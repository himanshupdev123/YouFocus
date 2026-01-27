/**
 * App Component Tests
 * 
 * Tests for the main App component including:
 * - Initialization and first visit detection
 * - Navigation between views
 * - Channel management integration
 * - API key validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the StorageManager
vi.mock('./utils/StorageManager', () => {
    const MockStorageManager = vi.fn(function () {
        return {
            loadChannels: vi.fn().mockReturnValue([]),
            saveChannels: vi.fn(),
            clearChannels: vi.fn(),
            isFirstVisit: vi.fn().mockReturnValue(true),
            markVisited: vi.fn(),
        };
    });

    return {
        StorageManager: MockStorageManager,
        StorageError: class StorageError extends Error {
            constructor(message: string) {
                super(message);
                this.name = 'StorageError';
            }
        },
    };
});

// Mock the YouTubeAPIClient
vi.mock('./services/YouTubeAPIClient', () => {
    const MockYouTubeAPIClient = vi.fn(function () {
        return {
            searchChannels: vi.fn().mockResolvedValue([]),
            getChannelInfo: vi.fn().mockResolvedValue({
                id: 'UC123',
                title: 'Test Channel',
                thumbnailUrl: 'https://example.com/thumb.jpg',
                subscriberCount: 1000,
                uploadsPlaylistId: 'UU123',
            }),
            getChannelVideos: vi.fn().mockResolvedValue([]),
            getVideoDetails: vi.fn().mockResolvedValue([]),
        };
    });

    return {
        YouTubeAPIClient: MockYouTubeAPIClient,
    };
});

describe('App', () => {
    const originalEnv = import.meta.env.VITE_YOUTUBE_API_KEY;

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original environment
        Object.defineProperty(import.meta, 'env', {
            value: { ...import.meta.env, VITE_YOUTUBE_API_KEY: originalEnv },
            writable: true
        });
    });

    it('should show onboarding screen for first-time users', async () => {
        // Mock environment with valid API key
        Object.defineProperty(import.meta, 'env', {
            value: { ...import.meta.env, VITE_YOUTUBE_API_KEY: 'AIzaSyC1234567890123456789012345678901' },
            writable: true
        });

        render(<App />);

        // Wait for initialization to complete
        await waitFor(() => {
            expect(screen.getByText(/welcome to focused youtube viewer/i)).toBeInTheDocument();
        });
    });

    it('should show API key error when API key is not configured', async () => {
        // Mock environment with empty API key
        Object.defineProperty(import.meta, 'env', {
            value: { ...import.meta.env, VITE_YOUTUBE_API_KEY: '' },
            writable: true
        });

        render(<App />);

        // Wait for error to be displayed
        await waitFor(() => {
            expect(screen.getByText(/api key is missing/i)).toBeInTheDocument();
        });

        // Should show instructions
        expect(screen.getByText(/how to set up your youtube api key/i)).toBeInTheDocument();
    });
});
