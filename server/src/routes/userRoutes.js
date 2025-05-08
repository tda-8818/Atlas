import express from 'express';
import { signup, login, logout, getMe, updatePassword, getAllUsers } from "../controllers/userController.js";
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: 'Too many attempts, please try again later'
});

console.log('User routes loaded');  // Should appear when server starts
// pass authMiddleware as an argument if you are wanting to deal with cookie data
router.post('/login', authLimiter, login);
router.post('/signup', authLimiter, signup);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.get('/', getAllUsers);
router.put('/', authMiddleware, updatePassword);


export default router;