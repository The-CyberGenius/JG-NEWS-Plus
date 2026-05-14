import express from 'express';
import Parser from 'rss-parser';
import { extract } from '@extractus/article-extractor';
import axios from 'axios';
import { GoogleDecoder } from 'google-news-url-decoder';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// Lock all RSS sync endpoints to admin — they cost time and 3rd-party requests
router.use(requireAdmin);

// Adding User-Agent to prevent getting blocked by RSS sources
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    customFields: {
        item: [
            ['media:content', 'media'],
            ['enclosure', 'media'],
            ['content:encoded', 'contentEncoded']
        ],
    }
});

const FEED_MAP = {
    india: [
        { name: 'NDTV India', url: 'https://feeds.feedburner.com/ndtvnews-india-news' },
        { name: 'Google India', url: 'https://news.google.com/rss/search?q=India+News&hl=hi&gl=IN&ceid=IN:hi' }
    ],
    world: [
        { name: 'Google World', url: 'https://news.google.com/rss/search?q=World+News&hl=hi&gl=IN&ceid=IN:hi' },
        { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' }
    ],
    rajasthan: [
        { name: 'Rajasthan Patrika', url: 'https://www.patrika.com/rss/rajasthan-news.xml' },
        { name: 'Dainik Bhaskar', url: 'https://www.bhaskar.com/rss-feed/1061/' },
        { name: 'Amar Ujala Raj', url: 'https://www.amarujala.com/rss/rajasthan.xml' },
        { name: 'News18 Rajasthan', url: 'https://hindi.news18.com/rss/rajasthan.xml' },
        { name: 'Navbharat Times', url: 'https://navbharattimes.indiatimes.com/rss/rajasthan.cms' },
        { name: 'Hindustan', url: 'https://www.livehindustan.com/rss/news/rajasthan.xml' },
        { name: 'Jagran', url: 'https://www.jagran.com/rss/news-rajasthan.xml' },
        { name: 'Zee Rajasthan', url: 'https://zeenews.india.com/hindi/india/rajasthan/rss' },
        { name: 'Google Rajasthan', url: 'https://news.google.com/rss/search?q=Rajasthan+News&hl=hi&gl=IN&ceid=IN:hi' }
    ]
};

const extractImage = (html) => {
    if (!html) return '';
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '';
};

// ── Content cleaner ────────────────────────────────────────────
// Removes ad placeholders ("विज्ञापन", "Advertisement"), promotional
// blurbs, "read more" CTAs, and inline links from publisher articles.
const cleanArticleContent = (html) => {
    if (!html) return '';
    let out = html;

    // Drop entire <script>, <style>, <iframe>, <ins> (ad slots), <aside> blocks
    out = out.replace(/<(script|style|iframe|ins|aside|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '');

    // Drop self-closing / lone ad tags
    out = out.replace(/<ins\b[^>]*\/?>/gi, '');

    // Remove elements whose class/id signals an ad/promo block
    out = out.replace(/<(div|section|p|span)\b[^>]*(class|id)\s*=\s*["'][^"']*(ad|advert|promo|sponsor|newsletter|subscribe|related|recommend|share|social|footer|disclaimer)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, '');

    // Strip <a> tags but keep inner text — user wants no inline links
    out = out.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

    // Remove standalone "विज्ञापन" / "Advertisement" text inside any tag or alone
    out = out.replace(/<(p|div|span|h[1-6])[^>]*>\s*(विज्ञापन|Advertisement|ADVERTISEMENT|Ad|प्रायोजित|Sponsored)\s*<\/\1>/gi, '');
    out = out.replace(/(^|\n|>)\s*(विज्ञापन|Advertisement|ADVERTISEMENT|प्रायोजित|Sponsored)\s*(?=$|\n|<)/gi, '$1');

    // Remove common "read more / यहां पढ़ें / पूरी खबर" CTA lines
    out = out.replace(/<(p|div)[^>]*>\s*(यहां पढ़ें|यहाँ पढ़ें|पूरी खबर पढ़ें|और पढ़ें|Read more|Read More|Click here|यह भी पढ़ें|ये भी पढ़ें)[^<]*<\/\1>/gi, '');

    // Collapse empty / whitespace-only paragraphs and divs
    out = out.replace(/<(p|div|span)[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, '');

    // Collapse 3+ consecutive <br> into a single paragraph break
    out = out.replace(/(<br\s*\/?>\s*){3,}/gi, '<br/><br/>');

    // Final whitespace tidy
    out = out.replace(/\n{3,}/g, '\n\n').trim();

    return out;
};

// Plain-text cleaner for /sync previews (no HTML)
const cleanPlainText = (text) => {
    if (!text) return '';
    return text
        .replace(/\b(विज्ञापन|Advertisement|ADVERTISEMENT|प्रायोजित|Sponsored)\b/g, '')
        .replace(/(यहां पढ़ें|यहाँ पढ़ें|पूरी खबर पढ़ें|और पढ़ें|यह भी पढ़ें|ये भी पढ़ें|Read more|Click here)[^.।\n]*/gi, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

// Resolve Google News redirect URLs to the original publisher URL
const resolveGoogleNewsUrl = async (url) => {
    if (!url || !url.includes('news.google.com')) return url;
    try {
        const decoder = new GoogleDecoder();
        const result = await decoder.decode(url);
        if (result && result.status && result.decoded_url) {
            return result.decoded_url;
        }
        console.log('GoogleDecoder returned non-success:', result?.message);
    } catch (err) {
        console.log('GoogleDecoder failed:', err.message);
    }
    // Fallback: follow redirects via axios
    try {
        const response = await axios.get(url, {
            maxRedirects: 5,
            timeout: 8000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        return response.request?.res?.responseUrl || url;
    } catch (e) {
        return url;
    }
};

router.get('/sync', async (req, res) => {
    const { category = 'india' } = req.query;
    const feeds = FEED_MAP[category] || FEED_MAP.india;

    try {
        let allItems = [];

        for (const feed of feeds) {
            try {
                const data = await parser.parseURL(feed.url);
                const items = data.items.map(item => {
                    let img = item.media?.$?.url || item.enclosure?.url || '';
                    if (!img) img = extractImage(item.content) || extractImage(item.contentEncoded);

                    const rawContent = item.contentEncoded || item.content || item.contentSnippet || item.summary || item.description || '';
                    const stripped = rawContent.replace(/<[^>]*>?/gm, '').trim();
                    const cleanContent = cleanPlainText(stripped);

                    return {
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        fullContent: cleanContent || item.title,
                        source: feed.name,
                        image: img
                    };
                });
                allItems = [...allItems, ...items];
            } catch (err) {
                console.error(`Feed ${feed.name} failed:`, err.message);
                // Continue to next feed if one fails
            }
        }

        if (allItems.length === 0) {
            return res.status(404).json({ message: 'Koi khabar nahi mili' });
        }

        // ─── Filter: only long-form articles ─────────────────────────────
        // RSS often contains:
        //   - Just the title (no description) → skip
        //   - 1-2 line snippets ("Read more...") → skip
        //   - Real articles with 200+ char content → KEEP
        const MIN_CONTENT_LENGTH = 200; // characters of plain text
        const wordCount = (s) => s.split(/\s+/).filter(Boolean).length;

        const longFormItems = allItems.filter(item => {
            const text = (item.fullContent || '').trim();
            if (!text || text === item.title) return false; // no real content
            if (text.length < MIN_CONTENT_LENGTH) return false; // too short
            if (wordCount(text) < 30) return false; // less than 30 words = snippet
            // Skip common "click here / read more" placeholder content
            const lower = text.toLowerCase();
            if (lower.includes('click here to read') && text.length < 300) return false;
            return true;
        });

        // If filter removed too much, fall back to original list with warning
        // so admin still gets results. But sort longform first.
        const finalList = longFormItems.length >= 5 ? longFormItems : allItems;

        finalList.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        res.json(finalList.slice(0, 30));
    } catch (error) {
        console.error('RSS Sync Error:', error);
        res.status(500).json({ message: 'News fetch karne mein problem aayi' });
    }
});

router.post('/extract', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        // Decode Google News redirect URLs to the real publisher URL
        const realUrl = await resolveGoogleNewsUrl(url);

        let article = null;
        try {
            article = await extract(realUrl);
        } catch(err) {
            console.log("article-extractor failed, trying fallback...", err.message);
        }

        let fallbackImage = '';
        let fallbackDescription = '';
        if (!article || !article.image || !article.content) {
            try {
                const { data: htmlData } = await axios.get(realUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                    timeout: 10000,
                    maxRedirects: 5
                });
                const ogImageMatch = htmlData.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>|<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
                if (ogImageMatch) {
                    fallbackImage = ogImageMatch[1] || ogImageMatch[2];
                }
                const ogDescMatch = htmlData.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>|<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
                if (ogDescMatch) {
                    fallbackDescription = ogDescMatch[1] || ogDescMatch[2];
                }
            } catch(e) {
                // ignore fallback error
            }
        }

        const rawContent = article?.content || (fallbackDescription ? `<p>${fallbackDescription}</p>` : '');
        const finalContent = cleanArticleContent(rawContent);
        const finalText = cleanPlainText(article?.text || fallbackDescription || '');
        const finalImage = article?.image || fallbackImage || '';

        if (!finalContent && !finalImage) {
            return res.status(404).json({ message: 'Could not extract article content or image' });
        }

        res.json({
            content: finalContent,
            text: finalText,
            image: finalImage
        });
    } catch (error) {
        console.error('Article Extraction Error:', error.message);
        res.status(500).json({ message: 'Failed to extract article content' });
    }
});

export default router;
