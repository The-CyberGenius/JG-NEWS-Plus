import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';

export default function SettingsManager() {
    const { settings, updateSettings } = useNews();
    const [formData, setFormData] = useState({
        siteTitle: '',
        breakingLabel: '',
        liveUrl: '',
        adminPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: '' });

    useEffect(() => {
        if (settings) {
            setFormData({
                siteTitle: settings.siteTitle || 'JG NEWS Plus',
                breakingLabel: settings.breakingLabel || 'ब्रेकिंग न्यूज़',
                liveUrl: settings.liveUrl || '',
                adminPassword: settings.adminPassword || ''
            });
        }
    }, [settings]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSettings(formData);
            showToast('✅ सेटिंग्स सफलतापूर्वक अपडेट की गईं!');
        } catch (error) {
            console.error(error);
            showToast('❌ अपडेट करने में विफल', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            {toast.msg && (
                <div className={`toast toast-${toast.type === 'error' ? 'danger' : 'success'}`}>
                    {toast.msg}
                </div>
            )}

            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '4px' }}>⚙️ सेटिंग्स (Settings)</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>वेबसाइट की मुख्य सेटिंग्स और पासवर्ड यहाँ से बदलें</p>
            </div>

            <form onSubmit={handleSubmit} className="admin-card" style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    
                    {/* Website Title */}
                    <div>
                        <label className="form-label" style={{ fontWeight: 800 }}>वेबसाइट का नाम (Site Title)</label>
                        <input
                            type="text"
                            name="siteTitle"
                            className="form-control"
                            value={formData.siteTitle}
                            onChange={handleChange}
                            placeholder="जैसे: JG NEWS Plus"
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '4px' }}>यह आपकी पूरी वेबसाइट पर टाइटल की तरह दिखेगा।</p>
                    </div>

                    {/* Breaking Label */}
                    <div>
                        <label className="form-label" style={{ fontWeight: 800 }}>ब्रेकिंग लेबल (Breaking News Label)</label>
                        <input
                            type="text"
                            name="breakingLabel"
                            className="form-control"
                            value={formData.breakingLabel}
                            onChange={handleChange}
                            placeholder="जैसे: ताज़ा समाचार"
                        />
                    </div>

                    {/* Live TV URL */}
                    <div>
                        <label className="form-label" style={{ fontWeight: 800 }}>Live TV (Embed URL)</label>
                        <input
                            type="url"
                            name="liveUrl"
                            className="form-control"
                            value={formData.liveUrl}
                            onChange={handleChange}
                            placeholder="YouTube Embed URL (जैसे: https://www.youtube.com/embed/...) "
                        />
                    </div>

                    {/* Admin Password */}
                    <div style={{ padding: '20px', background: 'rgba(229,57,53,0.05)', borderRadius: '12px', border: '1px solid rgba(229,57,53,0.1)' }}>
                        <label className="form-label" style={{ fontWeight: 800, color: 'var(--red)' }}>🛡️ एडमिन पासवर्ड बदलें (Admin Password)</label>
                        <input
                            type="text"
                            name="adminPassword"
                            className="form-control"
                            value={formData.adminPassword}
                            onChange={handleChange}
                            placeholder="नया पासवर्ड डालें"
                            style={{ borderColor: 'rgba(229,57,53,0.2)' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '8px', fontWeight: 600 }}>
                            ⚠️ ध्यान दें: पासवर्ड बदलने के बाद आपको अगली बार लॉग-इन करने के लिए इसी नए पासवर्ड का उपयोग करना होगा।
                        </p>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}
                            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                        >
                            {loading ? '⏳ सेव हो रहा है...' : '💾 सेटिंग्स सुरक्षित करें'}
                        </button>
                    </div>
                </div>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.8rem' }}>
                JG News Plus V1.0 • Built with Security in Mind
            </div>
        </div>
    );
}
