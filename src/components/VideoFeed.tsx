/**
 * VideoFeed Component
 * 
 * Displays a chronological feed of videos from user's curated channels.
 * Fetches videos from all channels, sorts by upload date, and provides
 * a distraction-free viewing experience.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Channel, Video, APIError } from '../types';
import type { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import './VideoFeed.css';

export interface VideoFeedProps {
    /** List of channels to fetch videos from */
    channels: Channel[];
    /** YouTube API client instance */
    apiClient: YouTubeAPIClient;
    /** Callback when a video is selected for playback */
    onVideoSelect: (videoId: string) => void;
}

/**
 * Formats ISO 8601 duration to human-readable format
 * Memoized to avoid recreating on every render
 * @param duration - ISO 8601 duration string (e.g., "PT4M13S")
 * @returns Formatted duration (e.g., "4:13")
 */
const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats date to relative time (e.g., "2 days ago")
 * Memoized to avoid recreating on every render
 * @param date - Date to format
 * @returns Formatted relative time string
 */
const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

/**
 * VideoFeed component - displays chronological feed of videos from curated channels
 */
export function VideoFeed({ channels, apiClient, onVideoSelect }: VideoFeedProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<APIError | null>(null);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
    const [selectedChannelId, setSelectedChannelId] = useState<string>('');

    /**
     * Debounce search query (300ms)
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    /**
     * Fetches videos from all channels and sorts by date
     */
    const fetchVideos = useCallback(async () => {
        // Handle empty channel list
        if (channels.length === 0) {
            setVideos([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch videos from all channels in parallel
            const videoPromises = channels.map(channel =>
                apiClient.getChannelVideos(channel.id).catch(err => {
                    // If a single channel fails, log but continue with others
                    console.error(`Failed to fetch videos for channel ${channel.title}:`, err);
                    return [] as Video[];
                })
            );

            const videoArrays = await Promise.all(videoPromises);

            // Flatten and combine all videos
            const allVideos = videoArrays.flat();

            // Sort videos by upload date descending (newest first)
            // Note: Sorting is done once here, then memoized filtering is applied
            const sortedVideos = allVideos.sort((a, b) => {
                return b.publishedAt.getTime() - a.publishedAt.getTime();
            });

            setVideos(sortedVideos);
            setError(null);
        } catch (err) {
            const apiError = err as APIError;
            setError(apiError);
        } finally {
            setLoading(false);
        }
    }, [channels, apiClient]);

    /**
     * Fetch videos on mount and when channels change
     */
    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    /**
     * Handle refresh button click
     */
    const handleRefresh = () => {
        fetchVideos();
    };

    /**
     * Handle video card click
     */
    const handleVideoClick = (videoId: string) => {
        onVideoSelect(videoId);
    };

    /**
     * Filter videos based on search query and channel filter
     * Performs client-side filtering without API calls
     * Memoized to avoid recalculating on every render
     */
    const filteredVideos = useMemo(() => {
        return videos.filter(video => {
            // Apply search filter (title or description)
            if (debouncedSearchQuery.trim()) {
                const query = debouncedSearchQuery.toLowerCase();
                const matchesTitle = video.title.toLowerCase().includes(query);
                const matchesDescription = video.description.toLowerCase().includes(query);

                if (!matchesTitle && !matchesDescription) {
                    return false;
                }
            }

            // Apply channel filter
            if (selectedChannelId && video.channelId !== selectedChannelId) {
                return false;
            }

            return true;
        });
    }, [videos, debouncedSearchQuery, selectedChannelId]);

    /**
     * Handle search input change
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    /**
     * Handle channel filter change
     */
    const handleChannelFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChannelId(e.target.value);
    };

    /**
     * Clear all filters
     */
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedChannelId('');
    };

    /**
     * Check if any filters are active
     * Memoized to avoid recalculating on every render
     */
    const hasActiveFilters = useMemo(() => {
        return searchQuery.trim() !== '' || selectedChannelId !== '';
    }, [searchQuery, selectedChannelId]);

    return (
        <div className="video-feed">
            <div className="video-feed-header">
                <h1>Your Video Feed</h1>
                <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={loading}
                    aria-label="Refresh video feed"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Search and filter controls */}
            {!loading && !error && channels.length > 0 && videos.length > 0 && (
                <div className="filter-controls">
                    <div className="search-input-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search videos by title or description..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            aria-label="Search videos"
                        />
                    </div>

                    <div className="channel-filter-container">
                        <select
                            className="channel-filter"
                            value={selectedChannelId}
                            onChange={handleChannelFilterChange}
                            aria-label="Filter by channel"
                        >
                            <option value="">All Channels</option>
                            {channels.map(channel => (
                                <option key={channel.id} value={channel.id}>
                                    {channel.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            className="clear-filters-button"
                            onClick={handleClearFilters}
                            aria-label="Clear all filters"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <LoadingSpinner message="Loading videos..." size="large" />
            )}

            {/* Error message */}
            {error && !loading && (
                <ErrorMessage
                    error={error}
                    onRetry={error.retryable ? handleRefresh : undefined}
                    onDismiss={() => setError(null)}
                    size="large"
                />
            )}

            {/* Empty state - no channels */}
            {!loading && !error && channels.length === 0 && (
                <div className="empty-state">
                    <p>No channels added yet.</p>
                    <p>Add some channels to start seeing videos!</p>
                </div>
            )}

            {/* Empty state - no videos */}
            {!loading && !error && channels.length > 0 && videos.length === 0 && (
                <div className="empty-state">
                    <p>No recent videos found.</p>
                    <p>Your channels haven't posted any videos in the last 30 days.</p>
                </div>
            )}

            {/* No results after filtering */}
            {!loading && !error && videos.length > 0 && filteredVideos.length === 0 && (
                <div className="empty-state">
                    <p>No videos match your filters.</p>
                    <button onClick={handleClearFilters} className="clear-filters-link">
                        Clear filters to see all videos
                    </button>
                </div>
            )}

            {/* Video grid */}
            {!loading && !error && filteredVideos.length > 0 && (
                <div className="video-grid">
                    {filteredVideos.map(video => (
                        <div
                            key={video.id}
                            className="video-card"
                            onClick={() => handleVideoClick(video.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleVideoClick(video.id);
                                }
                            }}
                        >
                            <div className="video-thumbnail-container">
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="video-thumbnail"
                                    loading="lazy"
                                />
                                <span className="video-duration">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <p className="video-channel">{video.channelTitle}</p>
                                <p className="video-date">
                                    {formatRelativeTime(video.publishedAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
