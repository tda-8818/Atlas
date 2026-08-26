import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';
import Column from '../models/ColumnModel.js';
import Comment from '../models/CommentModel.js';
import { getAccessibleProject } from '../utils/projectAccess.js';

const TASK_POPULATE = [
    { path: 'assignedTo', select: 'firstName lastName profilePic email' },
    { path: 'projectId', select: 'title' },
    { path: 'labels' },
    { path: 'columnId', select: 'title index' },
];

function pickDefined(fields) {
    const out = {};
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) out[key] = value;
    }
    return out;
}
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
      console.log("getTasksByProject FETCH. RECEIVED PROJECTID:", projectId);

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required in URL params' });
      }

      const access = await getAccessibleProject(projectId, req.user);
      if (access.error) {
        return res.status(access.error.status).json({ message: access.error.message });
      }
  
      // Fetch tasks for the given project ID
      const tasks = await Task.find({ projectId })
        .populate('assignedTo', 'firstName lastName profilePic')
        .populate('projectId', 'title')
        .populate('labels');
      
      //console.log("SENDING TASKS:", tasks);
      console.log("SENDING TASKS:", tasks);

      res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};


export const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId).populate(TASK_POPULATE);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const access = await getAccessibleProject(task.projectId?._id || task.projectId, req.user);
        if (access.error) {
            return res.status(access.error.status).json({ message: access.error.message });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Error fetching task' });
    }
};

export const searchTasks = async (req, res) => {
    try {
        const { q, projectId, assignedToMe, status } = req.query;
        const filter = {};

        if (projectId) {
            const access = await getAccessibleProject(projectId, req.user);
            if (access.error) {
                return res.status(access.error.status).json({ message: access.error.message });
            }
            filter.projectId = projectId;
        } else {
            const accessibleIds = (req.user.projects || []).map((item) => item._id || item);
            filter.projectId = { $in: accessibleIds };
        }

        if (q && q.trim()) {
            const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { title: { $regex: escaped, $options: 'i' } },
                { description: { $regex: escaped, $options: 'i' } },
                { gitBranch: { $regex: escaped, $options: 'i' } },
            ];
        }

        if (assignedToMe === 'true' || assignedToMe === true) {
            filter.assignedTo = req.user._id;
        }

        if (status === 'open') {
            filter.status = false;
        } else if (status === 'done') {
            filter.status = true;
        }

        const tasks = await Task.find(filter)
            .populate('assignedTo', 'firstName lastName profilePic')
            .populate('projectId', 'title')
            .populate('labels')
            .sort({ updatedAt: -1 })
            .limit(100);

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).json({ message: 'Error searching tasks' });
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
        const {
            _id, // optional custom ID
            projectId,
            title,
            description,
            startDate,
            dueDate,
            columnId,
            assignedTo,
            priority,
            status,
            taskType,
            storyPoints,
            labels,
            sprintId
        } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const access = await getAccessibleProject(projectId, req.user);
        if (access.error) {
            return res.status(access.error.status).json({ message: access.error.message });
        }
        const project = access.project;

        const { gitRepo, gitBranch, gitSha, gitPrUrl } = req.body;

        // Build task data conditionally including _id
        const taskData = {
            ...(!!_id && { _id }), // only include _id if it's provided
            projectId,
            title,
            description,
            startDate,
            dueDate,
            columnId,
            assignedTo,
            priority,
            status,
            taskType: taskType || 'task',
            storyPoints: storyPoints || 0,
            labels: labels || [],
            sprintId: sprintId || null,
            gitRepo: gitRepo || '',
            gitBranch: gitBranch || '',
            gitSha: gitSha || '',
            gitPrUrl: gitPrUrl || '',
        };

        const newTask = new Task(taskData);

        // Assign to column (default or specified)
        if (!columnId) {
            console.log("No columnId provided, inserting into default column");
            const defaultColumn = await Column.findOne({ projectId, isDefault: true });
            if (!defaultColumn) {
                return res.status(404).json({ message: "Default column not found" });
            }
            newTask.columnId = defaultColumn._id;
            defaultColumn.tasks.push(newTask._id);
            await defaultColumn.save();
        } else {
            const columnToInsert = await Column.findOne({ _id: columnId, projectId });
            if (!columnToInsert) {
                return res.status(404).json({ message: "Target column not found in project" });
            }
            columnToInsert.tasks.push(newTask._id);
            await columnToInsert.save();
        }

        const savedTask = await newTask.save();

        project.tasks.push(savedTask._id);
        await project.save();

        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task", error });
    }
};

