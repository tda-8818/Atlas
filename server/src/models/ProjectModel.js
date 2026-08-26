import { createModel } from '../db/pgModel.js';

const Project = createModel('project', 'projects', {
  fields: [
    'id',
    'title',
    'description',
    'owner',
    'users',
    'tasks',
    'columns',
    'startDate',
    'endDate',
  ],
});

export default Project;
