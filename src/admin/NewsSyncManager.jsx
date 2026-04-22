import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { syncNews } from '../store/newsStore';
import { timeAgo } from '../utils/helpers';

const CATEGORIES = [
    { id: 'rajasthan', label: '🚩 राजस्थान', color: 'var(--saffron)' },
    { id: 'india', label: '🇮🇳 भारत', color: 'var(--teal)' },
    { id: 'world', label: '🌍 दुनिया', color: 'var(--navy)' },
];

export default function NewsSyncManager() {
    const { addArticle, categories } = useNews();
    const [fetchedNews, setFetchedNews] = useState([]);
    const [activeTab, setActiveTab] = useState('india');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [postingId, setPostingId] = useState(null);

    const fetchLatest = async (cat = activeTab) => {
        setLoading(true);
        const data = await syncNews(cat);
        setFetchedNews(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLatest(activeTab);
    }, [activeTab]);

    const handleQuickPost = async (item) => {
        setPostingId(item.link);
        try {
            // Smart Category Matching
            let assignedCat = categories[0] || 'अन्य';
            if (activeTab === 'rajasthan') assignedCat = 'राजस्थान';
            if (activeTab === 'world') assignedCat = 'मनोरंजन'; // or global

            const data = {
                title: item.title,
                excerpt: item.content.slice(0, 150) + '...',
                content: `<p>${item.content}</p><p>Source: ${item.source}</p>`,
                category: assignedCat,
                location: activeTab === 'rajasthan' ? 'जयपुर' : 'अन्य',
                image: item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
                author: 'AI Sync',
                isBreaking: false,
                isFeatured: false,
                tags: ['AI Sync', item.source, activeTab]
            };
            await addArticle(data);
            setToast(`🚀 Post Successfully: ${item.title.slice(0, 30)}...`);
            setFetchedNews(prev => prev.filter(i => i.link !== item.link));
        } catch (err) {
            setToast('❌ पोस्ट करने में विफल');
        } finally {
            setPostingId(null);
            setTimeout(() => setToast(''), 3000);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {toast && <div className="toast" style={{ background: 'var(--navy)', color: 'var(--teal)', zIndex: 1000 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>🤖 MCP: AI News Sync</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>प्रमुख समाचार स्रोतों से ताज़ा खबरें सिंक करें</p>
                </div>
                <button 
                    onClick={() => fetchLatest()} 
                    className="btn btn-navy" 
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? '⏳ Syncing...' : '🔄 Refresh List'}
                </button>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'var(--gray-100)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            transition: 'all 0.3s',
                            background: activeTab === cat.id ? cat.color : 'transparent',
                            color: activeTab === cat.id ? 'white' : 'var(--gray-600)',
                            boxShadow: activeTab === cat.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--gray-500)' }}>
                    <div className="spinner" style={{ margin: '0 auto 15px' }}></div>
                    {activeTab.toUpperCase()} की खबरें खोजी जा रही हैं...
                </div>
            )}

            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {fetchedNews.map((item, idx) => (
                        <div key={idx} style={{ 
                            background: 'white', padding: '16px', borderRadius: '16px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '20px',
                            alignItems: 'center', border: '1px solid var(--gray-100)',
                            animation: 'slideUp 0.3s ease-out'
                        }}>
                            {item.image && (
                                <img src={item.image} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                    <span style={{ background: 'var(--gray-100)', color: 'var(--navy)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {item.source}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{timeAgo(item.pubDate)}</span>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px', lineHeight: 1.4 }}>{item.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.content}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleQuickPost(item)} 
                                disabled={postingId === item.link}
                                className="btn btn-sm" 
                                style={{ background: CATEGORIES.find(c => c.id === activeTab).color, color: 'white', minWidth: '100px' }}
                            >
                                {postingId === item.link ? '⏳ Posting...' : '⚡ Quick Post'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {fetchedNews.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px', background: 'var(--gray-50)', borderRadius: '24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📰</div>
                    <h3 style={{ color: 'var(--navy)', fontWeight: 800 }}>कोई खबर नहीं मिली</h3>
                    <p style={{ color: 'var(--gray-500)' }}>इस कैटेगरी के लिए फिलहाल कोई डेटा नहीं है।</p>
                </div>
            )}

            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
