import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

export default function AdminGuard({ children }) {
    const { adminAuth, refresh } = useNews();
    const refreshedRef = useRef(false);

    // When admin enters admin panel, load FULL article list (not just first 30)
    useEffect(() => {
        if (adminAuth && !refreshedRef.current) {
            refreshedRef.current = true;
            refresh();
        }
    }, [adminAuth, refresh]);

    if (!adminAuth) return <Navigate to="/admin" replace />;
    return children;
}
