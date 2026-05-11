import React, { useEffect, useState, useCallback } from 'react';
import { articleHref } from '../utils/articleHref';
import { useParams, Link } from 'react-router-dom';
import { timeAgo } from '../utils/helpers';
import { NewsCardSkeleton } from '../components/Skeletons';
import { SEO } from '../utils/seo';
import { getArticles } from '../store/newsStore';
import { optimizeImage, srcSet } from '../utils/imageUrl';

const PAGE_SIZE = 12;

function NewsCard({ article }) {
    const [imgFailed, setImgFailed] = useState(false);
    const validImageUrl = !!(article.image && /^https?:\/\//i.test(article.image.trim()));
    const hasImage = validImageUrl && !imgFailed;

    return (
        <Link to={articleHref(article)} className={`news-card${hasImage ? '' : ' news-card--no-image'}`} style={{ textDecoration: 'none' }}>
            {hasImage ? (
                <div className="news-card__img">
                    <img
                        src={optimizeImage(article.image, { width: 600 })}
                        srcSet={srcSet(article.image, [400, 600, 800])}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgFailed(true)}
                    />
                    {article.isBreaking && <span className="badge badge-red">ब्रेकिंग</span>}
                </div>
            ) : (
                <div className="news-card__placeholder">
                    <span className="news-card__placeholder-cat">{article.category}</span>
                    <h3 className="news-card__placeholder-title">{article.title}</h3>
                    {article.isBreaking && <span className="badge badge-red news-card__placeholder-badge">ब्रेकिंग</span>}
                </div>
            )}
            <div className="news-card__body">
                {hasImage && <div className="news-card__category">{article.category}</div>}
                {hasImage && <div className="news-card__title">{article.title}</div>}
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
    const [articles, setArticles] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPage = useCallback(async (pageNum, append) => {
        if (pageNum === 1) setIsLoading(true);
        else setLoadingMore(true);
        try {
            const result = await getArticles({ page: pageNum, limit: PAGE_SIZE, fields: 'summary', category });
            const newList = result.articles || [];
            setArticles(prev => append ? [...prev, ...newList] : newList);
            setPages(result.pages || 1);
            setTotal(result.total || newList.length);
        } catch (e) {
            console.error('Category fetch failed:', e);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [category]);

    useEffect(() => {
        setPage(1);
        fetchPage(1, false);
    }, [category, fetchPage]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPage(next, true);
    };

    const hasMore = page < pages;

    return (
        <div className="container section-gap">
            <SEO
                title={`${category} समाचार`}
                description={`${category} की ताज़ा खबरें — JG News Plus पर पढ़ें ${category} से जुड़े सभी समाचार, अपडेट और विश्लेषण।`}
                url={`/category/${category}`}
                keywords={`${category}, ${category} News, ${category} समाचार, Rajasthan News`}
            />
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
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{total} खबरें मिलीं</p>
                </div>
            </div>

            {isLoading ? (
                <div className="news-grid news-grid-3">
                    {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
                </div>
            ) : articles.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📰</div>
                    <h3>इस श्रेणी में कोई खबर नहीं है</h3>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>होम पर जाएं</Link>
                </div>
            ) : (
                <>
                    <div className="news-grid news-grid-3">
                        {articles.map(a => <NewsCard key={a.id} article={a} />)}
                    </div>
                    {hasMore && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="btn btn-navy"
                                style={{ minWidth: '180px', justifyContent: 'center' }}
                            >
                                {loadingMore ? 'लोड हो रहा है…' : 'और खबरें देखें'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
