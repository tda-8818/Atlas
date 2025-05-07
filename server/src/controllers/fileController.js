// controllers/fileController.js
import File from '../models/File.js';
import Project from '../models/Project.js';
import cloudinary from '../utils/cloudinary.js';

// Upload file and save metadata
export const uploadFile = async (req, res) => {
  try {
    const { projectId, description, isPublic } = req.body;
    
    // Ensure the file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Check project access
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is part of the project
    const userHasAccess = project.users.includes(req.user.id) || project.owner.toString() === req.user.id;
    if (!userHasAccess) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }
    
    // Create file entry in database
    const newFile = new File({
      filename: req.file.filename || req.file.public_id, // Cloudinary public_id
      originalName: req.file.originalname,
      url: req.file.path, // Cloudinary URL
      cloudinaryId: req.file.public_id || req.file.filename,
      fileType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      project: projectId,
      description: description || '',
      isPublic: isPublic === 'true' || isPublic === true
    });
    
    await newFile.save();
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: newFile
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// Get files by project
export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const userHasAccess = project.users.includes(req.user.id) || project.owner.toString() === req.user.id;
    if (!userHasAccess) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }
    
    // Get files for this project
    const files = await File.find({ project: projectId })
      .sort({ createdAt: -1 }) // Newest first
      .populate('uploadedBy', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      count: files.length,
      files
    });
    
  } catch (error) {
    console.error('Error getting project files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project files',
      error: error.message
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Find the file
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if user has permission to delete
    const isUploader = file.uploadedBy.toString() === req.user.id;
    
    // Check if user is project owner
    const project = await Project.findById(file.project);
    const isProjectOwner = project && project.owner.toString() === req.user.id;
    
    if (!isUploader && !isProjectOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this file' });
    }
    
    // Delete from Cloudinary
    if (file.cloudinaryId) {
      await cloudinary.uploader.destroy(file.cloudinaryId);
    }
    
    // Delete from database
    await File.findByIdAndDelete(fileId);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};