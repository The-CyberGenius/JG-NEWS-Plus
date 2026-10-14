import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useLang } from '../context/LangContext';
import { articleHref } from '../utils/articleHref';
import { timeAgo } from '../utils/helpers';
import { SEO } from '../utils/seo';
import { getLatestYouTubeVideos } from '../store/newsStore';

const FALLBACK_YOUTUBE_VIDEOS = [
    {
        id: 'IfQMSsKxaBU',
        title: 'JG NEWS | रतनगढ़ की आज की बड़ी खबरें | 14 अक्टूबर बुलेटिन | सम्पादक मनोज पारीक',
        link: 'https://www.youtube.com/watch?v=IfQMSsKxaBU',
        embedUrl: 'https://www.youtube.com/embed/IfQMSsKxaBU',
        thumbnail: 'https://i.ytimg.com/vi/IfQMSsKxaBU/hqdefault.jpg',
        published: '2026-10-13T17:14:12.000Z'
    },
    {
        id: 'jpcK4aX7Sl0',
        title: 'JG NEWS | रतनगढ़ की आज की बड़ी खबरें | 13 अक्टूबर बुलेटिन | सम्पादक मनोज पारीक',
        link: 'https://www.youtube.com/watch?v=jpcK4aX7Sl0',
        embedUrl: 'https://www.youtube.com/embed/jpcK4aX7Sl0',
        thumbnail: 'https://i.ytimg.com/vi/jpcK4aX7Sl0/hqdefault.jpg',
        published: '2026-10-12T22:30:09.000Z'
    },
    {
        id: 'nrk3hwlZ9eo',
        title: 'सांगासर साधु हत्याकांड का खुलासा और NH-11 पर दर्दनाक हादसा | 12 Oct | JG NEWS पत्रकार मनोज पारीक',
        link: 'https://www.youtube.com/watch?v=nrk3hwlZ9eo',
        embedUrl: 'https://www.youtube.com/embed/nrk3hwlZ9eo',
        thumbnail: 'https://i.ytimg.com/vi/nrk3hwlZ9eo/hqdefault.jpg',
        published: '2026-10-11T19:30:34.000Z'
    },
    {
        id: 'uP1ui9YI7g4',
        title: 'रतनगढ़ मुख्य समाचार: लोक अदालत फैसला, रामलीला शुभारंभ और दुर्गा महोत्सव | 11 Oct | JG NEWS',
        link: 'https://www.youtube.com/watch?v=uP1ui9YI7g4',
        embedUrl: 'https://www.youtube.com/embed/uP1ui9YI7g4',
        thumbnail: 'https://i.ytimg.com/vi/uP1ui9YI7g4/hqdefault.jpg',
        published: '2026-10-11T02:24:09.000Z'
    },
    {
        id: '6CqsVkm5GRM',
        title: 'रतनगढ़ सांगासर साधु हत्या मामला, समाधि से निकाला शव! | JG News 10 Oct 2026 | Manoj Pareek',
        link: 'https://www.youtube.com/watch?v=6CqsVkm5GRM',
        embedUrl: 'https://www.youtube.com/embed/6CqsVkm5GRM',
        thumbnail: 'https://i.ytimg.com/vi/6CqsVkm5GRM/hqdefault.jpg',
        published: '2026-10-09T20:30:15.000Z'
    }
];

