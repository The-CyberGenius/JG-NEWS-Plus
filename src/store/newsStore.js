// ─── Seed Data ───────────────────────────────────────────────────────────────
const SEED_ARTICLES = [
    {
        id: '1',
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
        date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        author: 'JG News Desk',
        tags: ['जयपुर', 'बारिश', 'मानसून'],
    },
    {
        id: '2',
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
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        author: 'राजनीति संवाददाता',
        tags: ['किसान', 'सरकार', 'योजना'],
    },
    {
        id: '3',
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
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        author: 'क्राइम रिपोर्टर',
        tags: ['जोधपुर', 'पुलिस', 'गिरफ्तारी'],
    },
    {
        id: '4',
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
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        author: 'खेल संवाददाता',
        tags: ['IPL', 'राजस्थान रॉयल्स', 'क्रिकेट'],
    },
    {
        id: '5',
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
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        author: 'मनोरंजन डेस्क',
        tags: ['उदयपुर', 'फिल्म', 'महोत्सव'],
    },
    {
        id: '6',
        title: 'कोटा में छात्रों के लिए मानसिक स्वास्थ्य केंद्र खुला',
        excerpt: 'कोटा प्रशासन ने प्रतियोगी परीक्षाओं की तैयारी कर रहे छात्रों की मदद के लिए एक विशेष मानसिक स्वास्थ्य केंद्र खोला है।',
        content: `<p>कोटा प्रशासन ने प्रतियोगी परीक्षाओं की तैयारी कर रहे छात्रों की मदद के लिए एक विशेष मानसिक स्वास्थ्य केंद्र की स्थापना की है।</p>
    <p>इस केंद्र में मनोचिकित्सक और काउंसलर 24 घंटे उपलब्ध रहेंगे। छात्र हेल्पलाइन नंबर पर कॉल करके भी सहायता ले सकते हैं।</p>`,
        category: 'शिक्षा',
        location: 'कोटा',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: false,
        date: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        author: 'शिक्षा संवाददाता',
        tags: ['कोटा', 'शिक्षा', 'छात्र'],
    },
    {
        id: '7',
        title: 'अजमेर दरगाह में उर्स का आगाज, लाखों श्रद्धालु पहुंचे',
        excerpt: 'अजमेर शरीफ दरगाह में ख्वाजा मोइनुद्दीन चिश्ती का उर्स शुरू हो गया। देश-विदेश से लाखों जायरीन पहुंचे।',
        content: `<p>अजमेर शरीफ दरगाह में ख्वाजा मोइनुद्दीन चिश्ती का वार्षिक उर्स शुरू हो गया है। इस अवसर पर देश-विदेश से लाखों श्रद्धालु दरगाह पर माथा टेकने पहुंचे हैं।</p>
    <p>प्रशासन ने सुरक्षा के कड़े इंतजाम किए हैं। इस बार उर्स में 15 लाख से अधिक जायरीन के आने का अनुमान है।</p>`,
        category: 'धर्म',
        location: 'अजमेर',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: false,
        date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        author: 'धर्म डेस्क',
        tags: ['अजमेर', 'उर्स', 'दरगाह'],
    },
    {
        id: '8',
        title: 'बीकानेर के ऊंट उत्सव में विदेशी पर्यटकों की भीड़',
        excerpt: 'बीकानेर ऊंट उत्सव में इस बार रिकॉर्ड 10 हजार पर्यटक पहुंचे, जिनमें 3 हजार से अधिक विदेशी सैलानी हैं।',
        content: `<p>बीकानेर में आयोजित ऊंट उत्सव में इस बार रिकॉर्ड तोड़ 10,000 पर्यटकों ने शिरकत की। इनमें 3,000 से अधिक विदेशी सैलानी भी शामिल हैं।</p>
    <p>उत्सव में ऊंटों की दौड़, ऊंट सज्जा प्रतियोगिता और लोक नृत्य का आयोजन किया गया। पर्यटन विभाग ने इसे अब तक का सबसे सफल उत्सव बताया।</p>`,
        category: 'पर्यटन',
        location: 'बीकानेर',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: true,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        author: 'पर्यटन संवाददाता',
        tags: ['बीकानेर', 'ऊंट उत्सव', 'पर्यटन'],
    },
    {
        id: '9',
        title: 'राजस्थान में 5G नेटवर्क का विस्तार, 10 नए शहर जुड़े',
        excerpt: 'दूरसंचार कंपनियों ने राजस्थान के 10 और शहरों में 5G सेवाएं शुरू की हैं। अब राज्य के 25 शहरों में 5G उपलब्ध होगा।',
        content: `<p>राजस्थान में 5G नेटवर्क का तेजी से विस्तार हो रहा है। दूरसंचार कंपनियों ने 10 नए शहरों में 5G सेवाएं लॉन्च की हैं।</p>
    <p>अब राज्य के 25 शहरों में 5G नेटवर्क उपलब्ध है। सरकार का लक्ष्य 2025 तक सभी जिला मुख्यालयों को 5G से जोड़ना है।</p>`,
        category: 'व्यापार',
        location: 'जयपुर',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: false,
        date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        author: 'तकनीक संवाददाता',
        tags: ['5G', 'तकनीक', 'राजस्थान'],
    },
    {
        id: '10',
        title: 'बाड़मेर में बाढ़ से सैकड़ों गांव प्रभावित, सेना तैनात',
        excerpt: 'पश्चिमी राजस्थान के बाड़मेर में बाढ़ से 200 से अधिक गांव प्रभावित हैं। सेना और NDRF के दल राहत कार्य में जुटे हैं।',
        content: `<p>पश्चिमी राजस्थान के बाड़मेर में बाढ़ की स्थिति भयावह बनी हुई है। 200 से अधिक गांव बाढ़ के पानी में घिरे हुए हैं।</p>
    <p>सेना और NDRF की टीमें राहत-बचाव कार्य में जुटी हैं। मुख्यमंत्री ने हवाई सर्वेक्षण कर बाढ़ पीड़ितों को 5000 करोड़ की सहायता देने की घोषणा की।</p>`,
        category: 'राजस्थान',
        location: 'बाड़मेर',
        image: 'https://images.unsplash.com/photo-1503656142023-618e7d1f435a?w=800&q=80',
        videoUrl: '',
        isBreaking: true,
        isFeatured: false,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        author: 'JG News Desk',
        tags: ['बाड़मेर', 'बाढ़', 'राहत'],
    },
    {
        id: '11',
        title: 'जयपुर मेट्रो का विस्तार: तीन नए रूट को मिली मंजूरी',
        excerpt: 'राज्य सरकार ने जयपुर मेट्रो के तीन नए रूट को मंजूरी दे दी है। इससे 50 लाख से ज्यादा लोगों को फायदा होगा।',
        content: `<p>राज्य सरकार ने जयपुर मेट्रो के तीन नए रूट को मंजूरी प्रदान कर दी है। इन रूट पर काम अगले साल से शुरू होगा।</p>
    <p>नए रूट में सीतापुरा, वैशाली नगर और मानसरोवर कॉरिडोर शामिल हैं। यह प्रोजेक्ट 15,000 करोड़ रुपये का होगा।</p>`,
        category: 'राजस्थान',
        location: 'जयपुर',
        image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: false,
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        author: 'सिटी डेस्क',
        tags: ['जयपुर', 'मेट्रो', 'विकास'],
    },
    {
        id: '12',
        title: 'राजस्थान के किसानों ने जैविक खेती अपनाकर बदली किस्मत',
        excerpt: 'श्रीगंगानगर के 500 किसानों ने जैविक खेती से प्रति एकड़ तीन गुना अधिक मुनाफा कमाया। सरकार की योजना से मिली प्रेरणा।',
        content: `<p>श्रीगंगानगर जिले के 500 किसानों ने जैविक खेती अपनाकर अपनी आय तीन गुना कर ली है। इन किसानों को सरकार की जैविक खेती प्रोत्साहन योजना से प्रेरणा मिली।</p>
    <p>इन किसानों का उत्पाद अब दिल्ली, मुंबई और विदेशों में भी बिक रहा है। कृषि विभाग ने इन्हें राज्य स्तरीय पुरस्कार से सम्मानित किया।</p>`,
        category: 'ग्रामीण',
        location: 'श्रीगंगानगर',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
        videoUrl: '',
        isBreaking: false,
        isFeatured: false,
        date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        author: 'ग्रामीण संवाददाता',
        tags: ['किसान', 'जैविक खेती', 'ग्रामीण'],
    },
];

