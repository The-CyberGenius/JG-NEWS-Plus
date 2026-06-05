import React from 'react';
import { Providers } from './providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubscribePopup from '../components/SubscribePopup';
import BackToTop from '../components/BackToTop';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
    title: 'JG News Plus - निडर • निष्पक्ष • निर्भीक',
    description: 'राजस्थान की ताज़ा ख़बरें',
};

export default function RootLayout({ children }) {
    return (
        <html lang="hi" data-scroll-behavior="smooth">
            <body>
                <Providers>
                    <Header />
                    <main style={{ minHeight: '60vh' }}>
                        {children}
                    </main>
                    <Footer />
                    <SubscribePopup />
                    <BackToTop />
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
