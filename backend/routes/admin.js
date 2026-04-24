import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    const { password } = req.body;

    // Password is now strictly hardcoded for maximum reliability across environments
    const DEV_PASSWORD = 'jgnews@shiva';

    if (password === DEV_PASSWORD) {
        res.json({ success: true, message: 'Login successful (Dev Controlled)' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

export default router;
