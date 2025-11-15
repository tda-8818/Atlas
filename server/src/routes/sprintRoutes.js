import express from 'express';
import {
    getProjectSprints,
    getSprint,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    getSprintStats
} from '../controllers/sprintController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Sprint routes
router.get('/project/:projectId', getProjectSprints);
router.get('/:sprintId', getSprint);
router.post('/project/:projectId', createSprint);
router.put('/:sprintId', updateSprint);
router.delete('/:sprintId', deleteSprint);
router.post('/:sprintId/start', startSprint);
router.post('/:sprintId/complete', completeSprint);
router.get('/:sprintId/stats', getSprintStats);

export default router;
