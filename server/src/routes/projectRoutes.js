import express from 'express';
import { createProject, getUserProjects, deleteProject, getProjectById, getProjectUsers, updateProjectUsers} from "../controllers/projectController.js";
import {
  createColumn,
  getProjectColumns,
  getColumnFromProject,
  deleteColumn,
  updateProjectColumn,
  updateColumnPositions
} from "../controllers/columnController.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

console.log('project routes loaded');  // Should appear when server starts

// pass authMiddleware as an argument if you are wanting to deal with cookie data
router.post('/', authMiddleware, createProject);

router.get('/', authMiddleware, getUserProjects);
router.get('/:id', authMiddleware, getProjectById)
router.get('/:id/users', authMiddleware, getProjectUsers);

router.put('/:id/users', authMiddleware, updateProjectUsers);

router.delete('/:projectId', authMiddleware, deleteProject);



// COLUMN ROUTES FOR KANBAN

console.log('column routes loaded');

// GET all columns in a project
router.get('/:projectId/kanban/', authMiddleware, getProjectColumns);

// GET a single column by columnId (optionally with projectId)
router.get('/:projectId/kanban/:columnId/', authMiddleware, getColumnFromProject);

// CREATE a column in a specific project
router.post('/:projectId/kanban', authMiddleware, createColumn);

// UPDATE a specific column (e.g., title or position)
router.put('/:projectId/kanban/:columnId', authMiddleware, updateProjectColumn);

// DELETE a column
router.delete('/:projectId/kanban/:columnId', authMiddleware, deleteColumn);

// UPDATE positions of multiple columns (drag-and-drop logic)
router.put('/:projectId/kanban/reorder', authMiddleware, updateColumnPositions);
export default router;