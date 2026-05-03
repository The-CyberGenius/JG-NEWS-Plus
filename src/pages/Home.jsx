import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { timeAgo } from '../utils/helpers';
import { NewsCardSkeleton, CategorySectionSkeleton, ListSkeleton } from '../components/Skeletons';
import { SEO } from '../utils/seo';
import { optimizeImage, srcSet } from '../utils/imageUrl';
import { api } from '../store/newsStore';

const INITIAL_WEATHER = [
    { city: 'रतनगढ़', temp: '34°C', icon: '☀️', desc: 'धूप' },
    { city: 'जयपुर', temp: '34°C', icon: '☀️', desc: 'धूप' },
    { city: 'जोधपुर', temp: '36°C', icon: '🌤️', desc: 'आंशिक बादल' },
    { city: 'उदयपुर', temp: '30°C', icon: '⛅', desc: 'बादल' },
    { city: 'कोटा', temp: '33°C', icon: '☀️', desc: 'गर्म' },
    { city: 'बीकानेर', temp: '38°C', icon: '🌵', desc: 'शुष्क' },
    { city: 'अजमेर', temp: '32°C', icon: '⛅', desc: 'बादल' },
    { city: 'अलवर', temp: '33°C', icon: '☀️', desc: 'धूप' },
    { city: 'भीलवाड़ा', temp: '31°C', icon: '🌤️', desc: 'आंशिक बादल' },
    { city: 'सीकर', temp: '34°C', icon: '☀️', desc: 'धूप' },
    { city: 'पाली', temp: '35°C', icon: '☀️', desc: 'धूप' },
    { city: 'माउंट आबू', temp: '22°C', icon: '⛅', desc: 'ठंडा' },
    { city: 'जैसलमेर', temp: '39°C', icon: '🌵', desc: 'शुष्क' },
    { city: 'चित्तौड़गढ़', temp: '31°C', icon: '⛅', desc: 'बादल' },
    { city: 'भरतपुर', temp: '33°C', icon: '☀️', desc: 'धूप' },
    { city: 'गंगानगर', temp: '37°C', icon: '☀️', desc: 'धूप' },
];

