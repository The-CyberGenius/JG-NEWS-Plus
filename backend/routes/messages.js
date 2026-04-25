import express from 'express';
import Message from '../models/Message.js';

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

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find({}).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (message) {
            await message.deleteOne();
            res.json({ message: 'Message removed' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Mark a message as read
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
router.put('/:id/read', async (req, res) => {
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
