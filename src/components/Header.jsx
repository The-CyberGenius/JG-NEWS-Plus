import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useLang } from '../context/LangContext';

export default function Header() {
    const { articles } = useNews();
    const { lang, toggleLang, t } = useLang();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const navigate = useNavigate();

    const NAV_LINKS = [
        { label: t.home, path: '/' },
        { label: lang === 'hi' ? 'राजस्थान' : 'Rajasthan', path: '/category/राजस्थान' },
        { label: t.politics, path: '/category/राजनीति' },
        { label: t.sports, path: '/category/खेल' },
        { label: t.entertainment, path: '/category/मनोरंजन' },
        { label: t.crime, path: '/category/अपराध' },
        { label: t.business, path: '/category/व्यापार' },
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
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#4267B2', fontWeight: 700 }}>Facebook</a>
                        <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: '#FF0000', fontWeight: 700 }}>YouTube</a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#1DA1F2', fontWeight: 700 }}>Twitter</a>
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
                <nav className="hide-mobile" style={{ background: 'var(--navy)' }}>
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
