import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

export default function PhotoGallery() {
    const { articles } = useNews();
    const [lightbox, setLightbox] = useState(null);

    const photos = articles.filter(a => a.image).map(a => ({
        src: a.image, title: a.title, id: a.id, category: a.category,
    }));

    return (
        <div className="container section-gap">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '24px' }}>📷 फोटो गैलरी</h1>
            <div className="gallery-grid">
                {photos.map((p, i) => (
                    <div key={p.id} className="gallery-item" onClick={() => setLightbox(p)}>
                        <img src={p.src} alt={p.title} loading="lazy" />
                        <div className="gallery-item__overlay">
                            <span style={{ color: 'white', fontSize: '1.5rem' }}>🔍</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="modal-wrap" style={{ zIndex: 9999 }} onClick={() => setLightbox(null)}>
                    <div style={{ maxWidth: '900px', width: '100%', padding: '16px' }} onClick={e => e.stopPropagation()}>
                        <img src={lightbox.src} alt={lightbox.title} style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--card-shadow-hover)' }} />
                        <div style={{ background: 'white', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <span className="badge badge-teal" style={{ marginBottom: '4px' }}>{lightbox.category}</span>
                                <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem', marginTop: '4px' }}>{lightbox.title}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link to={`/article/${lightbox.id}`} className="btn btn-primary btn-sm">पूरी खबर</Link>
                                <button onClick={() => setLightbox(null)} className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--navy)' }}>✕ बंद</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {lightbox && <div className="mobile-menu-overlay show" onClick={() => setLightbox(null)} />}
        </div>
    );
}
