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
