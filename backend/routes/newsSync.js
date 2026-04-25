import express from 'express';
import Parser from 'rss-parser';
import { extract } from '@extractus/article-extractor';
import axios from 'axios';

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

                    return {
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        fullContent: (item.contentSnippet || item.contentEncoded || item.content || '').replace(/<[^>]*>?/gm, ''),
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
        
        let article = null;
        try {
            article = await extract(url);
        } catch(err) {
            console.log("article-extractor failed, trying fallback...", err.message);
        }

        let fallbackImage = '';
        if (!article || !article.image) {
            try {
                const { data: htmlData } = await axios.get(url, { 
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, 
                    timeout: 8000 
                });
                const ogImageMatch = htmlData.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>|<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
                if (ogImageMatch) {
                    fallbackImage = ogImageMatch[1] || ogImageMatch[2];
                }
            } catch(e) {
                // ignore fallback error
            }
        }
        
        if (!article && !fallbackImage) {
            return res.status(404).json({ message: 'Could not extract article content or image' });
        }
        
        res.json({
            content: article?.content || '', 
            text: article?.text || '',       
            image: article?.image || fallbackImage || ''
        });
    } catch (error) {
        console.error('Article Extraction Error:', error.message);
        res.status(500).json({ message: 'Failed to extract article content' });
    }
});

export default router;
