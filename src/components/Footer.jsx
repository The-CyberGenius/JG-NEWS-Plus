import React from 'react';
import { Link } from 'react-router-dom';
import { useLang, CATEGORY_EN } from '../context/LangContext';

export default function Footer() {
    const { t, lang, tCat } = useLang();

    const FOOTER_CATS = [
        'राजस्थान', 'राजनीति', 'खेल', 'मनोरंजन', 'अपराध', 'व्यापार', 'शिक्षा', 'धर्म',
    ].map(cat => ({ label: tCat(cat), path: `/category/${cat}` }));

    const QUICK_LINKS = [
        { label: t.ePaper, path: '/epaper' },
        { label: t.liveTV, path: '/live' },
        { label: t.videos, path: '/videos' },
        { label: t.photos, path: '/photos' },
        { label: t.about, path: '/about' },
        { label: '⚙️ Admin Panel', path: '/admin' },
    ];

    const WA_NUMBER = '917240116211';
    const WA_MSG = encodeURIComponent(lang === 'hi'
        ? 'नमस्ते JG News Plus,\nमैं आपसे संपर्क करना चाहता/चाहती हूं।\nनाम:\nविषय:\nसंदेश:'
        : 'Hello JG News Plus,\nI would like to get in touch.\nName:\nSubject:\nMessage:');

    return (
        <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.8)', marginTop: '48px' }}>
            {/* Responsive grid:
                - Mobile: 2 cols → Brand spans full, Cats|Links side-by-side, Contact spans full
                - Desktop (≥1024px): 4 cols, each block its own column */}
            <style>{`
                .jg-footer-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 28px 18px;
                    margin-bottom: 32px;
                }
                .jg-footer-grid > .jg-span-2 { grid-column: 1 / -1; }
                @media (min-width: 1024px) {
                    .jg-footer-grid {
                        grid-template-columns: 2fr 1fr 1fr 1.5fr;
                        gap: 32px;
                    }
                    .jg-footer-grid > .jg-span-2 { grid-column: auto; }
                }
            `}</style>
            <div className="container" style={{ padding: '48px 16px 0' }}>
                <div className="jg-footer-grid">
                    {/* Brand */}
                    <div className="jg-span-2">
                        <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'white', marginBottom: '4px' }}>
                            JG <span style={{ color: 'var(--teal)' }}>NEWS</span> <span style={{ color: 'var(--saffron)' }}>Plus</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--teal)', marginBottom: '12px', fontWeight: 600 }}>
                            {t.tagline}
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '16px' }}>
                            {lang === 'hi'
                                ? 'राजस्थान की सबसे विश्वसनीय 24x7 समाचार सेवा। हम लाते हैं आपके लिए सच्ची, निष्पक्ष और ताज़ी खबरें।'
                                : 'Rajasthan\'s most trusted 24x7 news service. We bring you accurate, unbiased and latest news.'}
                        </p>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--saffron)', letterSpacing: '1px' }}>
                            {t.motto}
                        </div>

                        {/* Subscribe button — opens popup via global event */}
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('jgnews:open-subscribe'))}
                            style={{
                                marginTop: '16px',
                                background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '100px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(0,188,212,0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,188,212,0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,188,212,0.3)';
                            }}
                        >
                            📬 {lang === 'hi' ? 'Newsletter Subscribe करें' : 'Subscribe to Newsletter'}
                        </button>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '16px', fontSize: '1rem' }}>{t.categories}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {FOOTER_CATS.map(cat => (
                                <Link key={cat.path} to={cat.path}
                                    style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', transition: 'var(--transition)' }}
                                    onMouseEnter={e => e.target.style.color = 'var(--teal)'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                                >› {cat.label}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '16px', fontSize: '1rem' }}>{t.quickLinks}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {QUICK_LINKS.map(l => (
                                <Link key={l.path} to={l.path}
                                    style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', transition: 'var(--transition)' }}
                                    onMouseEnter={e => e.target.style.color = 'var(--teal)'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                                >› {l.label}</Link>
                            ))}
                        </div>

                        {/* Contact Us CTA */}
                        <Link
                            to="/contact"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                marginTop: '18px',
                                background: 'linear-gradient(135deg, var(--saffron), #e65c00)',
                                color: 'white',
                                padding: '10px 18px',
                                borderRadius: '100px',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 14px rgba(255,140,0,0.35)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,140,0,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,140,0,0.35)'; }}
                        >
                            📞 {t.contactUs}
                        </Link>
                    </div>

                    {/* Contact */}
                    <div className="jg-span-2">
                        <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '16px', fontSize: '1rem' }}>{t.contact}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><span>📍</span><span>{lang === 'hi' ? 'जयपुर, राजस्थान — 302001' : 'Jaipur, Rajasthan — 302001'}</span></div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span>📞</span><span>+91 7240116211</span></div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span>✉️</span><span>manoj@jgnews.live</span></div>
                        </div>
                        {/* WhatsApp CTA */}
                        <a
                            href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '16px',
                                background: '#25D366',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '100px',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,211,102,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.35)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            {lang === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Chat on WhatsApp'}
                        </a>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {[
                                {
                                    name: 'Instagram', color: '#E1306C', url: 'https://www.instagram.com/jgnews.live/?hl=en',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                },
                                {
                                    name: 'X', color: '#000', url: 'https://x.com/jgnewslive',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                },
                                {
                                    name: 'YouTube', color: '#FF0000', url: 'https://www.youtube.com/@MANOJ-1974-JG',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                },
                                {
                                    name: 'Facebook', color: '#1877F2', url: 'https://www.facebook.com/profile.php?id=61590175844898',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                },
                            ].map(s => (
                                <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                                    title={s.name}
                                    style={{
                                        width: '40px', height: '40px', background: s.color, color: 'white',
                                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', transition: '0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'; }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span>© {new Date().getFullYear()} JG News Plus Rajasthan. {lang === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link to="/privacy"
                            style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--teal)'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                        >{lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</Link>
                        <Link to="/terms"
                            style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--teal)'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                        >{lang === 'hi' ? 'नियम और शर्तें' : 'Terms'}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
