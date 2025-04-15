import express from 'express';
import { getTask, createTask, editTask, deleteTask, createEvent } from "../controllers/taskController.js";

const router = express.Router();

router.get('/calendar', getTask);

//router.post('/', createEvent);
router.post('/', createTask);

router.delete('/:id', deleteTask);

export default router;