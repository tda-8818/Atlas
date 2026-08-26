import { createModel } from '../db/pgModel.js';

const Column = createModel('column', 'columns', {
  fields: ['id', 'title', 'projectId', 'tasks', 'index', 'isDefault'],
});

export default Column;
