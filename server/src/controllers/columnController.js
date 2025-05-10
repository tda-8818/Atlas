import Column from "../models/ColumnModel.js";
import Project from "../models/ProjectModel.js";
import Task from "../models/TaskModel.js";

/**
 * Returns ALL columns by projectId.
 * @param {*} req
 * @param {*} res 
 * @returns Array of column Objects: [Column]
 */
export const getProjectColumns = async(req, res) => {
    try {
        const {projectId } = req.params;
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
            return res.status(404).json({message: "Error in getProjectColumn. Column not found"});
        }

        return res.status(200).json(column);

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
      const { title, position } = req.body;


    // Ensure at least one field is provided
    if (!title && position === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (position !== undefined) updateFields.position = position;

    const updatedColumn = await Column.findByIdAndUpdate(
      columnId,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedColumn) {
      return res.status(404).json({ message: "Column not found" });
    }

    return res.status(200).json(updatedColumn);

  } catch (error) {
    console.error("Error in updateProjectColumn:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};