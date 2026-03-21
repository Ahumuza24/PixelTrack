/**
 * MIME types considered as images for preview/thumbnail purposes
 */
export const IMAGE_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
    'image/gif',
])

/**
 * Accepted file types for upload
 */
export const ACCEPTED_FILE_TYPES = Array.from(IMAGE_MIME_TYPES).concat('application/pdf')

/**
 * Max file size in bytes (25 MB)
 */
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
