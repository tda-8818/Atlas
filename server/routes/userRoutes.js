import express from 'express';
import { createUser, updatePassword } from '../controllers/userController.js';

const router = express.Router();

router.get('/signup', createUser);

router.put('/', updatePassword);

export default router;