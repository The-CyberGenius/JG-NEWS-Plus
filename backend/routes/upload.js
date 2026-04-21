import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// GET /api/upload/signature
// Frontend direct Cloudinary upload ke liye signature generate karta hai
// File NEVER backend se guzarti — seedha Cloudinary pe jaati hai
router.get('/signature', (req, res) => {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = req.query.folder || 'jgnews_epaper';
        const resourceType = req.query.resource_type || 'raw';

        const paramsToSign = { timestamp, folder };
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder,
            resourceType,
        });
    } catch (error) {
        res.status(500).json({ message: 'Signature generation failed: ' + error.message });
    }
});

export default router;
