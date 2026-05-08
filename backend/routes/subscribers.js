import express from 'express';
import Subscriber from '../models/Subscriber.js';

const router = express.Router();

// Public: subscribe
// POST /api/subscribers
// body: { email, name?, phone?, source? }
router.post('/', async (req, res) => {
    try {
        const { email, name = '', phone = '', source = 'popup' } = req.body || {};

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email required' });
        }
        const trimmedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.connection?.remoteAddress
            || '';
        const userAgent = req.headers['user-agent'] || '';

        // Check if already exists
        const existing = await Subscriber.findOne({ email: trimmedEmail });
        if (existing) {
            // If they unsubscribed before, reactivate
            if (!existing.isActive) {
                existing.isActive = true;
                existing.unsubscribedAt = null;
                if (name && !existing.name) existing.name = name.trim();
                if (phone && !existing.phone) existing.phone = phone.trim();
                await existing.save();
                return res.json({ ok: true, message: 'Welcome back! Subscription reactivated.', reactivated: true });
            }
            return res.json({ ok: true, message: 'Already subscribed', alreadyExists: true });
        }

        const sub = await Subscriber.create({
            email: trimmedEmail,
            name: name.trim(),
            phone: phone.trim(),
            source,
            ipAddress,
            userAgent: userAgent.slice(0, 500),
        });
        res.status(201).json({ ok: true, message: 'Subscribed successfully', id: sub._id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ ok: true, message: 'Already subscribed', alreadyExists: true });
        }
        console.error('Subscribe error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Admin: list all subscribers
// GET /api/subscribers?page=&limit=&search=&status=
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
        const search = (req.query.search || '').trim();
        const status = req.query.status; // 'active' | 'inactive' | undefined

        const filter = {};
        if (status === 'active') filter.isActive = true;
        else if (status === 'inactive') filter.isActive = false;

        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const [subscribers, total, activeCount, inactiveCount, last30] = await Promise.all([
            Subscriber.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Subscriber.countDocuments(filter),
            Subscriber.countDocuments({ isActive: true }),
            Subscriber.countDocuments({ isActive: false }),
            Subscriber.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        ]);

        res.set('Cache-Control', 'private, no-store');
        res.json({
            subscribers,
            total,
            page,
            pages: Math.ceil(total / limit),
            stats: {
                total: activeCount + inactiveCount,
                active: activeCount,
                inactive: inactiveCount,
                last30days: last30,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: get one subscriber
router.get('/:id', async (req, res) => {
    try {
        const sub = await Subscriber.findById(req.params.id).lean();
        if (!sub) return res.status(404).json({ message: 'Not found' });
        res.json(sub);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: delete subscriber
router.delete('/:id', async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: bulk delete
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ids array required' });
        }
        const result = await Subscriber.deleteMany({ _id: { $in: ids } });
        res.json({ ok: true, deleted: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: export CSV
// GET /api/subscribers/export/csv
router.get('/export/csv', async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ createdAt: -1 }).lean();
        const rows = [
            ['Email', 'Name', 'Phone', 'Source', 'Active', 'Subscribed At'],
            ...subs.map(s => [
                s.email,
                s.name || '',
                s.phone || '',
                s.source || '',
                s.isActive ? 'Yes' : 'No',
                new Date(s.createdAt).toISOString(),
            ]),
        ];
        const csv = rows.map(r => r.map(cell => {
            const v = String(cell || '').replace(/"/g, '""');
            return /[",\n]/.test(v) ? `"${v}"` : v;
        }).join(',')).join('\n');

        res.set('Content-Type', 'text/csv; charset=utf-8');
        res.set('Content-Disposition', `attachment; filename="subscribers-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
