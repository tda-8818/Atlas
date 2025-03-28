import express from 'express';
import { getTask, createTask, editTask, deleteTask } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', getTask);

router.post('/', createTask);


export default router;