const SEED_CATEGORIES = [
    'राजस्थान', 'राजनीति', 'अपराध', 'खेल', 'मनोरंजन',
    'व्यापार', 'शिक्षा', 'धर्म', 'ग्रामीण', 'पर्यटन'
];

const SEED_SETTINGS = {
    liveUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    siteTitle: 'JG News Plus',
    breakingLabel: 'ब्रेकिंग न्यूज़',
    adminPassword: 'jgnews@2024',
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEYS = {
    ARTICLES: 'jgnews_articles',
    CATEGORIES: 'jgnews_categories',
    SETTINGS: 'jgnews_settings',
    ADMIN: 'jgnews_admin_session',
};

// ─── Initialize ───────────────────────────────────────────────────────────────
const init = () => {
    if (!localStorage.getItem(KEYS.ARTICLES)) {
        localStorage.setItem(KEYS.ARTICLES, JSON.stringify(SEED_ARTICLES));
    }
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
        localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(SEED_SETTINGS));
    }
};

// ─── Articles CRUD ────────────────────────────────────────────────────────────
export const getArticles = () => {
    init();
    return JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]');
};

export const getArticleById = (id) =>
    getArticles().find((a) => a.id === id) || null;

export const getArticlesByCategory = (category) =>
    getArticles().filter((a) => a.category === category);

