import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import Newspaper from './backend/models/Newspaper.js'; // Ensure correct path or write pure mongoose code

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jg_shiva:ekfbAg5X2VIIhGM1@cluster0.lupm36o.mongodb.net/jg_news_plus?retryWrites=true&w=majority';

cloudinary.config({
    cloud_name: 'dsczo1zim',
    api_key: '833691916979449',
    api_secret: '2G9OjsMp_dBSP7FmDkLvrrWb33E',
});

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        console.log('Uploading PDF to Cloudinary...');
        const result = await cloudinary.uploader.upload('/Users/shivaprajapat/Downloads/yugpaksh epaper 20th april 2026.pdf', {
            folder: 'jgnews_epaper',
            resource_type: 'image',
        });
        
        console.log('Uploaded! URL:', result.secure_url);

        console.log('Saving to DB...');
        const paper = new Newspaper({
            title: 'युगपक्ष ई-अखबार',
            edition: '20 अप्रैल 2026',
            pdfUrl: result.secure_url,
            publishDate: new Date('2026-04-20'),
            isActive: true
        });
        
        await paper.save();
        console.log('Successfully saved to DB!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
