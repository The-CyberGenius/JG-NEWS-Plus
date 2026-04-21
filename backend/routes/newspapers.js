import express from 'express';
import Newspaper from '../models/Newspaper.js';

const router = express.Router();

// GET all active newspapers (newest first)
router.get('/', async (req, res) => {
    try {
        const newspapers = await Newspaper.find({ isActive: true }).sort({ publishDate: -1 });
        res.json(newspapers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single newspaper
router.get('/:id', async (req, res) => {
    try {
        const newspaper = await Newspaper.findById(req.params.id);
        if (!newspaper) return res.status(404).json({ message: 'Edition not found' });
        res.json(newspaper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new newspaper edition (admin)
router.post('/', async (req, res) => {
    const newspaper = new Newspaper(req.body);
    try {
        const saved = await newspaper.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update newspaper edition (admin)
router.put('/:id', async (req, res) => {
    try {
        const updated = await Newspaper.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE newspaper edition (admin)
router.delete('/:id', async (req, res) => {
    try {
        await Newspaper.findByIdAndDelete(req.params.id);
        res.json({ message: 'Edition deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
