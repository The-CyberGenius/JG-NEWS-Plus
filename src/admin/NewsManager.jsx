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
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ padding: '12px 16px' }}>खबर</th>
                            <th style={{ padding: '12px 16px' }}>श्रेणी</th>
                            <th style={{ padding: '12px 16px' }}>स्थान</th>
                            <th style={{ padding: '12px 16px' }}>ब्रेकिंग</th>
                            <th style={{ padding: '12px 16px' }}>फीचर्ड</th>
                            <th style={{ padding: '12px 16px' }}>तारीख</th>
                            <th style={{ padding: '12px 16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(a => (
                            <tr key={a.id}>
                                <td style={{ padding: '8px 16px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&q=60'} alt="" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{a.title}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '8px 16px' }}><span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{a.category}</span></td>
                                <td style={{ padding: '8px 16px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>📍 {a.location}</td>
                                <td style={{ padding: '8px 16px' }}>
                                    <button
                                        onClick={() => toggleBreaking(a)}
                                        style={{ background: a.isBreaking ? 'var(--red)' : 'var(--gray-100)', color: a.isBreaking ? 'white' : 'var(--gray-600)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                                    >
                                        {a.isBreaking ? 'हाँ' : 'नहीं'}
                                    </button>
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                    <button
                                        onClick={() => toggleFeatured(a)}
                                        style={{ background: a.isFeatured ? 'var(--saffron)' : 'var(--gray-100)', color: a.isFeatured ? 'white' : 'var(--gray-600)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                                    >
                                        {a.isFeatured ? 'हाँ' : 'नहीं'}
                                    </button>
                                </td>
                                <td style={{ padding: '8px 16px', fontSize: '0.7rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{timeAgo(a.date)}</td>
                                <td style={{ padding: '8px 16px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <Link to={`/admin/news/edit/${a.id}`} className="btn btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--teal)', color: 'white' }}>✏️</Link>
                                        <button className="btn btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--red)', color: 'white' }} onClick={() => setConfirm(a.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
