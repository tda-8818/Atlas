// routes/fileRoutes.js
import express from 'express';
import { 
  uploadFile, 
  getProjectFiles, 
  deleteFile
} from '../controllers/fileController.js';
import { uploadProjectFile } from '../utils/cloudinary.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload a file (must be associated with a project)
router.post('/upload', uploadProjectFile.single('file'), uploadFile);

// Get files by project
router.get('/project/:projectId', getProjectFiles);

// Delete a file
router.delete('/:fileId', deleteFile);

export default router;