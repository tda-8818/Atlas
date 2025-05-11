import Column from "../models/ColumnModel.js";
import Project from "../models/ProjectModel.js";
import Task from "../models/TaskModel.js";

/**
 * Creates a NON-DEFAULT column.
 * Refer to createTask and createProject in './projectController.js' and './taskController.js'
 * to see how the unsorted column is defined
 * @param {*} req
 * @param {*} res 
 * @returns 
 */
export const createColumn = async(req, res) => {
    try {
        const { projectId } = req.params;
        const { title, index } = req.body;

        console.log("Received projectId:", projectId);
        console.log("Received body: ", title, index);

        if (!projectId){ 
            return res.status(400).json({message: "Error in createColumn. MISSING PROJECT ID! Did you send the projectId properly???"})
        }

        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({message: "Error in createColumn. Project not found"})
        }

        const newColumn = new Column({
            title: title,
            index: index,
            projectId: projectId
        });

        //save column 
        const savedColumn = await newColumn.save();

        project.columns.push(savedColumn._id);
        await project.save();

        return res.status(201).json(savedColumn); // RETURNS THE COLUMN DATA TO FRONT-END. You can access via response.data or something similar.
        

    } catch (error) {
        console.error({message: "Error in createColumn", error});
        res.status(500).json({ message: "Server error while retrieving columns" });
    }
}
/**
 * Returns ALL columns by projectId.
 * @param {*} req
 * @param {*} res 
 * @returns Array of column Objects: [Column]
 */
export const getProjectColumns = async(req, res) => {
    try {
        console.log("getProjectColumns Executed!");
        const { projectId } = req.params;
        if (!projectId){ 
            return res.status(400).json({message: "Error in getProjectColumn. MISSING PROJECT ID! Did you send the projectId properly???"})
        }

        const columns = await Column.find({projectId})

        if (!columns || columns.length ===0){
            return res.status(400).json({message: "NO COLUMNS FOUND FOR THIS PROJECT. THIS SHOULD BE IMPOSSIBLE"})// All projects are created with a default column
        }
        
        return res.status(200).json(columns);

    } catch (error) {
        console.error({message: "Error in getProjectColumn"})
        res.status(500).json({ message: "Server error while retrieving columns" });
    }
}

/**
 * Returns a specific column by projectId.
 * @param {*} req
 * @param {*} res 
 * @returns Singular column Object: Column
 */
export const getColumnFromProject = async(req, res) => {
    try {
        const {projectId, columnId } = req.params;

        const column = await Column.findOne({_id:columnId, projectId})

        if (!column) {
            return res.status(404).json({message: "Error in getColumnFromProject. Column not found"});
        }

        return res.status(200).json(column);

    } catch (error) {
        console.error({message: "Error in getColumnFromProject"})
        res.status(500).json({ message: "Server error while retrieving columns" });
    }
}


/**
 * Returns a specific column by projectId.
 * @param {*} req
 * @param {*} res 
 * @returns Singular column Object: Column
 */
export const deleteColumn = async (req, res) => {
    try {
      const { projectId, columnId } = req.params;
  
      // Step 1: Delete the column
      const deletedColumn = await Column.findOneAndDelete({ _id: columnId, projectId });
      if (!deletedColumn) {
        return res.status(404).json({ message: "Column not found or already deleted" });
      }
  
      // Step 2: Remove the column ID from the project's columns array
      await Project.findByIdAndUpdate(projectId, {
        $pull: { columns: columnId },
      });
  
      // Step 3: Delete all tasks associated with this column
      await Task.deleteMany({ columnId });
  
      return res.status(200).json({ message: "Column and related tasks deleted successfully" });
  
    } catch (error) {
      console.error("Error in deleteProjectColumn:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
 * Handles the update of a specific column by projectId.
 * @param {*} req
 * @param {*} res 
 * @returns Singular column Object: Column
 */
export const updateProjectColumn = async (req, res) => {
    try {
      const { columnId } = req.params;
      const { title, index } = req.body;


    // Ensure at least one field is provided
    if (!title && index === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // ONLY UPDATE THE FIELDS THAT ARE PROVIDED
    const updateFields = {};
    if (title) updateFields.title = title;
    if (index !== undefined) updateFields.index = index;

    const updatedColumn = await Column.findByIdAndUpdate(
      columnId,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedColumn) {
      return res.status(404).json({ message: "Column not found" });
    }

    return res.status(200).json(updatedColumn); // RETURN THE UPDATED COLUMN

  } catch (error) {
    console.error("Error in updateProjectColumn:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * NOTE: LIKELY HARD TO TEST! LEAVE FOR LATER AS LUXURY 
 * Handles the update of column indexs. 
 * Used for when the drags-and-drop actions are used to 
 * rearrange the project columns in the kanban.
 * This function expects to receive an arrat of column objects with their _id and
 * UPDATED indexs
 * @param {*} req
 * @param {*} res 
 * @returns 
 */
export const updateColumnPositions = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { columns } = req.body;

    
    // Ensure columns data is provided
    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({ message: "Invalid List of columns provided. Please provide a valid array of columns" });
    }

    // Validate that all columns belong to the correct project and update them
    const updatePromises = columns.map(col =>
        Column.findOneAndUpdate(
        { _id: col._id, projectId: projectId },
        { index: col.index },
        { new: true } // Optional: return updated documents
        )
    );

    await Promise.all(updatePromises);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error in updateColumnPositions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};