import mongoose from 'mongoose';

const newspaperSchema = new mongoose.Schema({
    title: { type: String, required: true },       // e.g. "JG News Plus - दैनिक संस्करण"
    edition: { type: String, required: true },     // e.g. "Edition 042 | April 2025"
    pdfUrl: { type: String, required: true },      // Google Drive / Cloudinary URL
    thumbnail: { type: String, default: '' },      // Preview image URL
    publishDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Newspaper', newspaperSchema);
