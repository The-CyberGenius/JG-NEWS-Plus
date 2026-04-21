import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

const NAV_ITEMS = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/news', icon: '📰', label: 'खबरें प्रबंधन' },
    { path: '/admin/news/add', icon: '➕', label: 'खबर जोड़ें' },
    { path: '/admin/live', icon: '📺', label: 'Live TV' },
    { path: '/admin/categories', icon: '🏷️', label: 'श्रेणियाँ' },
    { path: '/admin/epaper', icon: '🗞️', label: 'ई-अखबार (PDF)' },
    { path: '/admin/settings', icon: '⚙️', label: 'सेटिंग्स' },
];

export default function AdminLayout({ children }) {
    const { logout } = useNews();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    return (
        <div style={{ fontFamily: 'var(--font-hindi)' }}>
            {/* Top Bar */}
            <div className="admin-topbar">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div style={{ fontWeight: 900, fontSize: '1rem', flex: 1 }}>
                    JG <span style={{ color: 'var(--teal)' }}>NEWS</span> <span style={{ color: 'var(--saffron)', fontSize: '0.8rem', marginLeft: '4px' }}>Admin Panel</span>
                </div>
                <a href="/" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🌐 <span className="hide-mobile">Site देखें</span>
                </a>
                <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(229,57,53,0.8)', color: 'white' }}>
                    🚪 <span className="hide-mobile">Logout</span>
                </button>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="mobile-menu-overlay show" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ paddingTop: '60px' }}>
                <div style={{ padding: '20px 16px 12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Navigation
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                        JG News Plus v1.0<br />निडर • निष्पक्ष • निर्भीक
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                <div className="admin-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
