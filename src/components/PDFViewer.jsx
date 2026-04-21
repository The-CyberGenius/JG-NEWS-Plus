import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN worker to avoid Vite/bundler issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ pdfUrl, title, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(false);
    }, []);

    const onDocumentLoadError = useCallback(() => {
        setLoading(false);
        setError(true);
    }, []);

    const goToPrev = () => setPageNumber(p => Math.max(p - 1, 1));
    const goToNext = () => setPageNumber(p => Math.min(p + 1, numPages));
    const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
    const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

    const iconBtn = (onClick, children, title, disabled = false) => (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            style={{
                background: disabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '7px 12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.82rem', fontWeight: 600,
                transition: '0.2s ease',
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: '#1a1a2e',
            display: 'flex', flexDirection: 'column',
            animation: 'pdfOpen 0.25s ease',
        }}>
            <style>{`
                @keyframes pdfOpen { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
                .pdf-page-wrap { display: flex; justify-content: center; }
                .react-pdf__Page__canvas { border-radius: 4px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
            `}</style>

            {/* ── Top Toolbar ── */}
            <div style={{
                background: 'linear-gradient(135deg, var(--navy), #1e2a4a)',
                padding: '10px 16px',
                display: 'flex', alignItems: 'center',
                gap: '10px', flexWrap: 'wrap',
                flexShrink: 0,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                {/* Logo + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: 0 }}>
                    <div style={{
                        background: 'var(--saffron)', color: 'white',
                        padding: '5px 10px', borderRadius: '6px',
                        fontWeight: 900, fontSize: '0.78rem', whiteSpace: 'nowrap', letterSpacing: '0.5px',
                    }}>📰 JG NEWS</div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {title}
                        </div>
                        {numPages && (
                            <div style={{ color: 'var(--teal)', fontSize: '0.72rem', fontWeight: 600 }}>
                                {numPages} पृष्ठ
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Page nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px 8px' }}>
                        {iconBtn(goToPrev, '◀', 'पिछला पृष्ठ', pageNumber <= 1)}
                        <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 700, minWidth: '60px', textAlign: 'center' }}>
                            {pageNumber} / {numPages || '—'}
                        </span>
                        {iconBtn(goToNext, '▶', 'अगला पृष्ठ', pageNumber >= numPages)}
                    </div>

                    {/* Zoom */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px 8px' }}>
                        {iconBtn(zoomOut, '🔍−', 'ज़ूम आउट', scale <= 0.5)}
                        <span style={{ color: 'var(--teal)', fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'center' }}>
                            {Math.round(scale * 100)}%
                        </span>
                        {iconBtn(zoomIn, '🔍+', 'ज़ूम इन', scale >= 3)}
                    </div>

                    {/* Download */}
                    <a
                        href={pdfUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            background: 'var(--teal)', color: 'white',
                            padding: '7px 14px', borderRadius: '8px',
                            fontWeight: 700, fontSize: '0.82rem',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            textDecoration: 'none', whiteSpace: 'nowrap',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        डाउनलोड
                    </a>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(229,57,53,0.8)', color: 'white',
                            border: 'none', width: '36px', height: '36px',
                            borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900,
                        }}
                        title="बंद करें"
                    >✕</button>
                </div>
            </div>

            {/* ── PDF Canvas Area ── */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#111827' }}>
                {loading && !error && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                        <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--teal)' }} />
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>PDF लोड हो रहा है...</p>
                    </div>
                )}

                {error && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '3rem' }}>⚠️</div>
                        <h3 style={{ color: 'white', fontWeight: 800 }}>PDF लोड नहीं हो सका</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.7 }}>
                            PDF URL सार्वजनिक (public) होनी चाहिए।<br />
                            कृपया Cloudinary पर अपलोड करके URL डालें।
                        </p>
                        <a href={pdfUrl} target="_blank" rel="noreferrer"
                            style={{ background: 'var(--teal)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
                            नई Tab में खोलें →
                        </a>
                    </div>
                )}

                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading=""
                >
                    {!error && (
                        <div className="pdf-page-wrap">
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                loading=""
                            />
                        </div>
                    )}
                </Document>
            </div>

            {/* ── Bottom Page Bar ── */}
            {numPages && !error && (
                <div style={{
                    background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap',
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>सभी पृष्ठ —</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Array.from({ length: Math.min(numPages, 20) }, (_, i) => i + 1).map(pg => (
                            <button
                                key={pg}
                                onClick={() => setPageNumber(pg)}
                                style={{
                                    width: '28px', height: '28px',
                                    borderRadius: '6px',
                                    background: pg === pageNumber ? 'var(--teal)' : 'rgba(255,255,255,0.1)',
                                    color: pg === pageNumber ? 'white' : 'rgba(255,255,255,0.6)',
                                    border: 'none', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: pg === pageNumber ? 800 : 400,
                                    transition: '0.2s ease',
                                }}
                            >
                                {pg}
                            </button>
                        ))}
                        {numPages > 20 && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', alignSelf: 'center' }}>...+{numPages - 20} और</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
