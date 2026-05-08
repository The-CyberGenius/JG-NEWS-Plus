import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../store/newsStore';
import { formatDate, timeAgo } from '../utils/helpers';

const NUMBER = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: 'white', borderRadius: '14px', padding: '18px 20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', gap: '6px',
            borderTop: `3px solid ${color}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', lineHeight: 1 }}>{NUMBER(value)}</div>
        </div>
    );
}

export default function SubscriberManager() {
    const [data, setData] = useState({ subscribers: [], stats: {}, total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [toast, setToast] = useState('');
    const [confirmDel, setConfirmDel] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/subscribers', { params: { page, limit: 50, search: search.trim() } });
            setData(res.data);
        } catch (err) {
            showToast('❌ Failed to load: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [page]);

    // Search debounce
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchData(); }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line
    }, [search]);

    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        const allIds = data.subscribers.map(s => s._id);
        const allSel = allIds.every(id => selected.has(id));
        setSelected(prev => {
            const next = new Set(prev);
            if (allSel) allIds.forEach(id => next.delete(id));
            else allIds.forEach(id => next.add(id));
            return next;
        });
    };

    const handleDeleteOne = async (id) => {
        try {
            await api.delete(`/subscribers/${id}`);
            showToast('✅ Subscriber deleted');
            fetchData();
            setConfirmDel(null);
        } catch (err) {
            showToast('❌ Delete failed');
        }
    };

    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!window.confirm(`${selected.size} subscribers delete करें?`)) return;
        try {
            const res = await api.post('/subscribers/bulk-delete', { ids: Array.from(selected) });
            showToast(`✅ ${res.data.deleted} deleted`);
            setSelected(new Set());
            fetchData();
        } catch (err) {
            showToast('❌ Bulk delete failed');
        }
    };

    const handleExportCSV = () => {
        // Hit the CSV endpoint — backend sets Content-Disposition for download
        const link = document.createElement('a');
        link.href = `${api.defaults.baseURL}/subscribers/export/csv`;
        link.download = `subscribers-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = data.stats || {};

    return (
        <div>
            {toast && <div className="toast toast-success">{toast}</div>}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>📬 Subscribers</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '2px' }}>
                        Newsletter subscribers list and management
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="btn"
                    style={{ background: 'var(--green, #10b981)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }}
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon="📊" label="Total Subscribers" value={stats.total} color="#0a1628" />
                <StatCard icon="✅" label="Active" value={stats.active} color="#10b981" />
                <StatCard icon="❌" label="Unsubscribed" value={stats.inactive} color="#e53935" />
                <StatCard icon="🆕" label="New (30d)" value={stats.last30days} color="#00bcd4" />
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Email / Name / Phone से खोजें..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}
                />
                <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                    Showing {data.subscribers.length} of {data.total}
                </span>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div style={{
                    background: 'var(--navy)', color: 'white',
                    padding: '12px 16px', borderRadius: '10px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                }}>
                    <span style={{ fontWeight: 800 }}>✅ {selected.size} selected</span>
                    <button onClick={handleBulkDelete} style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>🗑️ Delete</button>
                    <button onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '12px 8px 12px 16px', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={data.subscribers.length > 0 && data.subscribers.every(s => selected.has(s._id))}
                                    onChange={toggleSelectAll}
                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                            </th>
                            <th style={{ padding: '12px 16px' }}>Email</th>
                            <th style={{ padding: '12px 16px' }}>Name</th>
                            <th style={{ padding: '12px 16px' }}>Phone</th>
                            <th style={{ padding: '12px 16px' }}>Source</th>
                            <th style={{ padding: '12px 16px' }}>Status</th>
                            <th style={{ padding: '12px 16px' }}>Subscribed</th>
                            <th style={{ padding: '12px 16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>Loading...</td></tr>
                        )}
                        {!loading && data.subscribers.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                                {search ? 'कोई match नहीं मिला' : 'अभी तक कोई subscriber नहीं है'}
                            </td></tr>
                        )}
                        {!loading && data.subscribers.map(s => (
                            <tr key={s._id} style={{ background: selected.has(s._id) ? 'rgba(0,188,212,0.08)' : 'transparent' }}>
                                <td style={{ padding: '8px 8px 8px 16px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(s._id)}
                                        onChange={() => toggleSelect(s._id)}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <a href={`mailto:${s.email}`} style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>{s.email}</a>
                                        {s.verified && <span title="Verified via Google" style={{ fontSize: '0.85rem' }}>✅</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {s.picture && <img src={s.picture} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />}
                                        {s.name || <span style={{ color: 'var(--gray-400)' }}>—</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '8px 16px', fontSize: '0.85rem' }}>{s.phone || <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                                <td style={{ padding: '8px 16px' }}>
                                    {s.source === 'google'
                                        ? <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>🔵 Google</span>
                                        : <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{s.source}</span>
                                    }
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                    {s.isActive
                                        ? <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>✅ Active</span>
                                        : <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>❌ Inactive</span>
                                    }
                                </td>
                                <td style={{ padding: '8px 16px', fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                                    <div>{formatDate(s.createdAt)}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{timeAgo(s.createdAt)}</div>
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                    <button
                                        onClick={() => setConfirmDel(s)}
                                        style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                                    >🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
                <div className="pagination" style={{ marginTop: '20px', flexWrap: 'wrap' }}>
                    <button className="page-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>‹ पिछला</button>
                    {Array.from({ length: data.pages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === data.pages || Math.abs(p - page) <= 2)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px' }}>…</span>}
                                <button className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                            </React.Fragment>
                        ))}
                    <button className="page-btn" onClick={() => setPage(Math.min(data.pages, page + 1))} disabled={page === data.pages}>अगला ›</button>
                </div>
            )}

            {/* Delete confirm modal */}
            {confirmDel && (
                <>
                    <div className="mobile-menu-overlay show" onClick={() => setConfirmDel(null)} />
                    <div className="modal-wrap">
                        <div className="modal">
                            <div className="modal-title">⚠️ Subscriber हटाएं?</div>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                <strong>{confirmDel.email}</strong> को subscribers list से remove करना है?
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--navy)' }} onClick={() => setConfirmDel(null)}>रद्द करें</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteOne(confirmDel._id)}>🗑️ हटाएं</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
