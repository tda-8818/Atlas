import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/user/:userId', authMiddleware, userController.getUser);

export default router;