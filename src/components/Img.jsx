import React from 'react';
import { optimizeImage, srcSet } from '../utils/imageUrl';

/**
 * Optimized image component.
 * - Auto Cloudinary format/quality transforms
 * - Lazy-load by default
 * - Responsive srcset
 *
 * Usage: <Img src={article.image} alt={article.title} width={800} sizes="(max-width: 768px) 100vw, 50vw" />
 */
export default function Img({
    src,
    alt = '',
    width,
    height,
    sizes,
    eager = false,
    style,
    className,
    ...rest
}) {
    const optimized = optimizeImage(src, { width, height });
    const set = srcSet(src);

    return (
        <img
            src={optimized}
            srcSet={set}
            sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            style={style}
            className={className}
            {...rest}
        />
    );
}