export default function LiveTV() {
    const { settings, articles } = useNews();
    const { t } = useLang();
    const [copied, setCopied] = useState(false);
    const [ytVideos, setYtVideos] = useState(FALLBACK_YOUTUBE_VIDEOS);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const playerContainerRef = useRef(null);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://jgnews.live/live';
    const ytChannel = 'https://www.youtube.com/@MANOJ-1974-JG';

    // Fetch fresh 5 videos from YouTube channel via backend API
    useEffect(() => {
        getLatestYouTubeVideos(5).then(vids => {
            if (Array.isArray(vids) && vids.length > 0) {
                setYtVideos(vids);
            }
        }).catch(() => {});
    }, []);

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
    const liveStreamEmbedUrl = (() => {
        if (!settings?.liveUrl) return '';
        let url = settings.liveUrl;
        if (url.includes('youtube.com/embed/')) {
            const hasQuery = url.includes('?');
            const sep = hasQuery ? '&' : '?';
            return `${url}${sep}autoplay=1&mute=0&rel=0&modestbranding=1`;
        }
        return url;
    })();

    // Active player URL: selected video from strip, or live stream default
    const activeEmbedUrl = selectedVideo
        ? `https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&mute=0&rel=0&modestbranding=1`
        : liveStreamEmbedUrl;

    const handleSelectVideo = (video) => {
        setSelectedVideo(video);
        if (playerContainerRef.current) {
            playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Show 10 news posts as requested by the user
    const recentArticles = (articles || []).slice(0, 10);

    return (
        <div className="container section-gap" style={{ paddingTop: '16px' }}>
            <SEO
                title="JG News Live TV"
                description="JG News 24x7 ताज़ा लाइव प्रसारण व ताज़ा वीडियो बुलेटिन - निडर • निष्पक्ष • निर्भीक"
                url="/live"
            />

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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

                {/* Now Playing Alert (if user selected a video from the strip) */}
                {selectedVideo && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        marginBottom: '12px',
                        fontSize: '0.86rem',
                        gap: '10px',
                        flexWrap: 'wrap',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 800, flex: 1, minWidth: '220px' }}>
                            <span style={{ fontSize: '1.1rem' }}>▶</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                चयनित वीडियो: <strong>{selectedVideo.title}</strong>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedVideo(null)}
                            style={{
                                background: '#EF4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(239,68,68,0.25)'
                            }}
                        >
                            🔴 लाइव टीवी प्रसारण देखें
                        </button>
                    </div>
                )}

                {/* YouTube Player Window */}
                <div
                    ref={playerContainerRef}
                    className="video-embed"
                    style={{
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        boxShadow: '0 6px 24px rgba(10, 22, 40, 0.16)',
                        border: '1px solid rgba(10, 22, 40, 0.08)'
                    }}
                >
                    {activeEmbedUrl ? (
                        <iframe
                            src={activeEmbedUrl}
                            title={selectedVideo ? selectedVideo.title : "JG News Live TV"}
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

                {/* Action Bar Below Player */}
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

                {/* ─── 1. Last 5 YouTube Videos Strip Below Player ─────────── */}
                <div style={{ marginTop: '28px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                background: '#FF0000',
                                color: 'white',
                                fontSize: '0.72rem',
                                fontWeight: 900,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                YOUTUBE
                            </span>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
                                ताज़ा वीडियो बुलेटिन (Top 5)
                            </h2>
                        </div>
                        <a
                            href={ytChannel}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: 'var(--teal)',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            चैनल के सभी वीडियो देखें →
                        </a>
                    </div>

                    {/* Horizontal Responsive Strip */}
                    <div className="yt-videos-strip">
                        {ytVideos.slice(0, 5).map((vid, idx) => {
                            const isPlaying = selectedVideo?.id === vid.id;
                            return (
                                <div
                                    key={vid.id || idx}
                                    className={`yt-strip-card ${isPlaying ? 'is-playing' : ''}`}
                                    onClick={() => handleSelectVideo(vid)}
                                    title="क्लिक करके ऊपर प्लेयर में देखें"
                                >
                                    <div className="yt-strip-thumb-box">
                                        <img
                                            src={vid.thumbnail}
                                            alt={vid.title}
                                            loading="lazy"
                                            className="yt-strip-img"
                                        />
                                        <div className="yt-strip-overlay">
                                            <div className="yt-strip-play-btn">▶</div>
                                        </div>
                                        {isPlaying && (
                                            <div className="yt-strip-playing-pill">
                                                ● चल रहा है
                                            </div>
                                        )}
                                    </div>
                                    <div className="yt-strip-body">
                                        <div className="yt-strip-title">
                                            {vid.title}
                                        </div>
                                        <div className="yt-strip-footer">
                                            <span>⏱️ {timeAgo(vid.published)}</span>
                                            <a
                                                href={vid.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="yt-strip-ext-link"
                                                title="YouTube पर खोलें"
                                            >
                                                YouTube ↗
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── 2. Last 10 News Posts Below Video Strip ───────────── */}
                {recentArticles.length > 0 && (
                    <div style={{ marginTop: '32px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📰</span>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
                                    ताज़ा बड़ी खबरें (Top 10)
                                </h2>
                            </div>
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

            <style>{`
                .yt-videos-strip {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }
                @media (max-width: 860px) {
                    .yt-videos-strip {
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        -webkit-overflow-scrolling: touch;
                        padding-bottom: 8px;
                        gap: 12px;
                    }
                    .yt-strip-card {
                        min-width: 185px;
                        max-width: 185px;
                        scroll-snap-align: start;
                        flex-shrink: 0;
                    }
                }
                .yt-strip-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--gray-200);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    cursor: pointer;
                    transition: all 0.22s ease;
                    display: flex;
                    flex-direction: column;
                }
                .yt-strip-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 18px rgba(0,0,0,0.1);
                    border-color: #FF0000;
                }
                .yt-strip-card.is-playing {
                    border: 2px solid #FF0000;
                    box-shadow: 0 0 14px rgba(255,0,0,0.25);
                }
                .yt-strip-thumb-box {
                    position: relative;
                    padding-top: 56.25%;
                    background: #111;
                    overflow: hidden;
                }
                .yt-strip-img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.25s ease;
                }
                .yt-strip-card:hover .yt-strip-img {
                    transform: scale(1.06);
                }
                .yt-strip-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.2);
                    transition: background 0.2s ease;
                }
                .yt-strip-card:hover .yt-strip-overlay {
                    background: rgba(0,0,0,0.4);
                }
                .yt-strip-play-btn {
                    width: 34px;
                    height: 34px;
                    background: #FF0000;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    padding-left: 2px;
                    box-shadow: 0 2px 8px rgba(255,0,0,0.5);
                    transition: transform 0.2s ease;
                }
                .yt-strip-card:hover .yt-strip-play-btn {
                    transform: scale(1.15);
                }
                .yt-strip-playing-pill {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    background: #FF0000;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .yt-strip-body {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    flex: 1;
                }
                .yt-strip-title {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: var(--navy);
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    min-height: 2.7em;
                }
                .yt-strip-footer {
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.68rem;
                    color: var(--gray-500);
                    font-weight: 600;
                }
                .yt-strip-ext-link {
                    color: #FF0000;
                    text-decoration: none;
                    font-weight: 700;
                }
                .yt-strip-ext-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
