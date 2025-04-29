import express from 'express';
import { createProject, deselectProject, selectProject } from "../controllers/projectController.js";
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: 'Too many attempts, please try again later'
});

console.log('project routes loaded');  // Should appear when server starts

// pass authMiddleware as an argument if you are wanting to deal with cookie data
router.post('/', authMiddleware, createProject);

//
router.post('/id', authMiddleware, selectProject);

router.put('/:id', authMiddleware, deselectProject);

export default router;