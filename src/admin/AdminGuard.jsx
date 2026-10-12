import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { isAdminLoggedIn, getAdminRole } from '../store/newsStore';

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
