import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';

export default function LiveTVManager() {
    const { settings, updateSettings } = useNews();
    const [url, setUrl] = useState(settings.liveUrl || '');
    const [saved, setSaved] = useState(false);

    const convertToEmbed = (input) => {
        // Convert regular YouTube URL to embed
        const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        return input;
    };

    const handleSave = () => {
        const embedUrl = convertToEmbed(url);
        setUrl(embedUrl);
        updateSettings({ liveUrl: embedUrl });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px' }}>📺 Live TV Manager</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '28px', fontSize: '0.88rem' }}>
                YouTube Live का embed URL सेट करें
            </p>

            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', boxShadow: 'var(--card-shadow)' }}>
                {saved && (
                    <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontWeight: 700 }}>
                        ✅ Live URL सेव हो गया!
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">YouTube Live URL *</label>
                    <input
                        className="form-control"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/embed/LIVE_VIDEO_ID or https://youtube.com/watch?v=..."
                        style={{ fontSize: '0.9rem' }}
                    />
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', marginTop: '6px', lineHeight: 1.6 }}>
                        💡 Regular YouTube URL भी काम करेगा — हम auto convert कर देंगे<br />
                        Example: <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>https://youtube.com/embed/dQw4w9WgXcQ</code>
                    </div>
                </div>

                <button onClick={handleSave} className="btn btn-primary" style={{ marginBottom: '24px' }} disabled={!url.trim()}>
                    💾 Save करें
                </button>

                {/* Preview */}
                {url && (
                    <div>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '12px' }}>👁️ Preview</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                            <span className="live-badge"><span className="live-dot" /> LIVE ON AIR</span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>JG News Plus Live</span>
                        </div>
                        <div className="video-embed" style={{ borderRadius: 'var(--radius-md)' }}>
                            <iframe
                                src={convertToEmbed(url)}
                                title="Live TV Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {!url && (
                    <div className="empty-state" style={{ padding: '32px 24px' }}>
                        <div className="empty-state-icon">📺</div>
                        <h3>कोई Live URL सेट नहीं है</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.82rem' }}>ऊपर YouTube embed URL डालें</p>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-md)', padding: '20px', marginTop: '20px', color: 'white' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '12px', color: 'var(--teal)' }}>📋 YouTube Embed URL कैसे बनाएं?</h3>
                <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <li>YouTube पर अपना Live video खोलें</li>
                    <li>URL bar से Video ID कॉपी करें (जैसे: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>dQw4w9WgXcQ</code>)</li>
                    <li>यहाँ paste करें: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>https://youtube.com/embed/VIDEO_ID</code></li>
                    <li>Save करें — तुरंत Live TV section update होगा!</li>
                </ol>
            </div>
        </div>
    );
}
