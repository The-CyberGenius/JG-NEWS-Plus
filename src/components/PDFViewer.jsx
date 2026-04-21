import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ✅ Correct worker setup for Vite + react-pdf
// Uses local pdfjs-dist worker file bundled by Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export default function PDFViewer({ pdfUrl, title, edition, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.3);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [containerWidth, setContainerWidth] = useState(800);

    // Responsive width
    useEffect(() => {
        const updateWidth = () => {
            setContainerWidth(Math.min(window.innerWidth - 40, 900));
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setPageNumber(p => Math.min(p + 1, numPages || 1));
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setPageNumber(p => Math.max(p - 1, 1));
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [numPages, onClose]);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }, []);

    const onDocumentLoadError = useCallback((err) => {
        setLoading(false);
        setError(err?.message || 'PDF load failed');
    }, []);

    const goToPrev = () => setPageNumber(p => Math.max(p - 1, 1));
    const goToNext = () => setPageNumber(p => Math.min(p + 1, numPages));
    const zoomIn = () => setScale(s => Math.min(+(s + 0.2).toFixed(1), 3.0));
    const zoomOut = () => setScale(s => Math.max(+(s - 0.2).toFixed(1), 0.5));

    const ToolBtn = ({ onClick, children, title: t, disabled = false, color }) => (
        <button
            onClick={onClick}
            title={t}
            disabled={disabled}
            style={{
                background: color || (disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'),
                color: disabled ? 'rgba(255,255,255,0.25)' : 'white',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', padding: '7px 12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '0.82rem', fontWeight: 600,
                transition: '0.15s ease', whiteSpace: 'nowrap',
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#0f1117',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* ─── Toolbar ─── */}
            <div style={{
                background: 'linear-gradient(90deg, #0a1628, #0d1f3c)',
                padding: '10px 16px',
                display: 'flex', alignItems: 'center',
                gap: '8px', flexWrap: 'wrap',
                borderBottom: '1px solid rgba(0,188,212,0.2)',
                flexShrink: 0,
            }}>
                {/* Brand + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{ background: 'var(--saffron)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        📰 JG NEWS
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                        {edition && <div style={{ color: 'var(--teal)', fontSize: '0.7rem', marginTop: '1px' }}>{edition}</div>}
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Page Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px 8px' }}>
                        <ToolBtn onClick={goToPrev} title="पिछला (←)" disabled={pageNumber <= 1}>◀</ToolBtn>
                        <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: 700, padding: '0 8px', minWidth: '72px', textAlign: 'center' }}>
                            पृष्ठ {pageNumber} / {numPages || '—'}
                        </div>
                        <ToolBtn onClick={goToNext} title="अगला (→)" disabled={!numPages || pageNumber >= numPages}>▶</ToolBtn>
                    </div>

                    {/* Zoom */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px 8px' }}>
                        <ToolBtn onClick={zoomOut} title="ज़ूम कम करें" disabled={scale <= 0.5}>🔍−</ToolBtn>
                        <div style={{ color: 'var(--teal)', fontSize: '0.8rem', fontWeight: 800, minWidth: '44px', textAlign: 'center' }}>
                            {Math.round(scale * 100)}%
                        </div>
                        <ToolBtn onClick={zoomIn} title="ज़ूम बढ़ाएं" disabled={scale >= 3}>🔍+</ToolBtn>
                    </div>

                    {/* Reset Zoom */}
                    <ToolBtn onClick={() => setScale(1.3)} title="Reset">↺</ToolBtn>

                    {/* Download */}
                    <a href={pdfUrl} download target="_blank" rel="noreferrer" style={{
                        background: 'var(--teal)', color: 'white',
                        padding: '7px 14px', borderRadius: '8px',
                        fontWeight: 700, fontSize: '0.82rem',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        डाउनलोड
                    </a>

                    {/* Close */}
                    <button onClick={onClose} style={{
                        background: 'rgba(220,38,38,0.8)', color: 'white',
                        border: 'none', width: '36px', height: '36px',
                        borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                    }} title="बंद करें (Esc)">✕</button>
                </div>
            </div>

            {/* ─── PDF Canvas ─── */}
            <div style={{ flex: 1, overflow: 'auto', background: '#1a1d27', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
                {/* Loading State */}
                {loading && !error && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <div style={{ width: '44px', height: '44px', border: '4px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>PDF लोड हो रहा है...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '440px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '10px' }}>PDF लोड नहीं हो सका</h3>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '20px' }}>
                            {error.includes('CORS') || error.includes('fetch')
                                ? 'PDF file publicly accessible नहीं है। Admin panel से फिर से upload करें।'
                                : 'कोई तकनीकी समस्या आई। नीचे "नई Tab में खोलें" try करें।'
                            }
                        </p>
                        <a href={pdfUrl} target="_blank" rel="noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'var(--teal)', color: 'white',
                            padding: '10px 20px', borderRadius: '8px',
                            fontWeight: 700, textDecoration: 'none',
                        }}>
                            🔗 नई Tab में खोलें
                        </a>
                    </div>
                )}

                {/* PDF Document */}
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    options={{
                        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
                        cMapPacked: true,
                    }}
                >
                    {!error && (
                        <Page
                            key={`page_${pageNumber}_${scale}`}
                            pageNumber={pageNumber}
                            width={containerWidth * scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            loading={null}
                        />
                    )}
                </Document>

                {/* Spacer */}
                <div style={{ height: '40px', flexShrink: 0 }} />
            </div>

            {/* ─── Bottom Page Strip ─── */}
            {numPages && !error && (
                <div style={{
                    background: '#0a1628',
                    borderTop: '1px solid rgba(0,188,212,0.15)',
                    padding: '8px 16px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '6px',
                    flexShrink: 0, flexWrap: 'wrap',
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginRight: '6px' }}>पृष्ठ चुनें:</span>
                    {Array.from({ length: Math.min(numPages, 30) }, (_, i) => i + 1).map(pg => (
                        <button key={pg} onClick={() => setPageNumber(pg)} style={{
                            width: '30px', height: '30px', borderRadius: '6px', border: 'none',
                            background: pg === pageNumber ? 'var(--teal)' : 'rgba(255,255,255,0.08)',
                            color: pg === pageNumber ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', fontSize: '0.72rem',
                            fontWeight: pg === pageNumber ? 800 : 400,
                            transition: '0.15s ease',
                        }}>{pg}</button>
                    ))}
                    {numPages > 30 && (
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>...+{numPages - 30}</span>
                    )}
                </div>
            )}
        </div>
    );
}
