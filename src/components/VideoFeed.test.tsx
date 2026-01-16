/**
 * VideoFeed Component Tests
 * 
 * Unit tests for the VideoFeed component covering:
 * - Empty channel list handling
 * - Loading states
 * - Error handling
 * - Video display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoFeed } from './VideoFeed';
import type { Channel, Video } from '../types';
import type { YouTubeAPIClient } from '../services/YouTubeAPIClient';

describe('VideoFeed', () => {
    const mockChannel: Channel = {
        id: 'UC123',
        title: 'Test Channel',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        subscriberCount: 1000,
        uploadsPlaylistId: 'UU123'
    };

    const mockVideo: Video = {
        id: 'video1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/video-thumb.jpg',
        channelId: 'UC123',
        channelTitle: 'Test Channel',
        publishedAt: new Date('2024-01-15'),
        duration: 'PT4M13S',
        description: 'Test description'
    };

    let mockApiClient: YouTubeAPIClient;

    beforeEach(() => {
        mockApiClient = {
            getChannelVideos: vi.fn()
        } as any;
    });

    it('should display empty state when no channels are provided', () => {
        render(
            <VideoFeed
                channels={[]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        expect(screen.getByText('No channels added yet.')).toBeInTheDocument();
        expect(screen.getByText('Add some channels to start seeing videos!')).toBeInTheDocument();
    });

    it('should display loading indicator while fetching videos', async () => {
        (mockApiClient.getChannelVideos as any).mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve([mockVideo]), 100))
        );

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        expect(screen.getByText('Loading videos...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh/i })).toBeDisabled();
    });

    it('should display videos after successful fetch', async () => {
        (mockApiClient.getChannelVideos as any).mockResolvedValue([mockVideo]);

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Video')).toBeInTheDocument();
        });

        // Check for channel name in video card (not in dropdown)
        const videoCards = screen.getAllByRole('button');
        const videoCard = videoCards.find(card => card.textContent?.includes('Test Video'));
        expect(videoCard).toBeDefined();
        expect(videoCard?.textContent).toContain('Test Channel');
        expect(screen.getByAltText('Test Video')).toBeInTheDocument();
    });

    it('should display empty state when channels have no videos', async () => {
        (mockApiClient.getChannelVideos as any).mockResolvedValue([]);

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('No recent videos found.')).toBeInTheDocument();
        });

        expect(screen.getByText("Your channels haven't posted any videos in the last 30 days.")).toBeInTheDocument();
    });

    it('should handle individual channel failures gracefully', async () => {
        const error = {
            code: 500,
            message: 'Server error',
            userMessage: 'Failed to load videos',
            retryable: true
        };
        (mockApiClient.getChannelVideos as any).mockRejectedValue(error);

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        // When a channel fails, it should show empty state (no videos)
        // rather than an error, as the component handles individual channel failures gracefully
        await waitFor(() => {
            expect(screen.getByText('No recent videos found.')).toBeInTheDocument();
        });
    });

    it('should call onVideoSelect when video is clicked', async () => {
        const onVideoSelect = vi.fn();
        (mockApiClient.getChannelVideos as any).mockResolvedValue([mockVideo]);

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={onVideoSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Video')).toBeInTheDocument();
        });

        const videoCard = screen.getByRole('button', { name: /test video/i });
        await userEvent.click(videoCard);

        expect(onVideoSelect).toHaveBeenCalledWith('video1');
    });

    it('should refetch videos when refresh button is clicked', async () => {
        (mockApiClient.getChannelVideos as any).mockResolvedValue([mockVideo]);

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Video')).toBeInTheDocument();
        });

        expect(mockApiClient.getChannelVideos).toHaveBeenCalledTimes(1);

        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        await userEvent.click(refreshButton);

        await waitFor(() => {
            expect(mockApiClient.getChannelVideos).toHaveBeenCalledTimes(2);
        });
    });

    it('should sort videos by date descending', async () => {
        const video1: Video = { ...mockVideo, id: 'v1', title: 'Older Video', publishedAt: new Date('2024-01-10') };
        const video2: Video = { ...mockVideo, id: 'v2', title: 'Newer Video', publishedAt: new Date('2024-01-20') };
        const video3: Video = { ...mockVideo, id: 'v3', title: 'Newest Video', publishedAt: new Date('2024-01-25') };

        (mockApiClient.getChannelVideos as any).mockResolvedValue([video1, video2, video3]);

        render(
            <VideoFeed
                channels={[mockChannel]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Newest Video')).toBeInTheDocument();
        });

        const videoTitles = screen.getAllByRole('heading', { level: 3 });
        expect(videoTitles[0]).toHaveTextContent('Newest Video');
        expect(videoTitles[1]).toHaveTextContent('Newer Video');
        expect(videoTitles[2]).toHaveTextContent('Older Video');
    });

    it('should fetch videos from multiple channels', async () => {
        const channel1: Channel = { ...mockChannel, id: 'UC1', title: 'Channel 1' };
        const channel2: Channel = { ...mockChannel, id: 'UC2', title: 'Channel 2' };

        const video1: Video = { ...mockVideo, id: 'v1', channelId: 'UC1', channelTitle: 'Channel 1' };
        const video2: Video = { ...mockVideo, id: 'v2', channelId: 'UC2', channelTitle: 'Channel 2' };

        (mockApiClient.getChannelVideos as any)
            .mockResolvedValueOnce([video1])
            .mockResolvedValueOnce([video2]);

        render(
            <VideoFeed
                channels={[channel1, channel2]}
                apiClient={mockApiClient}
                onVideoSelect={vi.fn()}
            />
        );

        await waitFor(() => {
            // Check for channel names in video cards
            const videoCards = screen.getAllByRole('button');
            const hasChannel1 = videoCards.some(card => card.textContent?.includes('Channel 1'));
            const hasChannel2 = videoCards.some(card => card.textContent?.includes('Channel 2'));
            expect(hasChannel1).toBe(true);
            expect(hasChannel2).toBe(true);
        });

        expect(mockApiClient.getChannelVideos).toHaveBeenCalledTimes(2);
        expect(mockApiClient.getChannelVideos).toHaveBeenCalledWith('UC1');
        expect(mockApiClient.getChannelVideos).toHaveBeenCalledWith('UC2');
    });
});
