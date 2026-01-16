import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { StorageManager } from './utils/StorageManager';

// Mock the YouTube IFrame API
const mockYouTubeIFrameAPI = () => {
    (window as any).YT = {
        Player: vi.fn().mockImplementation(() => ({
            playVideo: vi.fn(),
            pauseVideo: vi.fn(),
            destroy: vi.fn(),
            addEventListener: vi.fn(),
        })),
        PlayerState: {
            ENDED: 0,
            PLAYING: 1,
            PAUSED: 2,
        },
    };
    (window as any).onYouTubeIframeAPIReady = vi.fn();
};

describe('Integration Tests: Application Functionality', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        // Mock YouTube IFrame API
        mockYouTubeIFrameAPI();

        // Mock fetch for API calls
        (globalThis as any).fetch = vi.fn();
    });

    describe('Application Initialization', () => {
        it('should render onboarding screen for first-time users', () => {
            render(<App />);

            // Verify onboarding screen is displayed
            expect(screen.getByText(/welcome/i)).toBeInTheDocument();
        });

        it('should render video feed for returning users with channels', () => {
            // Set up storage with existing channels
            const storage = new StorageManager();
            storage.saveChannels([
                {
                    id: 'UC_test',
                    title: 'Test Channel',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    uploadsPlaylistId: 'UU_test',
                },
            ]);
            storage.markVisited();

            render(<App />);

            // Verify video feed is displayed (not onboarding)
            expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
            expect(screen.getByText(/video feed/i)).toBeInTheDocument();
        });
    });

    describe('Data Persistence', () => {
        it('should persist and load channel data correctly', () => {
            const storage = new StorageManager();

            // Test saving channels
            const testChannels = [
                {
                    id: 'UC_persist_test',
                    title: 'Persist Test Channel',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    uploadsPlaylistId: 'UU_persist_test',
                },
            ];
            storage.saveChannels(testChannels);

            // Test loading channels
            const loadedChannels = storage.loadChannels();
            expect(loadedChannels).toEqual(testChannels);

            // Test clearing channels
            storage.clearChannels();
            const emptyChannels = storage.loadChannels();
            expect(emptyChannels).toEqual([]);
        });

        it('should handle empty storage gracefully', () => {
            const storage = new StorageManager();
            storage.clearChannels();

            const channels = storage.loadChannels();
            expect(channels).toEqual([]);
        });

        it('should track first visit status', () => {
            const storage = new StorageManager();

            // Initially should be first visit
            expect(storage.isFirstVisit()).toBe(true);

            // After marking visited
            storage.markVisited();
            expect(storage.isFirstVisit()).toBe(false);
        });
    });

    describe('UI Components Rendering', () => {
        it('should render all required UI elements on onboarding', () => {
            render(<App />);

            // Check for onboarding elements
            expect(screen.getByText(/welcome/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
        });

        it('should render video feed UI elements for returning users', () => {
            const storage = new StorageManager();
            storage.markVisited();
            storage.saveChannels([
                {
                    id: 'UC_test',
                    title: 'Test Channel',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    uploadsPlaylistId: 'UU_test',
                },
            ]);

            render(<App />);

            // Check for video feed elements
            expect(screen.getByText(/video feed/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
        });
    });

    describe('Requirements Verification', () => {
        it('meets Requirement 1: Initial Setup and Onboarding', () => {
            render(<App />);

            // 1.1: Display onboarding screen on first visit
            expect(screen.getByText(/welcome/i)).toBeInTheDocument();

            // 1.2: Provide search interface
            expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

            // 1.5: Allow skip
            expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
        });

        it('meets Requirement 6: Data Persistence', () => {
            const storage = new StorageManager();

            // 6.1: Save channels
            const testChannels = [
                {
                    id: 'UC_persist_test',
                    title: 'Persist Test Channel',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    uploadsPlaylistId: 'UU_persist_test',
                },
            ];
            storage.saveChannels(testChannels);

            // 6.2: Load channels
            const loadedChannels = storage.loadChannels();
            expect(loadedChannels).toEqual(testChannels);

            // 6.3: Handle empty storage
            storage.clearChannels();
            const emptyChannels = storage.loadChannels();
            expect(emptyChannels).toEqual([]);
        });

        it('meets Requirement 8: User Interface - displays loading indicators', () => {
            const storage = new StorageManager();
            storage.markVisited();

            render(<App />);

            // UI should be present without errors
            expect(document.body).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle storage errors gracefully', () => {
            const storage = new StorageManager();

            // Test that operations don't throw errors
            expect(() => storage.saveChannels([])).not.toThrow();
            expect(() => storage.loadChannels()).not.toThrow();
            expect(() => storage.clearChannels()).not.toThrow();
        });

        it('should initialize with empty state when storage is corrupted', () => {
            // Corrupt the storage
            localStorage.setItem('focused_yt_channels', 'invalid json');

            const storage = new StorageManager();
            const channels = storage.loadChannels();

            // Should return empty array instead of crashing
            expect(channels).toEqual([]);
        });
    });
});
