import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    const { password } = req.body;
    try {
        const settings = await Setting.findOne();
        if (settings && settings.adminPassword === password) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            // Default fallback in case DB not seeded yet
            if (password === 'jgnews@2024') {
                res.json({ success: true, message: 'Login successful (default)' });
            } else {
                res.status(401).json({ success: false, message: 'Invalid password' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
