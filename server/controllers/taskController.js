import Task from '../models/TaskModel.js';
//import Project from '../models/ProjectModel.js';

// // Generic function to get all tasks
// export const getAllTasks = async (req, res) => {
//     try {
//       const tasks = await Task.find();  // Example of fetching tasks
//       res.status(200).json(tasks);
//       console.log('getAllTasks has been executed');
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching tasks', error });
//     }
//   };
  
// export const getAllTasks = async (req, res) => {
//     try {
//         const tasks = await Task.find();
//         console.log("Fetched tasks:", tasks);  // Debugging log
//         res.status(200).json(tasks);
//     } catch (error) {
//         console.error("Error fetching tasks:", error);
//         res.status(500).json({ message: "Error fetching tasks", error });
//     }
// };

//export const moveCard = async (req, res) = { };
  
export const getTask = async (req, res) => {
    try {

        const { due_date } = req.body;

        console.log("req.params is:", due_date);  // Debugging log
        res.status(200).json(due_date);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks", error });
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
        const { title, start, end } = req.body;
        console.log("created tasks has been executed:");
        console.log(title, start, end);
        // other data points required.
        // Not sure if the current HTML request sends any other information other than the title and the date.
        const newTask = new Task({
            title,
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
    try {
        
    } catch (error) {
        
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
