/**
 * LoadingSpinner Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default props', () => {
        render(<LoadingSpinner />);

        // Check for screen reader text
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(<LoadingSpinner message="Loading videos..." />);

        expect(screen.getByText('Loading videos...')).toBeInTheDocument();
    });

    it('renders with small size', () => {
        const { container } = render(<LoadingSpinner size="small" />);

        const spinner = container.querySelector('.loading-spinner--small');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with medium size by default', () => {
        const { container } = render(<LoadingSpinner />);

        const spinner = container.querySelector('.loading-spinner--medium');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with large size', () => {
        const { container } = render(<LoadingSpinner size="large" />);

        const spinner = container.querySelector('.loading-spinner--large');
        expect(spinner).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        const { container } = render(<LoadingSpinner message="Loading..." />);

        const statusContainer = container.querySelector('[role="status"]');
        expect(statusContainer).toBeInTheDocument();
        expect(statusContainer).toHaveAttribute('aria-live', 'polite');
    });
});
