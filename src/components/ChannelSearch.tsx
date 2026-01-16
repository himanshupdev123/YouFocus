/**
 * ChannelSearch Component
 * 
 * Provides search functionality for finding YouTube channels.
 * Features:
 * - Debounced search input (300ms)
 * - Display search results with thumbnails, names, and subscriber counts
 * - Loading state during search
 * - Error message display
 * - Channel selection handling
 * 
 * Requirements: 1.2, 1.3
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Channel, APIError } from '../types';
import type { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import './ChannelSearch.css';

export interface ChannelSearchProps {
    /** YouTube API client instance */
    apiClient: YouTubeAPIClient;
    /** Callback when a channel is selected */
    onChannelSelect: (channel: Channel) => void;
    /** List of already selected channels (to show visual feedback) */
    selectedChannels?: Channel[];
}

/**
 * ChannelSearch component for searching and selecting YouTube channels
 */
export function ChannelSearch({ apiClient, onChannelSelect, selectedChannels = [] }: ChannelSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<APIError | null>(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce the search query (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perform search when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            // Don't search if query is empty or too short
            if (!debouncedQuery || debouncedQuery.trim().length < 2) {
                setSearchResults([]);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const results = await apiClient.searchChannels(debouncedQuery);
                setSearchResults(results);
                setError(null);
            } catch (err) {
                const apiError = err as APIError;
                setError(apiError);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery, apiClient]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    // Handle channel selection
    const handleChannelClick = useCallback((channel: Channel) => {
        onChannelSelect(channel);
    }, [onChannelSelect]);

    // Check if a channel is already selected (memoized)
    const isChannelSelected = useCallback((channelId: string) => {
        return selectedChannels.some(ch => ch.id === channelId);
    }, [selectedChannels]);

    // Format subscriber count for display (memoized)
    const formatSubscriberCount = useMemo(() => {
        return (count?: number): string => {
            if (!count) return 'Unknown subscribers';

            if (count >= 1000000) {
                return `${(count / 1000000).toFixed(1)}M subscribers`;
            } else if (count >= 1000) {
                return `${(count / 1000).toFixed(1)}K subscribers`;
            }
            return `${count} subscribers`;
        };
    }, []);

    // Handle retry for errors
    const handleRetry = useCallback(() => {
        setError(null);
        setDebouncedQuery(searchQuery); // Trigger search again
    }, [searchQuery]);

    return (
        <div className="channel-search">
            <div className="search-input-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for YouTube channels..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    aria-label="Search for YouTube channels"
                />
            </div>

            {isLoading && (
                <LoadingSpinner message="Searching for channels..." size="medium" />
            )}

            {error && (
                <ErrorMessage
                    error={error}
                    onRetry={error.retryable ? handleRetry : undefined}
                    onDismiss={() => setError(null)}
                    size="medium"
                />
            )}

            {!isLoading && !error && searchResults.length > 0 && (
                <div className="search-results">
                    <ul className="channel-list">
                        {searchResults.map((channel) => (
                            <li
                                key={channel.id}
                                className={`channel-item ${isChannelSelected(channel.id) ? 'selected' : ''}`}
                            >
                                <button
                                    className="channel-button"
                                    onClick={() => handleChannelClick(channel)}
                                    disabled={isChannelSelected(channel.id)}
                                    aria-label={`Select ${channel.title}`}
                                >
                                    <img
                                        src={channel.thumbnailUrl}
                                        alt={`${channel.title} thumbnail`}
                                        className="channel-thumbnail"
                                    />
                                    <div className="channel-info">
                                        <h3 className="channel-title">{channel.title}</h3>
                                        <p className="channel-subscribers">
                                            {formatSubscriberCount(channel.subscriberCount)}
                                        </p>
                                    </div>
                                    {isChannelSelected(channel.id) && (
                                        <span className="selected-badge">✓ Selected</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!isLoading && !error && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                <div className="no-results">
                    <p>No channels found for "{debouncedQuery}". Try a different search term.</p>
                </div>
            )}
        </div>
    );
}
