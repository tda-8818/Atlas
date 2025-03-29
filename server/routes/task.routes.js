import express from 'express';
import { getTask, createTask, editTask, deleteTask, createEvent } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', getTask);

router.post('/', createEvent);


export default router;