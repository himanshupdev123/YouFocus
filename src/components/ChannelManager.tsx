/**
 * ChannelManager Component
 * 
 * Provides interface for managing the user's channel list.
 * Features:
 * - Display current channel list with thumbnails and names
 * - Add channels by URL or ID
 * - Validate channel identifiers
 * - Remove channels from list
 * - Show error messages for invalid channels
 * - Persist changes immediately to storage
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useCallback } from 'react';
import type { Channel, APIError } from '../types';
import type { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { StorageManager, StorageError } from '../utils/StorageManager';
import { ErrorMessage } from './ErrorMessage';
import './ChannelManager.css';

export interface ChannelManagerProps {
    /** Current list of channels */
    channels: Channel[];
    /** Callback when a channel is added */
    onAddChannel: (channel: Channel) => void;
    /** Callback when a channel is removed */
    onRemoveChannel: (channelId: string) => void;
    /** YouTube API client instance */
    apiClient: YouTubeAPIClient;
    /** Storage manager instance */
    storageManager: StorageManager;
}

/**
 * Regular expressions for validating YouTube channel identifiers
 */
const CHANNEL_URL_PATTERNS = {
    // https://www.youtube.com/channel/UC...
    channelId: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]+)(?:\/.*)?$/i,
    // https://www.youtube.com/@handle
    handle: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w-]+)(?:\/.*)?$/i,
    // https://www.youtube.com/c/customurl
    customUrl: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([\w-]+)(?:\/.*)?$/i,
    // Just the channel ID: UC...
    bareChannelId: /^(UC[\w-]+)$/,
};

/**
 * ChannelManager component for adding and removing channels
 */
