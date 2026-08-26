import { createModel } from '../db/pgModel.js';

const Sprint = createModel('sprint', 'sprints', {
  fields: [
    'id',
    'name',
    'goal',
    'projectId',
    'startDate',
    'endDate',
    'status',
    'capacity',
  ],
});

export default Sprint;
