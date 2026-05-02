import express from 'express';
import Parser from 'rss-parser';
import { extract } from '@extractus/article-extractor';
import axios from 'axios';
import { GoogleDecoder } from 'google-news-url-decoder';

const router = express.Router();

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
        { name: 'Google Rajasthan', url: 'https://news.google.com/rss/search?q=Rajasthan+News&hl=hi&gl=IN&ceid=IN:hi' },
        { name: 'Amar Ujala Raj', url: 'https://www.amarujala.com/rss/rajasthan.xml' },
        { name: 'News18 Rajasthan', url: 'https://hindi.news18.com/rss/rajasthan.xml' },
        { name: 'Zee Rajasthan', url: 'https://zeenews.india.com/hindi/india/rajasthan/rss' }
    ]
};

const extractImage = (html) => {
    if (!html) return '';
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '';
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
                    const cleanContent = rawContent.replace(/<[^>]*>?/gm, '').trim();

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

        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        res.json(allItems.slice(0, 30));
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

        const finalContent = article?.content || (fallbackDescription ? `<p>${fallbackDescription}</p>` : '');
        const finalImage = article?.image || fallbackImage || '';

        if (!finalContent && !finalImage) {
            return res.status(404).json({ message: 'Could not extract article content or image' });
        }

        res.json({
            content: finalContent,
            text: article?.text || fallbackDescription || '',
            image: finalImage
        });
    } catch (error) {
        console.error('Article Extraction Error:', error.message);
        res.status(500).json({ message: 'Failed to extract article content' });
    }
});

export default router;
