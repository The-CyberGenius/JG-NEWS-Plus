'use client';

import React, { useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';
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

    useEffect(() => {
        if (!adminAuth) {
            redirect('/admin');
        }
    }, [adminAuth]);

    if (!adminAuth) return null;
    return children;
}