function NewsCard({ article }) {
    const imgUrl = article.image || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80`;
    return (
        <Link to={`/article/${article.id}`} className="news-card" style={{ textDecoration: 'none' }}>
            <div className="news-card__img">
                <img
                    src={optimizeImage(imgUrl, { width: 600 })}
                    srcSet={srcSet(imgUrl, [400, 600, 800])}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                />
                {article.isBreaking && <span className="badge badge-red">ब्रेकिंग</span>}
                {article.isFeatured && !article.isBreaking && <span className="badge badge-teal">मुख्य</span>}
            </div>
            <div className="news-card__body">
                <div className="news-card__category">{article.category}</div>
                <div className="news-card__title">{article.title}</div>
                <div className="news-card__meta">
                    <span className="news-card__location">📍 {article.location}</span>
                    <span>•</span>
                    <span>{timeAgo(article.date)}</span>
                </div>
            </div>
        </Link>
    );
}


function SectionHeader({ title, linkTo, linkLabel = 'और देखें' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
            {linkTo && (
                <Link to={linkTo} style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {linkLabel} →
                </Link>
            )}
        </div>
    );
}

export default function Home() {
    const { articles, settings, categories, isLoading } = useNews();
    const [weatherData, setWeatherData] = useState(INITIAL_WEATHER);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=28.0775,26.9124,26.2389,24.5854,25.2138,28.0229,26.4499,27.5530,25.3407,27.6094,25.7711,24.5926,26.9157,24.8829,27.2152,29.9038&longitude=74.6200,75.7873,73.0243,73.7125,75.8648,73.3119,74.6399,76.6346,74.6313,75.1398,73.3234,72.7156,70.9083,74.6230,77.4895,73.8772&current_weather=true");
                const data = await res.json();
                const getWeatherIcon = (code) => {
                    if (code === 0) return '☀️';
                    if (code <= 3) return '⛅';
                    if (code >= 45 && code <= 48) return '🌫️';
                    if (code >= 51 && code <= 67) return '🌧️';
                    if (code >= 71 && code <= 77) return '❄️';
                    if (code >= 95) return '⛈️';
                    return '🌤️';
                };
                const updatedWeather = data.map((location, i) => ({
                    ...INITIAL_WEATHER[i],
                    temp: `${Math.round(location.current_weather.temperature)}°C`,
                    icon: getWeatherIcon(location.current_weather.weathercode),
                }));
                setWeatherData(updatedWeather);
            } catch (err) {
                console.error('Open-Meteo weather update failed', err);
            }
        };
        fetchWeather();
    }, []);

    // Hero slider articles: featured first, then breaking, then latest
    const heroSlides = useMemo(() => {
        const featured = articles.filter(a => a.isFeatured);
        const breaking = articles.filter(a => a.isBreaking && !a.isFeatured);
        const pool = [...featured, ...breaking, ...articles.filter(a => !a.isFeatured && !a.isBreaking)];
        return pool.slice(0, 5);
    }, [articles]);

    // Sort articles by date desc explicitly so newest are always first
    const sortedArticles = useMemo(() => {
        return [...articles].sort((a, b) => {
            const da = new Date(a.date || a.createdAt || 0).getTime();
            const db = new Date(b.date || b.createdAt || 0).getTime();
            return db - da;
        });
    }, [articles]);

    const newsFlash = useMemo(() => sortedArticles.slice(0, 10), [sortedArticles]);

    // Latest news with Load More — initially shows 8, +8 per click
    const [latestCount, setLatestCount] = useState(8);
    const [extraArticles, setExtraArticles] = useState([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [serverHasMore, setServerHasMore] = useState(true);

    const combinedSorted = useMemo(() => {
        const seen = new Set();
        const merged = [];
        for (const a of [...sortedArticles, ...extraArticles]) {
            if (!seen.has(a.id || a._id)) {
                seen.add(a.id || a._id);
                merged.push(a);
            }
        }
        return merged.sort((a, b) => {
            const da = new Date(a.date || a.createdAt || 0).getTime();
            const db = new Date(b.date || b.createdAt || 0).getTime();
            return db - da;
        });
    }, [sortedArticles, extraArticles]);

    const latest = useMemo(() => combinedSorted.slice(0, latestCount), [combinedSorted, latestCount]);
    const hasMore = combinedSorted.length > latestCount || serverHasMore;

    const handleLoadMore = useCallback(async () => {
        // If we still have unseen articles in local cache, just expand count
        if (combinedSorted.length > latestCount) {
            setLatestCount(c => c + 8);
            return;
        }
        // Otherwise fetch the next page from API
        if (loadingMore || !serverHasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = Math.floor(combinedSorted.length / 30) + 1;
            const res = await api.get('/articles', { params: { page: nextPage, limit: 30, fields: 'summary' } });
            const newArticles = (res.data?.articles || []).map(a => ({ ...a, id: a._id }));
            if (newArticles.length === 0) {
                setServerHasMore(false);
            } else {
                setExtraArticles(prev => [...prev, ...newArticles]);
                setLatestCount(c => c + 8);
                if (res.data?.page >= res.data?.pages) setServerHasMore(false);
            }
        } catch (err) {
            console.error('Load more failed', err);
        } finally {
            setLoadingMore(false);
        }
    }, [combinedSorted.length, latestCount, loadingMore, serverHasMore]);

    // Trending Now (last 1 hour by views)
    const [trending, setTrending] = useState([]);
    useEffect(() => {
        let cancelled = false;
        api.get('/articles/trending/now', { params: { hours: 1, limit: 8 } })
            .then(res => {
                if (!cancelled) setTrending((res.data?.articles || []).map(a => ({ ...a, id: a._id })));
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    // Auto-slide logic
    const [slideIdx, setSlideIdx] = useState(0);
    const slideTimer = useRef(null);

    const startSlideTimer = useCallback(() => {
        if (slideTimer.current) clearInterval(slideTimer.current);
        slideTimer.current = setInterval(() => {
            setSlideIdx(prev => (prev + 1) % Math.max(1, heroSlides.length));
        }, 4000);
    }, [heroSlides.length]);

    useEffect(() => {
        if (heroSlides.length > 1) startSlideTimer();
        return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
    }, [heroSlides.length, startSlideTimer]);
    const byCategory = useMemo(() => {
        // Pick first 4 categories from DB
        const cats = categories.slice(0, 4);
        return cats.map(cat => ({
            cat,
            articles: articles.filter(a => a.category === cat).slice(0, 3),
        })).filter(c => c.articles.length > 0);
    }, [articles, categories]);

    return (
        <div>
            <SEO
                title="Rajasthan की ताज़ा खबरें"
                description="JG News Plus पर पढ़ें राजस्थान की हर बड़ी खबर — राजनीति, अपराध, खेल, मौसम, ब्रेकिंग न्यूज़ और बहुत कुछ। निडर • निष्पक्ष • निर्भीक।"
                url="/"
                keywords="Rajasthan News, Hindi News, राजस्थान समाचार, Jaipur News, जयपुर समाचार, Breaking News, JG News"
            />
            {/* Hero Section — Slider + News Flash */}
            <div className="container">
                {isLoading ? (
                    <div className="hero-section">
                        <div className="skeleton" style={{ height: '420px', borderRadius: '20px' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <ListSkeleton count={6} />
                        </div>
                    </div>
                ) : (
                    <div className="hero-section">
                        {/* Auto-sliding Hero */}
                        <div className="hero-slider">
                            {heroSlides.map((a, i) => (
                                <Link
                                    key={a.id}
                                    to={`/article/${a.id}`}
                                    className={`hero-slide ${i === slideIdx ? 'active' : ''}`}
                                >
                                    <img
                                        className="hero-slide__img"
                                        src={optimizeImage(a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80', { width: 1200 })}
                                        srcSet={srcSet(a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80', [600, 900, 1200, 1600])}
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                        alt={a.title}
                                        loading={i === 0 ? 'eager' : 'lazy'}
                                        decoding="async"
                                    />
                                    <div className="hero-slide__overlay" />
                                    <div className="hero-slide__body">
                                        <span className="hero-slide__category">
                                            {a.isBreaking ? 'ब्रेकिंग' : a.category}
                                        </span>
                                        <div className="hero-slide__title">{a.title}</div>
                                        <div className="hero-slide__meta">
                                            📍 {a.location} • {timeAgo(a.date)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            <div className="hero-dots">
                                {heroSlides.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`hero-dot ${i === slideIdx ? 'active' : ''}`}
                                        onClick={(e) => { e.preventDefault(); setSlideIdx(i); startSlideTimer(); }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Trending Now / News Flash Sidebar */}
                        {trending.length > 0 ? (
                            <div className="news-flash">
                                <div className="news-flash__header" style={{ background: 'linear-gradient(90deg, #e53935, #c62828)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        🔥 ट्रेंडिंग अभी
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', opacity: 0.85, fontWeight: 600 }}>last 1 hr</span>
                                </div>
                                <div className="news-flash__list">
                                    {trending.map((a, i) => (
                                        <Link key={a.id} to={`/article/${a.id}`} className="news-flash__item">
                                            <span style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 900,
                                                color: i < 3 ? '#e53935' : 'var(--gray-400)',
                                                minWidth: '20px',
                                                flexShrink: 0,
                                            }}>{i + 1}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="news-flash__text">{a.title}</div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                                                    👁️ {a.recentViews || a.views} views · {a.category}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="news-flash">
                                <div className="news-flash__header">
                                    ताज़ा अपडेट
                                </div>
                                <div className="news-flash__list">
                                    {newsFlash.map(a => (
                                        <Link key={a.id} to={`/article/${a.id}`} className="news-flash__item">
                                            <span className="news-flash__time">{timeAgo(a.date)}</span>
                                            <span className="news-flash__text">{a.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Weather Strip */}
            <div style={{ background: 'var(--navy)', padding: '16px 0', marginBottom: '8px' }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        <div style={{ color: 'var(--teal)', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            🌡️ मौसम
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                            {weatherData.map(w => (
                                <div key={w.city} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', textAlign: 'center', color: 'white', minWidth: '90px' }}>
                                    <div style={{ fontSize: '1.1rem' }}>{w.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--teal)' }}>{w.temp}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{w.city}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest News Grid */}
            <div className="container section-gap">
                <SectionHeader title="ताजा समाचार" linkTo="/category/राजस्थान" />
                <div className="news-grid news-grid-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <NewsCardSkeleton key={i} />)
                    ) : latest.map(a => <NewsCard key={a.id} article={a} />)}
                </div>
                {!isLoading && hasMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            style={{
                                background: loadingMore ? 'var(--gray-400)' : 'var(--navy)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '12px 32px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: loadingMore ? 'wait' : 'pointer',
                                boxShadow: '0 4px 16px rgba(10,22,40,0.18)',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={e => {
                                if (!loadingMore) {
                                    e.currentTarget.style.background = 'var(--teal)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!loadingMore) {
                                    e.currentTarget.style.background = 'var(--navy)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {loadingMore ? '⏳ लोड हो रहा है...' : 'और खबरें देखें ↓'}
                        </button>
                    </div>
                )}
            </div>

            {/* Live TV Banner */}
            {settings.liveUrl && (
                <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '40px 0', margin: '8px 0' }}>
                    <div className="container">
                        <style>{`@media(min-width:768px){.live-banner-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
                        <div className="live-banner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'center' }}>
                            <div style={{ color: 'white' }}>
                                <span className="live-badge" style={{ marginBottom: '12px' }}>
                                    <span className="live-dot" />LIVE ON AIR
                                </span>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '12px 0 8px', lineHeight: 1.2 }}>
                                    JG NEWS Plus<br />
                                    <span style={{ color: 'var(--teal)' }}>LIVE देखें</span>
                                </h2>
                                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '20px' }}>
                                    24x7 राजस्थान की सबसे तेज़ और सच्ची खबरें। निडर, निष्पक्ष और निर्भीक।
                                </p>
                                <Link to="/live" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    ▶ अभी देखें
                                </Link>
                            </div>
                            <div className="video-embed">
                                <iframe
                                    src={settings.liveUrl}
                                    title="JG News Plus Live"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Sections */}
            {isLoading ? (
                <>
                    <CategorySectionSkeleton title="श्रेणियाँ लोड हो रही हैं..." />
                    <CategorySectionSkeleton />
                </>
            ) : (
                byCategory.map(({ cat, articles: catArticles }) => (
                    <div key={cat} className="container section-gap">
                        <SectionHeader title={cat} linkTo={`/category/${cat}`} />
                        <div className="news-grid news-grid-3">
                            {catArticles.map(a => <NewsCard key={a.id} article={a} />)}
                        </div>
                    </div>
                ))
            )}

            {/* Video News Section */}
            <div style={{ background: 'var(--gray-100)', padding: '40px 0' }}>
                <div className="container">
                    <SectionHeader title="वीडियो न्यूज़" linkTo="/videos" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {articles.filter(a => a.videoUrl).slice(0, 3).map(a => (
                            <Link key={a.id} to={`/article/${a.id}`} style={{ textDecoration: 'none' }} className="news-card">
                                <div style={{ position: 'relative', paddingTop: '56.25%', background: 'var(--navy)', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                                    <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&auto=format'} alt={a.title} loading="lazy"
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>▶</span>
                                        </div>
                                    </div>
                                    <span className="live-badge" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                                        <span style={{ fontSize: '0.7rem' }}>🎥</span> VIDEO
                                    </span>
                                </div>
                                <div className="news-card__body">
                                    <div className="news-card__category">{a.category}</div>
                                    <div className="news-card__title">{a.title}</div>
                                    <div className="news-card__meta">
                                        <span>📍 {a.location}</span>
                                        <span>•</span>
                                        <span>{timeAgo(a.date)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {articles.filter(a => a.videoUrl).length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎬</div>
                            <h3>अभी कोई वीडियो उपलब्ध नहीं है</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* E-Newspaper Banner */}
            <div style={{ background: 'linear-gradient(135deg, #120820 0%, var(--navy) 60%, #0d2137 100%)', padding: '48px 0', margin: '8px 0' }}>
                <div className="container">
                    <style>{`@media(min-width:768px){.epaper-banner-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
                    <div className="epaper-banner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'center' }}>
                        <div style={{ color: 'white' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--saffron)', color: 'white', padding: '5px 14px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.5px' }}>
                                📰 E-NEWSPAPER
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>
                                JG News Plus<br />
                                <span style={{ color: 'var(--teal)' }}>ई-अखबार पढ़ें</span>
                            </h2>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.7 }}>
                                राजस्थान का सबसे भरोसेमंद डिजिटल समाचार पत्र।<br />
                                घर बैठे पढ़ें, मुफ्त में डाउनलोड करें।
                            </p>
                            <Link to="/epaper" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                📖 अभी पढ़ें
                            </Link>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { icon: '📰', label: 'दैनिक संस्करण', desc: 'हर दिन ताज़ा अखबार' },
                                { icon: '📥', label: 'Free Download', desc: 'PDF डाउनलोड करें' },
                                { icon: '🔍', label: 'Easy Reading', desc: 'Zoom करके पढ़ें' },
                            ].map(f => (
                                <div key={f.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px 20px', minWidth: '110px' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{f.icon}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.82rem' }}>{f.label}</div>
                                    <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '3px' }}>{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
