import express from 'express';
import { getTask, createTask, editTask, deleteTask, createEvent } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', getTask);

router.post('/', createTask);

router.delete('/', deleteTask);

export default router;