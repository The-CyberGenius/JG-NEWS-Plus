import React, { useState, useEffect, useCallback } from 'react';
import { getLoginSessions, forceLogoutSession, forceLogoutAllOthers } from '../store/newsStore';

export default function SessionManager() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'
    const [message, setMessage] = useState(null);

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
        const interval = setInterval(loadSessions, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, [loadSessions]);

    const handleForceLogout = async (session) => {
        if (!window.confirm(`क्या आप वाकई इस डिवाइस (${session.device} - IP: ${session.ip}) को तुरंत लॉगआउट करना चाहते हैं?`)) {
            return;
        }

        setActionLoading(true);
        setMessage(null);
        try {
            const res = await forceLogoutSession(session.id);
            if (res.success) {
                setMessage({ type: 'success', text: `डिवाइस (${session.ip}) को सफलतापूर्वक लॉगआउट कर दिया गया!` });
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
        if (!window.confirm('चेतावनी: क्या आप वर्तमान डिवाइस को छोड़कर अन्य सभी एक्टिव डिवाइसेस को तुरंत लॉगआउट करना चाहते हैं?')) {
            return;
        }

        setActionLoading(true);
        setMessage(null);
        try {
            const res = await forceLogoutAllOthers();
            if (res.success) {
                setMessage({ type: 'success', text: res.message });
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

    // Filtered list
    const filteredSessions = sessions.filter(s => {
        if (filterActive === 'active' && !s.isActive) return false;
        if (filterActive === 'inactive' && s.isActive) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (s.ip && s.ip.toLowerCase().includes(q)) ||
                   (s.device && s.device.toLowerCase().includes(q)) ||
                   (s.role && s.role.toLowerCase().includes(q));
        }
        return true;
    });

    const activeCount = sessions.filter(s => s.isActive).length;
    const mobileCount = sessions.filter(s => s.device && (s.device.includes('Mobile') || s.device.includes('iPhone') || s.device.includes('Android'))).length;
    const desktopCount = sessions.filter(s => s.device && (s.device.includes('PC') || s.device.includes('Mac') || s.device.includes('Linux'))).length;

    return (
        <div style={{ padding: '4px 0 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)' }}>
                        🛡️ लॉगिन डिवाइसेस व सेशन नियंत्रण
                    </h2>
                    <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                        यहाँ आप सभी लॉगिन हुए डिवाइसेस, उनका IP पता, लॉगिन समय देख सकते हैं और किसी भी डिवाइस को तुरंत लॉगआउट कर सकते हैं।
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={loadSessions}
                        disabled={loading || actionLoading}
                        className="btn btn-outline"
                        style={{ background: 'white', padding: '10px 16px', borderRadius: '12px', fontWeight: 700 }}
                    >
                        🔄 {loading ? 'लोड हो रहा...' : 'रीफ्रेश करें'}
                    </button>
                    <button
                        onClick={handleLogoutAllOthers}
                        disabled={actionLoading || activeCount <= 1}
                        className="btn"
                        style={{
                            background: '#dc2626', color: 'white', padding: '10px 18px',
                            borderRadius: '12px', fontWeight: 800, boxShadow: '0 4px 14px rgba(220,38,38,0.25)'
                        }}
                    >
                        ⚠️ अन्य सभी डिवाइस लॉगआउट करें
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>सक्रिय डिवाइसेस (Active)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '6px' }}>{activeCount}</div>
                </div>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>📱 मोबाइल डिवाइसेस</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', marginTop: '6px' }}>{mobileCount}</div>
                </div>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>💻 कंप्यूटर / डेस्कटॉप</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', marginTop: '6px' }}>{desktopCount}</div>
                </div>
                <div style={{ background: 'white', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>कुल रिकॉर्डेड सेशन्स</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gray-800)', marginTop: '6px' }}>{sessions.length}</div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ background: 'white', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--gray-200)', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 IP पता, डिवाइस या रोल खोजें..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '220px', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setFilterActive('all')}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                            background: filterActive === 'all' ? 'var(--navy)' : 'var(--gray-100)',
                            color: filterActive === 'all' ? 'white' : 'var(--gray-700)'
                        }}
                    >
                        सभी ({sessions.length})
                    </button>
                    <button
                        onClick={() => setFilterActive('active')}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                            background: filterActive === 'active' ? '#059669' : 'var(--gray-100)',
                            color: filterActive === 'active' ? 'white' : 'var(--gray-700)'
                        }}
                    >
                        🟢 केवल सक्रिय ({activeCount})
                    </button>
                    <button
                        onClick={() => setFilterActive('inactive')}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                            background: filterActive === 'inactive' ? '#dc2626' : 'var(--gray-100)',
                            color: filterActive === 'inactive' ? 'white' : 'var(--gray-700)'
                        }}
                    >
                        🔴 लॉगआउट ({sessions.length - activeCount})
                    </button>
                </div>
            </div>

            {/* Sessions Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)', color: 'var(--navy)', fontWeight: 800 }}>
                                <th style={{ padding: '16px 20px' }}>डिवाइस व स्थिति</th>
                                <th style={{ padding: '16px 20px' }}>रोल (Role)</th>
                                <th style={{ padding: '16px 20px' }}>IP एड्रेस</th>
                                <th style={{ padding: '16px 20px' }}>लॉगिन समय</th>
                                <th style={{ padding: '16px 20px' }}>अंतिम सक्रियता / लॉगआउट</th>
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
                                    const isMobile = session.device && (session.device.includes('Mobile') || session.device.includes('iPhone') || session.device.includes('Android'));

                                    return (
                                        <tr key={session.id} style={{ borderBottom: '1px solid var(--gray-100)', background: session.isCurrent ? '#f8fafc' : 'white' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        fontSize: '1.4rem', width: '42px', height: '42px', borderRadius: '12px',
                                                        background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isMobile ? '📱' : '💻'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: 'var(--navy)' }}>
                                                            {session.device || 'Unknown Device'}
                                                            {session.isCurrent && (
                                                                <span style={{
                                                                    marginLeft: '8px', background: 'var(--navy)', color: 'white',
                                                                    fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 700
                                                                }}>
                                                                    यह डिवाइस (Current)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                            <span style={{
                                                                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                                                                background: session.isActive ? '#10b981' : '#ef4444'
                                                            }} />
                                                            <span style={{ fontSize: '0.78rem', color: session.isActive ? '#059669' : '#dc2626', fontWeight: 700 }}>
                                                                {session.isActive ? 'सक्रिय (Online / Active)' : 'सत्र समाप्त (Offline)'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}`,
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800
                                                }}>
                                                    {roleBadge.label}
                                                </span>
                                            </td>

                                            <td style={{ padding: '16px 20px' }}>
                                                <code style={{
                                                    background: 'var(--gray-100)', padding: '4px 8px', borderRadius: '6px',
                                                    color: 'var(--navy)', fontWeight: 700, fontSize: '0.85rem'
                                                }}>
                                                    {session.ip}
                                                </code>
                                            </td>

                                            <td style={{ padding: '16px 20px', color: 'var(--gray-700)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {formatDateTime(session.loginTime)}
                                            </td>

                                            <td style={{ padding: '16px 20px', fontSize: '0.85rem' }}>
                                                {session.isActive ? (
                                                    <span style={{ color: '#059669', fontWeight: 600 }}>सक्रिय सत्र चल रहा है</span>
                                                ) : (
                                                    <div>
                                                        <div style={{ color: 'var(--gray-600)' }}>{formatDateTime(session.loggedOutAt)}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                                                            {session.logoutReason === 'force_logout_by_super_admin' ? '🛡️ सुपर एडमिन द्वारा लॉगआउट' : 'यूजर द्वारा लॉगआउट'}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                {session.isActive ? (
                                                    <button
                                                        onClick={() => handleForceLogout(session)}
                                                        disabled={actionLoading || session.isCurrent}
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: session.isCurrent ? 'var(--gray-200)' : '#fee2e2',
                                                            color: session.isCurrent ? 'var(--gray-500)' : '#dc2626',
                                                            border: session.isCurrent ? 'none' : '1px solid #fecaca',
                                                            padding: '6px 14px', borderRadius: '10px', fontWeight: 800,
                                                            cursor: session.isCurrent ? 'not-allowed' : 'pointer'
                                                        }}
                                                        title={session.isCurrent ? 'वर्तमान डिवाइस को टॉपबार लॉगआउट से बंद करें' : 'इस डिवाइस को तुरंत लॉगआउट करें'}
                                                    >
                                                        🚪 {session.isCurrent ? 'वर्तमान डिवाइस' : 'फोर्स लॉगआउट'}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem', fontWeight: 700 }}>
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
        </div>
    );
}
