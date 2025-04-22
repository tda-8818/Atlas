import express from 'express';
import { getTask, createTask, editTask, deleteTask, createEvent } from "../controllers/taskController.js";

const router = express.Router();

router.get('/calendar', getTask);

//router.post('/', createEvent);
router.post('/', createTask);

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

export default router;