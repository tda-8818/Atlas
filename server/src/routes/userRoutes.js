import express from 'express';
import { signup, login, logout, getMe } from "../controllers/userController.js";
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: 'Too many attempts, please try again later'
});

console.log('User routes loaded');  // Should appear when server starts

router.post('/login', authLimiter, login);
router.post('/signup', authLimiter, signup);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

export default router;