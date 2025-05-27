
export const ERROR_MESSAGES = {
    // Recording errors
    RECORDING_FAILED: 'Failed to start recording. Please try again.',
    RECORDING_SAVE_FAILED: 'Unable to save recording',
    PLAYBACK_FAILED: 'Unable to play recording.',

    // Storage errors
    STORAGE_FULL: 'Device storage is full.',
    FILE_NOT_FOUND: 'Recording not found',

    // Network errors
    NETWORK_ERROR: 'No internet connection',
    SERVER_ERROR: 'Server error. Please try again later.',

    // General errors
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
    PERMISSION_DENIED: 'Permission required to use this feature',
    INVALID_INPUT: 'Please enter valid information.'
} as const;

export const ERROR_CODES = {
    RECORDING_FAILED: 1001,
    RECORDING_SAVE_FAILED: 1002,
    PLAYBACK_FAILED: 2001,
    STORAGE_FULL: 3001,
    FILE_NOT_FOUND: 3002,
    NETWORK_ERROR: 4001,
    SERVER_ERROR: 4002,
    UNKNOWN_ERROR: 9001,
    PERMISSION_DENIED: 5001,
    INVALID_INPUT: 7001
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type ErrorCodeKey = keyof typeof ERROR_CODES;