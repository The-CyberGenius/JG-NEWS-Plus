import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getNewspapers } from '../store/newsStore';

// Lazy load PDFViewer to keep initial page fast
const PDFViewer = lazy(() => import('../components/PDFViewer'));

function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString('hi-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch { return dateStr; }
}

function NewspaperCard({ newspaper, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: hovered ? '0 20px 50px rgba(10,22,40,0.28)' : '0 4px 20px rgba(10,22,40,0.12)',
                transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
                transition: '0.35s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Newspaper Thumbnail (A4 ratio ~1:1.41) */}
            <div style={{ position: 'relative', paddingTop: '141%', background: '#f0f4f8', overflow: 'hidden' }}>
                {newspaper.thumbnail ? (
                    <img
                        src={newspaper.thumbnail}
                        alt={newspaper.title}
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover',
                            transition: '0.4s ease',
                            transform: hovered ? 'scale(1.04)' : 'scale(1)',
                        }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 50%, #1a3a6e 100%)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', padding: '20px',
                    }}>
                        {/* Fake newspaper lines */}
                        <div style={{ width: '100%', maxWidth: '160px' }}>
                            <div style={{ background: 'var(--saffron)', height: '4px', borderRadius: '2px', marginBottom: '10px' }} />
                            <div style={{ fontWeight: 900, color: 'white', fontSize: '1.1rem', textAlign: 'center', marginBottom: '6px', lineHeight: 1.2 }}>
                                JG NEWS Plus
                            </div>
                            <div style={{ color: 'var(--teal)', fontSize: '0.7rem', textAlign: 'center', marginBottom: '12px' }}>
                                {newspaper.edition || 'E-Newspaper'}
                            </div>
                            {[85, 65, 75, 50, 70, 60].map((w, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px', marginBottom: '6px', width: `${w}%` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Hover read overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(10,22,40,0.65)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: hovered ? 1 : 0,
                    transition: '0.3s ease',
                }}>
                    <div style={{
                        background: 'var(--teal)', color: 'white',
                        padding: '12px 28px', borderRadius: '100px',
                        fontWeight: 800, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 20px rgba(0,188,212,0.5)',
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        पढ़ें
                    </div>
                </div>

                {/* Date Badge */}
                <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: 'var(--saffron)', color: 'white',
                    padding: '3px 10px', borderRadius: '6px',
                    fontSize: '0.68rem', fontWeight: 800,
                }}>
                    📅 {formatDate(newspaper.publishDate)}
                </div>
            </div>

            {/* Card Info */}
            <div style={{ padding: '14px 16px', flex: 1 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--teal)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {newspaper.edition || 'E-Newspaper'}
                </div>
                <div style={{
                    fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy)', lineHeight: 1.4, marginBottom: '12px',
                    display: '-webkit-box', WebkitLineClamp: 2, lineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {newspaper.title}
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--gray-200)' }}>
                    <span style={{
                        flex: 1, textAlign: 'center',
                        background: 'var(--navy)', color: 'white',
                        padding: '6px 0', borderRadius: '8px',
                        fontSize: '0.75rem', fontWeight: 700,
                    }}>
                        📖 पढ़ें
                    </span>
                    <a
                        href={newspaper.pdfUrl}
                        download target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                            flex: 1, textAlign: 'center',
                            background: 'var(--gray-100)', color: 'var(--teal)',
                            padding: '6px 0', borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
                        }}
                    >
                        📥 डाउनलोड
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function EPaper() {
    const [newspapers, setNewspapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaper, setSelectedPaper] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getNewspapers();
            setNewspapers(data);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div>
            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 60%, #1a3a6e 100%)',
                padding: '52px 0 60px',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', background: 'rgba(0,188,212,0.07)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '300px', height: '300px', background: 'rgba(255,111,0,0.05)', borderRadius: '50%' }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--saffron)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '18px', letterSpacing: '1px' }}>
                        🗞️ E-NEWSPAPER
                    </div>
                    <h1 style={{ color: 'white', fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '14px' }}>
                        JG News Plus<br />
                        <span style={{ color: 'var(--teal)' }}>ई-अखबार</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: '520px', lineHeight: 1.7 }}>
                        राजस्थान के सबसे विश्वसनीय समाचार पत्र का डिजिटल संस्करण।
                        वेबसाइट पर ही पढ़ें — कोई डाउनलोड या लॉगिन जरूरी नहीं।
                    </p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
                        {[
                            { icon: '📰', t: 'वेबसाइट पर पढ़ें' },
                            { icon: '🔍', t: 'Zoom करें' },
                            { icon: '📥', t: 'Free Download' },
                        ].map(f => (
                            <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600 }}>
                                <span>{f.icon}</span>{f.t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newspapers */}
            <div className="container" style={{ padding: '40px 16px 60px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--gray-600)' }}>संस्करण लोड हो रहे हैं...</p>
                        </div>
                    </div>
                ) : newspapers.length === 0 ? (
                    <div className="empty-state" style={{ padding: '80px 24px' }}>
                        <div className="empty-state-icon">📰</div>
                        <h3>अभी कोई ई-अखबार उपलब्ध नहीं है</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: '8px' }}>जल्द ही नए संस्करण आएंगे</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h2 className="section-title" style={{ marginBottom: '4px' }}>सभी संस्करण</h2>
                                <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>{newspapers.length} संस्करण उपलब्ध • क्लिक करके पढ़ें</p>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '24px',
                        }}>
                            {newspapers.map(paper => (
                                <NewspaperCard
                                    key={paper.id}
                                    newspaper={paper}
                                    onClick={() => setSelectedPaper(paper)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* In-Website PDF Viewer */}
            {selectedPaper && (
                <Suspense fallback={
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px', borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#00bcd4' }} />
                            <p style={{ color: 'rgba(255,255,255,0.6)' }}>PDF Viewer लोड हो रहा है...</p>
                        </div>
                    </div>
                }>
                    <PDFViewer
                        pdfUrl={selectedPaper.pdfUrl}
                        title={selectedPaper.title}
                        onClose={() => setSelectedPaper(null)}
                    />
                </Suspense>
            )}
        </div>
    );
}
