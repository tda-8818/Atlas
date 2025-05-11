import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'app/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Create storage engine for project files
const projectFilesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'app/project-files',
    resource_type: 'auto',
  }
});

// Export multer instances for different upload types
export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const uploadProjectFile = multer({
  storage: projectFilesStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Export cloudinary instance for direct operations
export default cloudinary;