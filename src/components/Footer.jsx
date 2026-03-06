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
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span>📞</span><span>+91 98000 00000</span></div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span>✉️</span><span>news@jgnewsplus.in</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {[
                                { name: 'FB', color: '#4267B2', url: 'https://facebook.com' },
                                { name: 'YT', color: '#FF0000', url: 'https://youtube.com' },
                                { name: 'TW', color: '#1DA1F2', url: 'https://twitter.com' },
                                { name: 'IG', color: '#E1306C', url: 'https://instagram.com' },
                            ].map(s => (
                                <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                                    style={{ width: '36px', height: '36px', background: s.color, color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                                    {s.name}
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
