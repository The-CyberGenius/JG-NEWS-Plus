import express from 'express';
import Article from '../models/Article.js';
import { slugify, uniqueSlug } from '../utils/slugify.js';

const router = express.Router();

// Helper: ensure article has a slug, generate if missing
const ensureSlug = async (title, currentSlug, currentId) => {
    if (currentSlug) return currentSlug;
    return await uniqueSlug(title, async (s) => {
        const existing = await Article.findOne({ slug: s, _id: { $ne: currentId } }).lean();
        return !!existing;
    });
};

// Helper: sanitize date — reject empty/invalid/pre-2000 values and use current time instead
const sanitizeDate = (raw) => {
    if (!raw) return new Date();
    const d = new Date(raw);
    if (isNaN(d.getTime()) || d.getFullYear() < 2000) return new Date();
    return d;
};

// Get articles with optional pagination, category filter & field projection
router.get('/', async (req, res) => {
    try {
        const { page, limit, fields, includeHidden, category } = req.query;

        // Public site: filter out hidden. Admin passes ?includeHidden=true to see all.
        const filter = includeHidden === 'true' ? {} : { isHidden: { $ne: true } };
        if (category) filter.category = category;

        // Sort: createdAt desc as fallback for any rows with bad date (1970 epoch),
        // so missing-date articles still surface near the top of their bucket
        const sort = { date: -1, createdAt: -1 };

        // If page/limit provided, paginate; otherwise return all (backward compat)
        if (page && limit) {
            const p = Math.max(1, parseInt(page));
            const l = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (p - 1) * l;

            // Lightweight projection for list views (exclude heavy content field)
            const projection = fields === 'summary'
                ? { title: 1, slug: 1, excerpt: 1, category: 1, location: 1, image: 1, videoUrl: 1, isBreaking: 1, isFeatured: 1, author: 1, tags: 1, date: 1, createdAt: 1, isHidden: 1 }
                : {};

            const [articles, total] = await Promise.all([
                Article.find(filter, projection).sort(sort).skip(skip).limit(l).lean(),
                Article.countDocuments(filter),
            ]);

            res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
            return res.json({ articles, total, page: p, pages: Math.ceil(total / l) });
        }

        // Default: return all (for admin panel backward compatibility)
        const articles = await Article.find(filter).sort(sort).lean();
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single article — accepts MongoDB _id OR slug
router.get('/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let article;
        // Try as Mongo ObjectId first (24 hex chars)
        if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
            article = await Article.findById(idOrSlug).lean();
        }
        // If not found OR not an ObjectId pattern, try as slug
        if (!article) {
            article = await Article.findOne({ slug: idOrSlug }).lean();
        }
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.set('Cache-Control', 'public, max-age=60');
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create article
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        // Always sanitize date — empty/invalid/<2000 becomes Date.now
        data.date = sanitizeDate(data.date);
        // Auto-generate slug from title if not provided
        if (!data.slug && data.title) {
            data.slug = await uniqueSlug(data.title, async (s) => {
                const existing = await Article.findOne({ slug: s }).lean();
                return !!existing;
            });
        }
        const article = new Article(data);
        const newArticle = await article.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update article
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        // Sanitize date only if caller explicitly sent one (don't overwrite existing good date)
        if ('date' in data) data.date = sanitizeDate(data.date);
        // Regenerate slug if title changed and no explicit slug provided
        if (data.title && !data.slug) {
            const current = await Article.findById(req.params.id).lean();
            if (current && current.title !== data.title) {
                // Title changed → generate new slug (avoid clash with self)
                data.slug = await uniqueSlug(data.title, async (s) => {
                    const existing = await Article.findOne({ slug: s, _id: { $ne: req.params.id } }).lean();
                    return !!existing;
                });
            }
        }
        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Backfill: fix articles with bad dates (pre-2000 / 1970 epoch) — use createdAt instead
// POST /api/articles/fix-dates
router.post('/fix-dates', async (req, res) => {
    try {
        const cutoff = new Date('2000-01-01');
        const bad = await Article.find({ date: { $lt: cutoff } }, { _id: 1, createdAt: 1 }).lean();
        let fixed = 0;
        for (const a of bad) {
            const newDate = a.createdAt && new Date(a.createdAt).getFullYear() >= 2000 ? a.createdAt : new Date();
            await Article.updateOne({ _id: a._id }, { $set: { date: newDate } });
            fixed++;
        }
        res.json({ scanned: bad.length, fixed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Backfill slugs for existing articles (one-time admin migration)
// POST /api/articles/backfill-slugs
router.post('/backfill-slugs', async (req, res) => {
    try {
        const articles = await Article.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }, { _id: 1, title: 1 }).lean();
        let count = 0;
        for (const a of articles) {
            const slug = await uniqueSlug(a.title, async (s) => {
                const existing = await Article.findOne({ slug: s, _id: { $ne: a._id } }).lean();
                return !!existing;
            });
            await Article.updateOne({ _id: a._id }, { $set: { slug } });
            count++;
        }
        res.json({ ok: true, updated: count, total: articles.length });
    } catch (error) {
        console.error('Backfill error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Bulk operations: delete / hide / unhide / breaking / featured
// POST /api/articles/bulk { ids: [...], action: 'delete' | 'hide' | 'unhide' | 'breaking-on' | 'breaking-off' | 'featured-on' | 'featured-off' }
router.post('/bulk', async (req, res) => {
    try {
        const { ids, action } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ids array required' });
        }
        if (ids.length > 200) {
            return res.status(400).json({ message: 'Max 200 ids per call' });
        }

        let result;
        switch (action) {
            case 'delete':
                result = await Article.deleteMany({ _id: { $in: ids } });
                return res.json({ ok: true, count: result.deletedCount });
            case 'hide':
                result = await Article.updateMany({ _id: { $in: ids } }, { $set: { isHidden: true } });
                return res.json({ ok: true, count: result.modifiedCount });
            case 'unhide':
                result = await Article.updateMany({ _id: { $in: ids } }, { $set: { isHidden: false } });
                return res.json({ ok: true, count: result.modifiedCount });
            case 'breaking-on':
                result = await Article.updateMany({ _id: { $in: ids } }, { $set: { isBreaking: true } });
                return res.json({ ok: true, count: result.modifiedCount });
            case 'breaking-off':
                result = await Article.updateMany({ _id: { $in: ids } }, { $set: { isBreaking: false } });
                return res.json({ ok: true, count: result.modifiedCount });
            case 'featured-on':
                result = await Article.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: true } });
                return res.json({ ok: true, count: result.modifiedCount });
            case 'featured-off':
                result = await Article.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: false } });
                return res.json({ ok: true, count: result.modifiedCount });
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        // Pull articles with any view in last N hours (exclude hidden)
        const candidates = await Article.find(
            { views: { $gt: 0 }, isHidden: { $ne: true } },
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
