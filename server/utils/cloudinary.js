import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create different storage options for different types of files

// For profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'app/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'], 
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// For project documents and files
const projectFilesStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'app/project-files',
    resource_type: 'auto', // Auto-detect file type (images, pdfs, docs, etc)
    // No transformations for general files
  }
});

// Exports for different upload types
export const uploadProfilePicture = multer({ 
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for profile pics
});

export const uploadProjectFile = multer({ 
  storage: projectFilesStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for project files
});

// Export cloudinary instance for direct operations
export default cloudinary;