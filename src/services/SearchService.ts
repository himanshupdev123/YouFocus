/**
 * SearchService - Handles search operations using the Python search service
 * 
 * This service provides a bridge between the frontend and the Python search service,
 * offering search functionality without consuming YouTube API quota.
 */

import type { Channel } from '../types';

export interface SearchServiceConfig {
    /** Base URL of the Python search service */
    baseUrl: string;
    /** Request timeout in milliseconds */
    timeout?: number;
}

export interface SearchResult {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoId: string;
    videoTitle: string;
    confidence: number;
}

export interface SearchResponse {
    query: string;
    maxResults: number;
    totalResults: number;
    channels: SearchResult[];
    cached?: boolean;
}

export interface VideoSearchResult {
    name: string;
    id: string;
    img: string;
}

export interface VideoSearchResponse {
    query: string;
    maxResults: number;
    totalResults: number;
    videos: VideoSearchResult[];
}

/**
 * Service for interacting with the Python YouTube search service
 */
export class SearchService {
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor(config: SearchServiceConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.timeout = config.timeout ?? 10000; // 10 second default timeout
    }

    /**
     * Search for channels using the Python search service
     * @param query - Search query
     * @param maxResults - Maximum number of results (default: 25)
     * @returns Promise resolving to search results
     */
    async searchChannels(query: string, maxResults: number = 25): Promise<SearchResult[]> {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query cannot be empty');
        }

        const url = new URL('/api/search/channels', this.baseUrl);
        url.searchParams.set('q', query.trim());
        url.searchParams.set('maxResults', maxResults.toString());

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data: SearchResponse = await response.json();
            return data.channels;

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Search request timed out');
                }
                throw error;
            }
            throw new Error('Unknown error occurred during search');
        }
    }

    /**
     * Search for videos using the Python search service
     * @param query - Search query
     * @param maxResults - Maximum number of results (default: 25)
     * @returns Promise resolving to video search results
     */
    async searchVideos(query: string, maxResults: number = 25): Promise<VideoSearchResult[]> {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query cannot be empty');
        }

        const url = new URL('/api/search/videos', this.baseUrl);
        url.searchParams.set('q', query.trim());
        url.searchParams.set('maxResults', maxResults.toString());

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data: VideoSearchResponse = await response.json();
            return data.videos;

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Search request timed out');
                }
                throw error;
            }
            throw new Error('Unknown error occurred during video search');
        }
    }

    /**
     * Check if the search service is available
     * @returns Promise resolving to true if service is healthy
     */
    async isHealthy(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

            const response = await fetch(`${this.baseUrl}/api/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;

        } catch (error) {
            console.warn('Health check failed:', error);
            return false;
        }
    }

    /**
     * Clear the search service cache
     * @returns Promise resolving to success message
     */
    async clearCache(): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/api/cache/clear`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.message;

        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred while clearing cache');
        }
    }

    /**
     * Get cache statistics from the search service
     * @returns Promise resolving to cache stats
     */
    async getCacheStats(): Promise<{ cacheSize: number; cacheDuration: number; entries: string[] }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/cache/stats`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred while getting cache stats');
        }
    }

    /**
     * Convert search results to Channel objects for compatibility
     * Note: These channels will have temporary IDs and need to be resolved via YouTube API
     * @param searchResults - Results from search service
     * @returns Array of Channel objects
     */
    static convertToChannels(searchResults: SearchResult[]): Partial<Channel>[] {
        return searchResults.map(result => ({
            id: result.id,
            title: result.title,
            thumbnailUrl: result.thumbnailUrl,
            // Note: subscriberCount and uploadsPlaylistId will need to be fetched via YouTube API
            subscriberCount: undefined,
            uploadsPlaylistId: ''
        }));
    }

    /**
     * Extract unique video IDs from search results for channel resolution
     * @param searchResults - Results from search service
     * @returns Array of unique video IDs
     */
    static extractVideoIds(searchResults: SearchResult[]): string[] {
        const videoIds = searchResults.map(result => result.videoId);
        return [...new Set(videoIds)]; // Remove duplicates
    }
}