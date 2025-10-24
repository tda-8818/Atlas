import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
  updateProfilePicture,
  updateMe,
  getAllUsers,
  verifyEmail,
  resendVerificationEmail
} from "../controllers/userController.js";
import { uploadProfilePicture } from '../../utils/cloudinary.js';
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: 'Too many attempts, please try again later'
});

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit to 3 verification emails per 15 minutes
  message: 'Too many verification email requests, please try again later'
});

console.log('User routes loaded');  // Should appear when server starts
// pass authMiddleware as an argument if you are wanting to deal with cookie data
router.post('/login', authLimiter, login);
router.post('/signup', authLimiter, signup);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.put('/profile-pic',authMiddleware,uploadProfilePicture.single('profilePic'),updateProfilePicture);
router.put('/me', authMiddleware, updateMe);
router.get('/', getAllUsers);
router.put('/', authMiddleware, updatePassword);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authMiddleware, emailLimiter, resendVerificationEmail);


export default router;