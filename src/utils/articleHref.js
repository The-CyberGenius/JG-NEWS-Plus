/**
 * Build article URL — prefer slug for SEO, fall back to id.
 * Always returns "/article/<slug-or-id>"
 */
export const articleHref = (article) => {
    if (!article) return '/';
    const ref = article.slug || article.id || article._id;
    return `/article/${ref}`;
};
