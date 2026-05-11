// Lightweight admin auth — single string compare per request.
// Frontend sends `Authorization: Bearer <ADMIN_PASSWORD>` after successful /admin/login.
// No DB hit, no JWT, no session store — fast and stateless.

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jgnews@shiva';

export const requireAdmin = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || token !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};
