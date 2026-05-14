import fs from 'fs';
import path from 'path';
import Article from '../models/Article.js';

const SITE_URL = process.env.SITE_URL || 'https://jgnews.live';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

const BOT_UA = /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex(?:bot|images)|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|applebot|pinterest|skypeuripreview|slackbot|embedly|quora link preview|outbrain|vkshare|w3c_validator|redditbot|ia_archiver|crawler|spider|bot)/i;

const isBot = (req) => BOT_UA.test(req.headers['user-agent'] || '');

const ARTICLE_PATH = /^\/article\/([^/]+)\/?$/;
const CATEGORY_PATH = /^\/category\/([^/]+)\/?$/;

const htmlEsc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Strip HTML tags for crawler-readable plain text fallback.
const stripTags = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// SPA shell — read once, cached. Used for non-bot requests so the React app loads.
let cachedShell = null;
const getSpaShell = () => {
    if (cachedShell !== null) return cachedShell;
    const candidates = [
        path.resolve(process.cwd(), 'dist', 'index.html'),
        path.resolve(process.cwd(), 'index.html'),
    ];
    for (const p of candidates) {
        try {
            cachedShell = fs.readFileSync(p, 'utf8');
            return cachedShell;
        } catch { /* try next */ }
    }
    cachedShell = '';
    return cachedShell;
};

function articleBotHtml(article) {
    const title = article.title || 'JG News Plus';
    const description = article.excerpt || article.title || 'JG News Plus Rajasthan - 24x7 Latest News in Hindi.';
    const image = article.image || DEFAULT_IMAGE;
    const slugOrId = article.slug || article._id;
    const canonical = `${SITE_URL}/article/${slugOrId}`;
    const published = (article.date || article.createdAt || new Date()).toISOString();
    const modified = (article.updatedAt || article.date || new Date()).toISOString();
    const author = article.author || 'JG News Plus';
    const category = article.category || '';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        image: [image].filter(Boolean),
        datePublished: published,
        dateModified: modified,
        author: [{ '@type': 'Person', name: author }],
        publisher: {
            '@type': 'Organization',
            name: 'JG News Plus',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        description: stripTags(description),
        articleSection: category,
        inLanguage: 'hi',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    };

    const bodyText = stripTags(article.content || article.excerpt || '');

    return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${htmlEsc(title)} | JG News Plus</title>
<meta name="description" content="${htmlEsc(stripTags(description))}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="author" content="${htmlEsc(author)}" />
${category ? `<meta name="news_keywords" content="${htmlEsc(category)}" />` : ''}
<link rel="canonical" href="${htmlEsc(canonical)}" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${htmlEsc(title)}" />
<meta property="og:description" content="${htmlEsc(stripTags(description))}" />
<meta property="og:image" content="${htmlEsc(image)}" />
<meta property="og:url" content="${htmlEsc(canonical)}" />
<meta property="og:site_name" content="JG News Plus" />
<meta property="og:locale" content="hi_IN" />
<meta property="article:published_time" content="${published}" />
<meta property="article:modified_time" content="${modified}" />
<meta property="article:author" content="${htmlEsc(author)}" />
${category ? `<meta property="article:section" content="${htmlEsc(category)}" />` : ''}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${htmlEsc(title)}" />
<meta name="twitter:description" content="${htmlEsc(stripTags(description))}" />
<meta name="twitter:image" content="${htmlEsc(image)}" />
<meta name="twitter:site" content="@jgnewslive" />

<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<article>
<h1>${htmlEsc(title)}</h1>
${image ? `<img src="${htmlEsc(image)}" alt="${htmlEsc(title)}" />` : ''}
<p><strong>${htmlEsc(author)}</strong> — <time datetime="${published}">${published}</time>${category ? ` — ${htmlEsc(category)}` : ''}</p>
<p>${htmlEsc(stripTags(article.excerpt || ''))}</p>
<div>${htmlEsc(bodyText)}</div>
<p><a href="${htmlEsc(canonical)}">${htmlEsc(canonical)}</a></p>
</article>
</body>
</html>`;
}

async function categoryBotHtml(categoryName) {
    const articles = await Article.find({ category: categoryName, isHidden: { $ne: true } })
        .sort({ date: -1 })
        .limit(20)
        .select({ title: 1, slug: 1, _id: 1, excerpt: 1, image: 1, date: 1 })
        .lean();

    const title = `${categoryName} समाचार`;
    const description = `${categoryName} category की latest Hindi news — JG News Plus Rajasthan पर पढ़ें।`;
    const canonical = `${SITE_URL}/category/${encodeURIComponent(categoryName)}`;

    return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${htmlEsc(title)} | JG News Plus</title>
<meta name="description" content="${htmlEsc(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${htmlEsc(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${htmlEsc(title)} | JG News Plus" />
<meta property="og:description" content="${htmlEsc(description)}" />
<meta property="og:url" content="${htmlEsc(canonical)}" />
<meta property="og:image" content="${DEFAULT_IMAGE}" />
<meta property="og:site_name" content="JG News Plus" />
<meta property="og:locale" content="hi_IN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${htmlEsc(title)} | JG News Plus" />
<meta name="twitter:description" content="${htmlEsc(description)}" />
<meta name="twitter:image" content="${DEFAULT_IMAGE}" />
</head>
<body>
<h1>${htmlEsc(title)}</h1>
<p>${htmlEsc(description)}</p>
<ul>
${articles.map(a => `<li><a href="${SITE_URL}/article/${htmlEsc(a.slug || a._id)}">${htmlEsc(a.title)}</a> — ${htmlEsc(stripTags(a.excerpt || ''))}</li>`).join('\n')}
</ul>
</body>
</html>`;
}

export default async function crawlerRender(req, res, next) {
    const articleMatch = req.path.match(ARTICLE_PATH);
    const categoryMatch = req.path.match(CATEGORY_PATH);

    if (!articleMatch && !categoryMatch) return next();

    const bot = isBot(req);

    // Non-bot user — return the SPA shell so React loads normally.
    if (!bot) {
        const shell = getSpaShell();
        if (!shell) return next();
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
        return res.send(shell);
    }

    try {
        if (articleMatch) {
            const idOrSlug = decodeURIComponent(articleMatch[1]);
            let article = null;
            if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
                article = await Article.findById(idOrSlug).lean();
            }
            if (!article) article = await Article.findOne({ slug: idOrSlug }).lean();
            if (!article || article.isHidden) {
                res.status(404).set('Content-Type', 'text/html; charset=utf-8');
                return res.send('<!DOCTYPE html><html><head><title>Not Found</title><meta name="robots" content="noindex"></head><body><h1>404 — article not found</h1></body></html>');
            }
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
            return res.send(articleBotHtml(article));
        }

        if (categoryMatch) {
            const cat = decodeURIComponent(categoryMatch[1]);
            const html = await categoryBotHtml(cat);
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
            return res.send(html);
        }
    } catch (err) {
        console.error('crawlerRender error:', err);
        return next();
    }
}