export function ChannelManager({
    channels,
    onAddChannel,
    onRemoveChannel,
    apiClient,
    storageManager
}: ChannelManagerProps) {
    const [inputValue, setInputValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<APIError | StorageError | Error | null>(null);

    /**
     * Extracts channel ID from various URL formats or validates bare channel ID
     * @param input - User input (URL or channel ID)
     * @returns Channel ID if valid, null otherwise
     */
    const extractChannelId = (input: string): string | null => {
        const trimmed = input.trim();

        // Try bare channel ID first
        const bareMatch = trimmed.match(CHANNEL_URL_PATTERNS.bareChannelId);
        if (bareMatch) {
            return bareMatch[1];
        }

        // Try channel URL with ID
        const channelIdMatch = trimmed.match(CHANNEL_URL_PATTERNS.channelId);
        if (channelIdMatch) {
            return channelIdMatch[1];
        }

        // For handle and custom URL, we can't extract the ID directly
        // We'll need to search for the channel
        const handleMatch = trimmed.match(CHANNEL_URL_PATTERNS.handle);
        if (handleMatch) {
            return null; // Will need to search
        }

        const customUrlMatch = trimmed.match(CHANNEL_URL_PATTERNS.customUrl);
        if (customUrlMatch) {
            return null; // Will need to search
        }

        return null;
    };

    /**
     * Handles adding a channel
     */
    const handleAddChannel = useCallback(async () => {
        if (!inputValue.trim()) {
            setError(new Error('Please enter a channel URL or ID'));
            return;
        }

        setIsAdding(true);
        setError(null);

        try {
            // Try to extract channel ID
            const channelId = extractChannelId(inputValue);

            let channel: Channel;

            if (channelId) {
                // We have a direct channel ID, fetch channel info
                channel = await apiClient.getChannelInfo(channelId);
            } else {
                // Try to search for the channel by handle or custom URL
                // Extract the handle or custom name
                const handleMatch = inputValue.match(CHANNEL_URL_PATTERNS.handle);
                const customUrlMatch = inputValue.match(CHANNEL_URL_PATTERNS.customUrl);

                const searchQuery = handleMatch?.[1] || customUrlMatch?.[1];

                if (!searchQuery) {
                    throw new Error('Invalid channel URL or ID format');
                }

                // Search for the channel
                const results = await apiClient.searchChannels(searchQuery);

                if (results.length === 0) {
                    throw new Error('Channel not found');
                }

                // Use the first result
                channel = results[0];
            }

            // Check if channel is already in the list
            if (channels.some(ch => ch.id === channel.id)) {
                setError(new Error('This channel is already in your list'));
                setIsAdding(false);
                return;
            }

            // Add the channel
            onAddChannel(channel);

            // Persist immediately
            try {
                const updatedChannels = [...channels, channel];
                storageManager.saveChannels(updatedChannels);
            } catch (storageErr) {
                // Storage error - still added to UI but not persisted
                setError(storageErr as StorageError);
            }

            // Clear input and error on success
            setInputValue('');
            if (!(error instanceof StorageError)) {
                setError(null);
            }
        } catch (err) {
            // Check if it's an APIError
            const isAPIError = (e: unknown): e is APIError => {
                return (
                    typeof e === 'object' &&
                    e !== null &&
                    'code' in e &&
                    'message' in e &&
                    'userMessage' in e &&
                    'retryable' in e
                );
            };

            if (isAPIError(err)) {
                setError(err);
            } else if (err instanceof Error) {
                setError(err);
            } else {
                setError(new Error('Failed to add channel. Please check the URL or ID and try again.'));
            }
        } finally {
            setIsAdding(false);
        }
    }, [inputValue, channels, apiClient, onAddChannel, storageManager]);

    /**
     * Handles removing a channel
     */
    const handleRemoveChannel = useCallback((channelId: string) => {
        // Remove the channel
        onRemoveChannel(channelId);

        // Persist immediately
        try {
            const updatedChannels = channels.filter(ch => ch.id !== channelId);
            storageManager.saveChannels(updatedChannels);
        } catch (storageErr) {
            // Storage error - still removed from UI but not persisted
            setError(storageErr as StorageError);
        }
    }, [channels, onRemoveChannel, storageManager]);

    /**
     * Handles input change
     */
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
    }, [error]);

    /**
     * Handles Enter key press in input
     */
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isAdding) {
            handleAddChannel();
        }
    }, [isAdding, handleAddChannel]);

    return (
        <div className="channel-manager">
            <div className="add-channel-section">
                <h2>Add Channel</h2>
                <div className="add-channel-form">
                    <input
                        type="text"
                        className="channel-input"
                        placeholder="Enter channel URL or ID (e.g., https://www.youtube.com/@channelname)"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={isAdding}
                        aria-label="Channel URL or ID"
                    />
                    <button
                        className="add-button"
                        onClick={handleAddChannel}
                        disabled={isAdding || !inputValue.trim()}
                        aria-label="Add channel"
                    >
                        {isAdding ? 'Adding...' : 'Add'}
                    </button>
                </div>

                {error && (
                    <ErrorMessage
                        error={error}
                        onRetry={
                            error instanceof StorageError
                                ? undefined
                                : (error as APIError).retryable
                                    ? handleAddChannel
                                    : undefined
                        }
                        onDismiss={() => setError(null)}
                        size="medium"
                    />
                )}

                <div className="help-text">
                    <p>Supported formats:</p>
                    <ul>
                        <li>Channel URL: https://www.youtube.com/channel/UC...</li>
                        <li>Handle: https://www.youtube.com/@channelname</li>
                        <li>Custom URL: https://www.youtube.com/c/channelname</li>
                        <li>Channel ID: UC...</li>
                    </ul>
                </div>
            </div>

            <div className="channel-list-section">
                <h2>Your Channels ({channels.length})</h2>

                {channels.length === 0 ? (
                    <div className="empty-state">
                        <p>No channels added yet. Add your first channel above!</p>
                    </div>
                ) : (
                    <ul className="channel-list">
                        {channels.map((channel) => (
                            <li key={channel.id} className="channel-item">
                                <img
                                    src={channel.thumbnailUrl}
                                    alt={`${channel.title} thumbnail`}
                                    className="channel-thumbnail"
                                />
                                <div className="channel-info">
                                    <h3 className="channel-title">{channel.title}</h3>
                                    {channel.subscriberCount && (
                                        <p className="channel-subscribers">
                                            {formatSubscriberCount(channel.subscriberCount)}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="remove-button"
                                    onClick={() => handleRemoveChannel(channel.id)}
                                    aria-label={`Remove ${channel.title}`}
                                    title="Remove channel"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

/**
 * Format subscriber count for display
 */
function formatSubscriberCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M subscribers`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K subscribers`;
    }
    return `${count} subscribers`;
}
