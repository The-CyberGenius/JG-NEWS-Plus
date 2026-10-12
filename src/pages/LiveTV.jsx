import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useLang } from '../context/LangContext';
import { articleHref } from '../utils/articleHref';
import { timeAgo } from '../utils/helpers';
import { SEO } from '../utils/seo';

export default function LiveTV() {
    const { settings, articles } = useNews();
    const { t } = useLang();
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://jgnews.live/live';
    const ytChannel = 'https://www.youtube.com/@MANOJ-1974-JG';

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `🔴 JG NEWS Live TV प्रसारण देखें - राजस्थान की 24x7 ताज़ी खबरें: ${shareUrl}`
    )}`;

    // Prepare autoplay & clean embed parameters for YouTube
    const embedUrl = (() => {
        if (!settings?.liveUrl) return '';
        let url = settings.liveUrl;
        if (url.includes('youtube.com/embed/')) {
            const hasQuery = url.includes('?');
            const sep = hasQuery ? '&' : '?';
            return `${url}${sep}autoplay=1&mute=0&rel=0&modestbranding=1`;
        }
        return url;
    })();

    const recentArticles = (articles || []).slice(0, 4);

    return (
        <div className="container section-gap" style={{ paddingTop: '16px' }}>
            <SEO
                title="JG News Live TV"
                description="JG News 24x7 ताज़ा लाइव प्रसारण - निडर • निष्पक्ष • निर्भीक"
                url="/live"
            />

            {/* Compact Container (860px max) so YouTube window fits nicely on screen */}
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                {/* Header Row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="live-badge">
                            <span className="live-dot" /> LIVE ON AIR
                        </span>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
                            JG News Live TV
                        </h1>
                    </div>

                    <a
                        href={ytChannel}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#FF0000',
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(255, 0, 0, 0.25)'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube Subscribe
                    </a>
                </div>

                {/* Compact YouTube Player Window */}
                <div
                    className="video-embed"
                    style={{
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        boxShadow: '0 6px 24px rgba(10, 22, 40, 0.16)',
                        border: '1px solid rgba(10, 22, 40, 0.08)'
                    }}
                >
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title="JG News Live TV"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'var(--navy)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            gap: '8px'
                        }}>
                            <span>📺 प्रसारण जल्द शुरू होगा...</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>24x7 ताज़ी खबरें</span>
                        </div>
                    )}
                </div>

                {/* Compact Action Bar Below Player */}
                <div style={{
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginTop: '12px',
                    boxShadow: 'var(--card-shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src="/logo-nav.png"
                            alt="JG News"
                            style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy)' }}>
                                JG News Rajasthan
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--gray-600)' }}>
                                संपादक / पत्रकार: मनोज पारीक • निडर • निष्पक्ष • निर्भीक
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                            href={whatsappShareUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#25D366',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                            }}
                        >
                            <span>💬</span> WhatsApp
                        </a>

                        <button
                            onClick={handleCopy}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'var(--gray-100)',
                                color: 'var(--navy)',
                                border: '1px solid var(--gray-300)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🔗 {copied ? 'कॉपी हो गया! ✅' : 'शेयर लिंक'}
                        </button>
                    </div>
                </div>

                {/* Compact Latest News Grid */}
                {recentArticles.length > 0 && (
                    <div style={{ marginTop: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
                                📰 ताज़ा बड़ी खबरें
                            </h2>
                            <Link to="/" style={{ color: 'var(--teal)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                                सभी खबरें देखें →
                            </Link>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '14px'
                        }}>
                            {recentArticles.map(a => (
                                <Link
                                    key={a._id || a.id}
                                    to={articleHref(a)}
                                    className="news-card"
                                    style={{ textDecoration: 'none', background: 'white' }}
                                >
                                    <div style={{
                                        position: 'relative',
                                        paddingTop: '56.25%',
                                        background: 'var(--navy)',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            src={a.image || '/logo-nav.png'}
                                            alt={a.title}
                                            loading="lazy"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        {a.category && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                background: 'rgba(10, 22, 40, 0.85)',
                                                color: 'white',
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                padding: '3px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {a.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="news-card__body" style={{ padding: '12px' }}>
                                        <div className="news-card__title" style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
                                            {a.title}
                                        </div>
                                        <div className="news-card__meta" style={{ marginTop: '6px', fontSize: '0.72rem' }}>
                                            {a.district && <span>📍 {a.district}</span>}
                                            {a.district && <span>•</span>}
                                            <span>{timeAgo(a.date)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
