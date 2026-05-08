import React, { useEffect, useState, useRef } from 'react';
import { api } from '../store/newsStore';

const GOOGLE_CLIENT_ID = '604488011504-akubcgj9mgifq6gg97rt9d3pbbegsrle.apps.googleusercontent.com';
const SUBSCRIBED_KEY = 'jgnews_subscribed';
const DISMISSED_KEY = 'jgnews_subscribe_dismissed_at';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY = 25000; // 25 seconds after page load

export default function SubscribePopup() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Don't show if already subscribed
        if (localStorage.getItem(SUBSCRIBED_KEY)) return;
        // Don't show if dismissed within last 7 days
        const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || '0');
        if (dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION) return;
        // Show after delay
        const timer = setTimeout(() => setOpen(true), SHOW_DELAY);
        return () => clearTimeout(timer);
    }, []);

    // Trigger via global event so footer button can also open popup
    useEffect(() => {
        const handler = () => {
            setOpen(true);
            setSuccess(false);
            setError('');
        };
        window.addEventListener('jgnews:open-subscribe', handler);
        return () => window.removeEventListener('jgnews:open-subscribe', handler);
    }, []);

    const handleClose = () => {
        setOpen(false);
        if (!success) {
            // Mark as dismissed for 7 days
            localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        }
    };

    // ─── Google Sign-In ─────────────────────────────────────────────
    const googleBtnRef = useRef(null);

    const handleGoogleResponse = async (response) => {
        if (!response?.credential) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post('/subscribers/google', { credential: response.credential });
            setSuccess(true);
            localStorage.setItem(SUBSCRIBED_KEY, '1');
            setTimeout(() => setOpen(false), 3500);
        } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed, try email instead');
        } finally {
            setSubmitting(false);
        }
    };

    // Initialize Google Sign-In button when popup opens
    useEffect(() => {
        if (!open || success) return;
        if (!window.google?.accounts?.id) return;

        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
                ux_mode: 'popup',
            });
            if (googleBtnRef.current) {
                googleBtnRef.current.innerHTML = ''; // clear if re-rendering
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    text: 'continue_with',
                    logo_alignment: 'left',
                    width: 320,
                });
            }
        } catch (err) {
            console.warn('Google Sign-In init failed:', err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, success]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('कृपया email डालें');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post('/subscribers', {
                email: email.trim(),
                name: name.trim(),
                source: 'popup',
            });
            setSuccess(true);
            localStorage.setItem(SUBSCRIBED_KEY, '1');
            // Auto-close after 3 seconds
            setTimeout(() => setOpen(false), 3500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Subscribe failed, please try again';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(5, 10, 20, 0.7)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.25s ease',
                }}
            />

            {/* Popup */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    width: '92%',
                    maxWidth: '460px',
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                    animation: 'popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top gradient banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 60%, #00bcd4 100%)',
                    padding: '24px 24px 60px',
                    color: 'white',
                    position: 'relative',
                    textAlign: 'center',
                }}>
                    <button
                        onClick={handleClose}
                        aria-label="Close"
                        style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'rgba(255,255,255,0.18)', color: 'white',
                            border: 'none', width: '34px', height: '34px',
                            borderRadius: '50%', cursor: 'pointer',
                            fontSize: '1rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,0.85)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                    >✕</button>
                    <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>📬</div>
                    <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        margin: '0 0 6px',
                        letterSpacing: '-0.3px',
                    }}>
                        ताज़ा खबरें सीधे आपके इनबॉक्स में
                    </h2>
                    <p style={{
                        margin: 0,
                        opacity: 0.9,
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                    }}>
                        Subscribe करें और कोई बड़ी खबर miss न करें।<br />
                        राजस्थान की हर breaking news सबसे पहले।
                    </p>
                </div>

                {/* Form area */}
                <div style={{ padding: '0 24px 24px', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
                    {success ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '14px',
                            padding: '32px 20px',
                            textAlign: 'center',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✅</div>
                            <h3 style={{ color: 'var(--navy)', fontWeight: 900, margin: '0 0 6px' }}>
                                धन्यवाद!
                            </h3>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.92rem', margin: 0 }}>
                                आप successfully subscribe हो गए हैं।<br />
                                जल्द ही ताज़ा खबरें आपको मिलेंगी।
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                background: 'white',
                                borderRadius: '14px',
                                padding: '20px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                            }}
                        >
                            {/* Google Sign-In Button — recommended */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                                <div ref={googleBtnRef} />
                            </div>

                            {/* Divider */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                margin: '14px 0 14px',
                                color: 'var(--gray-400)', fontSize: '0.78rem', fontWeight: 600,
                            }}>
                                <span style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
                                <span>या email से</span>
                                <span style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
                            </div>

                            <input
                                type="text"
                                placeholder="आपका नाम (optional)"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    marginBottom: '10px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                            />
                            <input
                                type="email"
                                placeholder="आपका email *"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    marginBottom: '12px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                            />
                            {error && (
                                <div style={{
                                    background: '#ffebee', color: '#c62828',
                                    padding: '8px 12px', borderRadius: '8px',
                                    fontSize: '0.82rem', marginBottom: '10px',
                                    fontWeight: 600,
                                }}>{error}</div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    background: submitting
                                        ? 'var(--gray-400)'
                                        : 'linear-gradient(135deg, #00bcd4, #0097a7)',
                                    color: 'white',
                                    padding: '14px',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    cursor: submitting ? 'wait' : 'pointer',
                                    boxShadow: '0 4px 16px rgba(0,188,212,0.3)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {submitting ? '⏳ जुड़ रहे हैं...' : '📩 Subscribe करें'}
                            </button>
                            <p style={{
                                fontSize: '0.72rem',
                                color: 'var(--gray-500)',
                                textAlign: 'center',
                                marginTop: '12px',
                                marginBottom: 0,
                            }}>
                                🔒 हम आपका email kabhi share नहीं करेंगे। कभी भी unsubscribe कर सकते हैं।
                            </p>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popupIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </>
    );
}
