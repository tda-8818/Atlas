import express from 'express';
import { getTask, createTask, editTask, deleteTask, createEvent, updateTask } from "../controllers/taskController.js";
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: 'Too many attempts, please try again later'
});

const router = express.Router();

router.get('/calendar', getTask);

//router.post('/', createEvent);
router.post('/', authMiddleware, createTask);

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
router.delete('/:id', deleteTask);

router.put('/:id', editTask);

router.put('/:id', updateTask);
export default router;