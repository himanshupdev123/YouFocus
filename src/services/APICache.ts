/**
 * APICache - In-memory cache for YouTube API responses
 * 
 * Implements caching with timestamp-based expiration to minimize API quota usage.
 * Default cache duration is 30 minutes (configurable).
 */

import type { Channel, Video, CacheEntry } from '../types';

/**
 * APICache class manages in-memory caching of API responses
 */
export class APICache {
    private channelCache: Map<string, CacheEntry<Channel>>;
    private videoCache: Map<string, CacheEntry<Video[]>>;
    private readonly defaultCacheDuration: number;

    /**
     * Creates a new APICache instance
     * @param cacheDurationMs - Cache duration in milliseconds (default: 4 hours)
     */
    constructor(cacheDurationMs: number = 4 * 60 * 60 * 1000) {
        this.channelCache = new Map();
        this.videoCache = new Map();
        this.defaultCacheDuration = cacheDurationMs;
    }

    /**
     * Stores a channel in the cache
     * @param key - Cache key (typically channel ID)
     * @param channel - Channel data to cache
     * @param customDuration - Optional custom cache duration in milliseconds
     */
    setChannel(key: string, channel: Channel, customDuration?: number): void {
        const now = Date.now();
        const duration = customDuration ?? this.defaultCacheDuration;

        this.channelCache.set(key, {
            data: channel,
            timestamp: now,
            expiresAt: now + duration
        });
    }

    /**
     * Retrieves a channel from the cache if not expired
     * @param key - Cache key (typically channel ID)
     * @returns Cached channel or null if not found or expired
     */
    getChannel(key: string): Channel | null {
        const entry = this.channelCache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now >= entry.expiresAt) {
            // Cache expired, remove it
            this.channelCache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Stores videos in the cache
     * @param key - Cache key (typically channel ID or query string)
     * @param videos - Video array to cache
     * @param customDuration - Optional custom cache duration in milliseconds
     */
    setVideos(key: string, videos: Video[], customDuration?: number): void {
        const now = Date.now();
        const duration = customDuration ?? this.defaultCacheDuration;

        this.videoCache.set(key, {
            data: videos,
            timestamp: now,
            expiresAt: now + duration
        });
    }

    /**
     * Retrieves videos from the cache if not expired
     * @param key - Cache key (typically channel ID or query string)
     * @returns Cached videos or null if not found or expired
     */
    getVideos(key: string): Video[] | null {
        const entry = this.videoCache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now >= entry.expiresAt) {
            // Cache expired, remove it
            this.videoCache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Invalidates (removes) a specific channel from the cache
     * @param key - Cache key to invalidate
     */
    invalidateChannel(key: string): void {
        this.channelCache.delete(key);
    }

    /**
     * Invalidates (removes) specific videos from the cache
     * @param key - Cache key to invalidate
     */
    invalidateVideos(key: string): void {
        this.videoCache.delete(key);
    }

    /**
     * Clears all cached channels
     */
    clearChannels(): void {
        this.channelCache.clear();
    }

    /**
     * Clears all cached videos
     */
    clearVideos(): void {
        this.videoCache.clear();
    }

    /**
     * Clears all cached data (channels and videos)
     */
    clearAll(): void {
        this.channelCache.clear();
        this.videoCache.clear();
    }

    /**
     * Gets the number of cached channels
     * @returns Number of channels in cache
     */
    getChannelCacheSize(): number {
        return this.channelCache.size;
    }

    /**
     * Gets the number of cached video entries
     * @returns Number of video entries in cache
     */
    getVideoCacheSize(): number {
        return this.videoCache.size;
    }
}
