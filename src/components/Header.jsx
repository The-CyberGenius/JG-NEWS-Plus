'use client';

import React, { useState } from 'react';
import { articleHref } from '../utils/articleHref';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNews } from '../context/NewsContext';
import { useLang } from '../context/LangContext';

export default function Header() {
    const { articles, categories: dbCategories, categoryDetails } = useNews();
    const { lang, toggleLang, t, tCat } = useLang();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const navigate = useRouter();

    // Show only categories that have at least one visible article — uses real counts
    // from backend (not just the 30 articles loaded in context). categoryDetails is
    // already sorted by admin-defined order.
    const nonEmptyCategories = (categoryDetails || [])
        .filter(c => c.articleCount > 0)
        .map(c => c.name);
    // Dynamically insert categories into the center of the navbar. Limit main navbar categories to 6.
    const displayCategories = nonEmptyCategories.slice(0, 6);
    const NAV_LINKS = [
        { label: t.home, path: '/' },
        ...displayCategories.map(c => ({ label: tCat(c), path: `/category/${c}` })),
        { label: t.ePaper, path: '/epaper' },
        { label: t.liveTV, path: '/live' },
    ];

    const breakingArticles = articles
        .slice()
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 10);

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
            <div style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.65)', padding: '6px 0', fontSize: '0.72rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dateStr}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                        <a href="https://www.instagram.com/jgnews.live/?hl=en" target="_blank" rel="noreferrer" aria-label="Instagram"
                            style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#E1306C'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61590175844898" target="_blank" rel="noreferrer" aria-label="Facebook"
                            style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#1877F2'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="https://x.com/jgnewslive" target="_blank" rel="noreferrer" aria-label="X (Twitter)"
                            style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="https://www.youtube.com/@MANOJ-1974-JG" target="_blank" rel="noreferrer" aria-label="YouTube"
                            style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#FF0000'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 30px rgba(0,51,160,0.08)', position: 'sticky', top: 0, zIndex: 80, borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px' }}>
                    {/* Logo */}
                    <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                        <img
                            src="/logo.png"
                            alt="JG News Plus"
                            style={{ height: '70px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div className="hide-mobile" style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--navy)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                JG <span style={{ color: 'var(--red)' }}>NEWS</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.motto}</div>
                        </div>
                    </Link>

                    <div style={{ flex: 1 }} />

                    {/* Search bar desktop */}
                    <div className="hide-mobile">
                        <form className="search-bar" onSubmit={handleSearch} style={{ width: '240px', background: 'var(--gray-100)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--gray-200)', transition: 'var(--transition)' }}>
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t.searchPlaceholder} aria-label="Search news" style={{ background: 'transparent' }} />
                            <button type="submit" aria-label="Search" style={{ color: 'var(--navy)' }}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2.5" /><path d="M21 21l-4.35-4.35" strokeWidth="2.5" strokeLinecap="round" /></svg>
                            </button>
                        </form>
                    </div>

                    {/* Language Toggle */}
                    <button
                        onClick={toggleLang}
                        style={{
                            background: 'linear-gradient(135deg, var(--navy), var(--navy-light))', color: 'white', border: 'none',
                            borderRadius: '8px', padding: '8px 16px', fontWeight: 700,
                            fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)',
                            boxShadow: '0 2px 10px rgba(0,51,160,0.2)', flexShrink: 0,
                        }}
                        title={`Switch to ${t.langLabel}`}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                        {t.lang === 'EN' ? '🌐 EN' : '🌐 हि'}
                    </button>

                    {/* Live badge desktop */}
                    <Link href="/live" className="hide-mobile" style={{ textDecoration: 'none' }}>
                        <span className="live-badge" style={{ background: 'var(--red)', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, letterSpacing: '0.5px', boxShadow: '0 2px 10px rgba(213,0,0,0.25)' }}><span className="live-dot" style={{ background: 'white' }}></span>{t.liveTV}</span>
                    </Link>

                    {/* Mobile search toggle */}
                    <button className="hide-desktop" onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'var(--gray-100)', padding: '10px', borderRadius: '50%', color: 'var(--navy)' }} aria-label="Search">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2.5" /><path d="M21 21l-4.35-4.35" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    </button>

                    {/* Hamburger */}
                    <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'var(--navy)', color: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,51,160,0.2)' }} aria-label="Open menu">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>

                {/* Mobile search bar */}
                {searchOpen && (
                    <div className="container" style={{ paddingBottom: '14px' }}>
                        <form className="search-bar" onSubmit={handleSearch} style={{ background: 'var(--gray-100)', borderRadius: '24px', border: '1px solid var(--gray-200)' }}>
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t.searchPlaceholder} autoFocus style={{ background: 'transparent' }} />
                            <button type="submit" style={{ color: 'var(--navy)' }}><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2.5" /><path d="M21 21l-4.35-4.35" strokeWidth="2.5" strokeLinecap="round" /></svg></button>
                        </form>
                    </div>
                )}

                {/* Desktop Nav */}
                <style>{`
                    .desktop-nav-bar { display: none; background: linear-gradient(to right, var(--navy), var(--navy-mid)); }
                    @media (min-width: 768px) { .desktop-nav-bar { display: block; } }
                `}</style>
                <nav className="desktop-nav-bar">
                    <div className="container" style={{ display: 'flex' }}>
                        {NAV_LINKS.map(link => (
                            <Link key={link.path} href={link.path} style={{ padding: '12px 18px', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 600, transition: 'var(--transition)', borderBottom: '3px solid transparent', display: 'block' }}
                                onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.borderBottomColor = 'var(--saffron)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.9)'; e.target.style.borderBottomColor = 'transparent'; e.target.style.background = 'transparent'; }}
                            >{link.label}</Link>
                        ))}
                    </div>
                </nav>

                {/* Mobile Nav Drawer */}
                {menuOpen && (
                    <nav style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 100, boxShadow: '0 10px 30px rgba(0,51,160,0.15)', borderBottom: '1px solid var(--gray-200)' }}>
                        {NAV_LINKS.map(link => (
                            <Link key={link.path} href={link.path} onClick={() => setMenuOpen(false)}
                                style={{ display: 'block', padding: '16px 24px', color: 'var(--navy)', fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--gray-100)' }}>
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
                        {t.breaking}
                    </div>
                    <div className="ticker-content">
                        <div className="ticker-inner" style={{ '--ticker-speed': `${Math.max(24, breakingArticles.length * 3.6)}s` }}>
                            {[...breakingArticles, ...breakingArticles].map((a, i) => (
                                <Link key={`${a.id}-${i}`} href={articleHref(a)} className="ticker-item">
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
