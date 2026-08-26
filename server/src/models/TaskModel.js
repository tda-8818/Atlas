import { createModel } from '../db/pgModel.js';

const Task = createModel('task', 'tasks', {
  fields: [
    'id',
    'projectId',
    'title',
    'description',
    'status',
    'columnId',
    'priority',
    'assignedTo',
    'dueDate',
    'startDate',
    'subtasks',
    'parentTaskId',
    'taskType',
    'storyPoints',
    'labels',
    'sprintId',
    'gitRepo',
    'gitBranch',
    'gitSha',
    'gitPrUrl',
  ],
});

export default Task;
