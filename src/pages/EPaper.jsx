import React, { useState, useEffect } from 'react';
import { getNewspapers } from '../store/newsStore';

function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString('hi-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch { return dateStr; }
}

function PDFModal({ newspaper, onClose }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.2s ease',
        }}>
            <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
            {/* Modal Top Bar */}
            <div style={{
                background: 'var(--navy)', padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <div>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>{newspaper.title}</div>
                    <div style={{ color: 'var(--teal)', fontSize: '0.78rem' }}>{newspaper.edition} • {formatDate(newspaper.publishDate)}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a
                        href={newspaper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        style={{
                            background: 'var(--teal)', color: 'white', padding: '8px 16px',
                            borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        डाउनलोड करें
                    </a>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
                            width: '36px', height: '36px', borderRadius: '8px', fontSize: '1.2rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="बंद करें"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '0' }}>
                <iframe
                    src={newspaper.pdfUrl}
                    title={newspaper.title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </div>
        </div>
    );
}

function NewspaperCard({ newspaper, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className="epaper-card"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: hovered ? '0 16px 48px rgba(10,22,40,0.25)' : '0 4px 20px rgba(10,22,40,0.12)',
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                transition: '0.35s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Thumbnail */}
            <div style={{ position: 'relative', paddingTop: '141%', background: 'var(--gray-100)', overflow: 'hidden' }}>
                {newspaper.thumbnail ? (
                    <img
                        src={newspaper.thumbnail}
                        alt={newspaper.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s ease' }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📰</div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center', padding: '0 12px' }}>
                            JG News Plus
                        </div>
                        <div style={{ color: 'var(--teal)', fontSize: '0.75rem', marginTop: '4px' }}>E-Newspaper</div>
                    </div>
                )}

                {/* Hover Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(10,22,40,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: hovered ? 1 : 0,
                    transition: '0.3s ease',
                }}>
                    <div style={{
                        background: 'var(--teal)', color: 'white', padding: '10px 22px',
                        borderRadius: '100px', fontWeight: 800, fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.3px',
                }}>
                    📅 {formatDate(newspaper.publishDate)}
                </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '14px 16px', flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                    {newspaper.edition}
                </div>
                <div style={{
                    fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy)',
                    lineHeight: 1.4, marginBottom: '10px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {newspaper.title}
                </div>
                <div style={{
                    display: 'flex', gap: '8px', alignItems: 'center',
                    paddingTop: '10px', borderTop: '1px solid var(--gray-200)',
                }}>
                    <span style={{
                        background: 'var(--navy)', color: 'white', padding: '4px 12px',
                        borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        अभी पढ़ें
                    </span>
                    <a
                        href={newspaper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        onClick={e => e.stopPropagation()}
                        style={{
                            color: 'var(--teal)', fontSize: '0.72rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none',
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        डाउनलोड
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
                padding: '48px 0 56px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(0,188,212,0.08)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '250px', height: '250px', background: 'rgba(255,111,0,0.06)', borderRadius: '50%' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            background: 'var(--saffron)', color: 'white', padding: '8px 16px',
                            borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem',
                            letterSpacing: '1px',
                        }}>
                            📰 E-NEWSPAPER
                        </div>
                    </div>
                    <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '12px' }}>
                        JG News Plus<br />
                        <span style={{ color: 'var(--teal)' }}>ई-अखबार</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: '500px', lineHeight: 1.6 }}>
                        राजस्थान के सबसे विश्वसनीय समाचार पत्र का डिजिटल संस्करण।
                        घर बैठे पढ़ें, मुफ्त में डाउनलोड करें।
                    </p>
                </div>
            </div>

            {/* Newspapers Grid */}
            <div className="container" style={{ padding: '40px 16px 60px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--gray-600)' }}>लोड हो रहा है...</p>
                        </div>
                    </div>
                ) : newspapers.length === 0 ? (
                    <div className="empty-state" style={{ padding: '80px 24px' }}>
                        <div className="empty-state-icon">📰</div>
                        <h3>अभी कोई ई-अखबार उपलब्ध नहीं है</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: '8px' }}>
                            जल्द ही नए संस्करण आएंगे
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '28px' }}>
                            <h2 className="section-title">सभी संस्करण</h2>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: '-8px' }}>
                                {newspapers.length} संस्करण उपलब्ध हैं
                            </p>
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

            {/* PDF Modal */}
            {selectedPaper && (
                <PDFModal
                    newspaper={selectedPaper}
                    onClose={() => setSelectedPaper(null)}
                />
            )}
        </div>
    );
}
