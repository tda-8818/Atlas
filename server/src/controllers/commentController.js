import Comment from '../models/CommentModel.js';
import Task from '../models/TaskModel.js';
import { getAccessibleProject } from '../utils/projectAccess.js';

const commentPopulate = { path: 'authorId', select: 'firstName lastName profilePic email' };

async function getAccessibleTask(taskId, user) {
  const task = await Task.findById(taskId);
  if (!task) {
    return { error: { status: 404, message: 'Task not found' } };
  }

  const access = await getAccessibleProject(task.projectId, user);
  if (access.error) return access;

  return { task, project: access.project };
}

export const listComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const access = await getAccessibleTask(taskId, req.user);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const comments = await Comment.find({ taskId })
      .populate(commentPopulate)
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error listing comments:', error);
    res.status(500).json({ message: 'Error listing comments' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const body = (req.body?.body || '').trim();

    if (!body) {
      return res.status(400).json({ message: 'Comment body is required' });
    }

    const access = await getAccessibleTask(taskId, req.user);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const comment = await Comment.create({
      taskId,
      projectId: access.task.projectId,
      authorId: req.user._id,
      body,
    });

    const populated = await Comment.findById(comment._id).populate(commentPopulate);
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const access = await getAccessibleTask(taskId, req.user);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const comment = await Comment.findOne({ _id: commentId, taskId });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAuthor = String(comment.authorId) === String(req.user._id);
    const isOwner = String(access.project.owner) === String(req.user._id);
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted', id: commentId });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
