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

// Track article view (fire-and-forget from client)
router.post('/:id/view', async (req, res) => {
    try {
        const now = new Date();
        const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const hour = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH (e.g. '2026-05-04T18')
        await Article.findByIdAndUpdate(
            req.params.id,
            {
                $inc: {
                    views: 1,
                    [`viewsByDay.${today}`]: 1,
                    [`viewsByHour.${hour}`]: 1,
                },
            },
            { new: false }
        );
        res.set('Cache-Control', 'no-store');
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Track article share (whatsapp, facebook, twitter, copy)
router.post('/:id/share', async (req, res) => {
    try {
        const platform = String(req.body.platform || '').toLowerCase();
        const allowed = ['whatsapp', 'facebook', 'twitter', 'copy'];
        if (!allowed.includes(platform)) {
            return res.status(400).json({ message: 'Invalid platform' });
        }
        await Article.findByIdAndUpdate(
            req.params.id,
            {
                $inc: {
                    [`shares.${platform}`]: 1,
                    'shares.total': 1,
                },
            },
            { new: false }
        );
        res.set('Cache-Control', 'no-store');
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Trending — articles with highest views in the last N hours (default 1)
router.get('/trending/now', async (req, res) => {
    try {
        const hours = Math.min(24, Math.max(1, parseInt(req.query.hours) || 1));
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));

        // Build list of hour-keys to score on
        const hourKeys = [];
        const now = new Date();
        for (let i = 0; i < hours; i++) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
            hourKeys.push(d.toISOString().slice(0, 13));
        }

        // Pull articles with any view in last N hours
        // We do a simple in-memory rank since the dataset is small
        const candidates = await Article.find(
            { views: { $gt: 0 } },
            { title: 1, image: 1, category: 1, location: 1, date: 1, views: 1, viewsByHour: 1 }
        ).sort({ views: -1 }).limit(200).lean();

        const ranked = candidates.map(a => {
            const vbh = a.viewsByHour || {};
            const entries = vbh instanceof Map ? Array.from(vbh.entries()) : Object.entries(vbh);
            let recentViews = 0;
            for (const [hk, count] of entries) {
                if (hourKeys.includes(hk)) recentViews += count;
            }
            return { ...a, recentViews };
        }).filter(a => a.recentViews > 0)
          .sort((a, b) => b.recentViews - a.recentViews)
          .slice(0, limit);

        // If nothing trending in last hours, fall back to top viewed today
        if (ranked.length === 0) {
            const today = now.toISOString().slice(0, 10);
            const fallback = candidates.map(a => {
                const vbd = a.viewsByDay || {};
                const todayViews = vbd instanceof Map ? (vbd.get(today) || 0) : (vbd[today] || 0);
                return { ...a, recentViews: todayViews };
            }).filter(a => a.recentViews > 0)
              .sort((a, b) => b.recentViews - a.recentViews)
              .slice(0, limit);
            res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
            return res.json({ articles: fallback, fallback: 'today', hours });
        }

        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        res.json({ articles: ranked, fallback: null, hours });
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
