import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser({
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
        { name: 'TOI India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' }
    ],
    world: [
        { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'TOI World', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' }
    ],
    rajasthan: [
        { name: 'Patrika Rajasthan', url: 'https://www.patrika.com/rss/rajasthan-news/' },
        { name: 'Google Rajasthan', url: 'https://news.google.com/rss/search?q=rajasthan+news&hl=hi&gl=IN&ceid=IN:hi' }
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
            const data = await parser.parseURL(feed.url);
            const items = data.items.map(item => {
                let img = item.media?.$?.url || item.enclosure?.url || '';
                if (!img) img = extractImage(item.content) || extractImage(item.contentEncoded);

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    // Keeping more content for description
                    fullContent: (item.contentSnippet || item.contentEncoded || item.content || '').replace(/<[^>]*>?/gm, ''),
                    source: feed.name,
                    image: img
                };
            });
            allItems = [...allItems, ...items];
        }

        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        res.json(allItems.slice(0, 30)); 
    } catch (error) {
        console.error('RSS Sync Error:', error);
        res.status(500).json({ message: 'News fetch karne mein problem aayi' });
    }
});

export default router;
