
/**
 * Sanitize user input by removing potentially dangerous characters
 * @param input - The input string to sanitize
 */
export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove HTML tags and trim whitespace
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
};

/**
 * Validate email format
 * @param email - Email address to validate
 */
export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate recording filename to prevent path traversal
 * @param filename - The filename to validate
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename || typeof filename !== 'string') {
        return 'recording';
    }

    // Remove path separators and dangerous characters
    return filename
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\.\./g, '')
        .trim() || 'recording';
};

/**
 * Generate secure random string for IDs
 * @param length - Length of the string to generate
 */
export const generateSecureId = (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

/**
 * Validate and sanitize recording duration
 * @param duration - Duration in milliseconds
 */
export const validateRecordingDuration = (duration: number): number => {
    const MAX_DURATION = 3600000; // 1 hour in milliseconds
    const MIN_DURATION = 0;

    if (typeof duration !== 'number' || isNaN(duration)) {
        return 0;
    }

    return Math.max(MIN_DURATION, Math.min(duration, MAX_DURATION));
};