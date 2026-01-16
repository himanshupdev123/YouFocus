/**
 * Unit tests for ChannelSearch component
 * Tests search input, debouncing, loading states, error handling, and channel selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChannelSearch } from './ChannelSearch';
import type { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import type { Channel, APIError } from '../types';

// Mock API client
const createMockAPIClient = (): YouTubeAPIClient => {
    return {
        searchChannels: vi.fn(),
        getChannelInfo: vi.fn(),
        getChannelVideos: vi.fn(),
        getVideoDetails: vi.fn(),
    } as any;
};

// Sample channel data
const mockChannels: Channel[] = [
    {
        id: 'UC1',
        title: 'Test Channel 1',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        subscriberCount: 1500000,
        uploadsPlaylistId: 'UU1'
    },
    {
        id: 'UC2',
        title: 'Test Channel 2',
        thumbnailUrl: 'https://example.com/thumb2.jpg',
        subscriberCount: 50000,
        uploadsPlaylistId: 'UU2'
    }
];

describe('ChannelSearch', () => {
    let mockAPIClient: YouTubeAPIClient;
    let mockOnChannelSelect: (channel: Channel) => void;

    beforeEach(() => {
        mockAPIClient = createMockAPIClient();
        mockOnChannelSelect = vi.fn();
        vi.clearAllMocks();
    });

    it('renders search input', () => {
        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        expect(input).toBeDefined();
    });

    it('debounces search input (300ms)', async () => {
        const user = userEvent.setup();
        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue(mockChannels);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);

        // Type quickly
        await user.type(input, 'test');

        // Should not call API immediately
        expect(mockAPIClient.searchChannels).not.toHaveBeenCalled();

        // Wait for debounce (300ms)
        await waitFor(() => {
            expect(mockAPIClient.searchChannels).toHaveBeenCalledWith('test');
        }, { timeout: 500 });

        // Should only be called once despite multiple keystrokes
        expect(mockAPIClient.searchChannels).toHaveBeenCalledTimes(1);
    });

    it('displays loading state during search', async () => {
        const user = userEvent.setup();

        // Create a promise that we can control
        let resolveSearch: (value: Channel[]) => void;
        const searchPromise = new Promise<Channel[]>((resolve) => {
            resolveSearch = resolve;
        });

        vi.mocked(mockAPIClient.searchChannels).mockReturnValue(searchPromise);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'test channel');

        // Wait for debounce and loading state to appear
        await waitFor(() => {
            expect(screen.getByText(/searching for channels/i)).toBeDefined();
        }, { timeout: 500 });

        // Resolve the search
        resolveSearch!(mockChannels);

        // Loading state should disappear
        await waitFor(() => {
            expect(screen.queryByText(/searching for channels/i)).toBeNull();
        });
    });

    it('displays search results with thumbnails, names, and subscriber counts', async () => {
        const user = userEvent.setup();
        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue(mockChannels);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'test');

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeDefined();
        }, { timeout: 500 });

        // Check all required fields are displayed
        expect(screen.getByText('Test Channel 1')).toBeDefined();
        expect(screen.getByText('Test Channel 2')).toBeDefined();
        expect(screen.getByText('1.5M subscribers')).toBeDefined();
        expect(screen.getByText('50.0K subscribers')).toBeDefined();

        // Check thumbnails are rendered
        const thumbnails = screen.getAllByRole('img');
        expect(thumbnails.length).toBe(2);
        expect(thumbnails[0].getAttribute('src')).toBe('https://example.com/thumb1.jpg');
    });

    it('handles channel selection', async () => {
        const user = userEvent.setup();
        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue(mockChannels);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'test');

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeDefined();
        }, { timeout: 500 });

        // Click on first channel
        const channelButton = screen.getByLabelText(/select test channel 1/i);
        await user.click(channelButton);

        // Verify callback was called with correct channel
        expect(mockOnChannelSelect).toHaveBeenCalledWith(mockChannels[0]);
    });

    it('displays error message for failed searches', async () => {
        const user = userEvent.setup();
        const mockError: APIError = {
            code: 403,
            message: 'Quota exceeded',
            userMessage: 'YouTube API quota exceeded. Please try again later.',
            retryable: false
        };

        vi.mocked(mockAPIClient.searchChannels).mockRejectedValue(mockError);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'test');

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/youtube api quota exceeded/i)).toBeDefined();
        }, { timeout: 500 });

        // Results should not be displayed
        expect(screen.queryByText('Test Channel 1')).toBeNull();
    });

    it('shows selected badge for already selected channels', async () => {
        const user = userEvent.setup();
        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue(mockChannels);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
                selectedChannels={[mockChannels[0]]}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'test');

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('Test Channel 1')).toBeDefined();
        }, { timeout: 500 });

        // First channel should show selected badge
        expect(screen.getByText('✓ Selected')).toBeDefined();

        // Button should be disabled
        const channelButton = screen.getByLabelText(/select test channel 1/i);
        expect(channelButton.hasAttribute('disabled')).toBe(true);
    });

    it('does not search for queries shorter than 2 characters', async () => {
        const user = userEvent.setup();
        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue(mockChannels);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'a');

        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 400));

        // Should not call API
        expect(mockAPIClient.searchChannels).not.toHaveBeenCalled();
    });

    it('displays no results message when search returns empty array', async () => {
        const user = userEvent.setup();
        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue([]);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'nonexistent');

        // Wait for no results message
        await waitFor(() => {
            expect(screen.getByText(/no channels found/i)).toBeDefined();
        }, { timeout: 500 });
    });

    it('formats subscriber counts correctly', async () => {
        const user = userEvent.setup();
        const channelsWithVariousCounts: Channel[] = [
            {
                id: 'UC1',
                title: 'Small Channel',
                thumbnailUrl: 'https://example.com/thumb1.jpg',
                subscriberCount: 500,
                uploadsPlaylistId: 'UU1'
            },
            {
                id: 'UC2',
                title: 'Medium Channel',
                thumbnailUrl: 'https://example.com/thumb2.jpg',
                subscriberCount: 5000,
                uploadsPlaylistId: 'UU2'
            },
            {
                id: 'UC3',
                title: 'Large Channel',
                thumbnailUrl: 'https://example.com/thumb3.jpg',
                subscriberCount: 5000000,
                uploadsPlaylistId: 'UU3'
            },
            {
                id: 'UC4',
                title: 'Unknown Channel',
                thumbnailUrl: 'https://example.com/thumb4.jpg',
                subscriberCount: undefined,
                uploadsPlaylistId: 'UU4'
            }
        ];

        vi.mocked(mockAPIClient.searchChannels).mockResolvedValue(channelsWithVariousCounts);

        render(
            <ChannelSearch
                apiClient={mockAPIClient}
                onChannelSelect={mockOnChannelSelect}
            />
        );

        const input = screen.getByPlaceholderText(/search for youtube channels/i);
        await user.type(input, 'test');

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('500 subscribers')).toBeDefined();
        }, { timeout: 500 });

        expect(screen.getByText('5.0K subscribers')).toBeDefined();
        expect(screen.getByText('5.0M subscribers')).toBeDefined();
        expect(screen.getByText('Unknown subscribers')).toBeDefined();
    });
});
