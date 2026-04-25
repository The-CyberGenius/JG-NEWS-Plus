// Simple utility helpers
export function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'अभी';
    if (diff < 3600) return `${Math.floor(diff / 60)} मिनट पहले`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} घंटे पहले`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} दिन पहले`;
    return date.toLocaleDateString('hi-IN');
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('hi-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&q=80',
    'https://images.unsplash.com/photo-1529243856184-fd5465488984?w=800&q=80',
    'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&q=80'
];

export function getRandomFallbackImage() {
    const idx = Math.floor(Math.random() * FALLBACK_IMAGES.length);
    return FALLBACK_IMAGES[idx];
}
