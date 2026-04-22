import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser({
    customFields: {
        item: [['media:content', 'media'], ['enclosure', 'media']],
    }
});

const FEEDS = [
    { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' },
    { name: 'NDTV India', url: 'https://feeds.feedburner.com/ndtvnews-india-news' }
];

router.get('/sync', async (req, res) => {
    try {
        let allItems = [];
        
        for (const feed of FEEDS) {
            const data = await parser.parseURL(feed.url);
            const items = data.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                content: item.contentSnippet || item.content,
                source: feed.name,
                // Extracting image if available in RSS
                image: item.media?.$?.url || item.enclosure?.url || ''
            }));
            allItems = [...allItems, ...items];
        }

        // Sort by date (latest first)
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        res.json(allItems.slice(0, 20)); // Return top 20 news
    } catch (error) {
        console.error('RSS Sync Error:', error);
        res.status(500).json({ message: 'News fetch karne mein problem aayi' });
    }
});

export default router;
