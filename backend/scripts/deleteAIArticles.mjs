import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const articleSchema = new mongoose.Schema({}, { strict: false });
const Article = mongoose.model('Article', articleSchema, 'articles');

const DELETE = process.argv.includes('--delete');

await mongoose.connect(process.env.MONGO_URI);

const filter = { $or: [{ author: 'AI Sync' }, { tags: 'AI Sync' }] };
const matches = await Article.find(filter).lean();
console.log(`Found ${matches.length} AI-Sync articles.`);

if (matches.length > 0) {
    const backupDir = path.resolve(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.resolve(backupDir, `ai-articles-${ts}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(matches, null, 2));
    console.log(`Backup: ${backupPath} (${(fs.statSync(backupPath).size / 1024).toFixed(1)} KB)`);
    console.log('Sample:', matches.slice(0, 3).map(a => ({ title: a.title?.substring(0, 70), author: a.author })));
}

if (DELETE && matches.length > 0) {
    const result = await Article.deleteMany(filter);
    console.log(`DELETED: ${result.deletedCount} articles.`);
} else {
    console.log('Dry-run only. Re-run with --delete to actually delete.');
}

await mongoose.disconnect();
