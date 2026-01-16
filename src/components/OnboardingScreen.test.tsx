/**
 * OnboardingScreen Component Tests
 * 
 * Tests for the OnboardingScreen component functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingScreen } from './OnboardingScreen';
import { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { StorageManager } from '../utils/StorageManager';

// Mock API client
const createMockAPIClient = () => {
    return {
        searchChannels: vi.fn().mockResolvedValue([
            {
                id: 'UC1',
                title: 'Test Channel 1',
                thumbnailUrl: 'https://example.com/thumb1.jpg',
                subscriberCount: 100000,
                uploadsPlaylistId: 'UU1'
            },
            {
                id: 'UC2',
                title: 'Test Channel 2',
                thumbnailUrl: 'https://example.com/thumb2.jpg',
                subscriberCount: 50000,
                uploadsPlaylistId: 'UU2'
            }
        ]),
        getChannelInfo: vi.fn(),
        getChannelVideos: vi.fn(),
        getVideoDetails: vi.fn()
    } as unknown as YouTubeAPIClient;
};

// Mock storage manager
const createMockStorageManager = () => {
    return {
        saveChannels: vi.fn(),
        loadChannels: vi.fn().mockReturnValue([]),
        clearChannels: vi.fn(),
        isFirstVisit: vi.fn().mockReturnValue(true),
        markVisited: vi.fn()
    } as unknown as StorageManager;
};

describe('OnboardingScreen', () => {
    it('renders welcome message and instructions', () => {
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        expect(screen.getByText('Welcome to Focused YouTube Viewer')).toBeInTheDocument();
        expect(screen.getByText(/Watch content from your favorite YouTube channels/)).toBeInTheDocument();
    });

    it('displays ChannelSearch component', () => {
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        expect(screen.getByPlaceholderText('Search for YouTube channels...')).toBeInTheDocument();
    });

    it('displays skip and complete buttons', () => {
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        expect(screen.getByText('Skip for Now')).toBeInTheDocument();
        expect(screen.getByText('Select at least one channel')).toBeInTheDocument();
    });

    it('complete button is disabled when no channels selected', () => {
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        const completeButton = screen.getByText('Select at least one channel');
        expect(completeButton).toBeDisabled();
    });

    it('handles skip button click', async () => {
        const user = userEvent.setup();
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        const skipButton = screen.getByText('Skip for Now');
        await user.click(skipButton);

        expect(storageManager.markVisited).toHaveBeenCalled();
        expect(onSkip).toHaveBeenCalled();
    });

    it('adds selected channel to list', async () => {
        const user = userEvent.setup();
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        // Search for channels
        const searchInput = screen.getByPlaceholderText('Search for YouTube channels...');
        await user.type(searchInput, 'test');

        // Wait for search results
        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
        });

        // Click on a channel
        const channelButton = screen.getByLabelText('Select Test Channel 1');
        await user.click(channelButton);

        // Verify channel appears in selected list
        await waitFor(() => {
            expect(screen.getByText('Selected Channels (1)')).toBeInTheDocument();
        });
    });

    it('removes channel from selected list', async () => {
        const user = userEvent.setup();
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        // Search and select a channel
        const searchInput = screen.getByPlaceholderText('Search for YouTube channels...');
        await user.type(searchInput, 'test');

        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
        });

        const channelButton = screen.getByLabelText('Select Test Channel 1');
        await user.click(channelButton);

        await waitFor(() => {
            expect(screen.getByText('Selected Channels (1)')).toBeInTheDocument();
        });

        // Remove the channel
        const removeButton = screen.getByLabelText('Remove Test Channel 1');
        await user.click(removeButton);

        // Verify channel is removed
        await waitFor(() => {
            expect(screen.queryByText('Selected Channels (1)')).not.toBeInTheDocument();
        });
    });

    it('handles complete button click with selected channels', async () => {
        const user = userEvent.setup();
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        // Search and select a channel
        const searchInput = screen.getByPlaceholderText('Search for YouTube channels...');
        await user.type(searchInput, 'test');

        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
        });

        const channelButton = screen.getByLabelText('Select Test Channel 1');
        await user.click(channelButton);

        await waitFor(() => {
            expect(screen.getByText('Selected Channels (1)')).toBeInTheDocument();
        });

        // Click complete button
        const completeButton = screen.getByText('Continue with 1 channel');
        await user.click(completeButton);

        // Verify storage and callbacks
        expect(storageManager.saveChannels).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'UC1',
                    title: 'Test Channel 1'
                })
            ])
        );
        expect(storageManager.markVisited).toHaveBeenCalled();
        expect(onComplete).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'UC1',
                    title: 'Test Channel 1'
                })
            ])
        );
    });

    it('updates complete button text based on selected channels count', async () => {
        const user = userEvent.setup();
        const apiClient = createMockAPIClient();
        const storageManager = createMockStorageManager();
        const onComplete = vi.fn();
        const onSkip = vi.fn();

        render(
            <OnboardingScreen
                apiClient={apiClient}
                storageManager={storageManager}
                onComplete={onComplete}
                onSkip={onSkip}
            />
        );

        // Initially disabled
        expect(screen.getByText('Select at least one channel')).toBeDisabled();

        // Search and select first channel
        const searchInput = screen.getByPlaceholderText('Search for YouTube channels...');
        await user.type(searchInput, 'test');

        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
        });

        const channel1Button = screen.getByLabelText('Select Test Channel 1');
        await user.click(channel1Button);

        await waitFor(() => {
            expect(screen.getByText('Continue with 1 channel')).toBeInTheDocument();
        });

        // Select second channel
        const channel2Button = screen.getByLabelText('Select Test Channel 2');
        await user.click(channel2Button);

        await waitFor(() => {
            expect(screen.getByText('Continue with 2 channels')).toBeInTheDocument();
        });
    });
});
