import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    liveUrl: { type: String, default: '' },
    siteTitle: { type: String, default: 'JG News Plus' },
    breakingLabel: { type: String, default: 'ब्रेकिंग न्यूज़' },
});

export default mongoose.model('Setting', settingSchema);
