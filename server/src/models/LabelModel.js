import { createModel } from '../db/pgModel.js';

const Label = createModel('label', 'labels', {
  fields: ['id', 'name', 'color', 'projectId'],
});

export default Label;
