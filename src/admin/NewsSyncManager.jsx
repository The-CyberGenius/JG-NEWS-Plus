import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { syncNews } from '../store/newsStore';
import { timeAgo } from '../utils/helpers';

const CATEGORIES = [
    { id: 'rajasthan', label: '🚩 राजस्थान', color: 'var(--saffron)' },
    { id: 'india', label: '🇮🇳 भारत', color: 'var(--teal)' },
    { id: 'world', label: '🌍 दुनिया', color: 'var(--navy)' },
];

const RAJASTHAN_CITIES = [
    'जयपुर', 'जोधपुर', 'उदयपुर', 'कोटा', 'बीकानेर', 'अजमेर', 'भरतपुर', 'सीकर', 'अन्य'
];

export default function NewsSyncManager() {
    const { addArticle, categories } = useNews();
    const [fetchedNews, setFetchedNews] = useState([]);
    const [activeTab, setActiveTab] = useState('india');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    
    // Preview Modal State
    const [previewItem, setPreviewItem] = useState(null);
    const [posting, setPosting] = useState(false);

    const fetchLatest = async (cat = activeTab) => {
        setLoading(true);
        const data = await syncNews(cat);
        setFetchedNews(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLatest(activeTab);
    }, [activeTab]);

    const handleConfirmPost = async () => {
        if (!previewItem) return;
        setPosting(true);
        try {
            const data = {
                title: previewItem.title,
                excerpt: previewItem.content.slice(0, 150) + '...',
                content: `<p>${previewItem.content}</p><p>Source: ${previewItem.source}</p>`,
                category: previewItem.assignedCat,
                location: previewItem.location,
                image: previewItem.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
                author: 'AI Sync',
                isBreaking: false,
                isFeatured: false,
                tags: ['AI Sync', previewItem.source, activeTab]
            };
            await addArticle(data);
            setToast(`🚀 Published: ${previewItem.title.slice(0, 30)}...`);
            setFetchedNews(prev => prev.filter(i => i.link !== previewItem.link));
            setPreviewItem(null);
        } catch (err) {
            setToast('❌ पोस्ट करने में विफल');
        } finally {
            setPosting(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    const openPreview = (item) => {
        setPreviewItem({
            ...item,
            location: activeTab === 'rajasthan' ? 'जयपुर' : 'अन्य',
            assignedCat: activeTab === 'rajasthan' ? 'राजस्थान' : categories[0] || 'अन्य'
        });
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {toast && <div className="toast" style={{ background: 'var(--navy)', color: 'var(--teal)', zIndex: 10000 }}>{toast}</div>}

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

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'var(--gray-100)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.3s',
                            background: activeTab === cat.id ? cat.color : 'transparent',
                            color: activeTab === cat.id ? 'white' : 'var(--gray-600)'
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
                        }}>
                            <img src={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80'} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '12px', background: 'var(--gray-100)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                    <span style={{ background: 'var(--gray-100)', color: 'var(--navy)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>{item.source}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{timeAgo(item.pubDate)}</span>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>{item.title}</h3>
                            </div>
                            <button onClick={() => openPreview(item)} className="btn btn-sm" style={{ background: CATEGORIES.find(c => c.id === activeTab).color, color: 'white' }}>
                                ⚡ Quick Post
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ======= PREVIEW MODAL ======= */}
            {previewItem && (
                <>
                    <div className="mobile-menu-overlay show" style={{ zIndex: 9998 }} onClick={() => setPreviewItem(null)} />
                    <div className="modal-wrap" style={{ zIndex: 9999 }}>
                        <div className="modal" style={{ maxWidth: '500px', width: '90%' }}>
                            <div className="modal-title">🚀 Review & Post</div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <img src={previewItem.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} />
                                <h4 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '15px' }}>{previewItem.title}</h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-500)' }}>CITY / LOCATION</label>
                                        <select className="form-control" value={previewItem.location} onChange={e => setPreviewItem({...previewItem, location: e.target.value})}>
                                            {RAJASTHAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-500)' }}>CATEGORY</label>
                                        <select className="form-control" value={previewItem.assignedCat} onChange={e => setPreviewItem({...previewItem, assignedCat: e.target.value})}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-sm" onClick={() => setPreviewItem(null)} style={{ background: 'var(--gray-200)', color: 'var(--navy)' }}>Cancel</button>
                                <button className="btn btn-sm" onClick={handleConfirmPost} disabled={posting} style={{ background: 'var(--teal)', color: 'white', minWidth: '100px' }}>
                                    {posting ? '⏳ Posting...' : '🚀 Publish Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
