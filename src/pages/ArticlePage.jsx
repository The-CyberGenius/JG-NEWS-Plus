import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useLang } from '../context/LangContext';
import { timeAgo, formatDate } from '../utils/helpers';

export default function ArticlePage() {
    const { id } = useParams();
    const { articles } = useNews();
    const { t } = useLang();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [lightbox, setLightbox] = useState(false);

    const article = articles.find(a => a.id === id);
    const related = articles.filter(a => a.id !== id && a.category === article?.category).slice(0, 4);

    useEffect(() => { window.scrollTo(0, 0); }, [id]);

    // Close lightbox on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setLightbox(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Prevent body scroll when lightbox open
    useEffect(() => {
        document.body.style.overflow = lightbox ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightbox]);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWa = () => window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`);
    const shareFb = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
    const shareTw = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`);

    if (!article) {
        return (
            <div className="container section-gap">
                <div className="empty-state">
                    <div className="empty-state-icon">😔</div>
                    <h3>खबर नहीं मिली</h3>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>होम पर जाएं</Link>
                </div>
            </div>
        );
    }

    const heroImg = article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80';

    return (
        <>
            <article>


                <div className="article-body">
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                        <Link to="/" style={{ color: 'var(--teal)' }}>होम</Link>
                        <span>›</span>
                        <Link to={`/category/${article.category}`} style={{ color: 'var(--teal)' }}>{article.category}</Link>
                        <span>›</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{article.title}</span>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {article.isBreaking && <span className="badge badge-red">ब्रेकिंग</span>}
                        <span className="badge badge-teal">{article.category}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 900, color: 'var(--navy)', lineHeight: 1.4, marginBottom: '16px' }}>
                        {article.title}
                    </h1>

                    {/* Meta */}
                    <div className="article-meta">
                        <div className="article-meta-item"><span>✍️</span> {article.author}</div>
                        <div className="article-meta-item"><span>📅</span> {formatDate(article.date)}</div>
                        <div className="article-meta-item"><span>⏱️</span> {timeAgo(article.date)}</div>
                        <div className="article-meta-item"><span>📍</span> {article.location}</div>
                    </div>

                    {/* Excerpt */}
                    {article.excerpt && (
                        <div style={{ background: 'linear-gradient(135deg, rgba(0,188,212,0.08), rgba(10,22,40,0.04))', borderLeft: '4px solid var(--teal)', padding: '14px 18px', borderRadius: '0 12px 12px 0', marginBottom: '24px', fontSize: '1rem', fontWeight: 500, color: 'var(--navy)', lineHeight: 1.7 }}>
                            {article.excerpt}
                        </div>
                    )}

                    {/* Inline Image (small framed) — also clickable */}
                    <div
                        onClick={() => setLightbox(true)}
                        style={{
                            cursor: 'zoom-in',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            marginBottom: '24px',
                            boxShadow: '0 4px 24px rgba(10,22,40,0.18)',
                            border: '3px solid rgba(0,188,212,0.20)',
                            position: 'relative',
                            maxHeight: '420px',
                            background: 'var(--navy)',
                        }}
                        title="क्लिक करके बड़ा देखें"
                    >
                        <img
                            src={heroImg}
                            alt={article.title}
                            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                        {/* Caption bar */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(transparent, rgba(10,22,40,0.85))',
                            padding: '24px 16px 12px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                        }}>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
                                📍 {article.location}
                            </span>
                            <span style={{ color: 'var(--teal)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" /></svg>
                                Zoom
                            </span>
                        </div>
                    </div>

                    {/* Video Embed */}
                    {article.videoUrl && (
                        <div>
                            <h3 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🎬</span> वीडियो रिपोर्ट
                            </h3>
                            <div className="video-embed">
                                <iframe
                                    src={article.videoUrl}
                                    title="Video Report"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        style={{ marginBottom: '24px' }}
                    />

                    {/* Tags */}
                    {article.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '0.85rem' }}>टैग:</span>
                            {article.tags.map(tag => (
                                <span key={tag} style={{ background: 'var(--gray-100)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 600 }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Share */}
                    <div className="share-row">
                        <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.85rem', alignSelf: 'center' }}>📤 शेयर करें:</span>
                        <button onClick={shareWa} className="share-btn share-wa">📱 WhatsApp</button>
                        <button onClick={shareFb} className="share-btn share-fb">Facebook</button>
                        <button onClick={shareTw} className="share-btn share-tw">Twitter</button>
                        <button onClick={handleCopy} className="share-btn share-copy">{copied ? '✅ Copied!' : '🔗 Copy Link'}</button>
                    </div>

                    {/* Back button */}
                    <div style={{ marginTop: '24px' }}>
                        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← वापस जाएं</button>
                    </div>
                </div>

                {/* Related News */}
                {related.length > 0 && (
                    <div style={{ background: 'var(--gray-100)', padding: '40px 0', marginTop: '24px' }}>
                        <div className="container">
                            <h2 className="section-title">संबंधित खबरें</h2>
                            <div className="news-grid news-grid-4">
                                {related.map(a => (
                                    <Link key={a.id} to={`/article/${a.id}`} className="news-card" style={{ textDecoration: 'none' }}>
                                        <div className="news-card__img">
                                            <img src={a.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=70'} alt={a.title} loading="lazy" />
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
                        </div>
                    </div>
                )}
            </article>

            {/* ======= LIGHTBOX MODAL ======= */}
            {lightbox && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setLightbox(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9000,
                            background: 'rgba(5, 10, 20, 0.92)',
                            backdropFilter: 'blur(10px)',
                            animation: 'fadeIn 0.2s ease',
                        }}
                    />

                    {/* Frame */}
                    <div
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9001,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '20px',
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                maxWidth: '900px',
                                width: '100%',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
                                pointerEvents: 'all',
                                animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Lightbox Top Bar */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--navy)',
                                gap: '12px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    <span style={{ fontSize: '1rem' }}>🖼️</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {article.title}
                                        </div>
                                        <div style={{ color: 'var(--teal)', fontSize: '0.72rem' }}>
                                            📍 {article.location} &nbsp;•&nbsp; {article.category}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setLightbox(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                        color: 'white', width: '34px', height: '34px',
                                        borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,0.8)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    title="बंद करें (Esc)"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Image */}
                            <div style={{ background: '#0a0f1c', position: 'relative', lineHeight: 0 }}>
                                <img
                                    src={heroImg}
                                    alt={article.title}
                                    style={{
                                        width: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            </div>

                            {/* Caption */}
                            <div style={{
                                padding: '12px 18px',
                                background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: '10px',
                            }}>
                                <div>
                                    <span className="badge badge-teal" style={{ marginRight: '6px', fontSize: '0.7rem' }}>{article.category}</span>
                                    {article.isBreaking && <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>ब्रेकिंग</span>}
                                    <div style={{ color: 'var(--gray-600)', fontSize: '0.78rem', marginTop: '4px' }}>
                                        {formatDate(article.date)} &nbsp;•&nbsp; {article.author}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={shareWa} className="btn btn-sm" style={{ background: '#25D366', color: 'white', fontSize: '0.78rem' }}>📱 Share</button>
                                    <button onClick={() => setLightbox(false)} className="btn btn-sm btn-outline" style={{ fontSize: '0.78rem' }}>बंद करें</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
          `}</style>
                </>
            )}
        </>
    );
}
