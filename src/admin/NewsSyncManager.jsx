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
    'जयपुर', 'जोधपुर', 'उदयपुर', 'कोटा', 'बीकानेर', 'अजमेर', 'भरतपुर', 'सीकर', 'पाली', 'अलवर', 'अन्य'
];

export default function NewsSyncManager() {
    const { addArticle, categories } = useNews();
    const [fetchedNews, setFetchedNews] = useState([]);
    const [activeTab, setActiveTab] = useState('india');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [expandedIdx, setExpandedIdx] = useState(null);
    
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
                excerpt: previewItem.fullContent.slice(0, 150) + '...',
                content: `<p>${previewItem.fullContent}</p><p>Source: ${previewItem.source}</p>`,
                category: previewItem.assignedCat,
                location: previewItem.location,
                image: previewItem.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
                author: 'AI Sync',
                isBreaking: false,
                isFeatured: false,
                tags: ['AI Sync', previewItem.source, activeTab]
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

    const openPreview = (item) => {
        setPreviewItem({
            ...item,
            location: activeTab === 'rajasthan' ? 'जयपुर' : 'अन्य',
            assignedCat: activeTab === 'rajasthan' ? 'राजस्थान' : categories[0] || 'अन्य'
        });
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '40px' }}>
            {toast && <div className="toast" style={{ background: 'var(--navy)', color: 'var(--teal)', zIndex: 10000, fontWeight: 800 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>🤖 AI News Sync (MCP)</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>ताज़ा खबरें सीधे आपके पोर्टल पर</p>
                </div>
                <button onClick={() => fetchLatest()} className="btn btn-navy" disabled={loading}>
                    {loading ? '⏳ Syncing...' : '🔄 Refresh List'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'var(--gray-100)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        style={{
                            padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s',
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {fetchedNews.map((item, idx) => {
                        const isExpanded = expandedIdx === idx;
                        return (
                            <div key={idx} style={{ 
                                background: 'white', padding: '20px', borderRadius: '20px', 
                                boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid var(--gray-100)',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    <img src={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80'} alt="" style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '14px', background: 'var(--gray-100)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                            <span style={{ background: 'var(--gray-100)', color: 'var(--navy)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{item.source}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{timeAgo(item.pubDate)}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px', lineHeight: 1.4 }}>{item.title}</h3>
                                        
                                        <div style={{ 
                                            fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.6, 
                                            display: isExpanded ? 'block' : '-webkit-box', 
                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                                            overflow: 'hidden' 
                                        }}>
                                            {item.fullContent}
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                            <button onClick={() => setExpandedIdx(isExpanded ? null : idx)} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                                                {isExpanded ? '↑ कम देखें' : '↓ पूरा विवरण पढ़ें'}
                                            </button>
                                            <button onClick={() => openPreview(item)} className="btn btn-sm" style={{ background: CATEGORIES.find(c => c.id === activeTab).color, color: 'white', padding: '6px 16px' }}>
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
                                <img src={previewItem.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'} alt="" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }} />
                                <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '15px', lineHeight: 1.4 }}>{previewItem.title}</h3>
                                
                                <div style={{ background: 'var(--gray-50)', padding: '15px', borderRadius: '12px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                    <strong>Description:</strong><br />
                                    {previewItem.fullContent}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase' }}>City / Location</label>
                                        <select className="form-control" value={previewItem.location} onChange={e => setPreviewItem({...previewItem, location: e.target.value})} style={{ borderRadius: '10px' }}>
                                            {RAJASTHAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Website Category</label>
                                        <select className="form-control" value={previewItem.assignedCat} onChange={e => setPreviewItem({...previewItem, assignedCat: e.target.value})} style={{ borderRadius: '10px' }}>
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
