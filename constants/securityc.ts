
export const SECURITY_CONSTANTS = {
    // Recording limits
    MAX_RECORDING_DURATION: 3600000, // 1 hour in milliseconds
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_RECORDINGS: 100, // Maximum number of recordings per user

    // Input validation
    MAX_FILENAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,

    // API security
    API_TIMEOUT: 10000, // 10 seconds
    MAX_RETRY_ATTEMPTS: 3,

    // File naming
    ALLOWED_FILE_EXTENSIONS: ['.mp3', '.wav', '.m4a', '.aac'],
    FORBIDDEN_CHARACTERS: /[\/\\:*?"<>|]/g,

    // Error messages (avoid exposing sensitive information)
    ERROR_MESSAGES: {
        INVALID_INPUT: 'Invalid input provided',
        FILE_TOO_LARGE: 'File size exceeds limit',
        DURATION_TOO_LONG: 'Recording duration exceeds maximum allowed time',
        STORAGE_FULL: 'Storage limit reached',
        NETWORK_ERROR: 'Network connection error'
    }
} as const;

export const VALIDATION_RULES = {
    filename: {
        minLength: 1,
        maxLength: SECURITY_CONSTANTS.MAX_FILENAME_LENGTH,
        pattern: /^[a-zA-Z0-9\s\-_()]+$/
    },

    description: {
        minLength: 0,
        maxLength: SECURITY_CONSTANTS.MAX_DESCRIPTION_LENGTH
    }
} as const;