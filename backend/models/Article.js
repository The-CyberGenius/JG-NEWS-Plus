import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    videoUrl: { type: String, default: '' },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    author: { type: String, required: true },
    tags: [{ type: String }],
    date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Article', articleSchema);
