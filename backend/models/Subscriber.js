import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    source: { type: String, default: 'popup' }, // popup | footer | inline | google
    verified: { type: Boolean, default: false }, // true if signed up via Google (email auto-verified)
    googleId: { type: String, default: '', index: true, sparse: true }, // Google sub claim
    picture: { type: String, default: '' }, // Google profile picture URL
    isActive: { type: Boolean, default: true },
    unsubscribedAt: { type: Date, default: null },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
}, { timestamps: true });

subscriberSchema.index({ createdAt: -1 });
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model('Subscriber', subscriberSchema);
