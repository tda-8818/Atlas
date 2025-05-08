import express from 'express';
import { createProject, getUserProjects, deleteProject, getProjectById, getProjectUsers, updateProjectUsers} from "../controllers/projectController.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

console.log('project routes loaded');  // Should appear when server starts

// pass authMiddleware as an argument if you are wanting to deal with cookie data
router.post('/', authMiddleware, createProject);

router.get('/', authMiddleware, getUserProjects);
router.get('/:id', authMiddleware, getProjectById)
router.get('/:id/users', authMiddleware, getProjectUsers);

router.put('/:id/users', authMiddleware, updateProjectUsers);

router.delete('/:id', authMiddleware, deleteProject);


export default router;