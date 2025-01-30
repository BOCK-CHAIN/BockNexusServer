import express from 'express';

const router = express.Router();

router.post('/login', loginOrSignup)

export default router;