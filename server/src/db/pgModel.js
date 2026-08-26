import { getSupabase } from './supabaseClient.js';

const models = new Map();

function camelToSnake(value) {
  return String(value).replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);
}

function snakeToCamel(value) {
  return String(value).replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
}

function idOf(value) {
  if (value == null) return value;
  if (typeof value === 'object') {
    if (value._id != null) return String(value._id);
    if (value.id != null) return String(value.id);
  }
  return String(value);
}

function toPlain(input) {
  if (input == null) return input;
  if (Array.isArray(input)) return input.map(toPlain);
  if (typeof input.toJSON === 'function') return input.toJSON();
  if (typeof input === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(input)) {
      if (key === '$model' || key === '$isNew') continue;
      out[key] = toPlain(value);
    }
    return out;
  }
  return input;
}

function rowToCamel(row) {
  const out = {};
  for (const [key, value] of Object.entries(row || {})) {
    out[snakeToCamel(key)] = value;
  }
  if (out.id != null) out._id = out.id;
  return out;
}

function throwIfError(error) {
  if (!error) return;
  const err = new Error(error.message || 'Database error');
  err.name = 'SupabaseError';
  err.code = error.code;
  throw err;
}

function parseSelect(selectArg) {
  const include = new Set();
  const exclude = new Set();
  const plus = new Set();
  if (!selectArg) return { include, exclude, plus };

  const parts = Array.isArray(selectArg)
    ? selectArg
    : String(selectArg).split(/\s+/).filter(Boolean);

  for (const part of parts) {
    if (part.startsWith('+')) plus.add(part.slice(1));
    else if (part.startsWith('-')) exclude.add(part.slice(1));
    else include.add(part);
  }
  return { include, exclude, plus };
}

function applySelectToDoc(doc, selectArg, hidden) {
  if (!doc) return doc;
  const { include, exclude, plus } = parseSelect(selectArg);
  const hiddenSet = new Set(hidden || []);
  const data = { ...doc };

  for (const field of hiddenSet) {
    if (!plus.has(field)) delete data[field];
  }
  for (const field of exclude) delete data[field];

  if (include.size > 0) {
    const allowed = new Set(['_id', 'id', ...include, ...plus]);
    for (const key of Object.keys(data)) {
      if (!allowed.has(key)) delete data[key];
    }
  }
  return data;
}

const POPULATE = {
  assignedTo: { model: 'user', many: true },
  projectId: { model: 'project', many: false },
  labels: { model: 'label', many: true },
  columnId: { model: 'column', many: false },
  users: { model: 'user', many: true },
  owner: { model: 'user', many: false },
  notifications: { model: 'notification', many: true },
  senderId: { model: 'user', many: false },
  recipientId: { model: 'user', many: false },
  subtasks: { model: 'task', many: true },
  uploadedBy: { model: 'user', many: false },
  project: { model: 'project', many: false },
  authorId: { model: 'user', many: false },
  parentTaskId: { model: 'task', many: false },
  sprintId: { model: 'sprint', many: false },
  tasks: { model: 'task', many: true },
  columns: { model: 'column', many: true },
};

function pickFields(doc, select) {
  if (!select) return doc;
  const { include } = parseSelect(select);
  if (include.size === 0) return doc;
  const out = { _id: doc._id, id: doc.id };
  for (const field of include) out[field] = doc[field];
  return out;
}

async function populateValue(path, value, select) {
  const spec = POPULATE[path];
  if (!spec || value == null) return value;
  const model = models.get(spec.model);
  if (!model) return value;

  if (spec.many) {
    const ids = (Array.isArray(value) ? value : [value]).map(idOf).filter(Boolean);
    if (ids.length === 0) return [];
    const docs = await model._find({ _id: { $in: ids } });
    const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
    return ids.map((id) => {
      const found = byId.get(String(id));
      return found ? pickFields(found, select) : null;
    }).filter(Boolean);
  }

  const doc = await model._findOne({ _id: idOf(value) });
  return doc ? pickFields(doc, select) : null;
}

async function applyPopulates(result, populateOps) {
  if (!result || !populateOps?.length) return result;
  const list = Array.isArray(result) ? result : [result];
  for (const doc of list) {
    for (const op of populateOps) {
      const path = op.path || op;
      const select = op.select;
      doc[path] = await populateValue(path, doc[path], select);
    }
  }
  return result;
}

function normalizeFilter(filter = {}) {
  const out = {};
  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or') out.$or = value;
    else if (key === '_id') out.id = value;
    else out[key] = value;
  }
  return out;
}

function regexToIlike(regex, options = '') {
  let source = regex instanceof RegExp ? regex.source : String(regex);
  const prefix = source.startsWith('^');
  if (prefix) source = source.slice(1);
  source = source.replace(/\\/g, '');
  return prefix ? `${source}%` : `%${source}%`;
}

