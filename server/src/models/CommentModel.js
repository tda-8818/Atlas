import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'task',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'project',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model('comment', commentSchema);

export default Comment;
