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
  resendVerificationEmail,
  googleAuth,
  googleAuthCallback,
  githubAuth,
  githubAuthCallback,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";
import { listApiKeys, createApiKey, revokeApiKey } from "../controllers/apiKeyController.js";
import { uploadProfilePicture } from '../../utils/cloudinary.js';
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';
import passport from '../config/passport.js';

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
// Temporarily disabled rate limiter for debugging
router.post('/signup', signup); // authLimiter removed for testing
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.put('/profile-pic',authMiddleware,uploadProfilePicture.single('profilePic'),updateProfilePicture);
router.put('/me', authMiddleware, updateMe);
router.get('/', getAllUsers);
router.put('/', authMiddleware, updatePassword);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authMiddleware, emailLimiter, resendVerificationEmail);

router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// OAuth routes
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
router.get('/auth/github', githubAuth);
router.get('/auth/github/callback', githubAuthCallback);

router.get('/api-keys', authMiddleware, listApiKeys);
router.post('/api-keys', authMiddleware, authLimiter, createApiKey);
router.delete('/api-keys/:keyId', authMiddleware, revokeApiKey);

export default router;
