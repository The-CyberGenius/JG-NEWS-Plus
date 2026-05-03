// Cloudinary image URL optimizer
// Adds f_auto (best format: WebP/AVIF) and q_auto (smart compression) transformations
// Optionally sets width for srcset.

const FALLBACK = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

/**
 * Optimize an image URL.
 * - Cloudinary URLs: inject f_auto,q_auto[,w_<width>] transformation
 * - Unsplash URLs: append/replace ?w= and ?q= params
 * - Other URLs: returned as-is
 */
export function optimizeImage(url, { width, height, quality = 'auto' } = {}) {
    if (!url) return FALLBACK;

    try {
        // Cloudinary: https://res.cloudinary.com/<cloud>/<resource>/<type>/[transforms/]<publicId>
        if (url.includes('res.cloudinary.com')) {
            const transforms = ['f_auto', `q_${quality}`];
            if (width) transforms.push(`w_${width}`);
            if (height) transforms.push(`h_${height},c_fill`);
            const transform = transforms.join(',');

            // Insert after /upload/ or /image/upload/ etc.
            // Pattern: .../<resource>/<type>/[v123/]<rest>
            const match = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/[^/]+\/[^/]+)\/(.*)$/);
            if (match) {
                const [, base, rest] = match;
                // If there's already a transform like v123 or t_..., prepend our transform
                return `${base}/${transform}/${rest}`;
            }
            return url;
        }

        // Unsplash: handle ?w= param
        if (url.includes('images.unsplash.com')) {
            const u = new URL(url);
            if (width) u.searchParams.set('w', width);
            u.searchParams.set('q', quality === 'auto' ? '80' : quality);
            u.searchParams.set('auto', 'format,compress');
            return u.toString();
        }

        // Other URLs returned as-is
        return url;
    } catch {
        return url;
    }
}

/**
 * Generate srcset string for responsive images.
 */
export function srcSet(url, widths = [400, 800, 1200]) {
    if (!url) return '';
    return widths
        .map(w => `${optimizeImage(url, { width: w })} ${w}w`)
        .join(', ');
}
