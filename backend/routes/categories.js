import express from 'express';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// Get all categories — names only (kept for backward compat with admin UIs)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, name: 1 });
        res.json(categories.map(c => c.name));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get categories with visible-article counts + order — used by navbar & reorder UI
router.get('/details', async (req, res) => {
    try {
        const [categories, counts] = await Promise.all([
            Category.find().sort({ order: 1, name: 1 }).lean(),
            Article.aggregate([
                { $match: { isHidden: { $ne: true } } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
        ]);
        const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]));
        const totalVisible = counts.reduce((s, c) => s + c.count, 0);
        const result = categories.map(c => ({
            name: c.name,
            order: c.order || 0,
            // राजस्थान is the "All" page — count == total visible articles
            articleCount: c.name === 'राजस्थान' ? totalVisible : (countMap[c.name] || 0),
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reorder categories — admin sends ordered list of names
router.put('/reorder', requireAdmin, async (req, res) => {
    try {
        const { names } = req.body || {};
        if (!Array.isArray(names)) return res.status(400).json({ message: 'names[] required' });
        await Promise.all(names.map((name, i) =>
            Category.updateOne({ name }, { $set: { order: i } })
        ));
        res.json({ updated: names.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create category — append to end (highest order)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const last = await Category.findOne().sort({ order: -1 }).lean();
        const nextOrder = (last?.order ?? -1) + 1;
        const category = new Category({ name: req.body.name, order: nextOrder });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete category
router.delete('/:name', requireAdmin, async (req, res) => {
    try {
        await Category.findOneAndDelete({ name: req.params.name });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
