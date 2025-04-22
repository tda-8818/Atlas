import Task from '../models/TaskModel.js';

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
        const { title, description, start, end } = req.body;
        console.log("created tasks has been executed:");
        console.log(title, start, end);
        // other data points required.
        // Not sure if the current HTML request sends any other information other than the title and the date.
        const newTask = new Task({
            title,
            description,
            start_date:start,
            due_date:end
           
        })
        const savedTask = await newTask.save();
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
