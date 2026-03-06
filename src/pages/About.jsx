import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="container section-gap" style={{ maxWidth: '860px', margin: '0 auto' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center', marginBottom: '40px', color: 'white' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                    JG <span style={{ color: 'var(--teal)' }}>NEWS</span> <span style={{ color: 'var(--saffron)' }}>Plus</span>
                </div>
                <div style={{ color: 'var(--teal)', fontWeight: 700, marginBottom: '16px' }}>Rajasthan | 24x7 NEWS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--saffron)', letterSpacing: '2px' }}>
                    निडर • निष्पक्ष • निर्भीक
                </div>
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '20px' }}>हमारे बारे में</h1>

            <div style={{ fontSize: '0.95rem', lineHeight: 1.85, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p>JG News Plus Rajasthan, राजस्थान का एक विश्वसनीय और निष्पक्ष 24x7 समाचार चैनल है। हम राजस्थान की जनता को सटीक, ताज़ी और निर्भीक खबरें प्रदान करने के लिए प्रतिबद्ध हैं।</p>
                <p>हमारी टीम में अनुभवी पत्रकार, रिपोर्टर और तकनीकी विशेषज्ञ शामिल हैं जो दिन-रात राजस्थान के हर कोने से खबरें लाते हैं।</p>
                <p>हम राजनीति, खेल, मनोरंजन, अपराध, व्यापार, शिक्षा, धर्म और ग्रामीण विकास सहित जीवन के हर क्षेत्र को कवर करते हैं।</p>
            </div>

            {/* Values */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', margin: '40px 0' }}>
                {[
                    { icon: '⚡', title: 'निडर', desc: 'हम बिना किसी दबाव के सच बोलते हैं' },
                    { icon: '⚖️', title: 'निष्पक्ष', desc: 'हर खबर को निष्पक्षता से पेश करते हैं' },
                    { icon: '🦁', title: 'निर्भीक', desc: 'सत्य की राह में कोई समझौता नहीं' },
                    { icon: '🕐', title: '24x7', desc: 'चौबीसों घंटे, सातों दिन ताज़ी खबरें' },
                ].map(v => (
                    <div key={v.title} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{v.icon}</div>
                        <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.1rem', marginBottom: '6px' }}>{v.title}</div>
                        <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{v.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                <Link to="/contact" className="btn btn-primary">📞 संपर्क करें</Link>
            </div>
        </div>
    );
}
