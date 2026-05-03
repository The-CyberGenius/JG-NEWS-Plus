import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://jgnews.live';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

export function SEO({
    title,
    description = 'JG News Plus Rajasthan - 24x7 Latest News in Hindi. निडर • निष्पक्ष • निर्भीक',
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    publishedAt,
    modifiedAt,
    author,
    keywords,
    structuredData,
}) {
    const fullTitle = title ? `${title} | JG News Plus` : 'JG News Plus Rajasthan | 24x7 News';
    const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonical} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="JG News Plus" />
            <meta property="og:locale" content="hi_IN" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:site" content="@jgnewslive" />

            {/* Article-specific */}
            {type === 'article' && publishedAt && (
                <meta property="article:published_time" content={publishedAt} />
            )}
            {type === 'article' && modifiedAt && (
                <meta property="article:modified_time" content={modifiedAt} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
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
            '@id': `${SITE_URL}/article/${article.id || article._id}`,
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
            'https://www.instagram.com/jgnewsrajasthan/',
            'https://x.com/jgnewslive',
            'https://www.youtube.com/@JGNewsPlus',
        ],
        description: 'JG News Plus Rajasthan - 24x7 Latest News in Hindi',
    };
}
