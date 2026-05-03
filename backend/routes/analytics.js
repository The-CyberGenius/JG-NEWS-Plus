import express from 'express';
import Article from '../models/Article.js';
import Message from '../models/Message.js';

const router = express.Router();

// GET /api/analytics/overview
// Returns dashboard analytics: totals, top articles, daily views, category breakdown
router.get('/overview', async (req, res) => {
    try {
        const days = Math.min(60, Math.max(7, parseInt(req.query.days) || 30));

        // Generate last N days as YYYY-MM-DD
        const dayKeys = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dayKeys.push(d.toISOString().slice(0, 10));
        }

        const [totals, topArticles, topShared, recentArticles, allArticlesForViews, messageCount] = await Promise.all([
            // Totals
            Article.aggregate([
                {
                    $group: {
                        _id: null,
                        totalArticles: { $sum: 1 },
                        totalViews: { $sum: { $ifNull: ['$views', 0] } },
                        totalShares: { $sum: { $ifNull: ['$shares.total', 0] } },
                        whatsappShares: { $sum: { $ifNull: ['$shares.whatsapp', 0] } },
                        facebookShares: { $sum: { $ifNull: ['$shares.facebook', 0] } },
                        twitterShares: { $sum: { $ifNull: ['$shares.twitter', 0] } },
                        breakingCount: { $sum: { $cond: ['$isBreaking', 1, 0] } },
                        featuredCount: { $sum: { $cond: ['$isFeatured', 1, 0] } },
                    },
                },
            ]),
            // Top 10 most-viewed articles
            Article.find({}, { title: 1, views: 1, category: 1, date: 1, image: 1, shares: 1 })
                .sort({ views: -1 })
                .limit(10)
                .lean(),
            // Top 10 most-shared articles
            Article.find({ 'shares.total': { $gt: 0 } }, { title: 1, views: 1, category: 1, date: 1, image: 1, shares: 1 })
                .sort({ 'shares.total': -1 })
                .limit(10)
                .lean(),
            // Recent articles (last 30)
            Article.find({}, { title: 1, category: 1, date: 1, isBreaking: 1, isFeatured: 1, views: 1 })
                .sort({ date: -1 })
                .limit(30)
                .lean(),
            // All viewsByDay for chart aggregation
            Article.find({ views: { $gt: 0 } }, { viewsByDay: 1 }).lean(),
            // Message count
            Message.countDocuments().catch(() => 0),
        ]);

        // Aggregate daily views across all articles
        const dailyMap = {};
        dayKeys.forEach(d => { dailyMap[d] = 0; });
        for (const art of allArticlesForViews) {
            if (!art.viewsByDay) continue;
            // viewsByDay is a Map; in lean() it comes back as plain object
            const entries = art.viewsByDay instanceof Map
                ? Array.from(art.viewsByDay.entries())
                : Object.entries(art.viewsByDay || {});
            for (const [day, count] of entries) {
                if (dailyMap[day] !== undefined) {
                    dailyMap[day] += count;
                }
            }
        }
        const dailyViews = dayKeys.map(d => ({ day: d, views: dailyMap[d] }));

        // Category breakdown (article count + views)
        const categoryStats = await Article.aggregate([
            {
                $group: {
                    _id: '$category',
                    articleCount: { $sum: 1 },
                    totalViews: { $sum: { $ifNull: ['$views', 0] } },
                },
            },
            { $sort: { articleCount: -1 } },
            { $limit: 10 },
        ]);

        // Articles posted per day (for last N days)
        const articlesPerDay = await Article.aggregate([
            {
                $match: {
                    date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const postedMap = {};
        dayKeys.forEach(d => { postedMap[d] = 0; });
        articlesPerDay.forEach(r => { if (postedMap[r._id] !== undefined) postedMap[r._id] = r.count; });
        const articlesPosted = dayKeys.map(d => ({ day: d, count: postedMap[d] }));

        const t = totals[0] || { totalArticles: 0, totalViews: 0, breakingCount: 0, featuredCount: 0 };

        res.set('Cache-Control', 'private, max-age=30');
        res.json({
            totals: {
                ...t,
                messageCount,
            },
            topArticles,
            topShared,
            recentArticles,
            dailyViews,
            articlesPosted,
            categoryStats,
            range: { days, from: dayKeys[0], to: dayKeys[dayKeys.length - 1] },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
