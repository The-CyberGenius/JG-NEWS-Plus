import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    liveUrl: { type: String, default: '' },
    siteTitle: { type: String, default: 'JG News Plus' },
    breakingLabel: { type: String, default: 'ब्रेकिंग न्यूज़' },
    adminPassword: { type: String, required: true }, // We'll store it here for now as in the original design
});

export default mongoose.model('Setting', settingSchema);
