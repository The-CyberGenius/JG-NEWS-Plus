import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    const { password } = req.body;

    // Developer choice: Using .env with a hardcoded fallback for easy deployment
    const DEV_PASSWORD = process.env.ADMIN_PASSWORD || 'jgnews@shiva';

    if (password === DEV_PASSWORD) {
        res.json({ success: true, message: 'Login successful (Dev Controlled)' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

export default router;
