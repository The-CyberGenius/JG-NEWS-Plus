import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories.map(c => c.name));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create category
router.post('/', async (req, res) => {
    const category = new Category({ name: req.body.name });
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete category
router.delete('/:name', async (req, res) => {
    try {
        await Category.findOneAndDelete({ name: req.params.name });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
