
import { ERROR_MESSAGES, ERROR_CODES, ErrorMessageKey } from '../constants/errorMessages';

export interface AppError {
    code: number;
    message: string;
    timestamp: Date;
    userMessage: string;
    technicalDetails?: string;
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: AppError[] = [];

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }


    //Log an error with details

    public logError(
        messageKey: ErrorMessageKey,
        technicalDetails?: string,
        originalError?: Error
    ): AppError {
        const code = this.getErrorCode(messageKey);
        const userMessage = ERROR_MESSAGES[messageKey];

        const appError: AppError = {
            code,
            message: messageKey,
            timestamp: new Date(),
            userMessage,
            technicalDetails: technicalDetails || originalError?.message
        };

        this.errorLog.push(appError);

        // Keep only the last 20 errors to prevent memory issues
        if (this.errorLog.length > 20) {
            this.errorLog = this.errorLog.slice(-20);
        }

        // Log to console in development
        if (__DEV__) {
            console.error(`[${code}] ${userMessage}`, {
                technicalDetails,
                originalError,
                timestamp: appError.timestamp
            });
        }

        return appError;
    }

     //Get user-friendly error message
    public getUserMessage(messageKey: ErrorMessageKey): string {
        return ERROR_MESSAGES[messageKey] || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

     //Get error code for tracking
    private getErrorCode(messageKey: ErrorMessageKey): number {
        return ERROR_CODES[messageKey] || ERROR_CODES.UNKNOWN_ERROR;
    }

     //Get recent error logs
    public getErrorLogs(limit: number = 10): AppError[] {
        return this.errorLog.slice(-limit);
    }

    public clearLogs(): void {
        this.errorLog = [];
    }

    public isCriticalError(messageKey: ErrorMessageKey): boolean {
        const criticalErrors: ErrorMessageKey[] = [
            'STORAGE_FULL',
            'PERMISSION_DENIED',
            'SERVER_ERROR'
        ];

        return criticalErrors.includes(messageKey);
    }

    public getErrorReport(): string {
        const recentErrors = this.getErrorLogs(10);

        if (recentErrors.length === 0) {
            return 'No errors recorded.';
        }

        let report = `Error Report (${recentErrors.length} errors)\n`;
        report += '='.repeat(30) + '\n\n';

        recentErrors.forEach((error, index) => {
            report += `${index + 1}. [${error.code}] ${error.userMessage}\n`;
            report += `   Time: ${error.timestamp.toISOString()}\n`;

            if (error.technicalDetails) {
                report += `   Details: ${error.technicalDetails}\n`;
            }

            report += '\n';
        });

        return report;
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const logError = (
    messageKey: ErrorMessageKey,
    technicalDetails?: string,
    originalError?: Error
): AppError => {
    return errorHandler.logError(messageKey, technicalDetails, originalError);
};

export const getUserErrorMessage = (messageKey: ErrorMessageKey): string => {
    return errorHandler.getUserMessage(messageKey);
};

export const isCriticalError = (messageKey: ErrorMessageKey): boolean => {
    return errorHandler.isCriticalError(messageKey);
};