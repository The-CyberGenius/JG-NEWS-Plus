import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jgnews@shiva';
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'jgnews_jwt_secret_change_me';
const JWT_EXPIRES = '12h';

// Admin Login — verifies password, returns signed JWT (not the plaintext password)
router.post('/login', async (req, res) => {
    const { password } = req.body;
    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ success: true, token, message: 'Login successful' });
});

export default router;
