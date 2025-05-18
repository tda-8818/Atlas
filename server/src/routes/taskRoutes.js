import express from 'express';
import { getTasksByProject, createTask, deleteTask, updateTask, createSubTask, deleteSubtask, updateSubtask } from "../controllers/taskController.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', authMiddleware, getTasksByProject);

router.post('/', authMiddleware, createTask);


router.delete('/:taskId', authMiddleware, deleteTask);

router.put('/:id', authMiddleware, updateTask);

//router.put('/:id', authMiddleware, updateTask);

// Subtask functions

router.post('/:taskId', authMiddleware, createSubTask);

router.delete('/:subtaskId', authMiddleware, deleteSubtask);

router.put('/:subtaskId', updateSubtask);

export default router;

/*
a route parameter like /:id means the URL will contain a dynamic segment — a value that can change — 
and that Express will extract it for you.
This route matches any request that looks like:
PUT /calendar/661234abcde12345
OR
DELETE /calendar/661234abcde12345
Here, 661234abcde12345 is the taskId value created by mongo, 
You can access the id in the controller like this:
const { id } = req.params;

On the frontend, you send a request like this:
await axios.put(`http://localhost:5001/calendar/${taskId}`, { ...data });
*/