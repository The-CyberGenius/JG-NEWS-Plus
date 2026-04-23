import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ siteTitle: 'JG News Plus' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update settings
router.put('/', async (req, res) => {
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
