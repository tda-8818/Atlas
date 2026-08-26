import express from 'express';
import { getTasksByProject, getTaskById, searchTasks, createTask, deleteTask, updateTask, createSubTask, deleteSubtask, updateSubtask, getSubTasks } from "../controllers/taskController.js";
import { listComments, createComment, deleteComment } from "../controllers/commentController.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', authMiddleware, searchTasks);
router.get('/item/:taskId', authMiddleware, getTaskById);

router.get('/:id', authMiddleware, getTasksByProject);

router.post('/', authMiddleware, createTask);

router.delete('/:taskId', authMiddleware, deleteTask);

router.put('/:id', authMiddleware, updateTask);

router.get('/:taskId/comments', authMiddleware, listComments);
router.post('/:taskId/comments', authMiddleware, createComment);
router.delete('/:taskId/comments/:commentId', authMiddleware, deleteComment);

router.get('/:taskId/subtasks', authMiddleware, getSubTasks);
router.post('/:taskId/subtasks', authMiddleware, createSubTask);
router.delete('/:taskId/subtasks/:subtaskId', authMiddleware, deleteSubtask);
router.put('/:taskId/subtasks/:subtaskId',authMiddleware, updateSubtask);

export default router;
