import jwt from 'jsonwebtoken';
import LoginSession from '../models/LoginSession.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'jgnews_jwt_secret_change_me';

export const requireAdmin = async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        // Check if session was force-terminated by super super admin
        const session = await LoginSession.findOne({ token });
        if (session && !session.isActive) {
            return res.status(401).json({ 
                message: 'आपका सत्र सुपर एडमिन द्वारा समाप्त कर दिया गया है।', 
                sessionTerminated: true 
            });
        }

        // Super Super Admin cannot post/edit news or manage standard content
        if (payload.role === 'super_super_admin') {
            return res.status(403).json({ 
                message: 'सुपर सुपर एडमिन को न्यूज़ अपलोड या एडिट करने की अनुमति नहीं है।' 
            });
        }

        if (payload.role !== 'admin' && payload.role !== 'subadmin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.userRole = payload.role;
        req.userToken = token;
        next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const requireSuperAdmin = async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        const session = await LoginSession.findOne({ token });
        if (session && !session.isActive) {
            return res.status(401).json({ 
                message: 'आपका सत्र समाप्त कर दिया गया है।', 
                sessionTerminated: true 
            });
        }

        if (payload.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin allowed' });
        }

        req.userRole = payload.role;
        req.userToken = token;
        next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const requireSuperSuperAdmin = async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        const session = await LoginSession.findOne({ token });
        if (session && !session.isActive) {
            return res.status(401).json({ 
                message: 'आपका सत्र समाप्त कर दिया गया है।', 
                sessionTerminated: true 
            });
        }

        if (payload.role !== 'super_super_admin') {
            return res.status(403).json({ message: 'केवल सुपर सुपर एडमिन के लिए अनुमत है (Forbidden)' });
        }

        req.userRole = payload.role;
        req.userToken = token;
        next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const requireAnyAdmin = async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        const session = await LoginSession.findOne({ token });
        if (session && !session.isActive) {
            return res.status(401).json({ 
                message: 'आपका सत्र समाप्त कर दिया गया है।', 
                sessionTerminated: true 
            });
        }

        if (!['admin', 'subadmin', 'super_super_admin'].includes(payload.role)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        req.userRole = payload.role;
        req.userToken = token;
        next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
