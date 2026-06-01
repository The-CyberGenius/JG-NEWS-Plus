import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleHref } from '../utils/articleHref';
import { searchArticles } from '../store/newsStore';
import { timeAgo } from '../utils/helpers';
import { useLang } from '../context/LangContext';

export default function SearchResults() {
    const [params] = useSearchParams();
    const q = params.get('q') || '';
    const { t } = useLang();

    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchResults = useCallback(async (query, pg) => {
        if (!query.trim()) { setResults([]); setTotal(0); return; }
        if (pg === 1) setLoading(true); else setLoadingMore(true);
        const data = await searchArticles({ q: query, page: pg, limit: 12 });
        if (pg === 1) {
            setResults(data.articles || []);
        } else {
            setResults(prev => [...prev, ...(data.articles || [])]);
        }
        setTotal(data.total || 0);
        setPages(data.pages || 0);
        setPage(pg);
        if (pg === 1) setLoading(false); else setLoadingMore(false);
    }, []);

    useEffect(() => {
        setPage(1);
        fetchResults(q, 1);
    }, [q, fetchResults]);

    const loadMore = () => fetchResults(q, page + 1);

    return (
        <>
            <Helmet>
                <title>{q ? `"${q}" - खोज | JG News Plus` : 'खोज | JG News Plus'}</title>
            </Helmet>
            <div className="container section-gap">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '6px' }}>
                    {t.searchResults}: "{q}"
                </h1>
                <p style={{ color: 'var(--gray-600)', marginBottom: '28px', fontSize: '0.9rem' }}>
                    {loading ? '' : `${total} ${t.found}`}
                </p>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>{t.noResults}</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{t.tryOther}</p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '12px' }}>{t.goHome}</Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {results.map(a => (
                                <Link key={a._id || a.id} to={articleHref(a)} style={{ textDecoration: 'none' }}>
                                    <div
                                        style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--card-shadow)', display: 'flex', gap: '16px', transition: 'var(--transition)' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--card-shadow)'}
                                    >
                                        <img
                                            src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=70'}
                                            alt={a.title}
                                            loading="lazy"
                                            style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                                        />
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

                        {page < pages && (
                            <div style={{ textAlign: 'center', marginTop: '28px' }}>
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="btn btn-outline"
                                    style={{ minWidth: '160px' }}
                                >
                                    {loadingMore ? t.loading : t.loadMore}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
