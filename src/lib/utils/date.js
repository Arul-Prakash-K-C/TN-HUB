export function formatDate(dateString, locale = 'en') {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
export function formatDateTime(dateString, locale = 'en') {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1)
        return 'Just now';
    if (minutes < 60)
        return `${minutes}m ago`;
    if (hours < 24)
        return `${hours}h ago`;
    if (days < 7)
        return `${days}d ago`;
    return formatDate(dateString);
}
export function formatFileSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
