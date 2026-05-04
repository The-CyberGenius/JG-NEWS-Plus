import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo, formatDate } from '../utils/helpers';

const PER_PAGE = 50;

export default function NewsManager() {
    const { articles, deleteArticle, updateArticle } = useNews();
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [sortDir, setSortDir] = useState('desc'); // 'desc' = newest first
    const [searchQ, setSearchQ] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const navigate = useNavigate();

    const filtered = useMemo(() => {
        let list = filterCat ? articles.filter(a => a.category === filterCat) : [...articles];
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            list = list.filter(a =>
                (a.title || '').toLowerCase().includes(q) ||
                (a.location || '').toLowerCase().includes(q)
            );
        }
        if (dateFrom) {
            const fromTs = new Date(dateFrom).getTime();
            list = list.filter(a => new Date(a.date || a.createdAt || 0).getTime() >= fromTs);
        }
        if (dateTo) {
            // Include the entire "to" day (until 23:59:59)
            const toTs = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
            list = list.filter(a => new Date(a.date || a.createdAt || 0).getTime() <= toTs);
        }
        list.sort((a, b) => {
            const da = new Date(a.date || a.createdAt || 0).getTime();
            const db = new Date(b.date || b.createdAt || 0).getTime();
            return sortDir === 'desc' ? db - da : da - db;
        });
        return list;
    }, [articles, filterCat, sortDir, searchQ, dateFrom, dateTo]);

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

    const handleDateChange = (a, newDate) => {
        if (!newDate) return;
        updateArticle(a.id, { date: new Date(newDate).toISOString() });
        showToast('📅 तारीख अपडेट हो गई');
    };

    const toIsoLocal = (d) => {
        if (!d) return '';
        try {
            const dt = new Date(d);
            // Format as yyyy-MM-ddTHH:mm for datetime-local input
            const tz = dt.getTimezoneOffset() * 60000;
            return new Date(dt - tz).toISOString().slice(0, 16);
        } catch { return ''; }
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

            {/* Search + Sort */}
            <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 शीर्षक या स्थान से खोजें..."
                    value={searchQ}
                    onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                    style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}
                />
                <button
                    onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
                    className="btn btn-sm"
                    style={{ background: 'var(--navy)', color: 'white', whiteSpace: 'nowrap' }}
                    title="तारीख से सॉर्ट करें"
                >
                    📅 {sortDir === 'desc' ? 'नई पहले ↓' : 'पुरानी पहले ↑'}
                </button>
            </div>

            {/* Date Range Filter */}
            <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--navy)' }}>📅 तारीख:</span>
                <label style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    From:
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--gray-200)', fontSize: '0.82rem' }}
                    />
                </label>
                <label style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    To:
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--gray-200)', fontSize: '0.82rem' }}
                    />
                </label>
                {(dateFrom || dateTo) && (
                    <button
                        onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                        style={{ background: 'var(--gray-100)', color: 'var(--navy)', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                        title="Clear date filter"
                    >
                        ✕ Clear
                    </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                    Showing {filtered.length} of {articles.length}
                </span>
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
                                <td style={{ padding: '8px 16px', fontSize: '0.7rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                                    <input
                                        type="datetime-local"
                                        value={toIsoLocal(a.date)}
                                        onChange={e => handleDateChange(a, e.target.value)}
                                        style={{
                                            border: '1px solid var(--gray-200)',
                                            borderRadius: '4px',
                                            padding: '3px 6px',
                                            fontSize: '0.7rem',
                                            color: 'var(--navy)',
                                            background: 'white',
                                            cursor: 'pointer',
                                        }}
                                        title={`${formatDate(a.date)} • ${timeAgo(a.date)}`}
                                    />
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '2px' }}>{timeAgo(a.date)}</div>
                                </td>
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
                <div className="pagination" style={{ flexWrap: 'wrap' }}>
                    <button
                        className="page-btn"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >‹ पिछला</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px' }}>…</span>}
                                <button className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                                    {p}
                                </button>
                            </React.Fragment>
                        ))}
                    <button
                        className="page-btn"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >अगला ›</button>
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
