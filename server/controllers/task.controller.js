import Task from '../models/task.model.js';
import Project from '../models/project.model.js';

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

        const { due_date } = req.query;

        console.log("req.params is:", due_date);  // Debugging log
        res.status(200).json(due_date);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks", error });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title } = req.body;
        
        // other data points required.
        // Not sure if the current HTML request sends any other information other than the title and the date.
        const newTask = new Task({
            title
        })

        newTask.save();
        console.log('createTasks has been executed');

    } catch (error) {
        next(error)
    }
};


export const editTask = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
};

export const deleteTask = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
};
