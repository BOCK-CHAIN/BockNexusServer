import express from 'express';
import { loginOrSignup } from '../controllers/user.js'; // Fix the typo here

const router = express.Router();

router.post('/login', loginOrSignup); // Ensure this matches the imported name

export default router;