function applyComparison(query, column, value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    if (value.$in) return query.in(column, value.$in.map(idOf));
    if (value.$nin) return query.not(column, 'in', `(${value.$nin.map((item) => `"${idOf(item)}"`).join(',')})`);
    if (value.$ne) return query.neq(column, idOf(value.$ne));
    if (value.$gt) {
      const raw = value.$gt instanceof Date ? value.$gt : new Date(value.$gt);
      return query.gt(column, raw.toISOString());
    }
    if (value.$regex != null) return query.ilike(column, regexToIlike(value.$regex, value.$options));
  }
  if (Array.isArray(value)) return query.contains(column, value.map(idOf));
  if (value === null) return query.is(column, null);
  return query.eq(column, value);
}

function applyFilter(query, filter) {
  const normalized = normalizeFilter(filter);
  if (normalized.$or) {
    const parts = normalized.$or.map((clause) => {
      const [key, value] = Object.entries(clause)[0];
      const column = camelToSnake(key === '_id' ? 'id' : key);
      if (value?.$regex != null) {
        return `${column}.ilike.${regexToIlike(value.$regex, value.$options)}`;
      }
      return `${column}.eq.${value}`;
    });
    query = query.or(parts.join(','));
  }

  for (const [key, value] of Object.entries(normalized)) {
    if (key === '$or') continue;
    const column = camelToSnake(key);
    query = applyComparison(query, column, value);
  }
  return query;
}

function applyUpdate(current, update) {
  const next = { ...current };
  const hasOps = update.$set || update.$push || update.$pull || update.$addToSet;
  if (!hasOps) Object.assign(next, update);
  if (update.$set) Object.assign(next, update.$set);
  if (update.$push) {
    for (const [key, value] of Object.entries(update.$push)) {
      next[key] = [...(next[key] || []), value];
    }
  }
  if (update.$addToSet) {
    for (const [key, value] of Object.entries(update.$addToSet)) {
      const arr = [...(next[key] || [])];
      if (!arr.some((item) => idOf(item) === idOf(value))) arr.push(value);
      next[key] = arr;
    }
  }
  if (update.$pull) {
    for (const [key, value] of Object.entries(update.$pull)) {
      next[key] = (next[key] || []).filter((item) => idOf(item) !== idOf(value));
    }
  }
  return next;
}

function docToRow(model, doc) {
  const row = {};
  for (const field of model.fields) {
    const value = field === 'id' ? doc._id ?? doc.id : doc[field];
    if (value === undefined) continue;
    const column = camelToSnake(field);
    if (Array.isArray(value)) row[column] = value.map(idOf);
    else if (value instanceof Date) row[column] = value.toISOString();
    else row[column] = value;
  }
  return row;
}

class Document {
  constructor(model, data = {}, isNew = true) {
    this.$model = model;
    this.$isNew = isNew;
    const src = data.toJSON ? data.toJSON() : data;
    for (const [key, value] of Object.entries(src)) {
      if (key.startsWith('$')) continue;
      this[key] = value;
    }
    this._id = this._id || this.id || undefined;
    if (this._id) this.id = this._id;
  }

  toJSON() {
    const obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith('$')) continue;
      obj[key] = value;
    }
    if (this._id != null) {
      obj._id = this._id;
      obj.id = this._id;
    }
    return obj;
  }

  async save() {
    if (this.$isNew || !this._id) {
      const created = await this.$model.create(this.toJSON());
      Object.assign(this, created.toJSON());
      this.$isNew = false;
      this.$model = created.$model;
      return this;
    }
    const updated = await this.$model._updateOne({ _id: this._id }, this.toJSON(), { new: true });
    if (updated) Object.assign(this, updated.toJSON ? updated.toJSON() : updated);
    this.$isNew = false;
    return this;
  }
}

class Query {
  constructor(model, spec) {
    this.model = model;
    this.spec = spec;
    this.populateOps = [];
    this.selectArg = spec.projection || null;
    this.leanFlag = false;
    this.sortSpec = null;
  }

  populate(path, select) {
    if (Array.isArray(path)) {
      for (const item of path) this.populate(item);
      return this;
    }
    if (path && typeof path === 'object' && path.path) {
      this.populateOps.push(path);
      return this;
    }
    this.populateOps.push({ path, select });
    return this;
  }

  select(fields) {
    this.selectArg = fields;
    return this;
  }

  lean() {
    this.leanFlag = true;
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }

  async exec() {
    let result = await this.model._run(this.spec, this.sortSpec);
    result = await applyPopulates(result, this.populateOps);
    const wrap = (doc) => {
      if (!doc) return doc;
      const selected = applySelectToDoc(doc, this.selectArg, this.model.hidden);
      return this.leanFlag ? selected : new Document(this.model, selected, false);
    };
    if (Array.isArray(result)) return result.map(wrap);
    return wrap(result);
  }
}

class Model {
  constructor(name, table, options = {}) {
    this.name = name;
    this.table = table;
    this.fields = options.fields;
    this.hidden = options.hidden || [];
  }

