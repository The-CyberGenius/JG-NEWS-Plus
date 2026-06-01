import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'jgnews_jwt_secret_change_me';

export const requireAdmin = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.role !== 'admin') throw new Error('Not admin');
        next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