export const getFeaturedArticles = () =>
    getArticles().filter((a) => a.isFeatured);

export const getBreakingArticles = () =>
    getArticles().filter((a) => a.isBreaking);

export const addArticle = (article) => {
    const articles = getArticles();
    const newArticle = {
        ...article,
        id: Date.now().toString(),
        date: new Date().toISOString(),
    };
    articles.unshift(newArticle);
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    return newArticle;
};

export const updateArticle = (id, updates) => {
    const articles = getArticles();
    const idx = articles.findIndex((a) => a.id === id);
    if (idx !== -1) {
        articles[idx] = { ...articles[idx], ...updates };
        localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
        return articles[idx];
    }
    return null;
};

export const deleteArticle = (id) => {
    const articles = getArticles().filter((a) => a.id !== id);
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = () => {
    init();
    return JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]');
};

export const addCategory = (name) => {
    const cats = getCategories();
    if (!cats.includes(name)) {
        cats.push(name);
        localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
    }
};

export const deleteCategory = (name) => {
    const cats = getCategories().filter((c) => c !== name);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = () => {
    init();
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
};

export const updateSettings = (updates) => {
    const settings = getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
};

// ─── Admin Auth ───────────────────────────────────────────────────────────────
export const adminLogin = (password) => {
    const settings = getSettings();
    if (password === settings.adminPassword) {
        sessionStorage.setItem(KEYS.ADMIN, 'true');
        return true;
    }
    return false;
};

export const adminLogout = () => {
    sessionStorage.removeItem(KEYS.ADMIN);
};

export const isAdminLoggedIn = () =>
    sessionStorage.getItem(KEYS.ADMIN) === 'true';
