import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Article from '../models/Article.js';

const LOCATION_MAPPING = {
    // Ratangarh variants
    'रतनगढ़': 'राजस्थान > चूरू > रतनगढ़',
    'रतनगढ़ ': 'राजस्थान > चूरू > रतनगढ़',
    'रतनगढ़': 'राजस्थान > चूरू > रतनगढ़',
    'ratangarh': 'राजस्थान > चूरू > रतनगढ़',
    'raangarh': 'राजस्थान > चूरू > रतनगढ़',
    'churu ratangarh': 'राजस्थान > चूरू > रतनगढ़',
    
    // District defaults
    'अजमेर': 'राजस्थान > अजमेर > अजमेर',
    'अलवर': 'राजस्थान > अलवर > अलवर',
    'अनूपगढ़': 'राजस्थान > अनूपगढ़ > अनूपगढ़',
    'बालोतरा': 'राजस्थान > बालोतरा > बालोतरा',
    'बांसवाड़ा': 'राजस्थान > बांसवाड़ा > बांसवाड़ा',
    'बारां': 'राजस्थान > बारां > बारां',
    'बाड़मेर': 'राजस्थान > बाड़मेर > बाड़मेर',
    'ब्यावर': 'राजस्थान > ब्यावर > ब्यावर',
    'भरतपुर': 'राजस्थान > भरतपुर > भरतपुर',
    'भीलवाड़ा': 'राजस्थान > भीलवाड़ा > भीलवाड़ा',
    'बीकानेर': 'राजस्थान > बीकानेर > बीकानेर',
    'बूंदी': 'राजस्थान > बूंदी > बूंदी',
    'चित्तौड़गढ़': 'राजस्थान > चित्तौड़गढ़ > चित्तौड़गढ़',
    'चूरू': 'राजस्थान > चूरू > चूरू',
    'दौसा': 'राजस्थान > दौसा > दौसा',
    'डीग': 'राजस्थान > डीग > डीग',
    'धौलपुर': 'राजस्थान > धौलपुर > धौलपुर',
    'डीडवाना-कुचामन': 'राजस्थान > डीडवाना-कुचामन > डीडवाना-कुचामन',
    'दूदू': 'राजस्थान > दूदू > दूदू',
    'डूंगरपुर': 'राजस्थान > डूंगरपुर > डूंगरपुर',
    'गंगानगर': 'राजस्थान > गंगानगर > गंगानगर',
    'गंगापुर सिटी': 'राजस्थान > गंगापुर सिटी > गंगापुर सिटी',
    'हनुमानगढ़': 'राजस्थान > हनुमानगढ़ > हनुमानगढ़',
    'जयपुर': 'राजस्थान > जयपुर > जयपुर',
    'जयपुर ग्रामीण': 'राजस्थान > जयपुर ग्रामीण > जयपुर ग्रामीण',
    'जैसलमेर': 'राजस्थान > जैसलमेर > जैसलमेर',
    'जालौर': 'राजस्थान > जालौर > जालौर',
    'झालावाड़': 'राजस्थान > झालावाड़ > झालावाड़',
    'झुंझुनूं': 'राजस्थान > झुंझुनूं > झुंझुनूं',
    'जोधपुर': 'राजस्थान > जोधपुर > जोधपुर',
    'जोधपुर ग्रामीण': 'राजस्थान > जोधपुर ग्रामीण > जोधपुर ग्रामीण',
    'करौली': 'राजस्थान > करौली > करौली',
    'केकड़ी': 'राजस्थान > केकड़ी > केकड़ी',
    'खैरथल-तिजारा': 'राजस्थान > खैरथल-तिजारा > खैरथल-तिजारा',
    'कोटा': 'राजस्थान > कोटा > कोटा',
    'कोटपुतली-बहरोड़': 'राजस्थान > कोटपुतली-बहरोड़ > कोटपुतली-बहरोड़',
    'नागौर': 'राजस्थान > नागौर > नागौर',
    'नागौर ': 'राजस्थान > नागौर > नागौर',
    'नीम का थाना': 'राजस्थान > नीम का थाना > नीम का थाना',
    'पाली': 'राजस्थान > पाली > पाली',
    'फलोदी': 'राजस्थान > फलोदी > फलोदी',
    'प्रतापगढ़': 'राजस्थान > प्रतापगढ़ > प्रतापगढ़',
    'राजसमंद': 'राजस्थान > राजसमंद > राजसमंद',
    'सलुंबर': 'राजस्थान > सलुंबर > सलुंबर',
    'सांचौर': 'राजस्थान > सांचौर > सांचौर',
    'सवाई माधोपुर': 'राजस्थान > सवाई माधोपुर > सवाई माधोपुर',
    'शाहpura': 'राजस्थान > शाहpura > शाहpura',
    'सीकर': 'राजस्थान > सीकर > सीकर',
    'सिरोही': 'राजस्थान > सिरोही > सिरोही',
    'टोंक': 'राजस्थान > टोंक > टोंक',
    'उदयपुर': 'राजस्थान > उदयपुर > उदयपुर',
    'अन्य': 'राजस्थान > अन्य > अन्य'
};

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const articles = await Article.find();
        let updatedCount = 0;

        for (const article of articles) {
            let currentLoc = article.location?.trim();
            
            if (currentLoc) {
                if (currentLoc.includes('>')) continue;

                const standardizedLoc = LOCATION_MAPPING[currentLoc];
                
                if (standardizedLoc) {
                    await Article.updateOne({ _id: article._id }, { $set: { location: standardizedLoc } });
                    updatedCount++;
                    console.log(`Updated article ID: ${article._id} - Location: ${currentLoc} -> ${standardizedLoc}`);
                } else {
                    console.log(`Unmapped location found: "${currentLoc}" for article ${article._id}`);
                    const newLoc = `राजस्थान > अन्य > ${currentLoc}`;
                    await Article.updateOne({ _id: article._id }, { $set: { location: newLoc } });
                    updatedCount++;
                }
            }
        }

        console.log(`\nMigration complete. Updated ${updatedCount} articles.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
