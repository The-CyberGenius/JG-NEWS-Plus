import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Use memory storage (no disk write — works on Vercel serverless)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
});

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'jgnews_epaper') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'raw',   // 'raw' for PDFs
                format: 'pdf',
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

// POST /api/upload/pdf — Upload PDF to Cloudinary
router.post('/pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'PDF file required' });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            fileName: req.file.originalname,
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
});

// POST /api/upload/image — Upload image to Cloudinary (for thumbnails)
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image file required' });

        const stream = cloudinary.uploader.upload_stream(
            { folder: 'jgnews_thumbnails', resource_type: 'image', use_filename: true, unique_filename: true },
            (error, result) => {
                if (error) return res.status(500).json({ message: error.message });
                res.json({ url: result.secure_url, publicId: result.public_id });
            }
        );
        Readable.from(req.file.buffer).pipe(stream);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
