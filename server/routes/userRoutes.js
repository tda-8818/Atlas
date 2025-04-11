import express from 'express';
import { createUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/signup', createUser);


export default router;