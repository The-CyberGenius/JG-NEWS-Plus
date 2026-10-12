import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { isAdminLoggedIn } from '../store/newsStore';

export default function AdminGuard({ children }) {
    const { adminAuth, refresh, logout } = useNews();
    const refreshedRef = useRef(false);

    const isTokenFresh = adminAuth && isAdminLoggedIn();

    useEffect(() => {
        if (!isAdminLoggedIn() && adminAuth) {
            logout();
        } else if (isTokenFresh && !refreshedRef.current) {
            refreshedRef.current = true;
            refresh();
        }
    }, [adminAuth, isTokenFresh, logout, refresh]);

    if (!isTokenFresh) return <Navigate to="/admin" replace />;
    return children;
}
