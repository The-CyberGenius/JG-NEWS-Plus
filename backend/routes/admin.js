import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// Admin Login — verifies password and returns a bearer token for subsequent admin API calls
router.post('/login', async (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jgnews@shiva';

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_PASSWORD, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

export default router;
