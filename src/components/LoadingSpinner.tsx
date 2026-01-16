/**
 * LoadingSpinner Component
 * 
 * A reusable loading indicator component that displays a spinner
 * with an optional message. Used across the application to indicate
 * loading states during asynchronous operations.
 * 
 * Requirements: 8.3
 */

import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
    /** Optional message to display below the spinner */
    message?: string;
    /** Size variant of the spinner */
    size?: 'small' | 'medium' | 'large';
}

/**
 * LoadingSpinner component - displays a loading indicator
 */
export function LoadingSpinner({ message, size = 'medium' }: LoadingSpinnerProps) {
    return (
        <div className="loading-spinner-container" role="status" aria-live="polite">
            <div className={`loading-spinner loading-spinner--${size}`} aria-hidden="true"></div>
            {message && <p className="loading-message">{message}</p>}
            <span className="sr-only">Loading...</span>
        </div>
    );
}
