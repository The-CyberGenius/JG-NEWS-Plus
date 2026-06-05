import React from 'react';

const SITE_URL = 'https://jgnews.live';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

export function SEO({ structuredData }) {
    if (!structuredData) return null;
    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    );
}

export function articleStructuredData(article) {
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        image: [article.image].filter(Boolean),
        datePublished: article.date,
        dateModified: article.updatedAt || article.date,
        author: [{ '@type': 'Person', name: article.author || 'JG News Plus' }],
        publisher: {
            '@type': 'Organization',
            name: 'JG News Plus',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
        description: article.excerpt,
        articleSection: article.category,
        inLanguage: 'hi',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/article/${article.slug || article.id || article._id}`,
        },
    };
}

export function organizationStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: 'JG News Plus',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
            'https://www.facebook.com/profile.php?id=61590175844898',
            'https://www.instagram.com/jgnews.live/?hl=en',
            'https://x.com/jgnewslive',
            'https://www.youtube.com/@MANOJ-1974-JG',
        ],
        description: 'JG News Plus Rajasthan - 24x7 Latest News in Hindi',
    };
}
