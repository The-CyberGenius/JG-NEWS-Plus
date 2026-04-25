import React from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo } from '../utils/helpers';

export default function VideoGallery() {
    const { articles } = useNews();
    const videoArticles = articles.filter(a => a.videoUrl);
    const allArticles = articles;

    return (
        <div className="container section-gap">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '24px' }}>🎬 वीडियो न्यूज़</h1>

            {videoArticles.length === 0 ? (
                <div style={{ marginBottom: '40px' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon">🎬</div>
                        <h3>वीडियो उपलब्ध नहीं है</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '4px' }}>Admin panel से वीडियो URL के साथ खबर जोड़ें</p>
                    </div>
                </div>
            ) : (
                <div className="news-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {videoArticles.map(a => (
                        <Link key={a.id} to={`/article/${a.id}`} className="news-card" style={{ textDecoration: 'none' }}>
                            <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderRadius: '12px 12px 0 0', background: 'var(--navy)' }}>
                                <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'} alt={a.title} loading="lazy"
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>▶</div>
                                </div>
                            </div>
                            <div className="news-card__body">
                                <div className="news-card__category">{a.category}</div>
                                <div className="news-card__title">{a.title}</div>
                                <div className="news-card__meta"><span>📍 {a.location}</span><span>•</span><span>{timeAgo(a.date)}</span></div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <h2 className="section-title">सभी खबरें</h2>
            <div className="news-grid news-grid-4">
                {allArticles.slice(0, 8).map(a => (
                    <Link key={a.id} to={`/article/${a.id}`} className="news-card" style={{ textDecoration: 'none' }}>
                        <div className="news-card__img">
                            <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=70'} alt={a.title} loading="lazy" />
                        </div>
                        <div className="news-card__body">
                            <div className="news-card__category">{a.category}</div>
                            <div className="news-card__title">{a.title}</div>
                            <div className="news-card__meta"><span>📍 {a.location}</span><span>•</span><span>{timeAgo(a.date)}</span></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
