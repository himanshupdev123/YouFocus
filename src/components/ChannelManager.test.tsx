/**
 * ChannelManager Component Tests
 * 
 * Tests for the ChannelManager component functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChannelManager } from './ChannelManager';
import { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { StorageManager } from '../utils/StorageManager';
import type { Channel } from '../types';

// Mock the API client
vi.mock('../services/YouTubeAPIClient');
vi.mock('../utils/StorageManager');

describe('ChannelManager', () => {
    let mockApiClient: YouTubeAPIClient;
    let mockStorageManager: StorageManager;
    let mockOnAddChannel: (channel: Channel) => void;
    let mockOnRemoveChannel: (channelId: string) => void;
    let mockChannels: Channel[];

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create mock instances
        mockApiClient = new YouTubeAPIClient({ apiKey: 'test-key' });
        mockStorageManager = new StorageManager();

        // Create mock callbacks with proper typing
        mockOnAddChannel = vi.fn();
        mockOnRemoveChannel = vi.fn();

        // Create mock channels
        mockChannels = [
            {
                id: 'UC123',
                title: 'Test Channel 1',
                thumbnailUrl: 'https://example.com/thumb1.jpg',
                subscriberCount: 1000000,
                uploadsPlaylistId: 'UU123'
            },
            {
                id: 'UC456',
                title: 'Test Channel 2',
                thumbnailUrl: 'https://example.com/thumb2.jpg',
                subscriberCount: 500000,
                uploadsPlaylistId: 'UU456'
            }
        ];

        // Mock storage manager methods
        vi.spyOn(mockStorageManager, 'saveChannels').mockImplementation(() => { });
    });

    it('renders the component with channel list', () => {
        render(
            <ChannelManager
                channels={mockChannels}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        // Check that the component renders
        expect(screen.getByText('Add Channel')).toBeInTheDocument();
        expect(screen.getByText('Your Channels (2)')).toBeInTheDocument();

        // Check that channels are displayed
        expect(screen.getByText('Test Channel 1')).toBeInTheDocument();
        expect(screen.getByText('Test Channel 2')).toBeInTheDocument();
        expect(screen.getByText('1.0M subscribers')).toBeInTheDocument();
        expect(screen.getByText('500.0K subscribers')).toBeInTheDocument();
    });

    it('displays empty state when no channels', () => {
        render(
            <ChannelManager
                channels={[]}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        expect(screen.getByText('Your Channels (0)')).toBeInTheDocument();
        expect(screen.getByText('No channels added yet. Add your first channel above!')).toBeInTheDocument();
    });

    it('shows error when trying to add empty input', async () => {
        render(
            <ChannelManager
                channels={[]}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const addButton = screen.getByRole('button', { name: 'Add channel' });

        // Button should be disabled when input is empty
        expect(addButton).toBeDisabled();

        // Try entering whitespace only
        const input = screen.getByPlaceholderText(/Enter channel URL or ID/i);
        fireEvent.change(input, { target: { value: '   ' } });

        // Button should still be disabled for whitespace-only input
        expect(addButton).toBeDisabled();
    });

    it('calls onAddChannel when valid channel ID is provided', async () => {
        const mockChannel: Channel = {
            id: 'UC789',
            title: 'New Channel',
            thumbnailUrl: 'https://example.com/thumb3.jpg',
            subscriberCount: 250000,
            uploadsPlaylistId: 'UU789'
        };

        vi.spyOn(mockApiClient, 'getChannelInfo').mockResolvedValue(mockChannel);

        render(
            <ChannelManager
                channels={[]}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const input = screen.getByPlaceholderText(/Enter channel URL or ID/i);
        const addButton = screen.getByRole('button', { name: 'Add channel' });

        fireEvent.change(input, { target: { value: 'UC789' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(mockOnAddChannel).toHaveBeenCalledWith(mockChannel);
            expect(mockStorageManager.saveChannels).toHaveBeenCalled();
        });
    });

    it('calls onRemoveChannel when remove button is clicked', () => {
        render(
            <ChannelManager
                channels={mockChannels}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        fireEvent.click(removeButtons[0]);

        expect(mockOnRemoveChannel).toHaveBeenCalledWith('UC123');
        expect(mockStorageManager.saveChannels).toHaveBeenCalled();
    });

    it('displays channel thumbnails', () => {
        render(
            <ChannelManager
                channels={mockChannels}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const thumbnails = screen.getAllByRole('img');
        expect(thumbnails).toHaveLength(2);
        expect(thumbnails[0]).toHaveAttribute('src', 'https://example.com/thumb1.jpg');
        expect(thumbnails[1]).toHaveAttribute('src', 'https://example.com/thumb2.jpg');
    });

    it('shows error when channel is already in list', async () => {
        const existingChannel = mockChannels[0];
        vi.spyOn(mockApiClient, 'getChannelInfo').mockResolvedValue(existingChannel);

        render(
            <ChannelManager
                channels={mockChannels}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const input = screen.getByPlaceholderText(/Enter channel URL or ID/i);
        const addButton = screen.getByRole('button', { name: 'Add channel' });

        fireEvent.change(input, { target: { value: 'UC123' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('This channel is already in your list')).toBeInTheDocument();
            expect(mockOnAddChannel).not.toHaveBeenCalled();
        });
    });

    it('handles API errors gracefully', async () => {
        const apiError = {
            code: 404,
            message: 'Channel not found',
            userMessage: 'The channel you requested could not be found',
            retryable: false
        };

        vi.spyOn(mockApiClient, 'getChannelInfo').mockRejectedValue(apiError);

        render(
            <ChannelManager
                channels={[]}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const input = screen.getByPlaceholderText(/Enter channel URL or ID/i);
        const addButton = screen.getByRole('button', { name: 'Add channel' });

        fireEvent.change(input, { target: { value: 'UC999' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('The channel you requested could not be found')).toBeInTheDocument();
            expect(mockOnAddChannel).not.toHaveBeenCalled();
        });
    });

    it('clears input after successfully adding a channel', async () => {
        const mockChannel: Channel = {
            id: 'UC789',
            title: 'New Channel',
            thumbnailUrl: 'https://example.com/thumb3.jpg',
            subscriberCount: 250000,
            uploadsPlaylistId: 'UU789'
        };

        vi.spyOn(mockApiClient, 'getChannelInfo').mockResolvedValue(mockChannel);

        render(
            <ChannelManager
                channels={[]}
                onAddChannel={mockOnAddChannel}
                onRemoveChannel={mockOnRemoveChannel}
                apiClient={mockApiClient}
                storageManager={mockStorageManager}
            />
        );

        const input = screen.getByPlaceholderText(/Enter channel URL or ID/i) as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: 'Add channel' });

        fireEvent.change(input, { target: { value: 'UC789' } });
        expect(input.value).toBe('UC789');

        fireEvent.click(addButton);

        await waitFor(() => {
            expect(input.value).toBe('');
        });
    });
});
