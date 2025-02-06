import express from 'express';
import { login0rSignUp } from '../controllers/user.js';

const router = express.Router();

router.post('/login', loginOrSignup)

export default router;