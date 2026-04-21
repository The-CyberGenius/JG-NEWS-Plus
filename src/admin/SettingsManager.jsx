import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';

export default function SettingsManager() {
    const { settings, updateSettings } = useNews();
    const [formData, setFormData] = useState({
        siteTitle: '',
        breakingLabel: '',
        liveUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: '' });

    useEffect(() => {
        if (settings) {
            setFormData({
                siteTitle: settings.siteTitle || 'JG NEWS Plus',
                breakingLabel: settings.breakingLabel || 'ब्रेकिंग न्यूज़',
                liveUrl: settings.liveUrl || '',
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
            showToast('✅ सेटings सफलतापूर्वक अपडेट की गईं!');
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
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '4px' }}>⚙️ वेबसाइट सेटिंग्स (Site Settings)</h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>वेबसाइट का नाम और अन्य जानकारी यहाँ से बदलें</p>
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
                            placeholder="YouTube Embed URL"
                        />
                    </div>

                    {/* Developer Info Box */}
                    <div style={{ padding: '20px', background: 'var(--gray-100)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                        <label className="form-label" style={{ fontWeight: 800, color: 'var(--navy)' }}>🛡️ सुरक्षा (Developer Control)</label>
                        <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', margin: '0', lineHeight: '1.5' }}>
                            आपकी पसंद के अनुसार, **एडमिन पासवर्ड** को सुरक्षा के लिए सीधे और केवल **Backend Code (.env file)** से कंट्रोल किया जा रहा है। इसे यहाँ पैनल से नहीं बदला जा सकता।
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
        </div>
    );
}