  query(spec) {
    return new Query(this, spec);
  }

  find(filter = {}, projection) {
    return this.query({ type: 'find', filter, projection });
  }

  findOne(filter = {}, projection) {
    return this.query({ type: 'findOne', filter, projection });
  }

  findById(id, projection) {
    if (!id) return this.query({ type: 'findOne', filter: { _id: '__none__' }, projection });
    return this.findOne({ _id: idOf(id) }, projection);
  }

  create(data) {
    return this._insert(data);
  }

  findByIdAndUpdate(id, update, options) {
    return this.query({ type: 'updateOne', filter: { _id: idOf(id) }, update, options });
  }

  findOneAndUpdate(filter, update, options) {
    return this.query({ type: 'updateOne', filter, update, options });
  }

  findByIdAndDelete(id) {
    return this._deleteOne({ _id: idOf(id) });
  }

  findOneAndDelete(filter) {
    return this._deleteOne(filter);
  }

  updateOne(filter, update, options) {
    return this._updateOne(filter, update, options);
  }

  updateMany(filter, update) {
    return this._updateMany(filter, update);
  }

  deleteMany(filter = {}) {
    return this._deleteMany(filter);
  }

  async countDocuments(filter = {}) {
    const rows = await this._find(filter);
    return rows.length;
  }

  async _run(spec, sortSpec) {
    if (spec.type === 'find') return this._find(spec.filter, sortSpec);
    if (spec.type === 'findOne') return this._findOne(spec.filter);
    if (spec.type === 'updateOne') return this._updateOne(spec.filter, spec.update, spec.options);
    return null;
  }

  async _find(filter = {}, sortSpec) {
    let query = getSupabase().from(this.table).select('*');
    query = applyFilter(query, filter);
    if (sortSpec) {
      const [field, dir] = Object.entries(sortSpec)[0];
      query = query.order(camelToSnake(field), { ascending: dir !== -1 });
    }
    const { data, error } = await query;
    throwIfError(error);
    return (data || []).map(rowToCamel);
  }

  async _findOne(filter = {}) {
    const rows = await this._find(filter);
    return rows[0] || null;
  }

  async _insert(data) {
    const incoming = toPlain(data);
    delete incoming._id;
    delete incoming.id;
    const row = docToRow(this, incoming);
    const { data: inserted, error } = await getSupabase()
      .from(this.table)
      .insert(row)
      .select('*')
      .single();
    throwIfError(error);
    return new Document(this, rowToCamel(inserted), false);
  }

  async _updateOne(filter, update, options = {}) {
    const current = await this._findOne(filter);
    if (!current) return null;
    const next = applyUpdate(current, toPlain(update));
    const row = docToRow(this, next);
    delete row.id;
    const { data, error } = await getSupabase()
      .from(this.table)
      .update(row)
      .eq('id', current._id)
      .select('*')
      .single();
    throwIfError(error);
    const camel = rowToCamel(data);
    return options.new === false ? current : camel;
  }

  async _updateMany(filter, update) {
    const rows = await this._find(filter);
    for (const row of rows) {
      await this._updateOne({ _id: row._id }, update, { new: true });
    }
    return { acknowledged: true, modifiedCount: rows.length };
  }

  async _deleteOne(filter) {
    const current = await this._findOne(filter);
    if (!current) return null;
    const { error } = await getSupabase().from(this.table).delete().eq('id', current._id);
    throwIfError(error);
    return new Document(this, current, false);
  }

  async _deleteMany(filter = {}) {
    let query = getSupabase().from(this.table).delete();
    if (!filter || Object.keys(filter).length === 0) {
      query = query.not('id', 'is', null);
    } else {
      query = applyFilter(query, filter);
    }
    const { error, count } = await query.select('id');
    throwIfError(error);
    return { acknowledged: true, deletedCount: count };
  }
}

export function createModel(name, table, options) {
  const model = new Model(name, table, options);
  models.set(name, model);

  function ModelConstructor(data) {
    return new Document(model, data, true);
  }

  ModelConstructor.find = model.find.bind(model);
  ModelConstructor.findOne = model.findOne.bind(model);
  ModelConstructor.findById = model.findById.bind(model);
  ModelConstructor.create = model.create.bind(model);
  ModelConstructor.findByIdAndUpdate = model.findByIdAndUpdate.bind(model);
  ModelConstructor.findOneAndUpdate = model.findOneAndUpdate.bind(model);
  ModelConstructor.findByIdAndDelete = model.findByIdAndDelete.bind(model);
  ModelConstructor.findOneAndDelete = model.findOneAndDelete.bind(model);
  ModelConstructor.updateOne = model.updateOne.bind(model);
  ModelConstructor.updateMany = model.updateMany.bind(model);
  ModelConstructor.deleteMany = model.deleteMany.bind(model);
  ModelConstructor.countDocuments = model.countDocuments.bind(model);
  return ModelConstructor;
}
