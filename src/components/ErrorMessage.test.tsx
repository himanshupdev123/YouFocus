/**
 * ErrorMessage Component Tests
 * 
 * Tests for the ErrorMessage component including:
 * - Rendering with different error types
 * - Retry functionality
 * - Dismiss functionality
 * - Different size variants
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';
import type { APIError } from '../types';
import { StorageError } from '../utils/StorageManager';

describe('ErrorMessage', () => {
    it('renders with string error', () => {
        render(<ErrorMessage error="Test error message" />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders with APIError', () => {
        const apiError: APIError = {
            code: 404,
            message: 'Not found',
            userMessage: 'The requested resource was not found',
            retryable: false
        };

        render(<ErrorMessage error={apiError} />);

        expect(screen.getByText('The requested resource was not found')).toBeInTheDocument();
    });

    it('renders with StorageError', () => {
        const storageError = new StorageError('Storage quota exceeded');

        render(<ErrorMessage error={storageError} />);

        expect(screen.getByText('Storage quota exceeded')).toBeInTheDocument();
        expect(screen.getByText(/Try clearing your browser's local storage/)).toBeInTheDocument();
    });

    it('shows retry button for retryable APIError', () => {
        const apiError: APIError = {
            code: 500,
            message: 'Server error',
            userMessage: 'Server error occurred',
            retryable: true
        };

        const onRetry = vi.fn();
        render(<ErrorMessage error={apiError} onRetry={onRetry} />);

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
    });

    it('does not show retry button for non-retryable error', () => {
        const apiError: APIError = {
            code: 400,
            message: 'Bad request',
            userMessage: 'Invalid request',
            retryable: false
        };

        render(<ErrorMessage error={apiError} />);

        expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
        const user = userEvent.setup();
        const apiError: APIError = {
            code: 500,
            message: 'Server error',
            userMessage: 'Server error occurred',
            retryable: true
        };

        const onRetry = vi.fn();
        render(<ErrorMessage error={apiError} onRetry={onRetry} />);

        const retryButton = screen.getByRole('button', { name: /retry/i });
        await user.click(retryButton);

        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows dismiss button when onDismiss is provided', () => {
        const onDismiss = vi.fn();
        render(<ErrorMessage error="Test error" onDismiss={onDismiss} />);

        const dismissButton = screen.getByRole('button', { name: /dismiss/i });
        expect(dismissButton).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
        const user = userEvent.setup();
        const onDismiss = vi.fn();
        render(<ErrorMessage error="Test error" onDismiss={onDismiss} />);

        const dismissButton = screen.getByRole('button', { name: /dismiss/i });
        await user.click(dismissButton);

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders with custom title', () => {
        render(<ErrorMessage error="Test error" title="Custom Error Title" />);

        expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('applies correct size class', () => {
        const { container } = render(<ErrorMessage error="Test error" size="large" />);

        const errorElement = container.querySelector('.error-message--large');
        expect(errorElement).toBeInTheDocument();
    });

    it('renders with generic Error object', () => {
        const error = new Error('Generic error message');
        render(<ErrorMessage error={error} />);

        expect(screen.getByText('Generic error message')).toBeInTheDocument();
    });
});
