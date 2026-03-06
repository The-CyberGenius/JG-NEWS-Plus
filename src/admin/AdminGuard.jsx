import React from 'react';
import { Navigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

export default function AdminGuard({ children }) {
    const { adminAuth } = useNews();
    if (!adminAuth) return <Navigate to="/admin" replace />;
    return children;
}