export const updateTask = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        startDate,
        taskType,
        storyPoints,
        labels,
        sprintId,
        columnId,
        gitRepo,
        gitBranch,
        gitSha,
        gitPrUrl,
    } = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const access = await getAccessibleProject(task.projectId, req.user);
        if (access.error) {
            return res.status(access.error.status).json({ message: access.error.message });
        }

        const updates = pickDefined({
            title,
            description,
            status,
            priority,
            assignedTo,
            dueDate,
            startDate,
            taskType,
            storyPoints,
            labels,
            sprintId,
            gitRepo,
            gitBranch,
            gitSha,
            gitPrUrl,
        });

        if (columnId !== undefined && String(columnId) !== String(task.columnId)) {
            const targetColumn = await Column.findOne({ _id: columnId, projectId: task.projectId });
            if (!targetColumn) {
                return res.status(404).json({ message: 'Target column not found in project' });
            }

            if (task.columnId) {
                await Column.findByIdAndUpdate(task.columnId, { $pull: { tasks: task._id } });
            }
            targetColumn.tasks.push(task._id);
            await targetColumn.save();
            updates.columnId = targetColumn._id;
        }

        if (Object.keys(updates).length === 0) {
            const current = await Task.findById(id)
                .populate('labels')
                .populate('assignedTo', 'firstName lastName profilePic');
            return res.status(200).json(current);
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate('labels').populate('assignedTo', 'firstName lastName profilePic');

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task', error });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params
        console.log('deleteTasks has been executed received taskId', taskId);

        const task_to_delete = await Task.findById(taskId);
        if (!task_to_delete) {
            return res.status(404).json({ message: "Task not found"});
        }

        const access = await getAccessibleProject(task_to_delete.projectId, req.user);
        if (access.error) {
            return res.status(access.error.status).json({ message: access.error.message });
        }

        await Comment.deleteMany({ taskId });
        await Task.findByIdAndDelete(taskId);

        // Remove task from its column's task list (if stored there)
        if (task_to_delete.columnId) {
            await Column.findByIdAndUpdate(task_to_delete.columnId, {
                $pull: { tasks: task_to_delete._id}
            })
        }

        // Remove task from its project’s task list (if stored there)
        if (task_to_delete.projectId) {
            await Project.findByIdAndUpdate(task_to_delete.projectId, {
                $pull: { tasks: task_to_delete._id }
            });
        }

    res.status(200).json({ message: "Task deleted successfully", deletedTask: task_to_delete });
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
////////////////////////////////////////////////////
//     BEGINNING OF SUBTASK RELATED FUNCTIONS     //
////////////////////////////////////////////////////

/**
 *  
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
  export const getSubTasks = async (req, res) => {
    try {
        const { taskId } = req.params
        console.log('getSubTasks has been executed received taskId', taskId);
        const task = await Task.findById(taskId).populate('subtasks');
        if (!task) {
            return res.status(404).json({ message: "Task not found"});
        }
        const subtasks = await Task.find({ parentTaskId: taskId }).populate('assignedTo').populate('labels');
        console.log("subtasks: ", subtasks);
        res.status(200).json(subtasks);
    } catch (error) {
        console.error("Error in getSubTasks", error);
        res.status(500).json({message: "Error fetching subtasks", error});
    }
};

  export const createSubTask = async(req, res) => {
    try {
        const { taskId } = req.params
        const { title, priority, status } = req.body;
        console.log('createSubTask has been executed received taskId', taskId);
        console.log('createSubTask has been executed received title', title);
        console.log('createSubTask has been executed received priority', priority);
        console.log('createSubTask has been executed received status', status);
        console.log('createSubTask has been executed received body', req.body);

        if (!taskId){
            return res.status(400).json({message: "Error in createSubTask. TaskID undefined!"})
        }

        const mainTask = await Task.findById(taskId);

        if (!mainTask) {
            return res.status(400).json({message: "Error in createSubTask. Cannot find task to insert!"})
        }

        // Create a new subtask as a full Task with a reference to the parent task
        const newSubtask = await Task.create({
            title,
            priority: priority || 'None',
            status: status || false,
            parentTaskId: taskId,
            projectId: mainTask.projectId,
            columnId: mainTask.columnId,
            description: req.body.description || '',
            assignedTo: req.body.assignedTo || [],
            startDate: req.body.startDate || null,
            dueDate: req.body.dueDate || null,
            taskType: req.body.taskType || 'task',
            storyPoints: req.body.storyPoints || 0,
            labels: req.body.labels || [],
            sprintId: mainTask.sprintId
        });

        // insert subtask into mainTask
        mainTask.subtasks.push(newSubtask._id);
        await mainTask.save();

        console.log(`Subtask ${title} inserted into ${mainTask.title}!`);

        return res.status(201).json(newSubtask);

    } catch (error) {
        console.error("Error in createSubTask", error);
        res.status(500).json({message: "Error creating subtask", error});
    }

};

/**
 *  
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
  export const deleteSubtask = async(req, res) => {
    try {
        const { subtaskId } = req.params
        console.log('deleteSubTasks has been executed received taskId', subtaskId);

        const task_to_delete = await Task.findById(subtaskId);

        if (!task_to_delete) {
            return res.status(404).json({ message: "Task not found"});
        }

        // remove subtask from parent's list of tasks
        await Task.findByIdAndUpdate(
          { _id: task_to_delete.parentTaskId},
          { $pull: { subtasks: task_to_delete._id}}
        );

        // remove subtask from Task database
        await Task.findByIdAndDelete(subtaskId);

        res.status(200).json({ message: "Task deleted successfully", deletedTask: task_to_delete });
    } catch (error) {
        console.error("Error deleting task in deleteSubtask: ", error);
        res.status(500).json({ message: "Server error while deleting subtask"});
    }
};

/**
 *  Similar to the existing edit task function, updates an existing subtask
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
  export const updateSubtask = async(req, res) => {
    try { 

        console.log("EDIT SUBTASK EXECUTED");
        const { taskId, subtaskId } = req.params;
        const {
            title,
            status,
            priority,
        } = req.body;
        console.log("subtaskId: ", subtaskId);
        console.log("body: ", req.body);
        if (title === undefined && status === undefined && priority === undefined) {
            return res.status(400).json({message: "Nothing to update"});
        }

        console.log("subtaskId: ", subtaskId);
        // Extract only the fields that have been modified
        const updatedFields = {};
        if (title !== undefined) updatedFields.title = title;
        if (status !== undefined) updatedFields.status = status;
        if (priority !== undefined) updatedFields.priority = priority;

        const updatedSubtask = await Task.findByIdAndUpdate(
            subtaskId,
            {$set: updatedFields},
            {new: true},
        ).populate('assignedTo').populate('labels');
        if (!updatedSubtask) {
            return res.status(404).json({message: "Subtask not found"});
        }

        return res.status(200).json(updatedSubtask);
    
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Error updating task", error });
    }
};
////////////////////////////////////////////////////
//     END OF SUBTASK RELATED FUNCTIONS           //
////////////////////////////////////////////////////