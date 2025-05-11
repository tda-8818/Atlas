// import express from 'express';
// import {
//   createColumn,
//   getProjectColumns,
//   getColumnFromProject,
//   deleteColumn,
//   updateProjectColumn,
//   updateColumnPositions
// } from "../controllers/columnController.js";
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// console.log('column routes loaded');

// // GET all columns in a project
// router.get('/kanban/:projectId', authMiddleware, getProjectColumns);

// // GET a single column by columnId (optionally with projectId)
// router.get('/kanban/:columnId', authMiddleware, getColumnFromProject);

// // CREATE a column in a specific project
// router.post('/kanban/:projectId', authMiddleware, createColumn);

// // UPDATE a specific column (e.g., title or position)
// router.put('/kanban/:projectId/:columnId', authMiddleware, updateProjectColumn);

// // DELETE a column
// router.delete('/kanban/:projectId/:columnId', authMiddleware, deleteColumn);

// // UPDATE positions of multiple columns (drag-and-drop logic)
// router.put('/kanban/:projectId/reorder', authMiddleware, updateColumnPositions);

// export default router;
