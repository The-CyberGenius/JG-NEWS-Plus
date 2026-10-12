import jwt from 'jsonwebtoken';
import express from 'express';
import LoginSession from '../models/LoginSession.js';
import Article from '../models/Article.js';
import { requireSuperSuperAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

const SUPER_SUPER_ADMIN_PASSWORD = process.env.SUPER_SUPER_ADMIN_PASSWORD || '8955256878';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jgnews@manoj';
const SUBADMIN_PASSWORD = process.env.SUBADMIN_PASSWORD || 'jgnews@shiva';
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'jgnews_jwt_secret_change_me';
const JWT_EXPIRES = '365d';

// Helper: extract accurate IP from request
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'Unknown';
};

// Helper: parse human-readable device and OS info from User-Agent
const parseDevice = (userAgent = '') => {
    const ua = (userAgent || '').toLowerCase();
    let os = 'Unknown OS';
    if (ua.includes('windows')) os = 'Windows PC';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'Mac / Apple';
    else if (ua.includes('android')) os = 'Android Mobile';
    else if (ua.includes('iphone')) os = 'iPhone';
    else if (ua.includes('ipad')) os = 'iPad';
    else if (ua.includes('linux')) os = 'Linux';

    let browser = 'Browser';
    if (ua.includes('edg/')) browser = 'Edge';
    else if (ua.includes('chrome/')) browser = 'Chrome';
    else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox/')) browser = 'Firefox';

    return `${browser} on ${os}`;
};

// Verify token endpoint
router.get('/verify', async (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ valid: false, message: 'No token' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // Check if session was invalidated
        const session = await LoginSession.findOne({ token });
        if (session && !session.isActive) {
            return res.status(401).json({ valid: false, sessionTerminated: true, message: 'Session revoked' });
        }
        res.json({ valid: true, role: payload.role });
    } catch (e) {
        res.status(401).json({ valid: false, message: e.message });
    }
});

// Admin Login — verifies password, creates login session with IP & device, returns JWT
router.post('/login', async (req, res) => {
    const { password } = req.body;
    let role = null;
    
    if (password === SUPER_SUPER_ADMIN_PASSWORD) {
        role = 'super_super_admin';
    } else if (password === ADMIN_PASSWORD) {
        role = 'admin';
    } else if (password === SUBADMIN_PASSWORD) {
        role = 'subadmin';
    }
    
    if (!role) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const device = parseDevice(userAgent);

    try {
        await LoginSession.create({
            role,
            token,
            ip,
            userAgent,
            device,
            loginTime: new Date(),
            lastActive: new Date(),
            isActive: true,
        });
    } catch (sessionErr) {
        console.error('Failed to record login session:', sessionErr);
    }

    res.json({ success: true, token, role, message: 'Login successful' });
});

// Admin Logout endpoint — mark current session inactive
router.post('/logout', async (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (token) {
        try {
            await LoginSession.findOneAndUpdate(
                { token },
                { $set: { isActive: false, loggedOutAt: new Date(), logoutReason: 'user_logout' } }
            );
        } catch (e) {
            console.error('Logout error:', e);
        }
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

// ─── Super Super Admin Endpoints ─────────────────────────────────────────────

// Get all login sessions (devices, IPs, timestamps, status)
router.get('/sessions', requireSuperSuperAdmin, async (req, res) => {
    try {
        const sessions = await LoginSession.find()
            .sort({ loginTime: -1 })
            .limit(200)
            .lean();
        
        // Hide full token, provide safe view
        const safeSessions = sessions.map(s => ({
            id: s._id,
            role: s.role,
            ip: s.ip,
            device: s.device,
            userAgent: s.userAgent,
            loginTime: s.loginTime,
            lastActive: s.lastActive,
            isActive: s.isActive,
            loggedOutAt: s.loggedOutAt,
            logoutReason: s.logoutReason,
            isCurrent: s.token === req.userToken,
        }));

        res.json({ success: true, sessions: safeSessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Force logout / revoke a specific session
router.post('/sessions/:id/logout', requireSuperSuperAdmin, async (req, res) => {
    try {
        const session = await LoginSession.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    isActive: false, 
                    loggedOutAt: new Date(), 
                    logoutReason: 'force_logout_by_super_admin' 
                } 
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.json({ success: true, message: 'सत्र सफलतापूर्वक समाप्त (लॉगआउट) कर दिया गया।' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Force logout all other active sessions
router.post('/sessions/logout-all-others', requireSuperSuperAdmin, async (req, res) => {
    try {
        const result = await LoginSession.updateMany(
            { token: { $ne: req.userToken }, isActive: true },
            { 
                $set: { 
                    isActive: false, 
                    loggedOutAt: new Date(), 
                    logoutReason: 'force_logout_by_super_admin' 
                } 
            }
        );

        res.json({ 
            success: true, 
            message: `अन्य सभी सक्रिय सत्र (${result.modifiedCount ?? result.nModified ?? 0}) समाप्त कर दिए गए।` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fetch articles for analytics modification
router.get('/articles-analytics', requireSuperSuperAdmin, async (req, res) => {
    try {
        const { q, category, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (q && q.trim()) {
            filter.title = { $regex: q.trim(), $options: 'i' };
        }
        if (category && category !== 'all' && category !== 'राजस्थान') {
            filter.category = category;
        }

        const p = Math.max(1, parseInt(page));
        const l = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (p - 1) * l;

        const [articles, total] = await Promise.all([
            Article.find(filter, {
                title: 1,
                slug: 1,
                category: 1,
                district: 1,
                date: 1,
                image: 1,
                views: 1,
                shares: 1,
                isBreaking: 1,
                isFeatured: 1,
            })
            .sort({ date: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
            Article.countDocuments(filter),
        ]);

        res.json({ success: true, articles, total, page: p, pages: Math.ceil(total / l) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update article analytics numbers (views & shares)
router.put('/articles/:id/analytics', requireSuperSuperAdmin, async (req, res) => {
    try {
        const { views, shares } = req.body;
        const updateData = {};

        if (views !== undefined && views !== null && views !== '') {
            const v = Math.max(0, parseInt(views));
            if (!isNaN(v)) {
                updateData.views = v;
            }
        }

        if (shares && typeof shares === 'object') {
            const whatsapp = Math.max(0, parseInt(shares.whatsapp) || 0);
            const facebook = Math.max(0, parseInt(shares.facebook) || 0);
            const twitter = Math.max(0, parseInt(shares.twitter) || 0);
            const copy = Math.max(0, parseInt(shares.copy) || 0);
            const total = shares.total !== undefined && !isNaN(parseInt(shares.total))
                ? Math.max(0, parseInt(shares.total))
                : (whatsapp + facebook + twitter + copy);

            updateData.shares = { whatsapp, facebook, twitter, copy, total };
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'कोई एनालिटिक्स मान (views या shares) नहीं दिए गए।' });
        }

        const updated = await Article.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, fields: { title: 1, views: 1, shares: 1, category: 1, date: 1 } }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        res.json({ 
            success: true, 
            article: updated, 
            message: `"${updated.title?.slice(0, 30)}..." के एनालिटिक्स नंबर सफलतापूर्वक अपडेट कर दिए गए!` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

