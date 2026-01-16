/**
 * VideoFeed Component Example
 * 
 * Demonstrates usage of the VideoFeed component with sample data
 */

import { VideoFeed } from './VideoFeed';
import { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import type { Channel, Video } from '../types';

// Sample channels
const sampleChannels: Channel[] = [
    {
        id: 'UCBJycsmduvYEL83R_U4JriQ',
        title: 'Marques Brownlee',
        thumbnailUrl: 'https://yt3.googleusercontent.com/lkH37D712tiyphnu0Id0D5MwwQ7IRuwgQLVD05iMXlDWO-kDHut3uI4MgIEAQ9StK0qOST7fiA=s240-c-k-c0x00ffffff-no-rj',
        subscriberCount: 18000000,
        uploadsPlaylistId: 'UUBJycsmduvYEL83R_U4JriQ'
    },
    {
        id: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
        title: 'Linus Tech Tips',
        thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mNDhzb-Xt8Xt8Xt8Xt8Xt8Xt8Xt8Xt8Xt8Xt8=s240-c-k-c0x00ffffff-no-rj',
        subscriberCount: 15000000,
        uploadsPlaylistId: 'UUXuqSBlHAE6Xw-yeJA0Tunw'
    }
];

// Create API client (requires API key)
const apiClient = new YouTubeAPIClient({
    apiKey: 'YOUR_API_KEY_HERE' // Replace with actual API key
});

/**
 * Example: Basic VideoFeed usage
 */
export function VideoFeedExample() {
    const handleVideoSelect = (videoId: string) => {
        console.log('Selected video:', videoId);
        // In a real app, this would navigate to the video player
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>VideoFeed Component Example</h1>
            <VideoFeed
                channels={sampleChannels}
                apiClient={apiClient}
                onVideoSelect={handleVideoSelect}
            />
        </div>
    );
}

/**
 * Example: Empty channel list
 */
export function VideoFeedEmptyExample() {
    const handleVideoSelect = (videoId: string) => {
        console.log('Selected video:', videoId);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>VideoFeed - Empty State</h1>
            <VideoFeed
                channels={[]}
                apiClient={apiClient}
                onVideoSelect={handleVideoSelect}
            />
        </div>
    );
}

/**
 * Example: Single channel
 */
export function VideoFeedSingleChannelExample() {
    const handleVideoSelect = (videoId: string) => {
        console.log('Selected video:', videoId);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>VideoFeed - Single Channel</h1>
            <VideoFeed
                channels={[sampleChannels[0]]}
                apiClient={apiClient}
                onVideoSelect={handleVideoSelect}
            />
        </div>
    );
}

/**
 * Example: With mock API client for testing
 */
export function VideoFeedMockExample() {
    // Create a mock API client that returns sample data
    const mockVideos: Video[] = [
        {
            id: 'dQw4w9WgXcQ',
            title: 'Amazing Tech Review - The Future is Here!',
            thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            channelId: 'UCBJycsmduvYEL83R_U4JriQ',
            channelTitle: 'Marques Brownlee',
            publishedAt: new Date('2024-01-15'),
            duration: 'PT12M34S',
            description: 'An in-depth review of the latest technology'
        },
        {
            id: 'jNQXAC9IVRw',
            title: 'Building the Ultimate PC Setup',
            thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
            channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
            channelTitle: 'Linus Tech Tips',
            publishedAt: new Date('2024-01-14'),
            duration: 'PT15M22S',
            description: 'Step by step guide to building a high-end PC'
        },
        {
            id: 'M7lc1UVf-VE',
            title: 'Top 5 Gadgets You Need in 2024',
            thumbnailUrl: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg',
            channelId: 'UCBJycsmduvYEL83R_U4JriQ',
            channelTitle: 'Marques Brownlee',
            publishedAt: new Date('2024-01-10'),
            duration: 'PT8M45S',
            description: 'My favorite gadgets of the year'
        }
    ];

    const mockApiClient = {
        getChannelVideos: async () => mockVideos
    } as any;

    const handleVideoSelect = (videoId: string) => {
        console.log('Selected video:', videoId);
        alert(`Playing video: ${videoId}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>VideoFeed - Mock Data Example</h1>
            <VideoFeed
                channels={sampleChannels}
                apiClient={mockApiClient}
                onVideoSelect={handleVideoSelect}
            />
        </div>
    );
}
