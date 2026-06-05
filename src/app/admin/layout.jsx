'use client';

import React from 'react';
import AdminGuard from '../../admin/AdminGuard';
import AdminLayout from '../../admin/AdminLayout';
import { usePathname } from 'next/navigation';

export default function AdminRootLayout({ children }) {
    const pathname = usePathname();
    
    // If we are exactly on /admin, we don't render the AdminGuard or AdminLayout
    // because that's the login page.
    if (pathname === '/admin') {
        return <>{children}</>;
    }

    return (
        <AdminGuard>
            <AdminLayout>
                {children}
            </AdminLayout>
        </AdminGuard>
    );
}
