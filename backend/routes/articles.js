import express from 'express';
import Article from '../models/Article.js';

const router = express.Router();

// Get articles with optional pagination & field projection
router.get('/', async (req, res) => {
    try {
        const { page, limit, fields } = req.query;

        // If page/limit provided, paginate; otherwise return all (backward compat)
        if (page && limit) {
            const p = Math.max(1, parseInt(page));
            const l = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (p - 1) * l;

            // Lightweight projection for list views (exclude heavy content field)
            const projection = fields === 'summary'
                ? { title: 1, excerpt: 1, category: 1, location: 1, image: 1, videoUrl: 1, isBreaking: 1, isFeatured: 1, author: 1, tags: 1, date: 1, createdAt: 1 }
                : {};

            const [articles, total] = await Promise.all([
                Article.find({}, projection).sort({ date: -1 }).skip(skip).limit(l).lean(),
                Article.countDocuments(),
            ]);

            res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
            return res.json({ articles, total, page: p, pages: Math.ceil(total / l) });
        }

        // Default: return all (for admin panel backward compatibility)
        const articles = await Article.find().sort({ date: -1 }).lean();
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single article
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).lean();
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.set('Cache-Control', 'public, max-age=60');
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create article
router.post('/', async (req, res) => {
    const article = new Article(req.body);
    try {
        const newArticle = await article.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update article
router.put('/:id', async (req, res) => {
    try {
        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete article
router.delete('/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
