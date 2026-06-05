import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jgnews@shiva';
const SUBADMIN_PASSWORD = process.env.SUBADMIN_PASSWORD || 'jgnews_subadmin';
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'jgnews_jwt_secret_change_me';
const JWT_EXPIRES = '12h';

// Admin Login — verifies password, returns signed JWT
router.post('/login', async (req, res) => {
    const { password } = req.body;
    let role = null;
    
    if (password === ADMIN_PASSWORD) {
        role = 'admin';
    } else if (password === SUBADMIN_PASSWORD) {
        role = 'subadmin';
    }
    
    if (!role) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ success: true, token, role, message: 'Login successful' });
});

export default router;
