import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Article from './models/Article.js';
import Category from './models/Category.js';
import Setting from './models/Setting.js';

dotenv.config();

// Existing seed data
const SEED_ARTICLES = [
    {
        title: 'जयपुर में भारी बारिश से जनजीवन अस्त-व्यस्त, कई इलाकों में जलभराव',
        excerpt: 'राजधानी जयपुर में गुरुवार को हुई भारी बारिश से शहर की सड़कें जलमग्न हो गईं। प्रशासन ने राहत दल तैनात किए हैं।',
        content: `<p>राजधानी जयपुर में गुरुवार को हुई भारी बारिश से शहर की सड़कें जलमग्न हो गईं। प्रशासन ने राहत दल तैनात किए हैं।</p>
    <p>मानसून की इस पहली बड़ी बरसात ने शहर के निचले इलाकों को तालाब में बदल दिया। विद्याधर नगर, मालवीय नगर और सांगानेर में सबसे अधिक जलभराव देखा गया।</p>
    <p>नगर निगम के अधिकारियों ने बताया कि पानी निकासी का काम युद्धस्तर पर जारी है। मुख्यमंत्री ने स्थिति की समीक्षा की और प्रभावित लोगों को हर संभव सहायता देने के निर्देश दिए हैं।</p>`,
        category: 'राजस्थान',
        location: 'जयपुर',
        image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80',
        videoUrl: '',
        isBreaking: true,
        isFeatured: true,
        date: new Date(Date.now() - 1 * 60 * 60 * 1000),
        author: 'JG News Desk',
        tags: ['जयपुर', 'बारिश', 'मानसून'],
    },
    {
        title: 'राजस्थान सरकार ने किसानों के लिए नई योजना की घोषणा की',
        excerpt: 'मुख्यमंत्री ने किसानों को ब्याज मुक्त ऋण और खाद पर सब्सिडी देने की घोषणा की। इससे 20 लाख किसान परिवार लाभान्वित होंगे।',
        content: `<p>राजस्थान सरकार ने किसानों के लिए एक बड़ी राहत योजना की घोषणा की है। इस योजना के तहत किसानों को ब्याज मुक्त ऋण और खाद पर सब्सिडी दी जाएगी।</p>
    <p>मुख्यमंत्री ने बताया कि इस योजना से राज्य के 20 लाख किसान परिवारों को सीधा लाभ मिलेगा। सरकार ने इसके लिए 5000 करोड़ रुपये का बजट आवंटित किया है।</p>
    <p>विपक्ष ने इस घोषणा का स्वागत करते हुए कहा कि यह सही दिशा में उठाया गया कदम है।</p>`,
        category: 'राजनीति',
        location: 'जयपुर',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        isBreaking: true,
        isFeatured: false,
        date: new Date(Date.now() - 3 * 60 * 60 * 1000),
        author: 'राजनीति संवाददाता',
        tags: ['किसान', 'सरकार', 'योजना'],
    },
    {
        title: 'जोधपुर पुलिस ने बड़े ड्रग नेटवर्क का भंडाफोड़ किया, 5 गिरफ्तार',
        excerpt: 'जोधपुर एसओजी ने एक बड़े ड्रग रैकेट का पर्दाफाश करते हुए 5 आरोपियों को गिरफ्तार किया और करोड़ों का माल जब्त किया।',
        content: `<p>जोधपुर पुलिस की एसओजी टीम ने एक बड़े ड्रग नेटवर्क का भंडाफोड़ करते हुए 5 आरोपियों को गिरफ्तार किया है।</p>
    <p>पुलिस ने आरोपियों के पास से 50 किलोग्राम स्मैक और 2 करोड़ रुपये की नकदी बरामद की। एसपी ने बताया कि यह गिरोह राजस्थान, उत्तर प्रदेश और पंजाब में सक्रिय था।</p>`,
        category: 'अपराध',
        location: 'जोधपुर',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
        videoUrl: '',
        isBreaking: true,
        isFeatured: false,
        date: new Date(Date.now() - 5 * 60 * 60 * 1000),
        author: 'क्राइम रिपोर्टर',
        tags: ['जोधपुर', 'पुलिस', 'गिरफ्तारी'],
    },
    {
        title: 'राजस्थान रॉयल्स IPL में जीत दर्ज कर तालिका में शीर्ष पर',
        excerpt: 'राजस्थान रॉयल्स ने मुंबई इंडियंस को रोमांचक मुकाबले में 8 रन से हराया। संजू सैमसन ने शानदार 87 रनों की पारी खेली।',
        content: `<p>राजस्थान रॉयल्स ने मुंबई इंडियंस को रोमांचक मुकाबले में 8 रन से हराकर आईपीएल पॉइंट टेबल में शीर्ष स्थान हासिल किया।</p>
    <p>कप्तान संजू सैमसन ने 87 रनों की जबरदस्त पारी खेली। गेंदबाज युजवेंद्र चहल ने 3 विकेट लेकर मुंबई के अभियान को धराशायी कर दिया।</p>`,
        category: 'खेल',
        location: 'जयपुर',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: true,
        date: new Date(Date.now() - 8 * 60 * 60 * 1000),
        author: 'खेल संवाददाता',
        tags: ['IPL', 'राजस्थान रॉयल्स', 'क्रिकेट'],
    },
    {
        title: 'उदयपुर में अंतर्राष्ट्रीय फिल्म महोत्सव का आगाज, 50 देशों की फिल्में',
        excerpt: 'झीलों की नगरी उदयपुर में 5 दिवसीय अंतर्राष्ट्रीय फिल्म महोत्सव शुरू हुआ। 50 से अधिक देशों की 200 फिल्में दिखाई जाएंगी।',
        content: `<p>उदयपुर में 5 दिवसीय अंतर्राष्ट्रीय फिल्म महोत्सव की शुरुआत धूमधाम से हुई। इस बार 50 से अधिक देशों की 200 से ज़्यादा फिल्में प्रदर्शित होंगी।</p>
    <p>महोत्सव का उद्घाटन बॉलीवुड अभिनेत्री ने किया। पिछोला झील के किनारे बने विशेष आउटडोर थिएटर में दर्शकों की भीड़ उमड़ी।</p>`,
        category: 'मनोरंजन',
        location: 'उदयपुर',
        image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: false,
        date: new Date(Date.now() - 12 * 60 * 60 * 1000),
        author: 'मनोरंजन डेस्क',
        tags: ['उदयपुर', 'फिल्म', 'महोत्सव'],
    },
];

const SEED_CATEGORIES = [
    { name: 'राजस्थान' },
    { name: 'राजनीति' },
    { name: 'अपराध' },
    { name: 'खेल' },
    { name: 'मनोरंजन' },
    { name: 'व्यापार' },
    { name: 'शिक्षा' },
    { name: 'धर्म' },
    { name: 'ग्रामीण' },
    { name: 'पर्यटन' },
];

const SEED_SETTINGS = {
    liveUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    siteTitle: 'JG News Plus',
    breakingLabel: 'ब्रेकिंग न्यूज़',
    adminPassword: 'jgnews@2024',
};

const importData = async () => {
    try {
        await connectDB();

        // Remove existing data to avoid duplicates during seeding
        await Article.deleteMany();
        await Category.deleteMany();
        await Setting.deleteMany();

        console.log('Old Data Destroyed...');

        // Insert new data
        await Article.insertMany(SEED_ARTICLES);
        await Category.insertMany(SEED_CATEGORIES);
        await Setting.create(SEED_SETTINGS);

        console.log('Sample Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error.message}`);
        process.exit(1);
    }
}

if (process.argv[2] === '-d') {
    // optional delete script
} else {
    importData();
}
