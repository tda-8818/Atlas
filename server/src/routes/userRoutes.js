import express from 'express';
import { signup, login, logout, getMe } from "../controllers/userController.js";
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/user/:userId', authMiddleware, getMe);

export default router;