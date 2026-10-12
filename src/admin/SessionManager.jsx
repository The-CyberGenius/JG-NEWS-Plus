import React, { useState, useEffect, useCallback } from 'react';
import { getLoginSessions, forceLogoutSession, forceLogoutAllOthers } from '../store/newsStore';

export default function SessionManager() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'
    const [message, setMessage] = useState(null);
    const [inspectedSession, setInspectedSession] = useState(null);

    const loadSessions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLoginSessions();
            if (data.success) {
                setSessions(data.sessions || []);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'लॉगिन सेशन्स लोड करने में त्रुटि।' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSessions();
        const interval = setInterval(loadSessions, 15000); // 15s auto-refresh
        return () => clearInterval(interval);
    }, [loadSessions]);

    const handleForceLogout = async (session) => {
        if (!window.confirm(`क्या आप वाकई इस डिवाइस (${session.device} - IP: ${session.ip}) को तुरंत बाहर निकालना (Logout) चाहते हैं?`)) {
            return;
        }

        setActionLoading(true);
        setMessage(null);
        try {
            const res = await forceLogoutSession(session.id);
            if (res.success) {
                setMessage({ type: 'success', text: `डिवाइस (${session.ip}) को तुरंत लॉगआउट कर दिया गया!` });
                // Optimistic instant state update
                setSessions(prev => prev.map(s => s.id === session.id ? { ...s, isActive: false, logoutReason: 'force_logout_by_super_admin' } : s));
                await loadSessions();
            } else {
                setMessage({ type: 'error', text: res.message || 'लॉगआउट करने में विफल।' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'सर्वर त्रुटि।' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogoutAllOthers = async () => {
        if (!window.confirm('⚠️ चेतावनी: क्या आप वर्तमान डिवाइस को छोड़कर अन्य सभी एक्टिव डिवाइसेस को तुरंत लॉगआउट करना चाहते हैं?')) {
            return;
        }

        setActionLoading(true);
        setMessage(null);
        try {
            const res = await forceLogoutAllOthers();
            if (res.success) {
                setMessage({ type: 'success', text: res.message });
                setSessions(prev => prev.map(s => s.isCurrent ? s : { ...s, isActive: false, logoutReason: 'force_logout_by_super_admin' }));
                await loadSessions();
            } else {
                setMessage({ type: 'error', text: res.message || 'कार्रवाई विफल।' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'सर्वर त्रुटि।' });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleString('hi-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const getRoleBadge = (role) => {
        if (role === 'super_super_admin') {
            return { label: '👑 Super Super Admin', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
        }
        if (role === 'admin') {
            return { label: '👔 Main Admin', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
        }
        return { label: '👤 Subadmin', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    };

    const copyToClipboard = (text) => {
        navigator.clipboard?.writeText(text);
        setMessage({ type: 'success', text: `IP पता "${text}" क्लिपबोर्ड में कॉपी हो गया!` });
    };

    // Filtered list
    const filteredSessions = sessions.filter(s => {
        if (filterActive === 'active' && !s.isActive) return false;
        if (filterActive === 'inactive' && s.isActive) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (s.ip && s.ip.toLowerCase().includes(q)) ||
                   (s.device && s.device.toLowerCase().includes(q)) ||
                   (s.os && s.os.toLowerCase().includes(q)) ||
                   (s.browser && s.browser.toLowerCase().includes(q)) ||
                   (s.role && s.role.toLowerCase().includes(q));
        }
        return true;
    });

    const activeCount = sessions.filter(s => s.isActive).length;
    const mobileCount = sessions.filter(s => s.deviceType === 'Mobile').length;
    const desktopCount = sessions.filter(s => s.deviceType === 'Desktop').length;

    return (
        <div style={{ padding: '4px 0 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>
                        🛡️ सुपर एडमिन — संपूर्ण डिवाइस व लॉगिन मॉनिटर
                    </h2>
                    <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                        यहाँ प्रत्येक लॉगिन डिवाइस की अधिकतम जानकारी (IP, OS, Browser, Screen, Timezone) उपलब्ध है और आप किसी भी डिवाइस को <strong>तुरंत बाहर निकाल सकते हैं</strong>।
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={loadSessions}
                        disabled={loading || actionLoading}
                        className="btn btn-outline"
                        style={{ background: 'white', padding: '10px 16px', borderRadius: '12px', fontWeight: 800 }}
                    >
                        🔄 {loading ? 'लोड हो रहा...' : 'रीफ्रेश करें'}
                    </button>
                    <button
                        onClick={handleLogoutAllOthers}
                        disabled={actionLoading || activeCount <= 1}
                        className="btn"
                        style={{
                            background: '#dc2626', color: 'white', padding: '10px 18px',
                            borderRadius: '12px', fontWeight: 900, boxShadow: '0 4px 14px rgba(220,38,38,0.25)'
                        }}
                    >
                        ⚠️ अन्य सभी डिवाइस तुरंत लॉगआउट करें
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div style={{
                    padding: '14px 20px', borderRadius: '14px', marginBottom: '20px', fontWeight: 700, fontSize: '0.92rem',
                    background: message.type === 'success' ? '#ecfdf5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span>{message.type === 'success' ? '✅' : '⚠️'} {message.text}</span>
                    <button onClick={() => setMessage(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                </div>
            )}

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase' }}>🟢 एक्टिव डिवाइसेस (Online)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '6px' }}>{activeCount}</div>
                </div>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase' }}>📱 मोबाइल डिवाइसेस</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', marginTop: '6px' }}>{mobileCount}</div>
                </div>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase' }}>💻 कंप्यूटर / डेस्कटॉप</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', marginTop: '6px' }}>{desktopCount}</div>
                </div>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase' }}>कुल रिकॉर्डेड सेशन्स</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gray-800)', marginTop: '6px' }}>{sessions.length}</div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ background: 'white', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--gray-200)', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 IP पता, ब्राउज़र, OS या रोल खोजें..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '240px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontSize: '0.92rem' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setFilterActive('all')}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
                            background: filterActive === 'all' ? 'var(--navy)' : 'var(--gray-100)',
                            color: filterActive === 'all' ? 'white' : 'var(--gray-700)'
                        }}
                    >
                        सभी ({sessions.length})
                    </button>
                    <button
                        onClick={() => setFilterActive('active')}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
                            background: filterActive === 'active' ? '#059669' : 'var(--gray-100)',
                            color: filterActive === 'active' ? 'white' : 'var(--gray-700)'
                        }}
                    >
                        🟢 केवल सक्रिय ({activeCount})
                    </button>
                    <button
                        onClick={() => setFilterActive('inactive')}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
                            background: filterActive === 'inactive' ? '#dc2626' : 'var(--gray-100)',
                            color: filterActive === 'inactive' ? 'white' : 'var(--gray-700)'
                        }}
                    >
                        🔴 लॉगआउट ({sessions.length - activeCount})
                    </button>
                </div>
            </div>

            {/* Sessions Detailed Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)', color: 'var(--navy)', fontWeight: 800 }}>
                                <th style={{ padding: '16px 20px' }}>डिवाइस व स्थिति</th>
                                <th style={{ padding: '16px 20px' }}>IP एड्रेस</th>
                                <th style={{ padding: '16px 20px' }}>सिस्टम व स्क्रीन विवरण</th>
                                <th style={{ padding: '16px 20px' }}>लॉगिन व अंतिम गतिविधि</th>
                                <th style={{ padding: '16px 20px' }}>रोल</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center' }}>एक्शन</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)', fontWeight: 600 }}>
                                        {loading ? 'डेटा लोड हो रहा है...' : 'कोई लॉगिन सत्र नहीं मिला।'}
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map(session => {
                                    const roleBadge = getRoleBadge(session.role);
                                    const isMobile = session.deviceType === 'Mobile';
                                    const isTablet = session.deviceType === 'Tablet';

                                    return (
                                        <tr key={session.id} style={{ borderBottom: '1px solid var(--gray-100)', background: session.isCurrent ? '#f8fafc' : 'white' }}>
                                            {/* Device Info */}
                                            <td style={{ padding: '16px 20px', minWidth: '220px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        fontSize: '1.5rem', width: '44px', height: '44px', borderRadius: '12px',
                                                        background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                    }}>
                                                        {isMobile ? '📱' : isTablet ? '📟' : '💻'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 900, color: 'var(--navy)', fontSize: '0.92rem' }}>
                                                            {session.browser || 'Browser'}
                                                        </div>
                                                        <div style={{ color: 'var(--gray-600)', fontSize: '0.78rem', fontWeight: 700 }}>
                                                            {session.os || 'OS'} ({session.deviceType || 'PC'})
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                            <span style={{
                                                                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                                                                background: session.isActive ? '#10b981' : '#ef4444'
                                                            }} />
                                                            <span style={{ fontSize: '0.75rem', color: session.isActive ? '#059669' : '#dc2626', fontWeight: 800 }}>
                                                                {session.isActive ? 'ऑनलाइन (सक्रिय)' : 'ऑफ़लाइन (लॉगआउट)'}
                                                            </span>
                                                            {session.isCurrent && (
                                                                <span style={{
                                                                    marginLeft: '4px', background: 'var(--navy)', color: 'white',
                                                                    fontSize: '0.68rem', padding: '1px 6px', borderRadius: '6px', fontWeight: 800
                                                                }}>
                                                                    यह डिवाइस
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* IP Address */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <code style={{
                                                        background: 'var(--gray-100)', padding: '4px 8px', borderRadius: '6px',
                                                        color: 'var(--navy)', fontWeight: 800, fontSize: '0.85rem'
                                                    }}>
                                                        {session.ip}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(session.ip)}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                                        title="IP कॉपी करें"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                                                    {session.timezone !== '—' && session.timezone !== 'Unknown' ? `🌐 ${session.timezone}` : ''}
                                                </div>
                                            </td>

                                            {/* System & Screen */}
                                            <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                                                <div><strong>स्क्रीन:</strong> {session.screenResolution}</div>
                                                <div><strong>भाषा:</strong> {session.language}</div>
                                                {session.hardware !== '—' && (
                                                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                                                        ⚙️ {session.hardware}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setInspectedSession(session)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--teal)', padding: 0, marginTop: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    🔍 संपूर्ण डिवाइस डेटा देखें
                                                </button>
                                            </td>

                                            {/* Timestamps */}
                                            <td style={{ padding: '16px 20px', fontSize: '0.82rem' }}>
                                                <div style={{ color: 'var(--navy)', fontWeight: 700 }}>
                                                    लॉगिन: {formatDateTime(session.loginTime)}
                                                </div>
                                                {session.isActive ? (
                                                    <div style={{ color: '#059669', fontSize: '0.76rem', fontWeight: 700, marginTop: '3px' }}>
                                                        🟢 अभी सक्रिय
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#dc2626', fontSize: '0.76rem', fontWeight: 700, marginTop: '3px' }}>
                                                        लॉगआउट: {formatDateTime(session.loggedOutAt)}
                                                        {session.logoutReason === 'force_logout_by_super_admin' && ' (सुपर एडमिन द्वारा)'}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Role */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}`,
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800
                                                }}>
                                                    {roleBadge.label}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                {session.isActive ? (
                                                    <button
                                                        onClick={() => handleForceLogout(session)}
                                                        disabled={actionLoading || session.isCurrent}
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: session.isCurrent ? 'var(--gray-200)' : '#dc2626',
                                                            color: session.isCurrent ? 'var(--gray-500)' : 'white',
                                                            border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 800,
                                                            cursor: session.isCurrent ? 'not-allowed' : 'pointer',
                                                            boxShadow: session.isCurrent ? 'none' : '0 4px 12px rgba(220,38,38,0.25)'
                                                        }}
                                                        title={session.isCurrent ? 'वर्तमान डिवाइस को टॉपबार लॉगआउट से बंद करें' : 'इस डिवाइस को तुरंत बाहर फेंकें'}
                                                    >
                                                        {session.isCurrent ? 'वर्तमान डिवाइस' : '🚪 तुरंत लॉगआउट'}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem', fontWeight: 800 }}>
                                                        लॉगआउट हो चुका
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inspector Modal for Full Device Information */}
            {inspectedSession && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)', zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '600px', width: '100%',
                        boxShadow: '0 25px 70px rgba(0,0,0,0.35)', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
                            <h3 style={{ margin: 0, color: 'var(--navy)', fontWeight: 900, fontSize: '1.3rem' }}>
                                🔍 संपूर्ण डिवाइस व सिस्टम डेटा
                            </h3>
                            <button
                                onClick={() => setInspectedSession(null)}
                                style={{ background: 'var(--gray-100)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 900 }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>रोल (Role):</strong>
                                <span>{inspectedSession.role}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>IP एड्रेस:</strong>
                                <code>{inspectedSession.ip}</code>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>डिवाइस टाइप:</strong>
                                <span>{inspectedSession.deviceType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>ऑपरेटिंग सिस्टम (OS):</strong>
                                <span>{inspectedSession.os}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>ब्राउज़र (Browser):</strong>
                                <span>{inspectedSession.browser}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>स्क्रीन रेजोल्यूशन:</strong>
                                <span>{inspectedSession.screenResolution}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>ब्राउज़र व्यूपोर्ट (Window):</strong>
                                <span>{inspectedSession.viewport}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>टाइमज़ोन (Timezone):</strong>
                                <span>{inspectedSession.timezone}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>डिवाइस भाषा (Language):</strong>
                                <span>{inspectedSession.language}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>हार्डवेयर (Hardware Specs):</strong>
                                <span>{inspectedSession.hardware}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>नेटवर्क कनेक्शन (Network):</strong>
                                <span>{inspectedSession.network}</span>
                            </div>
                            <div style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                <strong>यूज़र एजेंट (User-Agent):</strong>
                                <div style={{ fontSize: '0.74rem', color: 'var(--gray-700)', wordBreak: 'break-all', marginTop: '4px', fontFamily: 'monospace' }}>
                                    {inspectedSession.userAgent}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <button
                                onClick={() => setInspectedSession(null)}
                                className="btn btn-primary"
                                style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 800 }}
                            >
                                ठीक है (Close)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
