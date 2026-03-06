import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo } from '../utils/helpers';

const PER_PAGE = 10;

export default function NewsManager() {
    const { articles, deleteArticle, updateArticle } = useNews();
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const navigate = useNavigate();

    const filtered = filterCat ? articles.filter(a => a.category === filterCat) : articles;
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDelete = (id) => {
        deleteArticle(id);
        setConfirm(null);
        showToast('✅ खबर सफलतापूर्वक हटा दी गई');
    };

    const toggleBreaking = (a) => {
        updateArticle(a.id, { isBreaking: !a.isBreaking });
        showToast(a.isBreaking ? '🔕 ब्रेकिंग हटाया' : '🔴 ब्रेकिंग में जोड़ा');
    };

    const toggleFeatured = (a) => {
        updateArticle(a.id, { isFeatured: !a.isFeatured });
        showToast(a.isFeatured ? '⭐ फीचर्ड हटाया' : '⭐ फीचर्ड में जोड़ा');
    };

    const categories = [...new Set(articles.map(a => a.category))];

    return (
        <div>
            {toast && <div className="toast toast-success">{toast}</div>}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>📰 खबरें प्रबंधन</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{filtered.length} खबरें</p>
                </div>
                <Link to="/admin/news/add" className="btn btn-primary">➕ नई खबर जोड़ें</Link>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>फिल्टर:</span>
                <button
                    className={`cat-pill ${!filterCat ? 'active' : ''}`}
                    onClick={() => { setFilterCat(''); setPage(1); }}
                >सभी</button>
                {categories.map(c => (
                    <button
                        key={c}
                        className={`cat-pill ${filterCat === c ? 'active' : ''}`}
                        onClick={() => { setFilterCat(c); setPage(1); }}
                    >{c}</button>
                ))}
            </div>

            {/* Table - Desktop */}
            <div className="hide-mobile" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>खबर</th>
                            <th>श्रेणी</th>
                            <th>स्थान</th>
                            <th>ब्रेकिंग</th>
                            <th>फीचर्ड</th>
                            <th>तारीख</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(a => (
                            <tr key={a.id}>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&q=60'} alt="" className="data-table__thumb" />
                                        <div className="data-table__title">{a.title}</div>
                                    </div>
                                </td>
                                <td><span className="badge badge-teal">{a.category}</span></td>
                                <td style={{ fontSize: '0.8rem' }}>📍 {a.location}</td>
                                <td>
                                    <button
                                        onClick={() => toggleBreaking(a)}
                                        style={{ background: a.isBreaking ? 'var(--red)' : 'var(--gray-200)', color: a.isBreaking ? 'white' : 'var(--gray-600)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                    >
                                        {a.isBreaking ? '🔴 हाँ' : 'नहीं'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleFeatured(a)}
                                        style={{ background: a.isFeatured ? 'var(--saffron)' : 'var(--gray-200)', color: a.isFeatured ? 'white' : 'var(--gray-600)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                    >
                                        {a.isFeatured ? '⭐ हाँ' : 'नहीं'}
                                    </button>
                                </td>
                                <td style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>{timeAgo(a.date)}</td>
                                <td>
                                    <div className="data-table__actions">
                                        <Link to={`/article/${a.id}`} target="_blank" className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--navy)' }}>👁️</Link>
                                        <Link to={`/admin/news/edit/${a.id}`} className="btn btn-sm btn-outline">✏️</Link>
                                        <button className="btn btn-sm btn-danger" onClick={() => setConfirm(a.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="hide-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paginated.map(a => (
                    <div key={a.id} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '14px', boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                            <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&q=60'} alt="" style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>{a.category}</span>
                                    {a.isBreaking && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>ब्रेकिंग</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Link to={`/admin/news/edit/${a.id}`} className="btn btn-sm btn-outline">✏️ Edit</Link>
                            <button onClick={() => toggleBreaking(a)} className="btn btn-sm" style={{ background: a.isBreaking ? 'var(--red)' : 'var(--gray-200)', color: a.isBreaking ? 'white' : 'var(--navy)' }}>
                                {a.isBreaking ? '🔴 Remove' : '+ Breaking'}
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => setConfirm(a.id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Delete Confirm Modal */}
            {confirm && (
                <>
                    <div className="mobile-menu-overlay show" onClick={() => setConfirm(null)} />
                    <div className="modal-wrap">
                        <div className="modal">
                            <div className="modal-title">⚠️ खबर हटाएं?</div>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                क्या आप वाकई इस खबर को हटाना चाहते हैं? यह कार्य वापस नहीं होगा।
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--navy)' }} onClick={() => setConfirm(null)}>रद्द करें</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(confirm)}>🗑️ हटाएं</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
