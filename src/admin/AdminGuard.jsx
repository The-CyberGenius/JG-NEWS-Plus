import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { isAdminLoggedIn, getAdminRole, verifyAdminSession } from '../store/newsStore';

export default function AdminGuard({ children }) {
    const { adminAuth, refresh, logout } = useNews();
    const location = useLocation();
    const refreshedRef = useRef(false);

    const isTokenFresh = adminAuth && isAdminLoggedIn();
    const role = getAdminRole();

    useEffect(() => {
        if (!isAdminLoggedIn() && adminAuth) {
            logout();
        } else if (isTokenFresh && !refreshedRef.current) {
            refreshedRef.current = true;
            // Only refresh all articles if standard admin or subadmin (not needed for super_super_admin)
            if (role !== 'super_super_admin') {
                refresh();
            }
        }
    }, [adminAuth, isTokenFresh, logout, refresh, role]);

    // Active session heartbeat: check every 10s and on focus
    // If Super Super Admin clicked force-logout, this will instantly kick the user out!
    useEffect(() => {
        if (!isTokenFresh) return;

        const checkLiveness = async () => {
            const valid = await verifyAdminSession();
            if (!valid) {
                logout();
                window.location.href = '/admin?reason=revoked';
            }
        };

        const interval = setInterval(checkLiveness, 10000);
        window.addEventListener('focus', checkLiveness);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkLiveness);
        };
    }, [isTokenFresh, logout]);

    if (!isTokenFresh) return <Navigate to="/admin" replace />;

    // Super Super Admin cannot access news upload or standard editing routes
    if (role === 'super_super_admin') {
        const allowedPaths = ['/admin/sessions', '/admin/news-analytics', '/admin/dashboard', '/admin/analytics'];
        const isAllowed = allowedPaths.some(p => location.pathname.startsWith(p));
        if (!isAllowed) {
            return <Navigate to="/admin/sessions" replace />;
        }
    }

    return children;
}
