import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

export default function Footer() {
    const { t, lang } = useLang();

    const FOOTER_CATS = [
        { label: lang === 'hi' ? 'राजस्थान' : 'Rajasthan', path: '/category/राजस्थान' },
        { label: t.politics, path: '/category/राजनीति' },
        { label: t.sports, path: '/category/खेल' },
        { label: t.entertainment, path: '/category/मनोरंजन' },
        { label: t.crime, path: '/category/अपराध' },
        { label: t.business, path: '/category/व्यापार' },
        { label: lang === 'hi' ? 'शिक्षा' : 'Education', path: '/category/शिक्षा' },
        { label: lang === 'hi' ? 'धर्म' : 'Religion', path: '/category/धर्म' },
    ];

    const QUICK_LINKS = [
        { label: lang === 'hi' ? 'ई-अखबार' : 'E-Newspaper', path: '/epaper' },
        { label: lang === 'hi' ? 'लाइव टीवी' : 'Live TV', path: '/live' },
        { label: lang === 'hi' ? 'वीडियो' : 'Videos', path: '/videos' },
        { label: lang === 'hi' ? 'फोटो गैलरी' : 'Photo Gallery', path: '/photos' },
        { label: lang === 'hi' ? 'हमारे बारे में' : 'About Us', path: '/about' },
        { label: lang === 'hi' ? 'संपर्क करें' : 'Contact Us', path: '/contact' },
    ];

    return (
        <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.8)', marginTop: '48px' }}>
            <div className="container" style={{ padding: '48px 16px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                    {/* Brand */}
                    <div>
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
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '16px', fontSize: '1rem' }}>{t.contact}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><span>📍</span><span>{lang === 'hi' ? 'जयपुर, राजस्थान — 302001' : 'Jaipur, Rajasthan — 302001'}</span></div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span>📞</span><span>+91 7240116211</span></div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span>✉️</span><span>news@jgnewsplus.in</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {[
                                {
                                    name: 'Instagram', color: '#E1306C', url: 'https://www.instagram.com/jgnewsrajasthan/',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                },
                                {
                                    name: 'X', color: '#000', url: 'https://x.com/jgnewslive',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                },
                                {
                                    name: 'YouTube', color: '#FF0000', url: 'https://www.youtube.com/@JGNewsPlus',
                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                },
                                {
                                    name: 'Facebook', color: '#1877F2', url: 'https://facebook.com/jgnewsplus',
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
                        <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)' }}>Privacy Policy</Link>
                        <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)' }}>Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
