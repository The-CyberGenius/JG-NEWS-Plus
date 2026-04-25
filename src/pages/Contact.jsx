import React, { useState } from 'react';

export default function Contact() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to send message');
            }
            
            setSent(true);
            setTimeout(() => setSent(false), 4000);
            setForm({ name: '', phone: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section-gap">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px' }}>📞 संपर्क करें</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '32px' }}>आपकी खबर, सुझाव या शिकायत हमें भेजें</p>

            <div style={{ display: 'grid', gap: '40px', gridTemplateColumns: '1fr' }}>
                <style>{`@media(min-width:768px){.contact-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
                <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                    {/* Form */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--card-shadow)' }}>
                        {sent && (
                            <div className="toast toast-success" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '16px' }}>
                                ✅ आपका संदेश भेज दिया गया! हम जल्द संपर्क करेंगे।
                            </div>
                        )}
                        {error && (
                            <div className="toast toast-error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '16px', background: 'var(--red)', color: 'white' }}>
                                ❌ {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '0', gridTemplateColumns: '1fr 1fr' }}>
                                <style>{`@media(max-width:480px){.contact-row{grid-template-columns:1fr !important;}}`}</style>
                                <div className="contact-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                                    <div className="form-group">
                                        <label className="form-label">नाम *</label>
                                        <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="आपका नाम" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">फ़ोन</label>
                                        <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">ईमेल</label>
                                <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">विषय *</label>
                                <input className="form-control" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="संदेश का विषय" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">संदेश *</label>
                                <textarea className="form-control" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="अपना संदेश लिखें..." />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
                                {loading ? '⏳ भेज रहे हैं...' : '📤 भेजें'}
                            </button>
                        </form>
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { icon: '📍', label: 'पता', value: 'जयपुर, राजस्थान — 302001' },
                            { icon: '📞', label: 'फ़ोन', value: '+91 98000 00000' },
                            { icon: '✉️', label: 'ईमेल', value: 'news@jgnewsplus.in' },
                            { icon: '🕐', label: 'कार्यालय समय', value: '24x7 उपलब्ध' },
                        ].map(item => (
                            <div key={item.label} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(0,188,212,0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.85rem' }}>{item.label}</div>
                                    <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>{item.value}</div>
                                </div>
                            </div>
                        ))}

                        {/* Social Links */}
                        <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-md)', padding: '20px', color: 'white' }}>
                            <div style={{ fontWeight: 800, marginBottom: '14px' }}>सोशल मीडिया पर जुड़ें</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {[
                                    { name: '😊 Facebook', color: '#4267B2', url: 'https://facebook.com' },
                                    { name: '▶ YouTube', color: '#FF0000', url: 'https://youtube.com' },
                                    { name: '🐦 Twitter', color: '#1DA1F2', url: 'https://twitter.com' },
                                    { name: '📷 Instagram', color: '#E1306C', url: 'https://instagram.com' },
                                ].map(s => (
                                    <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                                        style={{ background: s.color, color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                                        {s.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
