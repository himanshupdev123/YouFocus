/**
 * Example usage of ChannelSearch component
 * This file demonstrates how to integrate the ChannelSearch component
 */

import { useState } from 'react';
import { ChannelSearch } from './ChannelSearch';
import { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import type { Channel } from '../types';

export function ChannelSearchExample() {
    const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);

    // Initialize API client with your API key
    const apiClient = new YouTubeAPIClient({
        apiKey: 'YOUR_YOUTUBE_API_KEY_HERE'
    });

    // Handle channel selection
    const handleChannelSelect = (channel: Channel) => {
        // Add channel to selected list if not already present
        if (!selectedChannels.some(ch => ch.id === channel.id)) {
            setSelectedChannels([...selectedChannels, channel]);
        }
    };

    // Handle channel removal
    const handleRemoveChannel = (channelId: string) => {
        setSelectedChannels(selectedChannels.filter(ch => ch.id !== channelId));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Channel Search Example</h1>

            <div style={{ marginBottom: '2rem' }}>
                <h2>Search for Channels</h2>
                <ChannelSearch
                    apiClient={apiClient}
                    onChannelSelect={handleChannelSelect}
                    selectedChannels={selectedChannels}
                />
            </div>

            <div>
                <h2>Selected Channels ({selectedChannels.length})</h2>
                {selectedChannels.length === 0 ? (
                    <p>No channels selected yet. Search and select channels above.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedChannels.map(channel => (
                            <li key={channel.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.5rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                marginBottom: '0.5rem'
                            }}>
                                <img
                                    src={channel.thumbnailUrl}
                                    alt={channel.title}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                />
                                <span style={{ flex: 1 }}>{channel.title}</span>
                                <button
                                    onClick={() => handleRemoveChannel(channel.id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
