import React, { useState, useEffect, useCallback } from 'react';
import { getArticlesForAnalytics, updateArticleAnalytics, getCategories } from '../store/newsStore';

export default function NewsAnalyticsManager() {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);
    const [message, setMessage] = useState(null);

    // Modal state for editing numbers
    const [editingArticle, setEditingArticle] = useState(null);
    const [editViews, setEditViews] = useState('');
    const [editWhatsapp, setEditWhatsapp] = useState('');
    const [editFacebook, setEditFacebook] = useState('');
    const [editTwitter, setEditTwitter] = useState('');
    const [editCopy, setEditCopy] = useState('');
    const [saving, setSaving] = useState(false);

    const loadArticles = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const data = await getArticlesForAnalytics({
                q: search,
                category: selectedCategory,
                page: p,
                limit: 15,
            });
            if (data.success) {
                setArticles(data.articles || []);
                setTotalArticles(data.total || 0);
                setTotalPages(data.pages || 1);
                setPage(data.page || 1);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'खबरों का एनालिटिक्स लोड करने में त्रुटि।' });
        } finally {
            setLoading(false);
        }
    }, [search, selectedCategory]);

    useEffect(() => {
        getCategories().then(cats => setCategories(cats || [])).catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadArticles(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, loadArticles]);

    const openEditModal = (article) => {
        setEditingArticle(article);
        setEditViews(String(article.views ?? 0));
        setEditWhatsapp(String(article.shares?.whatsapp ?? 0));
        setEditFacebook(String(article.shares?.facebook ?? 0));
        setEditTwitter(String(article.shares?.twitter ?? 0));
        setEditCopy(String(article.shares?.copy ?? 0));
        setMessage(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingArticle) return;

        setSaving(true);
        setMessage(null);

        const views = parseInt(editViews) || 0;
        const whatsapp = parseInt(editWhatsapp) || 0;
        const facebook = parseInt(editFacebook) || 0;
        const twitter = parseInt(editTwitter) || 0;
        const copy = parseInt(editCopy) || 0;
        const total = whatsapp + facebook + twitter + copy;

        try {
            const res = await updateArticleAnalytics(editingArticle._id, {
                views,
                shares: { whatsapp, facebook, twitter, copy, total }
            });

            if (res.success) {
                setMessage({ type: 'success', text: `सफलता: "${editingArticle.title.slice(0, 35)}..." के नंबर अपडेट हो गए!` });
                // Update local list
                setArticles(prev => prev.map(a => a._id === editingArticle._id ? {
                    ...a,
                    views,
                    shares: { whatsapp, facebook, twitter, copy, total }
                } : a));
                setEditingArticle(null);
            } else {
                setMessage({ type: 'error', text: res.message || 'अपडेट करने में विफल।' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'सर्वर त्रुटि।' });
        } finally {
            setSaving(false);
        }
    };

    const addQuickViews = (amount) => {
        const current = parseInt(editViews) || 0;
        setEditViews(String(current + amount));
    };

    const formatNumber = (num) => {
        return (num ?? 0).toLocaleString('en-IN');
    };

    return (
        <div style={{ padding: '4px 0 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>
                        ⚡ न्यूज़ व्यूज व एनालिटिक्स एडिटर
                    </h2>
                    <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                        सुपर सुपर एडमिन विशेष सुविधा: यहाँ से आप किसी भी खबर के व्यूज (Views) और शेयर्स (WhatsApp, Facebook, Twitter) सीधे बदल सकते हैं।
                    </p>
                </div>
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '8px 16px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}>
                    👑 कुल उपलब्ध खबरें: {totalArticles}
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div style={{
                    padding: '14px 20px', borderRadius: '14px', marginBottom: '20px', fontWeight: 700, fontSize: '0.92rem',
                    background: message.type === 'success' ? '#ecfdf5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span>{message.type === 'success' ? '✅' : '⚠️'} {message.text}</span>
                    <button onClick={() => setMessage(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                </div>
            )}

            {/* Search and Filters */}
            <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', marginBottom: '22px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 शीर्षक से खबर खोजें..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '240px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontSize: '0.92rem' }}
                />
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--gray-300)', background: 'white', fontWeight: 700, fontSize: '0.9rem' }}
                >
                    <option value="all">सभी श्रेणियाँ (All)</option>
                    {categories.map(c => (
                        <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                </select>
                <button
                    onClick={() => loadArticles(1)}
                    className="btn btn-primary"
                    style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 800 }}
                >
                    🔍 खोजें
                </button>
            </div>

            {/* Articles List Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)', color: 'var(--navy)', fontWeight: 800 }}>
                                <th style={{ padding: '16px 20px' }}>खबर / शीर्षक</th>
                                <th style={{ padding: '16px 20px' }}>श्रेणी व दिनांक</th>
                                <th style={{ padding: '16px 20px' }}>कुल व्यूज (Views)</th>
                                <th style={{ padding: '16px 20px' }}>शेयर्स विवरण (Shares)</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center' }}>एक्शन</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)', fontWeight: 600 }}>
                                        खबरें लोड हो रही हैं...
                                    </td>
                                </tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)', fontWeight: 600 }}>
                                        कोई खबर नहीं मिली।
                                    </td>
                                </tr>
                            ) : (
                                articles.map(art => (
                                    <tr key={art._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={{ padding: '16px 20px', maxWidth: '380px' }}>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                {art.image && (
                                                    <img
                                                        src={art.image}
                                                        alt={art.title}
                                                        style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 800, color: 'var(--navy)', lineHeight: 1.35, fontSize: '0.92rem' }}>
                                                        {art.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ background: 'var(--gray-100)', color: 'var(--gray-800)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                                                {art.category || 'राजस्थान'}
                                            </span>
                                            <div style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: '6px' }}>
                                                {new Date(art.date || art.createdAt).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>

                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0',
                                                padding: '6px 14px', borderRadius: '12px', fontWeight: 900, fontSize: '1rem'
                                            }}>
                                                👁️ {formatNumber(art.views)}
                                            </div>
                                        </td>

                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                                                <div><strong>कुल शेयर्स:</strong> <span style={{ color: 'var(--teal)', fontWeight: 800 }}>{formatNumber(art.shares?.total ?? 0)}</span></div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                    💬 WA: {art.shares?.whatsapp ?? 0} | 📘 FB: {art.shares?.facebook ?? 0} | 🐦 TW: {art.shares?.twitter ?? 0}
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => openEditModal(art)}
                                                className="btn"
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--teal), #0d9488)',
                                                    color: 'white', padding: '8px 16px', borderRadius: '12px',
                                                    fontWeight: 800, fontSize: '0.84rem', boxShadow: '0 4px 12px rgba(13,148,136,0.25)'
                                                }}
                                            >
                                                ✏️ नंबर बदलें
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '16px', borderTop: '1px solid var(--gray-200)' }}>
                        <button
                            onClick={() => loadArticles(page - 1)}
                            disabled={page <= 1 || loading}
                            className="btn btn-sm btn-outline"
                            style={{ borderRadius: '8px' }}
                        >
                            ← पिछला
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                            पेज {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => loadArticles(page + 1)}
                            disabled={page >= totalPages || loading}
                            className="btn btn-sm btn-outline"
                            style={{ borderRadius: '8px' }}
                        >
                            अगला →
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Editing Analytics Numbers */}
            {editingArticle && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)', zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '520px', width: '100%',
                        boxShadow: '0 25px 70px rgba(0,0,0,0.35)', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 6px', color: 'var(--navy)', fontWeight: 900, fontSize: '1.3rem' }}>
                                    ⚡ व्यूज व शेयर्स नंबर बदलें
                                </h3>
                                <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.82rem' }}>
                                    संख्या बदलने पर लाइव वेबसाइट पर तुरंत अपडेट दिखाई देगा।
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingArticle(null)}
                                style={{ background: 'var(--gray-100)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 900 }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Article Preview Card */}
                        <div style={{ background: 'var(--gray-50)', padding: '12px 16px', borderRadius: '14px', marginBottom: '20px', border: '1px solid var(--gray-200)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {editingArticle.image && (
                                <img src={editingArticle.image} alt="" style={{ width: '60px', height: '46px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                            )}
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.3 }}>
                                {editingArticle.title}
                            </div>
                        </div>

                        <form onSubmit={handleSave}>
                            {/* Views Input */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', color: 'var(--navy)', marginBottom: '6px' }}>
                                    👁️ कुल व्यूज (Total Views)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editViews}
                                    onChange={e => setEditViews(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid var(--teal)', fontSize: '1.15rem', fontWeight: 900, color: '#065f46' }}
                                />
                                {/* Quick Increment Buttons */}
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <button type="button" onClick={() => addQuickViews(500)} style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-300)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>+500</button>
                                    <button type="button" onClick={() => addQuickViews(1000)} style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-300)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>+1,000</button>
                                    <button type="button" onClick={() => addQuickViews(5000)} style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-300)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>+5,000</button>
                                    <button type="button" onClick={() => addQuickViews(10000)} style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-300)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>+10,000</button>
                                </div>
                            </div>

                            {/* Shares Inputs Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                        💬 WhatsApp शेयर्स
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editWhatsapp}
                                        onChange={e => setEditWhatsapp(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--gray-300)', fontSize: '0.95rem', fontWeight: 800 }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                        📘 Facebook शेयर्स
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFacebook}
                                        onChange={e => setEditFacebook(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--gray-300)', fontSize: '0.95rem', fontWeight: 800 }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                        🐦 Twitter (X) शेयर्स
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editTwitter}
                                        onChange={e => setEditTwitter(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--gray-300)', fontSize: '0.95rem', fontWeight: 800 }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                        🔗 कॉपी लिंक शेयर्स
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editCopy}
                                        onChange={e => setEditCopy(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--gray-300)', fontSize: '0.95rem', fontWeight: 800 }}
                                    />
                                </div>
                            </div>

                            {/* Live Total Shares Preview */}
                            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '10px 16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#115e59' }}>कुल शेयर्स (Auto-Calculated):</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f766e' }}>
                                    {(parseInt(editWhatsapp) || 0) + (parseInt(editFacebook) || 0) + (parseInt(editTwitter) || 0) + (parseInt(editCopy) || 0)}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingArticle(null)}
                                    className="btn"
                                    style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
                                >
                                    रद्द करें
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 800 }}
                                >
                                    {saving ? '⏳ सुरक्षित हो रहा है...' : '💾 नंबर अपडेट करें 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
