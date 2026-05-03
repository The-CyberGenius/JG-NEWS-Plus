import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import connectDB from './config/db.js';

// Route imports
import articleRoutes from './routes/articles.js';
import categoryRoutes from './routes/categories.js';
import settingRoutes from './routes/settings.js';
import adminRoutes from './routes/admin.js';
import newspaperRoutes from './routes/newspapers.js';
import uploadRoutes from './routes/upload.js';
import newsSyncRoutes from './routes/newsSync.js';
import messageRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import seoRoutes from './routes/seo.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Connect to Database
connectDB();

// API Routes
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newspapers', newspaperRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/news-sync', newsSyncRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seo', seoRoutes);

// Root-level SEO endpoints (Google expects /sitemap.xml at root)
import Article from './models/Article.js';
import Category from './models/Category.js';
const SITE_URL = process.env.SITE_URL || 'https://jgnews.live';
const xmlEsc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

app.get('/sitemap.xml', async (req, res) => {
    try {
        const [articles, categories] = await Promise.all([
            Article.find({}, { _id: 1, date: 1, updatedAt: 1, image: 1, title: 1 })
                .sort({ date: -1 }).limit(2000).lean(),
            Category.find().lean(),
        ]);
        const today = new Date().toISOString();
        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'hourly' },
            { loc: '/live', priority: '0.9', changefreq: 'daily' },
            { loc: '/epaper', priority: '0.9', changefreq: 'daily' },
            { loc: '/videos', priority: '0.7', changefreq: 'daily' },
            { loc: '/photos', priority: '0.7', changefreq: 'daily' },
            { loc: '/about', priority: '0.5', changefreq: 'monthly' },
            { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
        ];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
        for (const p of staticPages) {
            xml += `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
        }
        for (const c of categories) {
            xml += `  <url>\n    <loc>${SITE_URL}/category/${encodeURIComponent(c.name)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }
        for (const a of articles) {
            const lastmod = (a.updatedAt || a.date || new Date()).toISOString();
            const pubDate = (a.date || a.updatedAt || new Date()).toISOString();
            const isRecent = (Date.now() - new Date(pubDate).getTime()) < 2 * 24 * 60 * 60 * 1000;
            xml += `  <url>\n    <loc>${SITE_URL}/article/${a._id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n`;
            if (isRecent) {
                xml += `    <news:news>\n      <news:publication>\n        <news:name>JG News Plus</news:name>\n        <news:language>hi</news:language>\n      </news:publication>\n      <news:publication_date>${pubDate}</news:publication_date>\n      <news:title>${xmlEsc(a.title)}</news:title>\n    </news:news>\n`;
            }
            if (a.image) {
                xml += `    <image:image>\n      <image:loc>${xmlEsc(a.image)}</image:loc>\n      <image:title>${xmlEsc(a.title)}</image:title>\n    </image:image>\n`;
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

app.get('/api', (req, res) => {
    res.send('JG NEWS PLUS API is running...');
});

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
