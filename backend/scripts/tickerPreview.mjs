import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const articleSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Article = mongoose.model('Article', articleSchema, 'articles');

await mongoose.connect(process.env.MONGO_URI);

const ACTION = process.argv[2];

if (ACTION === 'create') {
    const samples = [
        { title: 'जयपुर में आज मौसम साफ, तापमान 32 डिग्री दर्ज', isBreaking: true },
        { title: 'राजस्थान सरकार ने किया बड़ा एलान, जानें पूरी खबर', isBreaking: true },
        { title: 'क्रिकेट: आज शाम 7 बजे महामुकाबला, IPL में रोमांच चरम पर', isBreaking: false },
    ];
    for (const s of samples) {
        await Article.create({
            title: s.title,
            excerpt: 'Test ticker preview',
            content: '<p>Preview article for ticker.</p>',
            category: 'राजस्थान',
            location: 'जयपुर',
            image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
            author: 'TICKER_PREVIEW',
            isBreaking: s.isBreaking,
            isFeatured: false,
            tags: ['__preview_ticker__'],
            date: new Date(),
        });
    }
    console.log('Created 3 preview articles.');
} else if (ACTION === 'cleanup') {
    const r = await Article.deleteMany({ author: 'TICKER_PREVIEW' });
    console.log(`Cleaned up ${r.deletedCount} preview articles.`);
} else {
    console.log('Usage: node tickerPreview.mjs create|cleanup');
}

await mongoose.disconnect();
