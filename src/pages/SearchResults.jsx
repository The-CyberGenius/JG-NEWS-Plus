import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo } from '../utils/helpers';

export default function SearchResults() {
    const [params] = useSearchParams();
    const q = params.get('q') || '';
    const { articles } = useNews();

    const results = useMemo(() => {
        if (!q.trim()) return [];
        const lower = q.toLowerCase();
        return articles.filter(a =>
            a.title.toLowerCase().includes(lower) ||
            a.excerpt?.toLowerCase().includes(lower) ||
            a.content?.toLowerCase().includes(lower) ||
            a.category?.toLowerCase().includes(lower) ||
            a.location?.toLowerCase().includes(lower)
        );
    }, [articles, q]);

    return (
        <div className="container section-gap">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '6px' }}>
                खोज परिणाम: "{q}"
            </h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '28px', fontSize: '0.9rem' }}>
                {results.length} खबरें मिलीं
            </p>

            {results.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3>कोई खबर नहीं मिली</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>दूसरे शब्दों से खोजें</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '12px' }}>होम पर जाएं</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {results.map(a => (
                        <Link key={a.id} to={`/article/${a.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--card-shadow)', display: 'flex', gap: '16px', transition: 'var(--transition)' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--card-shadow)'}
                            >
                                <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=70'} alt={a.title}
                                    style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        {a.isBreaking && <span className="badge badge-red">ब्रेकिंग</span>}
                                        <span className="badge badge-teal">{a.category}</span>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: '6px' }}>{a.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>📍 {a.location} • {timeAgo(a.date)}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
