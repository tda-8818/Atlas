import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';
import Column from '../models/ColumnModel.js';
/**
 * Gets task details based on the projectId query parameter.
 * If no projectId is provided, it fetches all tasks.
 * @param {G} req 
 * @param {*} res 
 */
export const getTasksByProject = async (req, res) => {
    try {

    // req.param is the json object {id: abc123} => destructure it 
      const id_param = req.params;

      const projectId = id_param.id;
      //console.log("getTasksByProject FETCH. RECEIVED PROJECTID:", projectId);

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required in URL params' });
      }
  
      // Fetch tasks for the given project ID
      const tasks = await Task.find({ projectId })
        .populate('assignedTo', 'firstName lastName')
        .populate('projectId', 'title');
      
      //console.log("SENDING TASKS:", tasks);

      res.status(200).json(tasks);

    // req.param is the json object {id: abc123} => destructure it 
      const id_param = req.params;

      const projectId = id_param.id;
      console.log("getTasksByProject FETCH. RECEIVED PROJECTID:", projectId);

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required in URL params' });
      }
  
      // Fetch tasks for the given project ID
      const tasks = await Task.find({ projectId })
        .populate('assignedTo', 'firstName lastName')
        .populate('projectId', 'title');
      
      console.log("SENDING TASKS:", tasks);

      res.status(200).json(tasks);
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
        // Optionally remove reliance on the cookie if the client includes projectId in the body.
        const { projectId, title, description, start, end, columnId } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 5. Create Task object
        // Refer to TaskSchema data points required.
        // Ensure the HTML request sends information which is congruent with the TaskSchema.
        const newTask = new Task({
            projectId: project,
            title,
            description,
            startDate: start,
            dueDate: end,
            columnId:columnId
        });

        if (!columnId) {
            console.log("No columnId provided, inserting into default column");
            const defaultColumn = await Column.findOne({projectId, isDefault:true});
            newTask.columnId = defaultColumn._id;

            defaultColumn.tasks.push(newTask._id);
            await defaultColumn.save();
        }
        else{
            const columnToInsert = await Column.findOne({_id:columnId, projectId})

            if (!columnToInsert) return res.status(404).json({message: "Target column not found in project"});
            
            columnToInsert.tasks.push(newTask._id);
            await columnToInsert.save(); 
        }

        console.log("New task created:", newTask);

        // 6. Save task document in database
        const savedTask = await newTask.save(); // savedTask is the JUST oid for the task object.

        // 7. Append the task to the project. This stores the task in a project.tasks array
        project.tasks.push(savedTask._id);
        // 8. Save the project document
        await project.save()

        // // Optionally link the task back to the project
        // project.tasks.push(savedTask._id);
        // await project.save();

        // 9. Send the oid for the task back to the frontend.
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task", error });
    }
};

export const createSubTask = async(req, res) => {
    try {
        const { taskId } = req.params
        const { title, priority } = req.body;

        if (!taskId){
            return res.status(400).json({message: "Error in createSubTask. TaskID undefined!"})
        }

        const mainTask = await Task.findById(taskId);

        if (!mainTask) {
            return res.status(400).json({message: "Error in createSubTask. Cannot find task to insert!"})
        }

        const newSubtask = new Task({
            title: title,
            priority: priority
        })
        
        // insert subtask into mainTask
        mainTask.tasks.push(newSubtask);
        await mainTask.save();

        console.log(`Subtask ${newSubtask} inserted into ${mainTask}!`);
        
        return res.status(201).json(newSubtask);

    } catch (error) {
        console.error("Error in createSubTask", error);
        res.status(500).json({message: "Error creating subtask", error});
    }

};

export const updateTask = async (req, res) => {
   console.log("EDIT TASK EXECUTED");
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
    console.log("id: ",id);
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
        console.log("updated task: ", updatedTask);
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
        const { taskId } = req.params
        console.log('deleteTasks has been executed received taskId', taskId);

        const task_to_delete = await Task.findByIdAndDelete(taskId);
        
        await Project.findByIdAndUpdate(
          { _id: task_to_delete.projectId},
          { $pull: { tasks: task_to_delete.id}}
        );
        if (!task_to_delete) {
            return res.status(404).json({ message: "Task not found"});

        }
        res.status(200).json({ message: "Task deleted successfully", task_to_delete})
    } catch (error) {
        console.error("Error deleting task: ", error);
        res.status(500).json({ message: "Server error while deleting task"});
    }
};

////////// USER-TASK RELATED QUERIES //////////

// Assign users to a task
export const assignUsersToTask = async (req, res) => {
    try {
      const { id: taskId } = req.params;
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: 'userIds must be an array' });
      }
      
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Replace existing assignees
      task.assignedTo = userIds;
      
      const updatedTask = await task.save();
      
      // Populate assignedTo for the response
      const populatedTask = await Task.findById(taskId).populate('assignedTo', 'firstName lastName');
      
      return res.status(200).json(populatedTask);
    } catch (error) {
      console.error('Error assigning users to task:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get users assigned to a task
  export const getTaskAssignees = async (req, res) => {
    try {
      const { id: taskId } = req.params;
      
      const task = await Task.findById(taskId).populate('assignedTo', 'firstName lastName email');
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.status(200).json(task.assignedTo);
    } catch (error) {
      console.error('Error fetching task assignees:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };