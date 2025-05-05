import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';
import { selectProject } from './projectController.js';
import jwt from 'jsonwebtoken';

/**
 * Gets task details based on the projectId query parameter.
 * If no projectId is provided, it fetches all tasks.
 * @param {G} req 
 * @param {*} res 
 */
export const getTasksByProject = async (req, res) => {
    try {
        // If a projectId query parameter is provided, filter by it
        const filter = req.query.projectId ? { projectId: req.query.projectId } : {};
        
        // Fetch tasks for a specific project if provided, or all tasks otherwise
        const tasks = await Task.find(filter)
          .populate('assignedTo', 'firstName lastName')  // Return user names as needed
          .populate('projectId', 'title');  // Populate project details like title
    
        // Optionally, you can transform these tasks for specific UI needs
        // or simply return the raw tasks.
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
      }
};

export const createTask = async (req, res) => {
    try {
        // Optionally remove reliance on the cookie if the client includes projectId in the body.
        const { projectId, title, description, start, end } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Create the new task using the provided details
        const newTask = new Task({
            projectId: project._id,
            title,
            description,
            start_date: start,
            due_date: end,
        });

        console.log("New task created:", newTask);

        const savedTask = await newTask.save();

        console.log("Saved task:", savedTask);

        // Optionally link the task back to the project
        project.tasks.push(savedTask._id);
        await project.save();

        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task", error });
    }
};

export const updateTask = async (req, res) => {
    try {

        // 1. First update the task in database
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('projectId').populate('assignedTo');

        console.log("Updated task:", updatedTask);

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // 2. Prepare WebSocket notification data
        const notificationPayload = {
            _id: updatedTask._id,
            title: updatedTask.title,
            status: updatedTask.status,
            dueDate: updatedTask.dueDate,
            projectId: updatedTask.projectId._id,
            projectTitle: updatedTask.projectId.title
        };

        // 3. Notify all assigned users
        updatedTask.assignedTo.forEach(user => {
            req.app.get('io').to(`user_${user._id}`).emit('TASK_UPDATED', {
                type: 'TASK_UPDATED',
                data: notificationPayload,
                updatedAt: new Date()
            });
        });

        // 4. Also notify all project members (optional)
        // req.app.get('io').to(`project_${updatedTask.projectId._id}`).emit('PROJECT_UPDATE', {
        //     type: 'TASK_CHANGED',
        //     taskId: updatedTask._id,
        //     status: updatedTask.status
        // });

        // 5. Send normal HTTP response
        res.status(200).json(updatedTask);

    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const editTask = async (req, res) => {
    try {
        // 1. Extract token from the cookie
        const token = req.cookies?.selectedProject;
        if (!token) {
            return res.status(401).json({ message: "Project not selected. Token missing." });
        }

        // 2. Verify and decode the JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error("JWT verification error:", error);
            return res.status(401).json({ message: "Invalid project token" });
        }

        // 3. Extract projectId from the decoded token payload
        const projectId = decoded.projectId;
        if (!projectId) {
            return res.status(400).json({ message: "Project ID missing in token" });
        }

        // 4. Get the task ID from URL parameters
        const taskId = req.params.id;

        // 5. Find the task ensuring it belongs to the current project
        const task = await Task.findOne({ _id: taskId, projectId });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // 6. Extract new task data from the request body
        const { title, description, start, end } = req.body;

        // 7. Update the task fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (start !== undefined) task.start_date = start;
        if (end !== undefined) task.due_date = end;

        // 8. Save the updated task
        const updatedTask = await task.save();

        // 9. Return a response with updated task data
        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });
    } catch (error) {
        console.error("Error editing task:", error);
        res.status(500).json({ message: "Error editing task", error });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        console.log('deleteTasks has been executed');

        const task_to_delete = await Task.findByIdAndDelete(id);

        if (!task_to_delete) {
            return res.status(404).json({ message: "Task not found" });

        }
        res.status(200).json({ message: "Task deleted successfully", task_to_delete })
    } catch (error) {
        console.error("Error deleting task: ", error);
        res.status(500).json({ message: "Server error while deleting task" });
    }
};
