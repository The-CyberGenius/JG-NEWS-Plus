import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useLang } from '../context/LangContext';

export default function Header() {
    const { articles, categories: dbCategories } = useNews();
    const { lang, toggleLang, t } = useLang();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const navigate = useNavigate();

    // Dynamically insert categories into the center of the navbar. Limit main navbar categories to 6.
    const displayCategories = dbCategories.slice(0, 6);
    const NAV_LINKS = [
        { label: t.home, path: '/' },
        ...displayCategories.map(c => ({ label: c, path: `/category/${c}` })),
        { label: lang === 'hi' ? 'ई-अखबार' : 'E-Paper', path: '/epaper' },
        { label: t.liveTV, path: '/live' },
    ];

    const breakingArticles = articles.filter(a => a.isBreaking);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQ.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
            setSearchQ('');
            setSearchOpen(false);
        }
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <>
            {/* Top Bar */}
            <div style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.7)', padding: '6px 0', fontSize: '0.75rem' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span>{dateStr}</span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <a href="https://www.instagram.com/jgnewsrajasthan/" target="_blank" rel="noreferrer" style={{ color: '#E1306C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                            Instagram
                        </a>
                        <a href="https://x.com/jgnewslive" target="_blank" rel="noreferrer" style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            X (Twitter)
                        </a>
                        <a href="https://www.youtube.com/@JGNewsPlus" target="_blank" rel="noreferrer" style={{ color: '#FF0000', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            YouTube
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header style={{ background: 'white', boxShadow: '0 2px 16px rgba(10,22,40,0.12)', position: 'sticky', top: 0, zIndex: 80 }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px' }}>
                    {/* Logo */}
                    <Link to="/" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                            src="/logo.png"
                            alt="JG News Plus"
                            style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div style={{ flex: '0 0 auto' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                                JG <span style={{ color: 'var(--teal)' }}>NEWS</span> <span style={{ color: 'var(--saffron)' }}>Plus</span>
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--gray-600)', fontWeight: 600 }}>{t.motto}</div>
                        </div>
                    </Link>

                    <div style={{ flex: 1 }} />

                    {/* Search bar desktop */}
                    <div className="hide-mobile">
                        <form className="search-bar" onSubmit={handleSearch} style={{ width: '220px' }}>
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t.searchPlaceholder} aria-label="Search news" />
                            <button type="submit" aria-label="Search">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="M21 21l-4.35-4.35" strokeWidth="2" /></svg>
                            </button>
                        </form>
                    </div>

                    {/* Language Toggle */}
                    <button
                        onClick={toggleLang}
                        style={{
                            background: 'var(--navy)', color: 'white', border: 'none',
                            borderRadius: '6px', padding: '6px 12px', fontWeight: 800,
                            fontSize: '0.82rem', cursor: 'pointer', transition: 'var(--transition)',
                            letterSpacing: '0.5px', flexShrink: 0,
                        }}
                        title={`Switch to ${t.langLabel}`}
                    >
                        {t.lang === 'EN' ? '🌐 EN' : '🌐 हि'}
                    </button>

                    {/* Live badge desktop */}
                    <Link to="/live" className="hide-mobile">
                        <span className="live-badge"><span className="live-dot"></span>{t.liveTV}</span>
                    </Link>

                    {/* Mobile search toggle */}
                    <button className="hide-desktop" onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', padding: '6px', color: 'var(--navy)' }} aria-label="Search">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="M21 21l-4.35-4.35" strokeWidth="2" /></svg>
                    </button>

                    {/* Hamburger */}
                    <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'var(--navy)', color: 'white', padding: '8px', borderRadius: '8px' }} aria-label="Open menu">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>

                {/* Mobile search bar */}
                {searchOpen && (
                    <div className="container" style={{ paddingBottom: '10px' }}>
                        <form className="search-bar" onSubmit={handleSearch}>
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t.searchPlaceholder} autoFocus />
                            <button type="submit"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="M21 21l-4.35-4.35" strokeWidth="2" /></svg></button>
                        </form>
                    </div>
                )}

                {/* Desktop Nav */}
                <style>{`
                    .desktop-nav-bar { display: none; background: var(--navy); }
                    @media (min-width: 768px) { .desktop-nav-bar { display: block; } }
                `}</style>
                <nav className="desktop-nav-bar">
                    <div className="container" style={{ display: 'flex' }}>
                        {NAV_LINKS.map(link => (
                            <Link key={link.path} to={link.path} style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition)', borderBottom: '3px solid transparent', display: 'block' }}
                                onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.borderBottomColor = 'var(--teal)'; }}
                                onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.85)'; e.target.style.borderBottomColor = 'transparent'; }}
                            >{link.label}</Link>
                        ))}
                    </div>
                </nav>

                {/* Mobile Nav Drawer */}
                {menuOpen && (
                    <nav style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--navy)', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                        {NAV_LINKS.map(link => (
                            <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                                style={{ display: 'block', padding: '14px 20px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </header>

            {/* Breaking News Ticker */}
            {breakingArticles.length > 0 && (
                <div className="ticker-wrap">
                    <div className="ticker-label">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        {lang === 'hi' ? 'ब्रेकिंग' : 'Breaking'}
                    </div>
                    <div className="ticker-content">
                        <div className="ticker-inner">
                            {[...breakingArticles, ...breakingArticles].map((a, i) => (
                                <Link key={`${a.id}-${i}`} to={`/article/${a.id}`} className="ticker-item">
                                    <span className="ticker-dot">●</span>{a.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
