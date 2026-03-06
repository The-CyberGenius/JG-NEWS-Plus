import React from 'react';
import { useNews } from '../context/NewsContext';

export default function LiveTV() {
    const { settings } = useNews();
    return (
        <div className="container section-gap">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <span className="live-badge"><span className="live-dot" /> LIVE ON AIR</span>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>JG News Plus Live</h1>
                </div>
                <div className="video-embed" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--card-shadow-hover)' }}>
                    {settings.liveUrl ? (
                        <iframe
                            src={(() => {
                                let url = settings.liveUrl;
                                if (url.includes('youtube.com/embed/')) {
                                    url += url.includes('?') ? '&autoplay=1&mute=1' : '?autoplay=1&mute=1';
                                }
                                return url;
                            })()}
                            title="JG News Plus Live TV"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                            📺 जल्द आ रहा है...
                        </div>
                    )}
                </div>
                <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '20px', marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', color: 'var(--navy)', fontWeight: 600, marginBottom: '4px' }}>JG News Plus Rajasthan</p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>निडर • निष्पक्ष • निर्भीक | 24x7 ताज़ी खबरें</p>
                </div>
            </div>
        </div>
    );
}
