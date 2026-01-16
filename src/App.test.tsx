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
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();

        // Set up environment variable for API key (valid format)
        import.meta.env.VITE_YOUTUBE_API_KEY = 'AIzaSyC1234567890123456789012345678901';
    });

    it('should show onboarding screen for first-time users', async () => {
        // Set a valid API key
        import.meta.env.VITE_YOUTUBE_API_KEY = 'AIzaSyC1234567890123456789012345678901';

        render(<App />);

        // Wait for initialization to complete
        await waitFor(() => {
            expect(screen.getByText(/welcome to focused youtube viewer/i)).toBeInTheDocument();
        });
    });

    it('should show API key error when API key is not configured', async () => {
        // Remove API key
        import.meta.env.VITE_YOUTUBE_API_KEY = '';

        render(<App />);

        // Wait for error to be displayed
        await waitFor(() => {
            expect(screen.getByText(/api key is missing/i)).toBeInTheDocument();
        });

        // Should show instructions
        expect(screen.getByText(/how to set up your youtube api key/i)).toBeInTheDocument();

        // Restore API key for other tests
        import.meta.env.VITE_YOUTUBE_API_KEY = 'AIzaSyC1234567890123456789012345678901';
    });
});
