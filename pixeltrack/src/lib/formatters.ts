/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

/**
 * Format date to short format (e.g., "Oct 24, 2023")
 */
export function formatShortDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Format date with time (e.g., "Oct 24, 2023, 2:15 PM")
 */
export function formatDateTime(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}
