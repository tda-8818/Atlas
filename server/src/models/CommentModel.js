import { createModel } from '../db/pgModel.js';

const Comment = createModel('comment', 'comments', {
  fields: ['id', 'taskId', 'projectId', 'authorId', 'body'],
});

export default Comment;
