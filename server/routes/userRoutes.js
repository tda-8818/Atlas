import express from 'express';
import { createUser, editUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/signup', createUser);

router.get('/edit', editUser);

export default router;