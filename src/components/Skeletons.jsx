import React from 'react';

export function NewsCardSkeleton() {
    return (
        <div className="news-card skeleton-card">
            <div className="news-card__img skeleton" style={{ height: '220px', borderRadius: '12px 12px 0 0' }}></div>
            <div className="news-card__body">
                <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '12px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '90%', height: '20px', marginBottom: '8px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '70%', height: '20px', marginBottom: '16px', borderRadius: '4px' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="skeleton" style={{ width: '30%', height: '12px', borderRadius: '4px' }}></div>
                    <div className="skeleton" style={{ width: '20%', height: '12px', borderRadius: '4px' }}></div>
                </div>
            </div>
        </div>
    );
}

export function FeaturedCardSkeleton() {
    return (
        <div className="featured-news skeleton-card" style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="skeleton" style={{ flex: 1, borderRadius: '16px 16px 0 0' }}></div>
            <div className="featured-news__content">
                <div className="skeleton" style={{ width: '30%', height: '18px', marginBottom: '16px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '32px', marginBottom: '10px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '32px', marginBottom: '20px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
            </div>
        </div>
    );
}

export function CategorySectionSkeleton({ title }) {
    return (
        <div className="section-gap">
            <div className="section-header">
                <h2 className="section-title">
                    {title || <div className="skeleton" style={{ width: '150px', height: '28px', borderRadius: '4px', display: 'inline-block' }}></div>}
                </h2>
                <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div>
            </div>
            <div className="news-grid news-grid-3">
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="list-news skeleton-card">
                    <div className="skeleton list-news__img"></div>
                    <div className="list-news__content">
                        <div className="skeleton" style={{ width: '35%', height: '12px', marginBottom: '8px', borderRadius: '4px' }}></div>
                        <div className="skeleton" style={{ width: '95%', height: '16px', marginBottom: '6px', borderRadius: '4px' }}></div>
                        <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '12px', borderRadius: '4px' }}></div>
                        <div className="skeleton" style={{ width: '25%', height: '10px', borderRadius: '4px' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
