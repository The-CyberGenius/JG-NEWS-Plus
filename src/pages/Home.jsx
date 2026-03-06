import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { formatDate, timeAgo } from '../utils/helpers';

const INITIAL_WEATHER = [
    { city: 'जयपुर', temp: '34°C', icon: '☀️', desc: 'धूप' },
    { city: 'जोधपुर', temp: '36°C', icon: '🌤️', desc: 'आंशिक बादल' },
    { city: 'उदयपुर', temp: '30°C', icon: '⛅', desc: 'बादल' },
    { city: 'कोटा', temp: '33°C', icon: '☀️', desc: 'गर्म' },
    { city: 'बीकानेर', temp: '38°C', icon: '🌵', desc: 'शुष्क' },
    { city: 'अजमेर', temp: '32°C', icon: '⛅', desc: 'हल्के बादल' },
];

function NewsCard({ article, large = false }) {
    return (
        <Link to={`/article/${article.id}`} className="news-card" style={{ textDecoration: 'none' }}>
            <div className="news-card__img">
                <img
                    src={article.image || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80`}
                    alt={article.title}
                    loading="lazy"
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

function FeaturedCard({ article }) {
    if (!article) return null;
    return (
        <Link to={`/article/${article.id}`} className="featured-card" style={{ textDecoration: 'none', display: 'flex' }}>
            <img
                className="featured-card__img"
                src={article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80'}
                alt={article.title}
            />
            <div className="featured-card__overlay" />
            <div className="featured-card__body">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {article.isBreaking && <span className="badge badge-red">ब्रेकिंग</span>}
                    <span className="badge badge-teal">{article.category}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', alignSelf: 'center' }}>📍 {article.location}</span>
                </div>
                <div className="featured-card__title">{article.title}</div>
                <div className="featured-card__excerpt">{article.excerpt}</div>
                <span className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>पूरी खबर पढ़ें →</span>
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
    const { articles, settings } = useNews();
    const [weatherData, setWeatherData] = useState(INITIAL_WEATHER);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Open-Meteo URL for Jaipur, Jodhpur, Udaipur, Kota, Bikaner, Ajmer
                const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=26.9124,26.2389,24.5854,25.2138,28.0229,26.4499&longitude=75.7873,73.0243,73.7125,75.8648,73.3119,74.6399&current_weather=true");
                const data = await res.json();

                const getWeatherIcon = (code) => {
                    if (code === 0) return '☀️';
                    if (code === 1 || code === 2 || code === 3) return '⛅';
                    if (code >= 45 && code <= 48) return '🌫️';
                    if (code >= 51 && code <= 67) return '🌧️';
                    if (code >= 71 && code <= 77) return '❄️';
                    if (code >= 95) return '⛈️';
                    return '🌤️';
                };

                const updatedWeather = data.map((location, i) => ({
                    ...INITIAL_WEATHER[i],
                    temp: `${Math.round(location.current_weather.temperature)}°C`,
                    icon: getWeatherIcon(location.current_weather.weathercode)
                }));

                setWeatherData(updatedWeather);
            } catch (err) {
                console.error("Open-Meteo weather update failed", err);
            }
        };
        fetchWeather();
    }, []);

    const featured = useMemo(() => articles.find(a => a.isFeatured) || articles[0], [articles]);
    const breaking = useMemo(() => articles.filter(a => a.isBreaking).slice(0, 3), [articles]);
    const latest = useMemo(() => articles.slice(0, 8), [articles]);
    const byCategory = useMemo(() => {
        const cats = ['राजनीति', 'खेल', 'मनोरंजन', 'अपराध'];
        return cats.map(cat => ({
            cat,
            articles: articles.filter(a => a.category === cat).slice(0, 3),
        })).filter(c => c.articles.length > 0);
    }, [articles]);

    return (
        <div>
            {/* Hero Section */}
            <div className="container section-gap">
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr' }}>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {/* Featured + Breaking side by side on desktop */}
                        <div style={{
                            display: 'grid', gap: '20px',
                            gridTemplateColumns: breaking.length > 0 ? '1fr' : '1fr',
                        }}>
                            <style>{`
                @media (min-width: 1024px) {
                  .hero-grid { grid-template-columns: 2fr 1fr !important; }
                }
              `}</style>
                            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                <FeaturedCard article={featured} />
                                {breaking.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <h2 className="section-title" style={{ marginBottom: '4px' }}>ताज़ी खबरें</h2>
                                        {breaking.map(a => (
                                            <Link key={a.id} to={`/article/${a.id}`} style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    background: 'white', borderRadius: '12px', padding: '14px',
                                                    boxShadow: 'var(--card-shadow)', display: 'flex', gap: '12px',
                                                    transition: 'var(--transition)', alignItems: 'flex-start',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--card-shadow)'}
                                                >
                                                    <img
                                                        src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=70'}
                                                        alt={a.title}
                                                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <span className="badge badge-red" style={{ marginBottom: '6px' }}>ब्रेकिंग</span>
                                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.4, color: 'var(--text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                            {a.title}
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '4px' }}>
                                                            📍 {a.location} • {timeAgo(a.date)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Strip */}
            <div style={{ background: 'var(--navy)', padding: '16px 0', marginBottom: '8px' }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        <div style={{ color: 'var(--teal)', fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            🌡️ मौसम
                        </div>
                        <div className="weather-grid" style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
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
                    {latest.map(a => <NewsCard key={a.id} article={a} />)}
                </div>
            </div>

            {/* Live TV Banner */}
            {settings.liveUrl && (
                <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', padding: '40px 0', margin: '8px 0' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gap: '24px', alignItems: 'center' }}>
                            <style>{`@media(min-width:768px){.live-banner-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
                            <div className="live-banner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'center' }}>
                                <div style={{ color: 'white' }}>
                                    <span className="live-badge" style={{ marginBottom: '12px' }}>
                                        <span className="live-dot" />
                                        LIVE ON AIR
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
                </div>
            )}

            {/* Category Sections */}
            {byCategory.map(({ cat, articles: catArticles }) => (
                <div key={cat} className="container section-gap">
                    <SectionHeader title={cat} linkTo={`/category/${cat}`} />
                    <div className="news-grid news-grid-3">
                        {catArticles.map(a => <NewsCard key={a.id} article={a} />)}
                    </div>
                </div>
            ))}

            {/* Video News Section */}
            <div style={{ background: 'var(--gray-100)', padding: '40px 0' }}>
                <div className="container">
                    <SectionHeader title="वीडियो न्यूज़" linkTo="/videos" />
                    <div className="news-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {articles.filter(a => a.videoUrl).slice(0, 3).map(a => (
                            <Link key={a.id} to={`/article/${a.id}`} style={{ textDecoration: 'none' }} className="news-card">
                                <div style={{ position: 'relative', paddingTop: '56.25%', background: 'var(--navy)', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                                    <img
                                        src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'}
                                        alt={a.title}
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                    />
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
        </div>
    );
}
