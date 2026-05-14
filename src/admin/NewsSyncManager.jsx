import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { syncNews, getSyncSources, extractArticle } from '../store/newsStore';
import { timeAgo, getRandomFallbackImage } from '../utils/helpers';

const CAT_META = {
    rajasthan: { label: '🚩 राजस्थान', color: 'var(--saffron)' },
    india:     { label: '🇮🇳 भारत',    color: 'var(--teal)' },
    world:     { label: '🌍 दुनिया',   color: 'var(--navy)' },
};

const RAJASTHAN_DISTRICTS = [
    'अजमेर', 'अलवर', 'अनूपगढ़', 'बालोतरा', 'बांसवाड़ा', 'बारां', 'बाड़मेर', 'ब्यावर', 'भरतपुर', 'भीलवाड़ा', 'बीकानेर', 'बूंदी', 'चित्तौड़गढ़', 'चूरू', 'दौसा', 'डीग', 'धौलपुर', 'डीडवाना-कुचामन', 'दूदू', 'डूंगरपुर', 'गंगानगर', 'गंगापुर सिटी', 'हनुमानगढ़', 'जयपुर', 'जयपुर ग्रामीण', 'जैसलमेर', 'जालौर', 'झालावाड़', 'झुंझुनूं', 'जोधपुर', 'जोधपुर ग्रामीण', 'करौली', 'केकड़ी', 'खैरथल-तिजारा', 'कोटा', 'कोटपुतली-बहरोड़', 'नागौर', 'नीम का थाना', 'पाली', 'फलोदी', 'प्रतापगढ़', 'राजसमंद', 'सलुंबर', 'सांचौर', 'सवाई माधोपुर', 'शाहपुरा', 'सीकर', 'सिरोही', 'टोंक', 'उदयपुर', 'अन्य'
];

const detectLocation = (title, content) => {
    const text = (title + ' ' + content);
    for (const district of RAJASTHAN_DISTRICTS) {
        if (district === 'अन्य') continue;
        if (text.includes(district)) return district;
    }
    return 'अन्य';
};

// Strip duplicate hero image from content + remove leading empty paragraphs.
// If `heroUrl` is provided, all <img> tags pointing to that URL (or visually
// the first image) are removed so they don't render twice next to the hero.
const cleanContentHTML = (html, heroUrl) => {
    if (!html) return '';
    let cleaned = String(html);

    // Remove the FIRST <img> if it matches the hero URL (or any near-duplicate)
    // Also drop any <img> whose src equals heroUrl exactly.
    if (heroUrl) {
        const escaped = heroUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Remove img tags matching hero URL
        cleaned = cleaned.replace(new RegExp(`<img[^>]*src=["']${escaped}["'][^>]*>`, 'gi'), '');
        // Remove figure wrappers if they became empty
        cleaned = cleaned.replace(/<figure[^>]*>\s*<\/figure>/gi, '');
    }

    // Always strip the FIRST <img> if it's the same image source as hero (URL-based)
    // OR if first child is an image (likely duplicate), so admins don't see double pics
    const firstImgMatch = cleaned.match(/^\s*(<p[^>]*>\s*)?<img[^>]*>(\s*<\/p>)?/i);
    if (firstImgMatch) {
        cleaned = cleaned.replace(firstImgMatch[0], '');
    }

    // Remove empty leading <p>s
    cleaned = cleaned.replace(/^(\s*<p[^>]*>\s*<\/p>)+/gi, '').trim();

    return cleaned;
};

// Strip ALL HTML tags & decode common entities for a clean text excerpt
const stripHTML = (html) => {
    if (!html) return '';
    return String(html)
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
};

const makeExcerpt = (html, max = 180) => {
    const txt = stripHTML(html);
    if (txt.length <= max) return txt;
    return txt.slice(0, max).replace(/\s+\S*$/, '') + '...';
};

