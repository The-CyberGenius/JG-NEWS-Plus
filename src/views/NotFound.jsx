'use client';

import React from 'react';
import Link from 'next/link';


import { useLang } from '../context/LangContext';

export default function NotFound() {
    const { t } = useLang();
    return (
        <>
            
            <div className="container section-gap" style={{ textAlign: 'center', padding: '80px 16px' }}>
                <div style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '16px' }}>📰</div>
                <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--navy)', margin: '0 0 8px' }}>404</h1>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '12px' }}>
                    पेज नहीं मिला
                </h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
                    यह पेज हटा दिया गया है या URL गलत है। होम पेज पर जाकर ताज़ा खबरें पढ़ें।
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" className="btn btn-primary">{t.goHome}</Link>
                    <button className="btn btn-outline" onClick={() => window.history.back()}>
                        वापस जाएं
                    </button>
                </div>
            </div>
        </>
    );
}
