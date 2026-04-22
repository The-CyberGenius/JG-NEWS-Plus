import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser({
    customFields: {
        item: [['media:content', 'media'], ['enclosure', 'media']],
    }
});

const FEED_MAP = {
    india: [
        { name: 'TOI India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' },
        { name: 'NDTV India', url: 'https://feeds.feedburner.com/ndtvnews-india-news' }
    ],
    world: [
        { name: 'TOI World', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
        { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' }
    ],
    rajasthan: [
        { name: 'TOI Rajasthan', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128819658.cms' },
        { name: 'Google News Rajasthan', url: 'https://news.google.com/rss/search?q=rajasthan+news&hl=hi&gl=IN&ceid=IN:hi' }
    ]
};

router.get('/sync', async (req, res) => {
    const { category = 'india' } = req.query;
    const feeds = FEED_MAP[category] || FEED_MAP.india;

    try {
        let allItems = [];
        
        for (const feed of feeds) {
            const data = await parser.parseURL(feed.url);
            const items = data.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                content: item.contentSnippet || item.content,
                source: feed.name,
                image: item.media?.$?.url || item.enclosure?.url || ''
            }));
            allItems = [...allItems, ...items];
        }

        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        res.json(allItems.slice(0, 20));
    } catch (error) {
        console.error('RSS Sync Error:', error);
        res.status(500).json({ message: 'News fetch karne mein problem aayi' });
    }
});

export default router;
