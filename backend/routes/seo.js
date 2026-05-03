import express from 'express';
import Article from '../models/Article.js';
import Category from '../models/Category.js';

const router = express.Router();

const SITE_URL = process.env.SITE_URL || 'https://jgnews.live';

// XML escape
const esc = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// GET /api/seo/sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
    try {
        const [articles, categories] = await Promise.all([
            Article.find({}, { _id: 1, date: 1, updatedAt: 1, image: 1, title: 1 })
                .sort({ date: -1 }).limit(2000).lean(),
            Category.find().lean(),
        ]);

        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'hourly' },
            { loc: '/live', priority: '0.9', changefreq: 'daily' },
            { loc: '/epaper', priority: '0.9', changefreq: 'daily' },
            { loc: '/videos', priority: '0.7', changefreq: 'daily' },
            { loc: '/photos', priority: '0.7', changefreq: 'daily' },
            { loc: '/about', priority: '0.5', changefreq: 'monthly' },
            { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
        ];

        const today = new Date().toISOString();
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" `;
        xml += `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" `;
        xml += `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        // Static pages
        for (const p of staticPages) {
            xml += `  <url>\n`;
            xml += `    <loc>${SITE_URL}${p.loc}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
            xml += `    <priority>${p.priority}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Categories
        for (const c of categories) {
            xml += `  <url>\n`;
            xml += `    <loc>${SITE_URL}/category/${encodeURIComponent(c.name)}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>hourly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        }

        // Articles (with Google News + Image markup for first 1000)
        for (const a of articles) {
            const lastmod = (a.updatedAt || a.date || new Date()).toISOString();
            const pubDate = (a.date || a.updatedAt || new Date()).toISOString();
            const isRecent = (Date.now() - new Date(pubDate).getTime()) < 2 * 24 * 60 * 60 * 1000; // 2 days

            xml += `  <url>\n`;
            xml += `    <loc>${SITE_URL}/article/${a._id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            if (isRecent) {
                xml += `    <news:news>\n`;
                xml += `      <news:publication>\n`;
                xml += `        <news:name>JG News Plus</news:name>\n`;
                xml += `        <news:language>hi</news:language>\n`;
                xml += `      </news:publication>\n`;
                xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
                xml += `      <news:title>${esc(a.title)}</news:title>\n`;
                xml += `    </news:news>\n`;
            }
            if (a.image) {
                xml += `    <image:image>\n`;
                xml += `      <image:loc>${esc(a.image)}</image:loc>\n`;
                xml += `      <image:title>${esc(a.title)}</image:title>\n`;
                xml += `    </image:image>\n`;
            }
            xml += `  </url>\n`;
        }

        xml += `</urlset>\n`;

        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=3600');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// GET /api/seo/robots.txt
router.get('/robots.txt', (req, res) => {
    const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*

Sitemap: ${SITE_URL}/api/seo/sitemap.xml
`;
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(txt);
});

// GET /api/seo/article/:id
// Returns server-rendered meta tags HTML for an article (for crawlers / share preview)
router.get('/article/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id, {
            title: 1, excerpt: 1, image: 1, category: 1, location: 1,
            date: 1, updatedAt: 1, author: 1, tags: 1,
        }).lean();
        if (!article) return res.status(404).json({ message: 'Not found' });
        res.set('Cache-Control', 'public, max-age=300');
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
