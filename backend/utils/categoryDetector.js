// Keyword-based category detection (Hindi + English).
// Shared between AI News Sync and bulk auto-categorize backfill.

const CATEGORY_KEYWORDS = {
    'अपराध': ['हत्या', 'मर्डर', 'लूट', 'चोरी', 'डकैती', 'बलात्कार', 'रेप', 'गिरफ्तार', 'गिरफ्तारी', 'fir', 'एफआईआर', 'अपराध', 'क्राइम', 'crime', 'murder', 'robbery', 'theft', 'arrest', 'arrested', 'accused', 'आरोपी', 'जुर्म', 'घोटाला', 'तस्करी', 'smuggling', 'fraud', 'धोखाधड़ी', 'जालसाजी', 'जेल', 'हमला', 'मारपीट', 'दुष्कर्म', 'अपहरण', 'kidnap'],
    'खेल': ['क्रिकेट', 'cricket', 'फुटबॉल', 'football', 'ipl', 'आईपीएल', 'विश्वकप', 'world cup', 'खिलाड़ी', 'player', 'match', 'मैच', 'tournament', 'खेल', 'sports', 'athlete', 'एथलीट', 'रन', 'विकेट', 'goal', 'टीम', 'team', 'stadium', 'कबड्डी', 'हॉकी', 'hockey', 'बैडमिंटन', 'badminton', 'कुश्ती', 'wrestling', 'बॉक्सिंग', 'boxing', 'champion', 'चैंपियन', 'medal', 'मेडल', 'पदक', 'ओलंपिक', 'olympic'],
    'मनोरंजन': ['फिल्म', 'film', 'movie', 'मूवी', 'बॉलीवुड', 'bollywood', 'actor', 'actress', 'अभिनेता', 'अभिनेत्री', 'web series', 'वेब सीरीज', 'ott', 'netflix', 'नेटफ्लिक्स', 'रिलीज', 'release', 'गाना', 'song', 'music', 'संगीत', 'serial', 'सीरियल', 'celebrity', 'सेलिब्रिटी', 'director', 'निर्देशक', 'trailer', 'ट्रेलर', 'award', 'पुरस्कार', 'मनोरंजन', 'entertainment', 'comedy', 'dance', 'reality show', 'टीवी', 'showbiz'],
    'शिक्षा': ['स्कूल', 'school', 'कॉलेज', 'college', 'university', 'विश्वविद्यालय', 'परीक्षा', 'exam', 'examination', 'result', 'रिजल्ट', 'cbse', 'rbse', 'शिक्षा', 'education', 'student', 'विद्यार्थी', 'छात्र', 'teacher', 'शिक्षक', 'admission', 'प्रवेश', 'scholarship', 'छात्रवृत्ति', 'syllabus', 'degree', 'डिग्री', 'coaching', 'course', 'सीट', 'merit'],
    'ग्रामीण': ['गांव', 'village', 'ग्राम', 'पंचायत', 'panchayat', 'किसान', 'farmer', 'खेती', 'farming', 'agriculture', 'कृषि', 'फसल', 'crop', 'सरपंच', 'sarpanch', 'ग्रामीण', 'rural', 'देहात', 'जमीन', 'land', 'irrigation', 'सिंचाई', 'mgnrega', 'मनरेगा', 'kisan', 'फसल बीमा', 'भूमि'],
};

const ORDER = ['अपराध', 'खेल', 'मनोरंजन', 'शिक्षा', 'ग्रामीण'];

export const detectCategory = (title, content) => {
    const text = ((title || '') + ' ' + (content || '')).toLowerCase();
    for (const cat of ORDER) {
        if (CATEGORY_KEYWORDS[cat].some(kw => text.includes(kw))) return cat;
    }
    return 'राजस्थान';
};
