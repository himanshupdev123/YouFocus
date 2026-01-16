/**
 * ChannelManager Example
 * 
 * Demonstrates the usage of the ChannelManager component
 * This file is for development/documentation purposes
 */

import { useState } from 'react';
import { ChannelManager } from './ChannelManager';
import { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { StorageManager } from '../utils/StorageManager';
import type { Channel } from '../types';

/**
 * Example usage of ChannelManager component
 */
export function ChannelManagerExample() {
    // Initialize API client (you'll need a real API key)
    const apiClient = new YouTubeAPIClient({
        apiKey: 'YOUR_API_KEY_HERE'
    });

    // Initialize storage manager
    const storageManager = new StorageManager();

    // State for channels
    const [channels, setChannels] = useState<Channel[]>(() => {
        // Load channels from storage on mount
        return storageManager.loadChannels();
    });

    // Handle adding a channel
    const handleAddChannel = (channel: Channel) => {
        setChannels(prev => [...prev, channel]);
    };

    // Handle removing a channel
    const handleRemoveChannel = (channelId: string) => {
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Channel Manager Example</h1>
            <ChannelManager
                channels={channels}
                onAddChannel={handleAddChannel}
                onRemoveChannel={handleRemoveChannel}
                apiClient={apiClient}
                storageManager={storageManager}
            />
        </div>
    );
}

/**
 * Example with pre-populated channels
 */
export function ChannelManagerWithDataExample() {
    const apiClient = new YouTubeAPIClient({
        apiKey: 'YOUR_API_KEY_HERE'
    });

    const storageManager = new StorageManager();

    // Example channels
    const [channels, setChannels] = useState<Channel[]>([
        {
            id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
            title: 'Google Developers',
            thumbnailUrl: 'https://yt3.ggpht.com/ytc/example1.jpg',
            subscriberCount: 2500000,
            uploadsPlaylistId: 'UU_x5XG1OV2P6uZZ5FSM9Ttw'
        },
        {
            id: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
            title: 'Linus Tech Tips',
            thumbnailUrl: 'https://yt3.ggpht.com/ytc/example2.jpg',
            subscriberCount: 15000000,
            uploadsPlaylistId: 'UUXuqSBlHAE6Xw-yeJA0Tunw'
        }
    ]);

    const handleAddChannel = (channel: Channel) => {
        setChannels(prev => [...prev, channel]);
    };

    const handleRemoveChannel = (channelId: string) => {
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Channel Manager with Pre-populated Data</h1>
            <ChannelManager
                channels={channels}
                onAddChannel={handleAddChannel}
                onRemoveChannel={handleRemoveChannel}
                apiClient={apiClient}
                storageManager={storageManager}
            />
        </div>
    );
}
