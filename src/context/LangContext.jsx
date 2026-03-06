import React, { createContext, useContext, useState } from 'react';

export const translations = {
    hi: {
        home: 'होम',
        politics: 'राजनीति',
        sports: 'खेल',
        entertainment: 'मनोरंजन',
        crime: 'अपराध',
        business: 'व्यापार',
        liveTV: 'LIVE TV',
        searchPlaceholder: 'खबर खोजें...',
        readMore: 'पूरी खबर पढ़ें →',
        latestNews: 'ताज़ी खबरें',
        topNews: 'ताजा समाचार',
        videoNews: 'वीडियो न्यूज़',
        weather: 'मौसम',
        watchNow: '▶ अभी देखें',
        liveWatch: 'JG News Plus\nLIVE देखें',
        liveDesc: '24x7 राजस्थान की सबसे तेज़ और सच्ची खबरें। निडर, निष्पक्ष और निर्भीक।',
        breakingNews: 'ब्रेकिंग न्यूज़',
        featured: 'मुख्य',
        back: '← वापस जाएं',
        shareOn: 'शेयर करें:',
        relatedNews: 'संबंधित खबरें',
        tagLabel: 'टैग:',
        categories: 'श्रेणियाँ',
        quickLinks: 'त्वरित लिंक',
        contact: 'संपर्क',
        noNews: 'इस श्रेणी में कोई खबर नहीं है',
        goHome: 'होम पर जाएं',
        searchResults: 'खोज परिणाम',
        found: 'खबरें मिलीं',
        noResults: 'कोई खबर नहीं मिली',
        tryOther: 'दूसरे शब्दों से खोजें',
        about: 'हमारे बारे में',
        contactUs: 'संपर्क करें',
        videos: 'वीडियो',
        photos: 'फोटो गैलरी',
        sendMsg: '📤 भेजें',
        lang: 'EN',
        langLabel: 'English',
        motto: 'निडर • निष्पक्ष • निर्भीक',
        tagline: 'Rajasthan | 24x7 NEWS',
    },
    en: {
        home: 'Home',
        politics: 'Politics',
        sports: 'Sports',
        entertainment: 'Entertainment',
        crime: 'Crime',
        business: 'Business',
        liveTV: 'LIVE TV',
        searchPlaceholder: 'Search news...',
        readMore: 'Read Full Story →',
        latestNews: 'Latest News',
        topNews: 'Top Stories',
        videoNews: 'Video News',
        weather: 'Weather',
        watchNow: '▶ Watch Now',
        liveWatch: 'JG News Plus\nWatch LIVE',
        liveDesc: '24x7 Rajasthan\'s fastest and most credible news. Fearless, Impartial, Courageous.',
        breakingNews: 'Breaking',
        featured: 'Featured',
        back: '← Go Back',
        shareOn: 'Share:',
        relatedNews: 'Related News',
        tagLabel: 'Tags:',
        categories: 'Categories',
        quickLinks: 'Quick Links',
        contact: 'Contact',
        noNews: 'No news found in this category',
        goHome: 'Go to Home',
        searchResults: 'Search Results',
        found: 'results found',
        noResults: 'No results found',
        tryOther: 'Try different keywords',
        about: 'About Us',
        contactUs: 'Contact Us',
        videos: 'Videos',
        photos: 'Photo Gallery',
        sendMsg: '📤 Send',
        lang: 'हि',
        langLabel: 'हिंदी',
        motto: 'Fearless • Impartial • Courageous',
        tagline: 'Rajasthan | 24x7 NEWS',
    },
};

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('jgnews_lang') || 'hi');

    const toggleLang = () => {
        const next = lang === 'hi' ? 'en' : 'hi';
        setLang(next);
        localStorage.setItem('jgnews_lang', next);
    };

    const t = translations[lang];

    return (
        <LangContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LangContext.Provider>
    );
};

export const useLang = () => {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error('useLang must be used within LangProvider');
    return ctx;
};