export default function NewsSyncManager() {
    const navigate = useNavigate();
    const { addArticle, categories } = useNews();
    const [fetchedNews, setFetchedNews] = useState([]);
    const [sources, setSources] = useState([]);
    const [activeSource, setActiveSource] = useState(null); // source id
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [readingItem, setReadingItem] = useState(null);

    const [previewItem, setPreviewItem] = useState(null);
    const [posting, setPosting] = useState(false);
    const [progress, setProgress] = useState(null);

    // Load sources list once on mount
    useEffect(() => {
        getSyncSources().then(list => {
            if (list.length > 0) {
                setSources(list);
                setActiveSource(list[0].id);
            }
        });
    }, []);

    const fetchLatest = async (sourceId) => {
        if (!sourceId) return;
        setLoading(true);
        const data = await syncNews({ source: sourceId });
        setFetchedNews((data || []).map(item => ({ ...item, extracted: false, isExtracting: false })));
        setLoading(false);
    };

    useEffect(() => {
        if (activeSource) fetchLatest(activeSource);
    }, [activeSource]);

    const activeSourceMeta = sources.find(s => s.id === activeSource);

    // Background extraction worker
    useEffect(() => {
        const processQueue = async () => {
            const itemToExtractIdx = fetchedNews.findIndex(item => !item.extracted && !item.isExtracting);
            if (itemToExtractIdx === -1) return; // All done

            // Mark as extracting
            setFetchedNews(prev => {
                const next = [...prev];
                next[itemToExtractIdx] = { ...next[itemToExtractIdx], isExtracting: true };
                return next;
            });

            const item = fetchedNews[itemToExtractIdx];
            try {
                const extracted = await extractArticle(item.link);
                const finalContent = extracted && extracted.content ? extracted.content : `<p>${item.fullContent}</p>`;
                const finalImage = (extracted && extracted.image) ? extracted.image : (item.image || getRandomFallbackImage());

                setFetchedNews(prev => {
                    const next = [...prev];
                    if (next[itemToExtractIdx] && next[itemToExtractIdx].link === item.link) {
                        next[itemToExtractIdx] = {
                            ...next[itemToExtractIdx],
                            fullContent: finalContent,
                            image: finalImage,
                            extracted: true,
                            isExtracting: false
                        };
                    }
                    return next;
                });
            } catch (err) {
                setFetchedNews(prev => {
                    const next = [...prev];
                    if (next[itemToExtractIdx] && next[itemToExtractIdx].link === item.link) {
                        next[itemToExtractIdx] = {
                            ...next[itemToExtractIdx],
                            extracted: true,
                            isExtracting: false
                        };
                    }
                    return next;
                });
            }
        };

        if (fetchedNews.length > 0) {
            processQueue();
        }
    }, [fetchedNews]);

    const handleConfirmPost = async () => {
        if (!previewItem) return;
        setPosting(true);
        try {
            const heroImg = previewItem.image || getRandomFallbackImage();
            const cleanedContent = cleanContentHTML(previewItem.fullContent, heroImg);
            const data = {
                title: previewItem.title,
                excerpt: makeExcerpt(previewItem.fullContent, 180),
                content: `${cleanedContent}<p><br/>Source: <a href="${previewItem.link}" target="_blank">${previewItem.source}</a></p>`,
                category: previewItem.assignedCat,
                location: previewItem.location,
                image: heroImg,
                author: 'AI Sync',
                isBreaking: false,
                isFeatured: false,
                tags: ['AI Sync', previewItem.source, activeSourceMeta?.category || 'rajasthan']
            };
            await addArticle(data);
            setToast(`🚀 Published Successfully!`);
            setFetchedNews(prev => prev.filter(i => i.link !== previewItem.link));
            setPreviewItem(null);
        } catch (err) {
            setToast('❌ पोस्ट करने में विफल');
        } finally {
            setPosting(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    const handlePostAll = async () => {
        if (fetchedNews.length === 0) return;
        if (!window.confirm(`क्या आप वाकई ${fetchedNews.length} खबरें एक साथ पोस्ट करना चाहते हैं? इसमें कुछ समय लग सकता है।`)) return;

        setProgress({ current: 0, total: fetchedNews.length });
        let successCount = 0;
        const isRajasthan = activeSourceMeta?.category === 'rajasthan';

        for (let i = 0; i < fetchedNews.length; i++) {
            const item = fetchedNews[i];
            try {
                const location = isRajasthan ? detectLocation(item.title, item.fullContent) : 'अन्य';
                const assignedCat = isRajasthan ? 'राजस्थान' : categories[0] || 'अन्य';

                const heroImg = item.image || getRandomFallbackImage();
                const cleanedContent = cleanContentHTML(item.fullContent, heroImg);
                const data = {
                    title: item.title,
                    excerpt: makeExcerpt(item.fullContent, 180),
                    content: `${cleanedContent}<p><br/>Source: <a href="${item.link}" target="_blank">${item.source}</a></p>`,
                    category: assignedCat,
                    location: location,
                    image: heroImg,
                    author: 'AI Sync',
                    isBreaking: false,
                    isFeatured: false,
                    tags: ['AI Sync', item.source, activeSourceMeta?.category || 'rajasthan']
                };

                await addArticle(data);
                successCount++;
                setProgress(prev => ({ ...prev, current: i + 1 }));
            } catch (err) {
                console.error('Error auto-posting item', item.title, err);
                setProgress(prev => ({ ...prev, current: i + 1 }));
            }
        }

        setToast(`✅ ${successCount} खबरें सफलतापूर्वक पोस्ट हो गईं!`);
        setProgress(null);
        setFetchedNews([]);
        setTimeout(() => setToast(''), 4000);
    };

    const openPreview = (item) => {
        const isRajasthan = activeSourceMeta?.category === 'rajasthan';
        setPreviewItem({
            ...item,
            location: isRajasthan ? detectLocation(item.title, item.fullContent) : 'अन्य',
            assignedCat: isRajasthan ? 'राजस्थान' : categories[0] || 'अन्य',
        });
    };

    const editAndPost = (item) => {
        const isRajasthan = activeSourceMeta?.category === 'rajasthan';
        const heroImg = item.image || getRandomFallbackImage();
        const cleanedContent = cleanContentHTML(item.fullContent, heroImg);
        const prefill = {
            title: item.title || '',
            excerpt: makeExcerpt(item.fullContent, 180),
            content: `${cleanedContent}<p><br/>Source: <a href="${item.link}" target="_blank">${item.source}</a></p>`,
            category: isRajasthan ? 'राजस्थान' : (categories[0] || ''),
            location: isRajasthan ? detectLocation(item.title, item.fullContent) : 'अन्य',
            image: heroImg,
            videoUrl: '',
            author: 'AI Sync',
            tags: ['AI Sync', item.source, activeSourceMeta?.category || 'rajasthan'].join(', '),
            isBreaking: false,
            isFeatured: false,
            __aiSyncLink: item.link,
        };
        // Pass via React Router state — ArticleForm reads & prefills
        navigate('/admin/news/add', { state: { prefill } });
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '40px' }}>
            {toast && <div className="toast" style={{ background: 'var(--navy)', color: 'var(--teal)', zIndex: 10000, fontWeight: 800 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>🤖 AI News Sync (MCP)</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>ताज़ा खबरें सीधे आपके पोर्टल पर</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={handlePostAll} className="btn" style={{ background: 'var(--teal)', color: 'white' }} disabled={loading || progress || fetchedNews.length === 0}>
                        🚀 Post All (Auto)
                    </button>
                    <button onClick={() => fetchLatest()} className="btn btn-navy" disabled={loading || progress}>
                        {loading ? '⏳ Syncing...' : '🔄 Refresh List'}
                    </button>
                </div>
            </div>

            {progress && (
                <div style={{ marginBottom: '24px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ color: 'var(--navy)', marginBottom: '10px' }}>⏳ खबरें पोस्ट हो रही हैं... ({progress.current} / {progress.total})</h3>
                    <div style={{ width: '100%', background: 'var(--gray-200)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${(progress.current / progress.total) * 100}%`, background: 'var(--teal)', height: '100%', transition: 'width 0.3s ease' }}></div>
                    </div>
                </div>
            )}

            {/* Source selector — grouped by category */}
            <div style={{ marginBottom: '24px' }}>
                {Object.entries(CAT_META).map(([cat, meta]) => {
                    const catSources = sources.filter(s => s.category === cat);
                    if (catSources.length === 0) return null;
                    return (
                        <div key={cat} style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                                {meta.label}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {catSources.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSource(s.id)}
                                        style={{
                                            padding: '7px 16px', borderRadius: '100px', border: '2px solid',
                                            borderColor: activeSource === s.id ? meta.color : 'var(--gray-200)',
                                            background: activeSource === s.id ? meta.color : 'white',
                                            color: activeSource === s.id ? 'white' : 'var(--gray-700)',
                                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--gray-500)' }}>
                    <div className="spinner" style={{ margin: '0 auto 15px' }}></div>
                    {activeSourceMeta?.name || 'खबरें'} से खबरें खोजी जा रही हैं...
                </div>
            )}

            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {fetchedNews.map((item, idx) => {
                        return (
                            <div key={idx} style={{
                                background: 'white', padding: '20px', borderRadius: '20px',
                                boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid var(--gray-100)',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    <img src={item.image || getRandomFallbackImage()} alt="" style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '14px', background: 'var(--gray-100)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                            <span style={{ background: 'var(--gray-100)', color: 'var(--navy)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{item.source}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>{timeAgo(item.pubDate)}</span>
                                            {item.isExtracting && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--teal)', background: 'var(--gray-50)', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> असली फोटो लोड हो रही है...
                                                </span>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px', lineHeight: 1.4 }}>{item.title}</h3>

                                        <div style={{
                                            fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.6,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }} dangerouslySetInnerHTML={{ __html: item.fullContent }} />

                                        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                            <button onClick={() => setReadingItem(item)} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                                                📖 पूरी खबर पढ़ें
                                            </button>
                                            <button onClick={() => editAndPost(item)} className="btn btn-sm" style={{ background: CAT_META[activeSourceMeta?.category]?.color || 'var(--teal)', color: 'white', padding: '6px 16px' }} title="Open in editor — edit before publishing">
                                                ✏️ Edit & Post
                                            </button>
                                            <button onClick={() => openPreview(item)} className="btn btn-sm" style={{ background: 'transparent', color: 'var(--gray-600)', border: '1px solid var(--gray-300)', padding: '5px 12px', fontSize: '0.78rem' }} title="Quick publish without editing">
                                                ⚡ Quick Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {fetchedNews.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px', background: 'var(--gray-50)', borderRadius: '24px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🌵</div>
                    <h3 style={{ color: 'var(--navy)', fontWeight: 800 }}>खबरें लोड नहीं हो पाईं</h3>
                    <p style={{ color: 'var(--gray-500)' }}>कृपया Refresh बटन दबाएं या इंटरनेट चेक करें।</p>
                </div>
            )}

            {/* ======= READING MODAL ======= */}
            {readingItem && (
                <>
                    <div className="mobile-menu-overlay show" style={{ zIndex: 9998 }} onClick={() => setReadingItem(null)} />
                    <div className="modal-wrap" style={{ zIndex: 9999 }}>
                        <div className="modal" style={{ maxWidth: '700px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                📖 पूरी खबर (Full Article)
                                <button onClick={() => setReadingItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                            </div>

                            <div style={{ padding: '10px 0' }}>
                                <img src={readingItem.image || getRandomFallbackImage()} alt="" style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }} />
                                <h2 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '15px', lineHeight: 1.4, fontSize: '1.4rem' }}>{readingItem.title}</h2>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <span style={{ background: 'var(--gray-100)', color: 'var(--navy)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>{readingItem.source}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{timeAgo(readingItem.pubDate)}</span>
                                </div>

                                <div className="article-content" style={{ fontSize: '1.05rem', color: 'var(--gray-800)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: cleanContentHTML(readingItem.fullContent, readingItem.image) }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-100)', paddingTop: '20px', marginTop: '20px' }}>
                                <button className="btn btn-navy btn-sm" onClick={() => setReadingItem(null)} style={{ background: 'var(--gray-200)', color: 'var(--navy)' }}>बंद करें (Close)</button>
                                <button className="btn" onClick={() => { const ri = readingItem; setReadingItem(null); editAndPost(ri); }} style={{ background: CAT_META[activeSourceMeta?.category]?.color || 'var(--teal)', color: 'white', padding: '10px 25px', borderRadius: '12px', fontWeight: 800 }}>
                                    ✏️ Edit & Post
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ======= PREVIEW MODAL ======= */}
            {previewItem && (
                <>
                    <div className="mobile-menu-overlay show" style={{ zIndex: 9998 }} onClick={() => setPreviewItem(null)} />
                    <div className="modal-wrap" style={{ zIndex: 9999 }}>
                        <div className="modal" style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                🚀 Review & Publish
                                <button onClick={() => setPreviewItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                            </div>

                            <div style={{ padding: '10px 0' }}>
                                <img src={previewItem.image || getRandomFallbackImage()} alt="" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }} />
                                <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '15px', lineHeight: 1.4 }}>{previewItem.title}</h3>

                                <div style={{ background: 'var(--gray-50)', padding: '15px', borderRadius: '12px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                    <strong>📝 सारांश (Excerpt):</strong>
                                    <p style={{ marginTop: '6px' }}>{makeExcerpt(previewItem.fullContent, 220)}</p>
                                </div>

                                <div style={{ background: 'var(--gray-50)', padding: '15px', borderRadius: '12px', marginBottom: '20px', maxHeight: '260px', overflowY: 'auto', fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                    <strong>📄 Full Content Preview:</strong>
                                    <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: cleanContentHTML(previewItem.fullContent, previewItem.image) }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase' }}>City / Location</label>
                                        <select className="form-control" value={previewItem.location} onChange={e => setPreviewItem({ ...previewItem, location: e.target.value })} style={{ borderRadius: '10px' }}>
                                            {RAJASTHAN_DISTRICTS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Website Category</label>
                                        <select className="form-control" value={previewItem.assignedCat} onChange={e => setPreviewItem({ ...previewItem, assignedCat: e.target.value })} style={{ borderRadius: '10px' }}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-100)', paddingTop: '20px' }}>
                                <button className="btn btn-navy btn-sm" onClick={() => setPreviewItem(null)} style={{ background: 'var(--gray-200)', color: 'var(--navy)' }}>Discard</button>
                                <button className="btn" onClick={handleConfirmPost} disabled={posting} style={{ background: 'var(--teal)', color: 'white', padding: '10px 25px', borderRadius: '12px', fontWeight: 800 }}>
                                    {posting ? '⏳ Posting...' : '🚀 Publish News'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
