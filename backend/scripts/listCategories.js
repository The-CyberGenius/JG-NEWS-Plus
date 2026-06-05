import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Article from '../models/Article.js';

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const categories = await Article.distinct('category');
        const locations = await Article.distinct('location');
        console.log('Categories:', categories);
        console.log('Locations:', locations);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
