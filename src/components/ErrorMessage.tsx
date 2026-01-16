/**
 * ErrorMessage Component
 * 
 * Displays user-friendly error messages with optional retry functionality.
 * Supports different error types (API errors, storage errors) and provides
 * appropriate actions based on whether the error is retryable.
 * 
 * Requirements: 5.5, 6.4
 */

import { useCallback } from 'react';
import type { APIError } from '../types';
import { StorageError } from '../utils/StorageManager';
import './ErrorMessage.css';

export interface ErrorMessageProps {
    /** Error object (APIError, StorageError, or Error) */
    error: APIError | StorageError | Error | string;
    /** Optional callback for retry action */
    onRetry?: () => void;
    /** Optional callback for dismiss action */
    onDismiss?: () => void;
    /** Optional custom title for the error */
    title?: string;
    /** Size variant */
    size?: 'small' | 'medium' | 'large';
}

/**
 * Type guard to check if error is an APIError
 */
function isAPIError(error: unknown): error is APIError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        'userMessage' in error &&
        'retryable' in error
    );
}

/**
 * Type guard to check if error is a StorageError
 */
function isStorageError(error: unknown): error is StorageError {
    return error instanceof StorageError;
}

/**
 * ErrorMessage component for displaying errors with retry functionality
 */
export function ErrorMessage({
    error,
    onRetry,
    onDismiss,
    title,
    size = 'medium'
}: ErrorMessageProps) {
    // Extract error information
    const getErrorInfo = useCallback(() => {
        if (typeof error === 'string') {
            return {
                title: title || 'Error',
                message: error,
                retryable: false,
                isStorageError: false
            };
        }

        if (isAPIError(error)) {
            return {
                title: title || 'API Error',
                message: error.userMessage,
                retryable: error.retryable,
                isStorageError: false
            };
        }

        if (isStorageError(error)) {
            return {
                title: title || 'Storage Error',
                message: error.message,
                retryable: false,
                isStorageError: true
            };
        }

        // Generic Error object - check before narrowing type
        const errorObj = error as Error;
        return {
            title: title || 'Error',
            message: errorObj.message || 'An unexpected error occurred',
            retryable: false,
            isStorageError: false
        };
    }, [error, title]);

    const errorInfo = getErrorInfo();

    // Handle retry button click
    const handleRetry = useCallback(() => {
        if (onRetry) {
            onRetry();
        }
    }, [onRetry]);

    // Handle dismiss button click
    const handleDismiss = useCallback(() => {
        if (onDismiss) {
            onDismiss();
        }
    }, [onDismiss]);

    return (
        <div
            className={`error-message error-message--${size}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="error-message__icon">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
            </div>

            <div className="error-message__content">
                <h3 className="error-message__title">{errorInfo.title}</h3>
                <p className="error-message__text">{errorInfo.message}</p>

                {errorInfo.isStorageError && (
                    <p className="error-message__hint">
                        Try clearing your browser's local storage or using a different browser.
                    </p>
                )}
            </div>

            <div className="error-message__actions">
                {errorInfo.retryable && onRetry && (
                    <button
                        className="error-message__button error-message__button--retry"
                        onClick={handleRetry}
                        aria-label="Retry"
                    >
                        Retry
                    </button>
                )}

                {onDismiss && (
                    <button
                        className="error-message__button error-message__button--dismiss"
                        onClick={handleDismiss}
                        aria-label="Dismiss error"
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}
