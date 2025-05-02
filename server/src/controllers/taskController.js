import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';
import { selectProject } from './projectController.js';

export const getTask = async (req, res) => {
    try {
        const tasks = await Task.find(); // or filter by project/user/etc

        const calendarEvents = tasks.map(task => ({
            id: task._id,
            title: task.title,
            start: task.startDate,
            end: task.dueDate,
            allDay: true, // optional: assume all tasks span full days
            description: task.description,
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
        /**Creating a task 
         * PLEASE -> Refer to Task schema blueprint to make sure data is consistent
         * throughout the app. Make sure all datapoints are named exactly like the 
         * property defined in TaskSchema to avoid confusion.
         * 
         * Creating a task should save it into the appropriate project.  
         */
        
        // 1. Recieve HTML request data
        const { title, description, start, end } = req.body;
        console.log("created tasks has been executed:");
        console.log(title, start, end);

        // 2. Grab cookie which contains the projectId
        const selectedProject = req.cookies?.selectedProject;
        console.log("Selected project from cookie in createTask.js: ", selectedProject);

        // 3. Fetch project document object from database
        const project = await Project.findById(selectedProject);

        // 4. Check if project is valid
        if (!project){
            return res.status(404).json({message: "Project not found createTask.js"});
        }

        // 5. Create Task object
        // Refer to TaskSchema data points required.
        // Ensure the HTML request sends information which is congruent with the TaskSchema.
        const newTask = new Task({
            projectId: project,
            title,
            description,
            start_date:start,
            due_date:end
           
        })

        // 6. Save task document in database
        const savedTask = await newTask.save(); // savedTask is the JUST oid for the task object.

        // 7. Append the task to the project. This stores the task in a project.tasks array
        project.tasks.push(savedTask);
        // 8. Save the project document
        await project.save()


        // 9. Send the oid for the task back to the frontend.
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task", error });
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

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        console.log('deleteTasks has been executed');

        const task_to_delete = await Task.findByIdAndDelete(id);
        
        if (!task_to_delete) {
            return res.status(404).json({ message: "Task not found"});

        }
        res.status(200).json({ message: "Task deleted successfully", task_to_delete})
    } catch (error) {
        console.error("Error deleting task: ", error);
        res.status(500).json({ message: "Server error while deleting task"});
    }
};
