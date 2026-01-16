/**
 * ErrorMessage Component Examples
 * 
 * Visual examples of the ErrorMessage component with different configurations
 */

import { ErrorMessage } from './ErrorMessage';
import type { APIError } from '../types';
import { StorageError } from '../utils/StorageManager';

export function ErrorMessageExamples() {
    // Example API errors
    const apiErrorRetryable: APIError = {
        code: 500,
        message: 'Internal server error',
        userMessage: 'YouTube service is temporarily unavailable. Please try again later.',
        retryable: true
    };

    const apiErrorNonRetryable: APIError = {
        code: 400,
        message: 'Bad request',
        userMessage: 'Invalid request. Please check your input and try again.',
        retryable: false
    };

    const quotaError: APIError = {
        code: 403,
        message: 'Quota exceeded',
        userMessage: 'YouTube API quota exceeded. Please try again later.',
        retryable: false
    };

    // Example storage error
    const storageError = new StorageError('Storage quota exceeded. Please clear some data.');

    // Example string error
    const stringError = 'An unexpected error occurred. Please try again.';

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>ErrorMessage Component Examples</h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2>API Error - Retryable</h2>
                <ErrorMessage
                    error={apiErrorRetryable}
                    onRetry={() => console.log('Retry clicked')}
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>API Error - Non-Retryable</h2>
                <ErrorMessage
                    error={apiErrorNonRetryable}
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>Quota Error</h2>
                <ErrorMessage
                    error={quotaError}
                    title="API Quota Exceeded"
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>Storage Error</h2>
                <ErrorMessage
                    error={storageError}
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>String Error</h2>
                <ErrorMessage
                    error={stringError}
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>Small Size</h2>
                <ErrorMessage
                    error="This is a small error message"
                    size="small"
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>Large Size</h2>
                <ErrorMessage
                    error={apiErrorRetryable}
                    size="large"
                    onRetry={() => console.log('Retry clicked')}
                    onDismiss={() => console.log('Dismiss clicked')}
                />
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>Without Actions</h2>
                <ErrorMessage error="This error has no action buttons" />
            </section>
        </div>
    );
}
