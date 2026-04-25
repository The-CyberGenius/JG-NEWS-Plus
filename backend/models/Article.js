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

// Add indexes for optimized querying
articleSchema.index({ date: -1 });
articleSchema.index({ category: 1, date: -1 });
articleSchema.index({ isFeatured: 1, date: -1 });
articleSchema.index({ isBreaking: 1, date: -1 });

export default mongoose.model('Article', articleSchema);
