/**
 * Core data models and types for Focused YouTube Viewer
 */

/**
 * Represents a YouTube channel
 */
export interface Channel {
    /** YouTube channel ID */
    id: string;
    /** Channel name */
    title: string;
    /** Channel avatar URL */
    thumbnailUrl: string;
    /** Subscriber count (optional) */
    subscriberCount?: number;
    /** ID of uploads playlist */
    uploadsPlaylistId: string;
}

/**
 * Represents a YouTube video
 */
export interface Video {
    /** YouTube video ID */
    id: string;
    /** Video title */
    title: string;
    /** Video thumbnail URL */
    thumbnailUrl: string;
    /** Parent channel ID */
    channelId: string;
    /** Channel name */
    channelTitle: string;
    /** Upload date */
    publishedAt: Date;
    /** Video duration (ISO 8601 format) */
    duration: string;
    /** Video description */
    description: string;
}

/**
 * Cache entry with timestamp and expiration
 */
export interface CacheEntry<T> {
    /** Cached data */
    data: T;
    /** Timestamp when cached */
    timestamp: number;
    /** Expiration timestamp */
    expiresAt: number;
}

/**
 * API response cache structure
 */
export interface APICache {
    /** Channel cache */
    channels: Map<string, CacheEntry<Channel>>;
    /** Videos cache */
    videos: Map<string, CacheEntry<Video[]>>;
}

/**
 * API error structure
 */
export interface APIError {
    /** HTTP status code */
    code: number;
    /** Technical error message */
    message: string;
    /** User-friendly error message */
    userMessage: string;
    /** Whether the error is retryable */
    retryable: boolean;
}

/**
 * YouTube API response types
 */

/**
 * YouTube API channel search response item
 */
export interface YouTubeChannelSearchItem {
    id: {
        kind: string;
        channelId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
    };
}

/**
 * YouTube API channel list response item
 */
export interface YouTubeChannelItem {
    id: string;
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
    };
    statistics: {
        subscriberCount: string;
        videoCount: string;
        viewCount: string;
    };
    contentDetails: {
        relatedPlaylists: {
            uploads: string;
        };
    };
}

/**
 * YouTube API playlist item response
 */
export interface YouTubePlaylistItem {
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
        channelTitle: string;
        resourceId: {
            kind: string;
            videoId: string;
        };
    };
}

/**
 * YouTube API video item response
 */
export interface YouTubeVideoItem {
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
        channelTitle: string;
    };
    contentDetails: {
        duration: string;
    };
}

/**
 * Generic YouTube API response wrapper
 */
export interface YouTubeAPIResponse<T> {
    kind: string;
    etag: string;
    items: T[];
    pageInfo?: {
        totalResults: number;
        resultsPerPage: number;
    };
    nextPageToken?: string;
    prevPageToken?: string;
}
