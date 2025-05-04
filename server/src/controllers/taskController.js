import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';
import { selectProject } from './projectController.js';
import jwt from 'jsonwebtoken';

export const getTask = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name').populate('projectId', 'name');

        const calendarEvents = tasks.map(task => ({
            id: task._id,
            title: task.title,
            start: task.startDate,
            end: task.dueDate,
            allDay: true,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo.map(user => user.name).join(', '),
            projectName: task.projectId?.name || "Unassigned"
        }));

        res.status(200).json(calendarEvents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};


export const createEvent = async (req, res) => {
    try {
        console.log("Received event data:", req.body); // Debugging log
        res.status(200).json({ message: "Event received successfully", event: req.body });
    } catch (error) {
        console.error("Error processing event:", error);
        res.status(500).json({ message: "Error processing event", error });
    }
};

export const createTask = async (req, res) => {
    try {
        // 1. Extract token from the cookie
        const token = req.cookies?.selectedProject;
        if (!token) {
          return res.status(401).json({ message: 'Project not selected. Token missing.' });
        }
    
        // 2. Verify and decode the JWT token
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          console.error("JWT verification error:", error);
          return res.status(401).json({ message: 'Invalid project token' });
        }
        
        // 3. Extract projectId from the decoded token payload
        // Ensure that when you set the cookie, you used { projectId: id } as payload
        const projectId = decoded.projectId;
        if (!projectId) {
          return res.status(400).json({ message: 'Project ID missing in token' });
        }
    
        console.log("Decoded projectId:", projectId);
    
        // 4. Find the project by projectId in the database
        const project = await Project.findById(projectId);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
    
        // 5. Extract task information from the request body
        const { title, description, start, end } = req.body;
        console.log("Creating task with:", title, start, end);
    
        // 6. Create the new task object (make sure your schema keys are used consistently)
        const newTask = new Task({
          projectId: project._id, // associate the valid project ObjectId
          title,
          description,
          start_date: start,
          due_date: end
        });
    
        // 7. Save the new task document to the database
        const savedTask = await newTask.save();
    
        // 8. Optionally update the project with the new task reference
        project.tasks.push(savedTask._id);
        await project.save();
    
        // 9. Return the saved task to the client with a 201 status code
        res.status(201).json(savedTask);
    
      } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task", error });
      }
};


// export const createTask = async (req, res) => {
//     try {
//         /**Creating a task 
//          * PLEASE -> Refer to Task schema blueprint to make sure data is consistent
//          * throughout the app. Make sure all datapoints are named exactly like the 
//          * property defined in TaskSchema to avoid confusion.
//          * 
//          * Creating a task should save it into the appropriate project.  
//          */

//         // 1. Recieve HTML request data
//         const { title, description, start, end } = req.body;
//         console.log("created tasks has been executed:");
//         console.log(title, start, end);

//         // 2. Grab cookie which contains the projectId
//         const token = req.cookies?.selectedProject;
//         if (!token) {
//             return res.status(401).json({ message: 'Project not selected' });
//         }
//         console.log("Selected project from cookie in createTask.js: ", token);

//         // 3. Fetch project document object from database
//         const project = await Project.findById(token);

//         // 4. Check if project is valid
//         if (!project) {
//             return res.status(404).json({ message: "Project not found createTask.js" });
//         }

//         // 5. Create Task object
//         // Refer to TaskSchema data points required.
//         // Ensure the HTML request sends information which is congruent with the TaskSchema.
//         const newTask = new Task({
//             projectId: project,
//             title,
//             description,
//             start_date: start,
//             due_date: end

//         })

//         // 6. Save task document in database
//         const savedTask = await newTask.save(); // savedTask is the JUST oid for the task object.

//         // 7. Append the task to the project. This stores the task in a project.tasks array
//         project.tasks.push(savedTask);
//         // 8. Save the project document
//         await project.save()


//         // 9. Send the oid for the task back to the frontend.
//         res.status(201).json(savedTask);
//     } catch (error) {
//         console.error("Error creating task:", error);
//         res.status(500).json({ message: "Error creating task", error });
//     }
// };

export const updateTask = async (req, res) => {
    try {

        // 1. First update the task in database
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            req.body,
            { new: true }
        ).populate('projectId').populate('assignedTo');

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
    const { id } = req.params;
    const {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        startDate
    } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                title,
                description,
                status,
                priority,
                assignedTo,
                dueDate,
                startDate
            },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Error updating task", error });
    }
};

// TODO: add jwt verification
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
