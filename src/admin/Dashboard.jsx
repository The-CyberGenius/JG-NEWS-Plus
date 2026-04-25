import React from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

export default function Dashboard() {
    const { articles, categories, settings } = useNews();

    const stats = [
        { icon: '📰', label: 'कुल खबरें', value: articles.length, color: '#0a1628', bg: 'rgba(0,188,212,0.1)' },
        { icon: '🔴', label: 'ब्रेकिंग न्यूज़', value: articles.filter(a => a.isBreaking).length, color: '#e53935', bg: 'rgba(229,57,53,0.1)' },
        { icon: '⭐', label: 'फीचर्ड', value: articles.filter(a => a.isFeatured).length, color: '#ff6f00', bg: 'rgba(255,111,0,0.1)' },
        { icon: '🏷️', label: 'श्रेणियाँ', value: categories.length, color: '#00bcd4', bg: 'rgba(0,188,212,0.1)' },
        { icon: '🎬', label: 'वीडियो', value: articles.filter(a => a.videoUrl).length, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
        { icon: '📷', label: 'फोटो', value: articles.filter(a => a.image).length, color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    ];

    const recent = articles.slice(0, 5);

    return (
        <div>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '4px' }}>📊 Dashboard</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>JG News Plus — Admin Control Panel</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {stats.map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>
                            <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                        </div>
                        <div>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link to="/admin/news/add" className="btn btn-primary">➕ खबर जोड़ें</Link>
                <Link to="/admin/sync" className="btn" style={{ background: 'var(--teal)', color: 'white' }}>🤖 AI News Sync (MCP)</Link>
                <Link to="/admin/messages" className="btn" style={{ background: '#4a90e2', color: 'white' }}>📩 संदेश</Link>
                <Link to="/admin/news" className="btn btn-navy">📰 सभी खबरें</Link>
                <Link to="/admin/live" className="btn" style={{ background: 'var(--red)', color: 'white' }}>📺 Live TV</Link>
                <Link to="/admin/categories" className="btn" style={{ background: 'var(--saffron)', color: 'white' }}>🏷️ श्रेणियाँ</Link>
            </div>

            {/* Recent Articles */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)' }}>
                    <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>🕐 हाल की खबरें</h2>
                    <Link to="/admin/news" style={{ color: 'var(--teal)', fontSize: '0.82rem', fontWeight: 700 }}>सभी देखें →</Link>
                </div>
                <div>
                    {recent.map((a, i) => (
                        <div key={a.id} style={{ display: 'flex', gap: '12px', padding: '14px 20px', borderBottom: i < recent.length - 1 ? '1px solid var(--gray-200)' : 'none', alignItems: 'center' }}>
                            <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&q=60'} alt={a.title} style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} loading="lazy" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '2px' }}>
                                    <span className="badge badge-teal" style={{ fontSize: '0.65rem', marginRight: '6px' }}>{a.category}</span>
                                    {a.isBreaking && <span className="badge badge-red" style={{ fontSize: '0.65rem', marginRight: '6px' }}>ब्रेकिंग</span>}
                                    📍 {a.location}
                                </div>
                            </div>
                            <Link to={`/admin/news/edit/${a.id}`} className="btn btn-sm btn-outline" style={{ flexShrink: 0 }}>✏️</Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live TV Status */}
            <div style={{ marginTop: '24px', background: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>📺 Live TV Status</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', wordBreak: 'break-all' }}>
                            {settings.liveUrl ? `✅ Active: ${settings.liveUrl.substring(0, 50)}...` : '❌ कोई URL सेट नहीं है'}
                        </p>
                    </div>
                    <Link to="/admin/live" className="btn btn-sm btn-outline">🔧 बदलें</Link>
                </div>
            </div>
        </div>
    );
}
