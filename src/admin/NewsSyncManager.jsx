import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { syncNews } from '../store/newsStore';
import { timeAgo } from '../utils/helpers';

export default function NewsSyncManager() {
    const { addArticle, categories } = useNews();
    const [fetchedNews, setFetchedNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [postingId, setPostingId] = useState(null);

    const fetchLatest = async () => {
        setLoading(true);
        const data = await syncNews();
        setFetchedNews(data);
        setLoading(false);
        setToast('✅ ताज़ा खबरें लोड हो गई हैं!');
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        fetchLatest();
    }, []);

    const handleQuickPost = async (item) => {
        setPostingId(item.link);
        try {
            const data = {
                title: item.title,
                excerpt: item.content.slice(0, 150) + '...',
                content: `<p>${item.content}</p><p>Source: ${item.source}</p>`,
                category: categories[0] || 'अन्य',
                location: 'अन्य',
                image: item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
                author: 'AI Sync',
                isBreaking: false,
                isFeatured: false,
                tags: ['AI Sync', item.source]
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
            {toast && <div className="toast" style={{ background: 'var(--navy)', color: 'var(--teal)' }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>🤖 MCP: AI News Sync</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>प्रमुख समाचार स्रोतों से ताज़ा खबरें सिंक करें</p>
                </div>
                <button 
                    onClick={fetchLatest} 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? '⏳ Syncing...' : '🔄 Refresh Feeds'}
                </button>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gray-500)' }}>
                    <div className="spinner" style={{ margin: '0 auto 15px' }}></div>
                    ताज़ा खबरें खोजी जा रही हैं...
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {fetchedNews.map((item, idx) => (
                    <div key={idx} style={{ 
                        background: 'white', padding: '16px', borderRadius: '16px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '20px',
                        alignItems: 'center', border: '1px solid var(--gray-100)'
                    }}>
                        {item.image && (
                            <img src={item.image} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                <span style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
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
                            style={{ background: 'var(--teal)', color: 'white', minWidth: '100px' }}
                        >
                            {postingId === item.link ? '⏳ Posting...' : '⚡ Quick Post'}
                        </button>
                    </div>
                ))}
            </div>

            {fetchedNews.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px', background: 'var(--gray-50)', borderRadius: '24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📰</div>
                    <h3 style={{ color: 'var(--navy)', fontWeight: 800 }}>कोई खबर नहीं मिली</h3>
                    <p style={{ color: 'var(--gray-500)' }}>Refresh बटन दबाकर कोशिश करें।</p>
                </div>
            )}
        </div>
    );
}
