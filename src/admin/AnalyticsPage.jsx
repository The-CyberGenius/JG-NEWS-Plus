import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../store/newsStore';
import { timeAgo } from '../utils/helpers';

const NUMBER = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

function StatCard({ icon, label, value, color, delta }) {
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
            {delta !== undefined && (
                <div style={{ fontSize: '0.78rem', color: delta >= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs prev period
                </div>
            )}
        </div>
    );
}

function BarChart({ data, label = 'Views', color = '#00bcd4' }) {
    const max = Math.max(1, ...data.map(d => d.views ?? d.count ?? 0));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '180px', padding: '12px 4px 0', borderBottom: '1px solid var(--gray-200)' }}>
            {data.map((d, i) => {
                const v = d.views ?? d.count ?? 0;
                const h = (v / max) * 100;
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div
                            title={`${d.day}: ${NUMBER(v)} ${label}`}
                            style={{
                                width: '100%',
                                height: `${h}%`,
                                minHeight: v > 0 ? '4px' : '2px',
                                background: v > 0
                                    ? `linear-gradient(180deg, ${color}, ${color}cc)`
                                    : 'var(--gray-200)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get('/analytics/overview', { params: { days } })
            .then(res => { if (!cancelled) setData(res.data); })
            .catch(e => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [days]);

    const dailyTotal = useMemo(() => {
        if (!data?.dailyViews) return 0;
        return data.dailyViews.reduce((s, d) => s + (d.views || 0), 0);
    }, [data]);

    const avgPerDay = useMemo(() => {
        if (!data?.dailyViews?.length) return 0;
        return Math.round(dailyTotal / data.dailyViews.length);
    }, [data, dailyTotal]);

    if (loading && !data) {
        return (
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '20px' }}>📊 Analytics</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '14px' }} />)}
                </div>
                <div className="skeleton" style={{ height: '240px', borderRadius: '14px' }} />
            </div>
        );
    }

    if (error) {
        return <div style={{ color: 'var(--red)', padding: '20px' }}>Error: {error}</div>;
    }

    const t = data?.totals || {};

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>📊 Analytics Dashboard</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '2px' }}>
                        Last {days} days · {data?.range?.from} → {data?.range?.to}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {[7, 30, 60].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className="btn btn-sm"
                            style={{
                                background: days === d ? 'var(--navy)' : 'white',
                                color: days === d ? 'white' : 'var(--navy)',
                                border: '1px solid var(--gray-200)',
                            }}
                        >{d}d</button>
                    ))}
                </div>
            </div>

            {/* Top KPI Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <StatCard icon="👁️" label="Total Views" value={t.totalViews} color="#00bcd4" />
                <StatCard icon="📰" label="Total Articles" value={t.totalArticles} color="#0a1628" />
                <StatCard icon="🔴" label="Breaking" value={t.breakingCount} color="#e53935" />
                <StatCard icon="⭐" label="Featured" value={t.featuredCount} color="#ff6f00" />
                <StatCard icon="📈" label={`Views (${days}d)`} value={dailyTotal} color="#7c3aed" />
                <StatCard icon="📊" label="Avg/Day" value={avgPerDay} color="#059669" />
                <StatCard icon="💬" label="Messages" value={t.messageCount} color="#4a90e2" />
            </div>

            {/* Daily Views Chart */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)' }}>📈 Daily Article Views</h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>{NUMBER(dailyTotal)} total · avg {NUMBER(avgPerDay)}/day</span>
                </div>
                <BarChart data={data?.dailyViews || []} color="#00bcd4" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '6px' }}>
                    <span>{data?.dailyViews?.[0]?.day}</span>
                    <span>{data?.dailyViews?.[data?.dailyViews?.length - 1]?.day}</span>
                </div>
            </div>

            {/* Articles Posted Chart */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '12px' }}>📝 Articles Posted Per Day</h2>
                <BarChart data={data?.articlesPosted || []} label="articles" color="#ff6f00" />
            </div>

            {/* Two-column row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Top Articles */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '14px' }}>🔥 Top Articles by Views</h2>
                    {(data?.topArticles || []).length === 0 && (
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No views recorded yet — share articles to see analytics.</p>
                    )}
                    {(data?.topArticles || []).map((a, i) => (
                        <Link key={a._id} to={`/article/${a._id}`} target="_blank" style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: i < 9 ? '1px solid var(--gray-100)' : 'none', textDecoration: 'none', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, color: 'var(--teal)', minWidth: '24px', fontSize: '0.9rem' }}>#{i + 1}</span>
                            <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100'} alt="" style={{ width: '44px', height: '34px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} loading="lazy" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{a.category} · {timeAgo(a.date)}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '0.95rem' }}>{NUMBER(a.views || 0)}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>views</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Category Breakdown */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '14px' }}>🏷️ Top Categories</h2>
                    {(() => {
                        const cats = data?.categoryStats || [];
                        const max = Math.max(1, ...cats.map(c => c.articleCount));
                        return cats.map((c, i) => (
                            <div key={c._id} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{c._id}</span>
                                    <span style={{ color: 'var(--gray-600)' }}>{c.articleCount} articles · {NUMBER(c.totalViews)} views</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(c.articleCount / max) * 100}%`,
                                        height: '100%',
                                        background: `linear-gradient(90deg, var(--teal), var(--teal-dark))`,
                                        borderRadius: '4px',
                                    }} />
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* Recent Articles */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)' }}>🕐 Recent Articles</h2>
                    <Link to="/admin/news" style={{ color: 'var(--teal)', fontSize: '0.82rem', fontWeight: 700 }}>View all →</Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
                                <th style={{ textAlign: 'right', padding: '8px' }}>Views</th>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Posted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.recentArticles || []).slice(0, 15).map(a => (
                                <tr key={a._id} style={{ borderTop: '1px solid var(--gray-100)' }}>
                                    <td style={{ padding: '8px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{a.title}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{a.category}</span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: 'var(--teal)' }}>{NUMBER(a.views || 0)}</td>
                                    <td style={{ padding: '8px' }}>
                                        {a.isBreaking && <span className="badge badge-red" style={{ fontSize: '0.65rem', marginRight: '4px' }}>ब्रेकिंग</span>}
                                        {a.isFeatured && <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>फीचर्ड</span>}
                                    </td>
                                    <td style={{ padding: '8px', fontSize: '0.78rem', color: 'var(--gray-600)' }}>{timeAgo(a.date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
