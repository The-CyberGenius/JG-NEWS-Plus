import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo, formatDate } from '../utils/helpers';
import { NewsCardSkeleton } from '../components/Skeletons';

function NewsCard({ article }) {
    return (
        <Link to={`/article/${article.id}`} className="news-card" style={{ textDecoration: 'none' }}>
            <div className="news-card__img">
                <img src={article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'} alt={article.title} loading="lazy" />
                {article.isBreaking && <span className="badge badge-red">ब्रेकिंग</span>}
            </div>
            <div className="news-card__body">
                <div className="news-card__category">{article.category}</div>
                <div className="news-card__title">{article.title}</div>
                <div className="news-card__meta">
                    <span>📍 {article.location}</span>
                    <span>•</span>
                    <span>{timeAgo(article.date)}</span>
                </div>
            </div>
        </Link>
    );
}

export default function CategoryPage() {
    const { category } = useParams();
    const { articles, isLoading } = useNews();

    const filtered = useMemo(() =>
        articles.filter(a => a.category === category),
        [articles, category]
    );

    return (
        <div className="container section-gap">
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                <Link to="/" style={{ color: 'var(--teal)' }}>होम</Link>
                <span>›</span>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{category}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <span style={{ background: 'var(--teal)', width: '4px', borderRadius: '2px', alignSelf: 'stretch' }} />
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)' }}>{category}</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{filtered.length} खबरें मिलीं</p>
                </div>
            </div>

            {isLoading ? (
                <div className="news-grid news-grid-3">
                    {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📰</div>
                    <h3>इस श्रेणी में कोई खबर नहीं है</h3>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>होम पर जाएं</Link>
                </div>
            ) : (
                <div className="news-grid news-grid-3">
                    {filtered.map(a => <NewsCard key={a.id} article={a} />)}
                </div>
            )}
        </div>
    );
}
