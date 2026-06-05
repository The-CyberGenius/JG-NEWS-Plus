import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Article from '../models/Article.js';
import { detectCategory } from '../utils/categoryDetector.js';

const RAJASTHAN_DISTRICTS = [
    'अजमेर', 'अलवर', 'अनूपगढ़', 'बालोतरा', 'बांसवाड़ा', 'बारां', 'बाड़मेर', 'ब्यावर', 'भरतपुर', 'भीलवाड़ा', 'बीकानेर', 'बूंदी', 'चित्तौड़गढ़', 'चूरू', 'दौसा', 'डीग', 'धौलपुर', 'डीडवाना-कुचामन', 'दूदू', 'डूंगरपुर', 'गंगानगर', 'गंगापुर सिटी', 'हनुमानगढ़', 'जयपुर', 'जयपुर ग्रामीण', 'जैसलमेर', 'जालौर', 'झालावाड़', 'झुंझुनूं', 'जोधपुर', 'जोधपुर ग्रामीण', 'करौली', 'केकड़ी', 'खैरथल-तिजारा', 'कोटा', 'कोटपुतली-बहरोड़', 'नागौर', 'नीम का थाना', 'पाली', 'फलोदी', 'प्रतापगढ़', 'राजसमंद', 'सलुंबर', 'सांचौर', 'सवाई माधोपुर', 'शाहpura', 'सीकर', 'सिरोही', 'टोंक', 'उदयपुर', 'अन्य'
];

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // We use strict: false to access the old `location` field which is removed from Schema.
        const articles = await Article.find({}, { title: 1, content: 1, category: 1, location: 1, district: 1, localArea: 1 }).lean({ strict: false });
        
        let updatedCount = 0;
        const dryRun = process.argv.includes('--dry-run');

        for (const a of articles) {
            let newDistrict = a.district || '';
            let newLocalArea = a.localArea || '';
            let newCategory = a.category;
            let needsUpdate = false;

            const oldLocation = (a.location || '').trim();
            const oldCategory = (a.category || '').trim();

            // Check if old location is actually a category like "अपराध"
            // Wait, normally people put locations in category. 
            // e.g. Category = "राजस्थान > चूरू > रतनगढ़"
            
            if (oldCategory.includes('>')) {
                const parts = oldCategory.split('>').map(p => p.trim());
                // format: State > District > LocalArea
                if (parts.length >= 2) {
                    newDistrict = parts[1];
                    if (parts.length >= 3) {
                        newLocalArea = parts[2];
                    }
                    newCategory = detectCategory(a.title, a.content) || 'अन्य';
                    needsUpdate = true;
                }
            } 
            // If category is a district name directly
            else if (RAJASTHAN_DISTRICTS.includes(oldCategory)) {
                newDistrict = oldCategory;
                newLocalArea = oldLocation !== oldCategory ? oldLocation : '';
                newCategory = detectCategory(a.title, a.content) || 'अन्य';
                needsUpdate = true;
            }

            // If we still don't have a district, let's look at oldLocation
            if (!newDistrict && oldLocation) {
                if (RAJASTHAN_DISTRICTS.includes(oldLocation)) {
                    newDistrict = oldLocation;
                } else {
                    // Try to guess district from string if it contains a district name
                    const foundDistrict = RAJASTHAN_DISTRICTS.find(d => oldLocation.includes(d));
                    if (foundDistrict) {
                        newDistrict = foundDistrict;
                        newLocalArea = oldLocation.replace(foundDistrict, '').replace(/,/g, '').trim();
                    } else {
                        // Put it in localArea and mark district as 'अन्य'
                        newDistrict = 'अन्य';
                        newLocalArea = oldLocation;
                    }
                }
                needsUpdate = true;
            }

            // If no district is found by now, set to 'अन्य'
            if (!newDistrict) {
                newDistrict = 'अन्य';
                needsUpdate = true;
            }

            // Only update if there are changes or if district/localArea fields are missing
            if (needsUpdate || !a.district) {
                if (!dryRun) {
                    await Article.updateOne(
                        { _id: a._id },
                        { 
                            $set: { 
                                district: newDistrict, 
                                localArea: newLocalArea,
                                category: newCategory 
                            },
                            $unset: { location: "" } 
                        },
                        { strict: false }
                    );
                }
                updatedCount++;
                if (updatedCount <= 10) {
                    console.log(`Sample Update: [Cat: ${oldCategory}, Loc: ${oldLocation}] -> [Dist: ${newDistrict}, Local: ${newLocalArea}, Cat: ${newCategory}]`);
                }
            }
        }

        console.log(`\nMigration ${dryRun ? '(DRY RUN) ' : ''}complete! Updated ${updatedCount} out of ${articles.length} articles.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
