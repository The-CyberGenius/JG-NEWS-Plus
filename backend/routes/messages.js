import express from 'express';
import Message from '../models/Message.js';
import { requireSuperAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// @desc    Submit a new contact message
// @route   POST /api/messages
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;

        if (!name || !subject || !message) {
            return res.status(400).json({ message: 'Name, subject, and message are required' });
        }

        const newMessage = await Message.create({
            name,
            phone,
            email,
            subject,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Admin: List all messages
// GET /api/messages?page=&limit=&status=
router.get('/', requireSuperAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const status = req.query.status;

        const filter = {};
        if (status === 'unread') filter.read = false;
        if (status === 'read') filter.read = true;

        const [messages, total] = await Promise.all([
            Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Message.countDocuments(filter),
        ]);

        res.json({
            messages,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Delete a message
router.delete('/:id', requireSuperAdmin, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Mark message as read/unread
// PUT /api/messages/:id/read
// body: { read: boolean }
router.put('/:id/read', requireSuperAdmin, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (message) {
            message.isRead = true;
            const updatedMessage = await message.save();
            res.json(updatedMessage);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
