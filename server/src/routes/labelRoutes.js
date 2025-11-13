import express from 'express';
import {
    getProjectLabels,
    createLabel,
    updateLabel,
    deleteLabel
} from '../controllers/labelController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Label routes
router.get('/project/:projectId', getProjectLabels);
router.post('/project/:projectId', createLabel);
router.put('/:labelId', updateLabel);
router.delete('/:labelId', deleteLabel);

export default router;
