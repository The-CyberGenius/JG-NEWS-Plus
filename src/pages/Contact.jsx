import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../store/newsStore';
import { useLang } from '../context/LangContext';

const WA_NUMBER = '917240116211';

function buildWAMsg(form, lang) {
    if (lang === 'hi') {
        return encodeURIComponent(
            `नमस्ते JG News Plus 🙏\n\nनाम: ${form.name || '—'}\nफ़ोन: ${form.phone || '—'}\nईमेल: ${form.email || '—'}\nविषय: ${form.subject || '—'}\n\nसंदेश:\n${form.message || '—'}`
        );
    }
    return encodeURIComponent(
        `Hello JG News Plus 👋\n\nName: ${form.name || '—'}\nPhone: ${form.phone || '—'}\nEmail: ${form.email || '—'}\nSubject: ${form.subject || '—'}\n\nMessage:\n${form.message || '—'}`
    );
}

export default function Contact() {
    const { lang } = useLang();
    const isHi = lang === 'hi';
    const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validate = () => {
        if (!form.name.trim()) return isHi ? 'नाम आवश्यक है।' : 'Name is required.';
        if (!form.subject.trim()) return isHi ? 'विषय आवश्यक है।' : 'Subject is required.';
        if (!form.message.trim()) return isHi ? 'संदेश आवश्यक है।' : 'Message is required.';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return isHi ? 'ईमेल पता अमान्य है।' : 'Invalid email address.';
        if (form.phone && !/^[+\d\s\-()]{7,15}$/.test(form.phone))
            return isHi ? 'फ़ोन नंबर अमान्य है।' : 'Invalid phone number.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }
        setLoading(true);
        setError('');
        try {
            await api.post('/messages', form);
            setSent(true);
            setTimeout(() => setSent(false), 5000);
            setForm({ name: '', phone: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(isHi ? 'संदेश नहीं भेजा जा सका। दोबारा कोशिश करें।' : 'Message could not be sent. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>{isHi ? 'संपर्क करें | JG News Plus' : 'Contact Us | JG News Plus'}</title>
            </Helmet>
            <div className="container section-gap">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '4px' }}>
                    📞 {isHi ? 'संपर्क करें' : 'Contact Us'}
                </h1>
                <p style={{ color: 'var(--gray-600)', marginBottom: '32px' }}>
                    {isHi ? 'आपकी खबर, सुझाव या शिकायत हमें भेजें' : 'Send us your news tip, suggestion, or complaint'}
                </p>

                {/* WhatsApp CTA Banner */}
                <a
                    href={`https://wa.me/${WA_NUMBER}?text=${buildWAMsg(form, lang)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 24px',
                        marginBottom: '28px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,211,102,0.3)'; }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                            {isHi ? 'WhatsApp पर तुरंत संपर्क करें' : 'Contact us instantly on WhatsApp'}
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>+91 72401 16211 — {isHi ? 'अभी चैट करें' : 'Chat now'}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '1.4rem' }}>→</div>
                </a>

                <style>{`@media(min-width:768px){.contact-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
                <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                    {/* Form */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--card-shadow)' }}>
                        <h2 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', fontSize: '1.1rem' }}>
                            ✉️ {isHi ? 'संदेश भेजें' : 'Send Message'}
                        </h2>
                        {sent && (
                            <div className="toast toast-success" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '16px' }}>
                                ✅ {isHi ? 'आपका संदेश भेज दिया गया! हम जल्द संपर्क करेंगे।' : 'Message sent! We\'ll contact you soon.'}
                            </div>
                        )}
                        {error && (
                            <div className="toast toast-error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '16px', background: 'var(--red)', color: 'white' }}>
                                ❌ {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <style>{`@media(max-width:480px){.contact-row{grid-template-columns:1fr !important;}}`}</style>
                            <div className="contact-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">{isHi ? 'नाम *' : 'Name *'}</label>
                                    <input className="form-control" required value={form.name}
                                        onChange={e => { setForm({ ...form, name: e.target.value }); setError(''); }}
                                        placeholder={isHi ? 'आपका नाम' : 'Your name'} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{isHi ? 'फ़ोन' : 'Phone'}</label>
                                    <input className="form-control" value={form.phone}
                                        onChange={e => { setForm({ ...form, phone: e.target.value }); setError(''); }}
                                        placeholder="+91 XXXXX XXXXX" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{isHi ? 'ईमेल' : 'Email'}</label>
                                <input className="form-control" type="email" value={form.email}
                                    onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }}
                                    placeholder="email@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{isHi ? 'विषय *' : 'Subject *'}</label>
                                <input className="form-control" required value={form.subject}
                                    onChange={e => { setForm({ ...form, subject: e.target.value }); setError(''); }}
                                    placeholder={isHi ? 'संदेश का विषय' : 'Message subject'} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{isHi ? 'संदेश *' : 'Message *'}</label>
                                <textarea className="form-control" required rows={4} value={form.message}
                                    onChange={e => { setForm({ ...form, message: e.target.value }); setError(''); }}
                                    placeholder={isHi ? 'अपना संदेश लिखें...' : 'Write your message...'} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }} disabled={loading}>
                                    {loading ? (isHi ? '⏳ भेज रहे हैं...' : '⏳ Sending...') : (isHi ? '📤 भेजें' : '📤 Send')}
                                </button>
                                <a
                                    href={`https://wa.me/${WA_NUMBER}?text=${buildWAMsg(form, lang)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: '#25D366',
                                        color: 'white',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        minWidth: '120px',
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    WhatsApp
                                </a>
                            </div>
                        </form>
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: '📍', label: isHi ? 'पता' : 'Address', value: isHi ? 'जयपुर, राजस्थान — 302001' : 'Jaipur, Rajasthan — 302001' },
                            { icon: '📞', label: isHi ? 'फ़ोन' : 'Phone', value: '+91 72401 16211', href: 'tel:+917240116211' },
                            { icon: '✉️', label: isHi ? 'ईमेल' : 'Email', value: 'manoj@jgnews.live', href: 'mailto:manoj@jgnews.live' },
                            { icon: '🕐', label: isHi ? 'कार्यालय समय' : 'Office Hours', value: isHi ? '24x7 उपलब्ध' : '24x7 Available' },
                        ].map(item => (
                            <div key={item.label} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '18px', boxShadow: 'var(--card-shadow)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', background: 'rgba(0,188,212,0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                    {item.href
                                        ? <a href={item.href} style={{ color: 'var(--teal)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none' }}>{item.value}</a>
                                        : <div style={{ color: 'var(--gray-700)', fontSize: '0.9rem' }}>{item.value}</div>
                                    }
                                </div>
                            </div>
                        ))}

                        {/* Social Links */}
                        <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-md)', padding: '20px', color: 'white' }}>
                            <div style={{ fontWeight: 800, marginBottom: '14px', fontSize: '0.95rem' }}>
                                {isHi ? 'सोशल मीडिया पर जुड़ें' : 'Follow Us'}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {[
                                    { name: 'Facebook', color: '#4267B2', url: 'https://www.facebook.com/profile.php?id=61590175844898' },
                                    { name: 'YouTube', color: '#FF0000', url: 'https://www.youtube.com/@MANOJ-1974-JG' },
                                    { name: 'Instagram', color: '#E1306C', url: 'https://www.instagram.com/jgnews.live/?hl=en' },
                                    { name: 'X (Twitter)', color: '#000', url: 'https://x.com/jgnewslive' },
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
        </>
    );
}
