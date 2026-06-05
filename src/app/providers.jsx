'use client';

import React from 'react';
import { NewsProvider } from '../context/NewsContext';
import { LangProvider } from '../context/LangContext';

export function Providers({ children }) {
    return (
        <LangProvider>
            <NewsProvider>
                {children}
            </NewsProvider>
        </LangProvider>
    );
}
