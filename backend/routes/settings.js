import express from 'express';
import Parser from 'rss-parser';
import Setting from '../models/Setting.js';
import { requireSuperAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

const YT_CHANNEL_ID = 'UC00-C2Y4XjBE8Fd-q0eD4Rg';
let ytCache = {
    data: null,
    timestamp: 0,
};

const FALLBACK_YOUTUBE_VIDEOS = [
    {
        id: 'IfQMSsKxaBU',
        title: 'JG NEWS | रतनगढ़ की आज की बड़ी खबरें | 14 अक्टूबर बुलेटिन | सम्पादक मनोज पारीक',
        link: 'https://www.youtube.com/watch?v=IfQMSsKxaBU',
        embedUrl: 'https://www.youtube.com/embed/IfQMSsKxaBU',
        thumbnail: 'https://i.ytimg.com/vi/IfQMSsKxaBU/hqdefault.jpg',
        published: '2026-10-13T17:14:12.000Z'
    },
    {
        id: 'jpcK4aX7Sl0',
        title: 'JG NEWS | रतनगढ़ की आज की बड़ी खबरें | 13 अक्टूबर बुलेटिन | सम्पादक मनोज पारीक',
        link: 'https://www.youtube.com/watch?v=jpcK4aX7Sl0',
        embedUrl: 'https://www.youtube.com/embed/jpcK4aX7Sl0',
        thumbnail: 'https://i.ytimg.com/vi/jpcK4aX7Sl0/hqdefault.jpg',
        published: '2026-10-12T22:30:09.000Z'
    },
    {
        id: 'nrk3hwlZ9eo',
        title: 'सांगासर साधु हत्याकांड का खुलासा और NH-11 पर दर्दनाक हादसा | 12 Oct | JG NEWS पत्रकार मनोज पारीक',
        link: 'https://www.youtube.com/watch?v=nrk3hwlZ9eo',
        embedUrl: 'https://www.youtube.com/embed/nrk3hwlZ9eo',
        thumbnail: 'https://i.ytimg.com/vi/nrk3hwlZ9eo/hqdefault.jpg',
        published: '2026-10-11T19:30:34.000Z'
    },
    {
        id: 'uP1ui9YI7g4',
        title: 'रतनगढ़ मुख्य समाचार: लोक अदालत फैसला, रामलीला शुभारंभ और दुर्गा महोत्सव | 11 Oct | JG NEWS',
        link: 'https://www.youtube.com/watch?v=uP1ui9YI7g4',
        embedUrl: 'https://www.youtube.com/embed/uP1ui9YI7g4',
        thumbnail: 'https://i.ytimg.com/vi/uP1ui9YI7g4/hqdefault.jpg',
        published: '2026-10-11T02:24:09.000Z'
    },
    {
        id: '6CqsVkm5GRM',
        title: 'रतनगढ़ सांगासर साधु हत्या मामला, समाधि से निकाला शव! | JG News 10 Oct 2026 | Manoj Pareek',
        link: 'https://www.youtube.com/watch?v=6CqsVkm5GRM',
        embedUrl: 'https://www.youtube.com/embed/6CqsVkm5GRM',
        thumbnail: 'https://i.ytimg.com/vi/6CqsVkm5GRM/hqdefault.jpg',
        published: '2026-10-09T20:30:15.000Z'
    }
];

// GET /api/settings/youtube-videos - returns latest videos from JG News YouTube channel
router.get('/youtube-videos', async (req, res) => {
    try {
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));
        const now = Date.now();

        // 10-minute in-memory cache
        if (ytCache.data && (now - ytCache.timestamp < 10 * 60 * 1000)) {
            return res.json(ytCache.data.slice(0, limit));
        }

        const parser = new Parser({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            customFields: {
                item: [
                    ['yt:videoId', 'videoId'],
                    ['yt:channelId', 'channelId'],
                ]
            }
        });

        const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`);
        if (feed && feed.items && feed.items.length > 0) {
            const videos = feed.items.map(item => {
                const videoId = item.videoId || (item.id && String(item.id).replace('yt:video:', '')) || '';
                return {
                    id: videoId,
                    title: item.title,
                    link: item.link || `https://www.youtube.com/watch?v=${videoId}`,
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    published: item.pubDate || item.isoDate || new Date().toISOString()
                };
            }).filter(v => !!v.id);

            if (videos.length > 0) {
                ytCache.data = videos;
                ytCache.timestamp = now;
                return res.json(videos.slice(0, limit));
            }
        }

        if (ytCache.data) {
            return res.json(ytCache.data.slice(0, limit));
        }
        res.json(FALLBACK_YOUTUBE_VIDEOS.slice(0, limit));
    } catch (error) {
        console.error('YouTube RSS fetch error:', error.message);
        if (ytCache.data) {
            return res.json(ytCache.data.slice(0, 5));
        }
        res.json(FALLBACK_YOUTUBE_VIDEOS.slice(0, 5));
    }
});

// Get settings
router.get('/', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ siteTitle: 'JG News' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update settings
router.put('/', requireSuperAdmin, async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (settings) {
            settings.liveUrl = req.body.liveUrl || settings.liveUrl;
            settings.siteTitle = req.body.siteTitle || settings.siteTitle;
            settings.breakingLabel = req.body.breakingLabel || settings.breakingLabel;
            settings.adminPassword = req.body.adminPassword || settings.adminPassword;
            const updated = await settings.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Settings not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
