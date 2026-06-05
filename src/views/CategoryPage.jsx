'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { articleHref } from '../utils/articleHref';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { timeAgo } from '../utils/helpers';
import { NewsCardSkeleton } from '../components/Skeletons';
import { SEO } from '../utils/seo';
import { getArticles, fetchMetaDistricts } from '../store/newsStore';
import { optimizeImage, srcSet } from '../utils/imageUrl';
import { useLang } from '../context/LangContext';

const PAGE_SIZE = 12;
const ALL_RAJASTHAN = 'राजस्थान';

function NewsCard({ article }) {
    const [imgFailed, setImgFailed] = useState(false);
    const { t } = useLang();
    const validImageUrl = !!(article.image && /^https?:\/\//i.test(article.image.trim()));
    const hasImage = validImageUrl && !imgFailed;

    return (
        <Link href={articleHref(article)} className={`news-card${hasImage ? '' : ' news-card--no-image'}`} style={{ textDecoration: 'none' }}>
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
                    {article.isBreaking && <span className="badge badge-red">{t.breaking}</span>}
                </div>
            ) : (
                <div className="news-card__placeholder">
                    <span className="news-card__placeholder-cat">{article.category}</span>
                    <h3 className="news-card__placeholder-title">{article.title}</h3>
                    {article.isBreaking && <span className="badge badge-red news-card__placeholder-badge">{t.breaking}</span>}
                </div>
            )}
            <div className="news-card__body">
                {hasImage && <div className="news-card__category">{article.category}</div>}
                {hasImage && <div className="news-card__title">{article.title}</div>}
                <div className="news-card__meta">
                    <span>📍 {article.localArea ? `${article.localArea}, ` : ''}{article.district}</span>
                    <span>•</span>
                    <span>{timeAgo(article.date)}</span>
                </div>
            </div>
        </Link>
    );
}

export default function CategoryPage() {
    const { category } = useParams();
    const { t, tCat } = useLang();
    const isRajasthan = category === ALL_RAJASTHAN;

    const [articles, setArticles] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Location filter (only for राजस्थान/All page)
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const pillsRef = useRef(null);

    // Fetch locations once when on राजस्थान page
    useEffect(() => {
        if (!isRajasthan) return;
        fetchMetaDistricts().then(data => setLocations(data || []));
    }, [isRajasthan]);

    // Reset location filter when category changes
    useEffect(() => {
        setSelectedLocation('all');
    }, [category]);

    const fetchPage = useCallback(async (pageNum, append, locOverride) => {
        const loc = locOverride !== undefined ? locOverride : selectedLocation;
        if (pageNum === 1) setIsLoading(true);
        else setLoadingMore(true);
        try {
            const result = await getArticles({
                page: pageNum,
                limit: PAGE_SIZE,
                fields: 'summary',
                category,
                district: loc !== 'all' ? loc : undefined,
            });
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
    }, [category, selectedLocation]);

    useEffect(() => {
        setPage(1);
        fetchPage(1, false);
    }, [category, selectedLocation, fetchPage]);

    const handleLocationPill = (loc) => {
        setSelectedLocation(loc);
        setPage(1);
        // scroll pills container to keep selected pill visible
        if (pillsRef.current) pillsRef.current.scrollLeft = 0;
    };

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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                <Link href="/" style={{ color: 'var(--teal)' }}>{t.home}</Link>
                <span>›</span>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{tCat(category)}</span>
                {selectedLocation !== 'all' && (
                    <>
                        <span>›</span>
                        <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{selectedLocation}</span>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isRajasthan && locations.length > 0 ? '16px' : '28px' }}>
                <span style={{ background: 'var(--teal)', width: '4px', borderRadius: '2px', alignSelf: 'stretch' }} />
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)' }}>
                        {selectedLocation !== 'all' ? selectedLocation : tCat(category)}
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{total} {t.found}</p>
                </div>
            </div>

            {/* Location filter pills — राजस्थान page only */}
            {isRajasthan && locations.length > 0 && (
                <div
                    ref={pillsRef}
                    style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '12px',
                        marginBottom: '24px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                    className="location-pills-strip"
                >
                    {/* All pill */}
                    <button
                        onClick={() => handleLocationPill('all')}
                        style={{
                            flexShrink: 0,
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: '2px solid',
                            borderColor: selectedLocation === 'all' ? 'var(--teal)' : 'var(--gray-300)',
                            background: selectedLocation === 'all' ? 'var(--teal)' : 'white',
                            color: selectedLocation === 'all' ? 'white' : 'var(--gray-700)',
                            fontWeight: selectedLocation === 'all' ? 700 : 500,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        सभी जिले
                    </button>

                    {locations.map(({ district, count }) => (
                        <button
                            key={district}
                            onClick={() => handleLocationPill(district)}
                            style={{
                                flexShrink: 0,
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: '2px solid',
                                borderColor: selectedLocation === district ? 'var(--teal)' : 'var(--gray-300)',
                                background: selectedLocation === district ? 'var(--teal)' : 'white',
                                color: selectedLocation === district ? 'white' : 'var(--gray-700)',
                                fontWeight: selectedLocation === district ? 700 : 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                            }}
                        >
                            📍 {district}
                            <span style={{
                                background: selectedLocation === district ? 'rgba(255,255,255,0.25)' : 'var(--gray-100)',
                                color: selectedLocation === district ? 'white' : 'var(--gray-500)',
                                borderRadius: '10px',
                                padding: '1px 7px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>{count}</span>
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="news-grid news-grid-3">
                    {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
                </div>
            ) : articles.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📰</div>
                    <h3>{t.noNews}</h3>
                    {selectedLocation !== 'all' && (
                        <button
                            className="btn btn-outline"
                            style={{ marginTop: '8px', marginBottom: '4px' }}
                            onClick={() => handleLocationPill('all')}
                        >
                            सभी जिले देखें
                        </button>
                    )}
                    <Link href="/" className="btn btn-primary" style={{ marginTop: '8px' }}>{t.goHome}</Link>
                </div>
            ) : (
                <>
                    <div className="news-grid news-grid-3">
                        {articles.map(a => <NewsCard key={a.id || a._id} article={a} />)}
                    </div>
                    {hasMore && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="btn btn-navy"
                                style={{ minWidth: '180px', justifyContent: 'center' }}
                            >
                                {loadingMore ? t.loading : t.loadMore}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
