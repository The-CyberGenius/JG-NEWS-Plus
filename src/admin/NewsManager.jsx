import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo, formatDate } from '../utils/helpers';
import { bulkArticleAction } from '../store/newsStore';

const PER_PAGE = 50;

export default function NewsManager() {
    const { articles, deleteArticle, updateArticle, refresh } = useNews();
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);
    const [bulkConfirm, setBulkConfirm] = useState(null); // { action, ids, label }
    const [toast, setToast] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [sortDir, setSortDir] = useState('desc'); // 'desc' = newest first
    const [searchQ, setSearchQ] = useState('');
    const [selected, setSelected] = useState(new Set()); // article ids selected
    const [bulkLoading, setBulkLoading] = useState(false);
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

    // ─── Multi-select handlers ───────────────────────────────────────
    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAllVisible = () => {
        const allVisibleIds = paginated.map(a => a.id);
        const allSelected = allVisibleIds.every(id => selected.has(id));
        setSelected(prev => {
            const next = new Set(prev);
            if (allSelected) {
                allVisibleIds.forEach(id => next.delete(id));
            } else {
                allVisibleIds.forEach(id => next.add(id));
            }
            return next;
        });
    };
    const clearSelection = () => setSelected(new Set());

    const runBulkAction = async (action, label) => {
        if (selected.size === 0) return;
        setBulkLoading(true);
        try {
            const ids = Array.from(selected);
            const result = await bulkArticleAction(ids, action);
            showToast(`✅ ${label}: ${result.count} खबरें`);
            clearSelection();
            await refresh();
        } catch (err) {
            showToast('❌ Bulk action विफल: ' + (err.response?.data?.message || err.message));
        } finally {
            setBulkLoading(false);
            setBulkConfirm(null);
        }
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

            {/* Bulk Action Bar — visible when any row is selected */}
            {selected.size > 0 && (
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'var(--navy)', color: 'white',
                    padding: '12px 16px', borderRadius: '12px',
                    marginBottom: '12px',
                    display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
                    boxShadow: '0 4px 16px rgba(10,22,40,0.3)',
                }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        ✅ {selected.size} selected
                    </span>
                    <button
                        onClick={() => setBulkConfirm({ action: 'delete', label: 'Delete', count: selected.size })}
                        disabled={bulkLoading}
                        style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >🗑️ Delete</button>
                    <button
                        onClick={() => runBulkAction('hide', '👁️ Hidden')}
                        disabled={bulkLoading}
                        style={{ background: 'var(--gray-600)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >👁️‍🗨️ Hide</button>
                    <button
                        onClick={() => runBulkAction('unhide', '👁️ Unhidden')}
                        disabled={bulkLoading}
                        style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >👁️ Unhide</button>
                    <button
                        onClick={() => runBulkAction('breaking-on', '🔴 Breaking ON')}
                        disabled={bulkLoading}
                        style={{ background: 'rgba(229,57,53,0.85)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >🔴 Breaking</button>
                    <button
                        onClick={() => runBulkAction('featured-on', '⭐ Featured ON')}
                        disabled={bulkLoading}
                        style={{ background: 'var(--saffron)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >⭐ Featured</button>
                    <button
                        onClick={clearSelection}
                        style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', marginLeft: 'auto' }}
                    >✕ Clear</button>
                </div>
            )}

            {/* Table - Desktop */}
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ padding: '12px 8px 12px 16px', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={paginated.length > 0 && paginated.every(a => selected.has(a.id))}
                                    onChange={toggleSelectAllVisible}
                                    title="Select all visible"
                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                            </th>
                            <th style={{ padding: '12px 16px' }}>खबर</th>
                            <th style={{ padding: '12px 16px' }}>श्रेणी</th>
                            <th style={{ padding: '12px 16px' }}>स्थान</th>
                            <th style={{ padding: '12px 16px' }}>ब्रेकिंग</th>
                            <th style={{ padding: '12px 16px' }}>फीचर्ड</th>
                            <th style={{ padding: '12px 16px' }}>स्थिति</th>
                            <th style={{ padding: '12px 16px' }}>तारीख</th>
                            <th style={{ padding: '12px 16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(a => (
                            <tr key={a.id} style={{ background: selected.has(a.id) ? 'rgba(0,188,212,0.08)' : (a.isHidden ? 'rgba(229,57,53,0.04)' : 'transparent') }}>
                                <td style={{ padding: '8px 8px 8px 16px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(a.id)}
                                        onChange={() => toggleSelect(a.id)}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&q=60'} alt="" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px', opacity: a.isHidden ? 0.5 : 1 }} />
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: a.isHidden ? 'var(--gray-500)' : 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px', textDecoration: a.isHidden ? 'line-through' : 'none' }}>{a.title}</div>
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
                                <td style={{ padding: '8px 16px' }}>
                                    <button
                                        onClick={() => {
                                            updateArticle(a.id, { isHidden: !a.isHidden });
                                            showToast(a.isHidden ? '👁️ Visible अब' : '👁️‍🗨️ Hidden ho gayi');
                                        }}
                                        title={a.isHidden ? 'Click to show on site' : 'Click to hide from site'}
                                        style={{
                                            background: a.isHidden ? 'var(--gray-600)' : 'var(--teal)',
                                            color: 'white', padding: '3px 8px', borderRadius: '4px',
                                            fontSize: '0.7rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        {a.isHidden ? '👁️‍🗨️ Hidden' : '👁️ Visible'}
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

            {/* Bulk Delete Confirm Modal */}
            {bulkConfirm && (
                <>
                    <div className="mobile-menu-overlay show" onClick={() => setBulkConfirm(null)} />
                    <div className="modal-wrap">
                        <div className="modal">
                            <div className="modal-title">⚠️ {bulkConfirm.count} खबरें हटाएं?</div>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                क्या आप वाकई <strong>{bulkConfirm.count} selected खबरें</strong> permanently delete करना चाहते हैं? यह कार्य वापस नहीं होगा।
                                <br /><br />
                                💡 Tip: Hide करने से public site से छुप जायेगी, but data save रहेगा।
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--navy)' }} onClick={() => setBulkConfirm(null)}>रद्द करें</button>
                                <button className="btn btn-sm" style={{ background: 'var(--gray-600)', color: 'white' }} onClick={() => { runBulkAction('hide', '👁️ Hidden'); }}>👁️‍🗨️ Hide करें instead</button>
                                <button className="btn btn-sm btn-danger" onClick={() => runBulkAction('delete', '🗑️ Deleted')} disabled={bulkLoading}>
                                    {bulkLoading ? '⏳ Deleting...' : `🗑️ हाँ, ${bulkConfirm.count} delete करें`}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
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
