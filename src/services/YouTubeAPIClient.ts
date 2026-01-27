/**
 * YouTubeAPIClient - Handles all interactions with YouTube Data API v3
 * 
 * Integrates with APICache to minimize quota usage and provides methods for:
 * - Searching channels
 * - Getting channel information
 * - Fetching channel videos
 * - Getting video details
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';
import { APICache } from './APICache';
import { SearchService, type SearchServiceConfig } from './SearchService';
import type {
    Channel,
    Video,
    APIError,
    YouTubeAPIResponse,
    YouTubeChannelSearchItem,
    YouTubeChannelItem,
    YouTubePlaylistItem,
    YouTubeVideoItem
} from '../types';

/**
 * Configuration for YouTubeAPIClient
 */
export interface YouTubeAPIClientConfig {
    /** YouTube Data API v3 key */
    apiKey: string;
    /** Cache instance for API responses */
    cache?: APICache;
    /** Maximum results per request (default: 50) */
    maxResults?: number;
    /** Time window for fetching videos in days (default: 30) */
    videoTimeWindowDays?: number;
    /** Search service configuration for quota optimization */
    searchService?: SearchServiceConfig;
    /** Whether to use search service for channel searches (default: true) */
    useSearchService?: boolean;
}

/**
 * YouTubeAPIClient class for interacting with YouTube Data API v3
 */
export class YouTubeAPIClient {
    private readonly apiKey: string;
    private readonly cache: APICache;
    private readonly axiosInstance: AxiosInstance;
    private readonly maxResults: number;
    private readonly videoTimeWindowDays: number;
    private readonly baseURL = 'https://www.googleapis.com/youtube/v3';
    private readonly searchService?: SearchService;
    private readonly useSearchService: boolean;

    /**
     * Creates a new YouTubeAPIClient instance
     * @param config - Configuration object
     */
    constructor(config: YouTubeAPIClientConfig) {
        if (!config.apiKey || config.apiKey.trim().length === 0) {
            throw new Error('YouTube API key is required');
        }

        this.apiKey = config.apiKey;
        this.cache = config.cache ?? new APICache();
        this.maxResults = config.maxResults ?? 50;
        this.videoTimeWindowDays = config.videoTimeWindowDays ?? 30;
        this.useSearchService = config.useSearchService ?? true;

        // Initialize search service if configured
        if (config.searchService && this.useSearchService) {
            this.searchService = new SearchService(config.searchService);
        }

        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            params: {
                key: this.apiKey
            }
        });
    }

    /**
     * Searches for YouTube channels by query
     * Uses hybrid approach: SearchService (0 quota) + YouTube API for details (1 unit per channel)
     * Falls back to direct YouTube API search if SearchService is unavailable
     * 
     * @param query - Search query (channel name or keywords)
     * @returns Array of matching channels
     * @throws APIError if the request fails
     */
    async searchChannels(query: string): Promise<Channel[]> {
        if (!query || query.trim().length === 0) {
            throw this.createAPIError(400, 'Search query cannot be empty', 'Please enter a channel name to search', false);
        }

        // Check cache first - use longer cache for search results (24 hours)
        const cacheKey = `search:${query.toLowerCase().trim()}`;

        const cachedChannels = this.cache.getVideos(cacheKey);
        if (cachedChannels) {
            // Cache stores Video[], but we're using it for Channel[] here
            // This is a workaround - we'll store as any and cast
            return cachedChannels as unknown as Channel[];
        }

        // Try search service first (if available and enabled)
        if (this.searchService && this.useSearchService) {
            try {
                const isHealthy = await this.searchService.isHealthy();
                if (isHealthy) {
                    console.log('Using SearchService for channel search (0 API quota)');
                    return await this.searchChannelsViaService(query, cacheKey);
                } else {
                    console.warn('SearchService is not healthy, falling back to YouTube API');
                }
            } catch (error) {
                console.warn('SearchService failed, falling back to YouTube API:', error);
            }
        }

        // Fallback to direct YouTube API search
        console.log('Using YouTube API for channel search (100 API quota)');
        return await this.searchChannelsViaAPI(query, cacheKey);
    }

    /**
     * Search channels using the Python search service (0 API quota)
     * @param query - Search query
     * @param cacheKey - Cache key for storing results
     * @returns Array of channels with full details
     */
    private async searchChannelsViaService(query: string, cacheKey: string): Promise<Channel[]> {
        try {
            // Get search results from Python service (0 API quota)
            const searchResults = await this.searchService!.searchChannels(query, Math.min(this.maxResults, 25));

            if (searchResults.length === 0) {
                return [];
            }

            // Extract video IDs to get channel IDs
            const videoIds = SearchService.extractVideoIds(searchResults);

            // Get video details to extract channel IDs (1 unit per 50 videos)
            const videoDetails = await this.getVideoDetails(videoIds);

            // Extract unique channel IDs
            const channelIds = [...new Set(videoDetails.map(video => video.channelId))];

            if (channelIds.length === 0) {
                return [];
            }

            // Get full channel details (1 unit per channel)
            const channels = await this.getChannelsByIds(channelIds);

            // Sort channels by relevance (based on search result confidence)
            const channelRelevanceMap = new Map<string, number>();

            // Map video channels to search result confidence
            videoDetails.forEach(video => {
                const searchResult = searchResults.find(sr => sr.videoId === video.id);
                if (searchResult) {
                    const currentConfidence = channelRelevanceMap.get(video.channelId) || 0;
                    channelRelevanceMap.set(video.channelId, Math.max(currentConfidence, searchResult.confidence));
                }
            });

            // Sort channels by confidence score
            channels.sort((a, b) => {
                const confidenceA = channelRelevanceMap.get(a.id) || 0;
                const confidenceB = channelRelevanceMap.get(b.id) || 0;
                return confidenceB - confidenceA;
            });

            // Cache the results for 24 hours
            this.cache.setVideos(cacheKey, channels as unknown as Video[], 24 * 60 * 60 * 1000);

            return channels;

        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Search channels using direct YouTube API (100 API quota)
     * @param query - Search query
     * @param cacheKey - Cache key for storing results
     * @returns Array of channels
     */
    private async searchChannelsViaAPI(query: string, cacheKey: string): Promise<Channel[]> {
        try {
            const response = await this.makeAPIRequest<YouTubeAPIResponse<YouTubeChannelSearchItem>>('/search', {
                part: 'snippet',
                type: 'channel',
                q: query,
                maxResults: Math.min(this.maxResults, 25) // Search endpoint has lower limits
            });

            this.validateResponse(response, ['items']);

            // Extract channel IDs to fetch full details
            const channelIds = response.items.map(item => item.id.channelId);

            if (channelIds.length === 0) {
                return [];
            }

            // Fetch full channel details to get subscriber counts and uploads playlist
            const channels = await this.getChannelsByIds(channelIds);

            // Cache the results for 24 hours (search results change less frequently)
            this.cache.setVideos(cacheKey, channels as unknown as Video[], 24 * 60 * 60 * 1000);

            return channels;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Gets detailed information for a specific channel
     * Uses channels.list endpoint (cost: 1 unit per request)
     * 
     * @param channelId - YouTube channel ID
     * @returns Channel information
     * @throws APIError if the request fails
     */
    async getChannelInfo(channelId: string): Promise<Channel> {
        if (!channelId || channelId.trim().length === 0) {
            throw this.createAPIError(400, 'Channel ID cannot be empty', 'Please provide a valid channel ID', false);
        }

        // Check cache first
        const cachedChannel = this.cache.getChannel(channelId);
        if (cachedChannel) {
            return cachedChannel;
        }

        try {
            const response = await this.makeAPIRequest<YouTubeAPIResponse<YouTubeChannelItem>>('/channels', {
                part: 'snippet,statistics,contentDetails',
                id: channelId
            });

            this.validateResponse(response, ['items']);

            if (response.items.length === 0) {
                throw this.createAPIError(404, 'Channel not found', 'The channel you requested could not be found', false);
            }

            const item = response.items[0];
            const channel = this.mapChannelItem(item);

            // Cache the channel
            this.cache.setChannel(channelId, channel);

            return channel;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Gets recent videos from a channel's uploads playlist
     * Uses playlistItems.list endpoint (cost: 1 unit per request)
     * 
     * @param channelId - YouTube channel ID
     * @param maxResults - Maximum number of videos to fetch (default: 50)
     * @returns Array of videos from the channel
     * @throws APIError if the request fails
     */
    async getChannelVideos(channelId: string, maxResults?: number): Promise<Video[]> {
        if (!channelId || channelId.trim().length === 0) {
            throw this.createAPIError(400, 'Channel ID cannot be empty', 'Please provide a valid channel ID', false);
        }

        const limit = maxResults ?? this.maxResults;

        // Check cache first
        const cacheKey = `videos:${channelId}:${limit}`;
        const cachedVideos = this.cache.getVideos(cacheKey);
        if (cachedVideos) {
            return cachedVideos;
        }

        try {
            // First, get the channel info to get the uploads playlist ID
            const channel = await this.getChannelInfo(channelId);

            // Calculate the date threshold for filtering videos
            const publishedAfter = new Date();
            publishedAfter.setDate(publishedAfter.getDate() - this.videoTimeWindowDays);

            // Fetch videos from the uploads playlist
            const response = await this.makeAPIRequest<YouTubeAPIResponse<YouTubePlaylistItem>>('/playlistItems', {
                part: 'snippet',
                playlistId: channel.uploadsPlaylistId,
                maxResults: limit
            });

            this.validateResponse(response, ['items']);

            // Filter videos by date and extract video IDs
            const videoIds = response.items
                .filter(item => {
                    const publishedDate = new Date(item.snippet.publishedAt);
                    return publishedDate >= publishedAfter;
                })
                .map(item => item.snippet.resourceId.videoId);

            if (videoIds.length === 0) {
                return [];
            }

            // Fetch full video details (including duration)
            const videos = await this.getVideoDetails(videoIds);

            // Cache the results
            this.cache.setVideos(cacheKey, videos);

            return videos;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Gets detailed information for multiple videos
     * Uses videos.list endpoint (cost: 1 unit per request, up to 50 videos per request)
     * 
     * @param videoIds - Array of YouTube video IDs
     * @returns Array of video details
     * @throws APIError if the request fails
     */
    async getVideoDetails(videoIds: string[]): Promise<Video[]> {
        if (!videoIds || videoIds.length === 0) {
            return [];
        }

        try {
            // YouTube API allows up to 50 video IDs per request
            const batchSize = 50;
            const batches: string[][] = [];

            for (let i = 0; i < videoIds.length; i += batchSize) {
                batches.push(videoIds.slice(i, i + batchSize));
            }

            const allVideos: Video[] = [];

            for (const batch of batches) {
                const response = await this.makeAPIRequest<YouTubeAPIResponse<YouTubeVideoItem>>('/videos', {
                    part: 'snippet,contentDetails',
                    id: batch.join(',')
                });

                this.validateResponse(response, ['items']);

                const videos = response.items.map(item => this.mapVideoItem(item));
                allVideos.push(...videos);
            }

            return allVideos;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Makes an API request to YouTube Data API v3
     * @param endpoint - API endpoint path
     * @param params - Request parameters
     * @returns API response data
     */
    private async makeAPIRequest<T>(endpoint: string, params: Record<string, any>): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(endpoint, {
                params: params
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Helper method to fetch multiple channels by IDs
     * @param channelIds - Array of channel IDs
     * @returns Array of channels
     */
    private async getChannelsByIds(channelIds: string[]): Promise<Channel[]> {
        if (channelIds.length === 0) {
            return [];
        }

        try {
            const response = await this.makeAPIRequest<YouTubeAPIResponse<YouTubeChannelItem>>('/channels', {
                part: 'snippet,statistics,contentDetails',
                id: channelIds.join(',')
            });

            this.validateResponse(response, ['items']);

            return response.items.map(item => this.mapChannelItem(item));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Maps YouTube API channel item to internal Channel model
     * @param item - YouTube API channel item
     * @returns Channel object
     */
    private mapChannelItem(item: YouTubeChannelItem): Channel {
        return {
            id: item.id,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default.url,
            subscriberCount: parseInt(item.statistics.subscriberCount, 10),
            uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
        };
    }

    /**
     * Maps YouTube API video item to internal Video model
     * @param item - YouTube API video item
     * @returns Video object
     */
    private mapVideoItem(item: YouTubeVideoItem): Video {
        return {
            id: item.id,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default.url,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            publishedAt: new Date(item.snippet.publishedAt),
            duration: item.contentDetails.duration,
            description: item.snippet.description
        };
    }

    /**
     * Validates that an API response contains required fields
     * @param response - API response object
     * @param requiredFields - Array of required field names
     * @throws APIError if validation fails
     */
    private validateResponse(response: any, requiredFields: string[]): void {
        if (!response) {
            throw this.createAPIError(500, 'Empty response from API', 'Received an invalid response from YouTube', true);
        }

        for (const field of requiredFields) {
            if (!(field in response)) {
                throw this.createAPIError(500, `Missing required field: ${field}`, 'Received an invalid response from YouTube', true);
            }
        }

        // Validate items array if present
        if ('items' in response && !Array.isArray(response.items)) {
            throw this.createAPIError(500, 'Invalid items field in response', 'Received an invalid response from YouTube', true);
        }
    }

    /**
     * Handles errors from API requests and converts them to APIError
     * @param error - Error from axios or other source
     * @returns APIError object
     */
    private handleError(error: unknown): APIError {
        // If it's already an APIError, return it
        if (this.isAPIError(error)) {
            return error;
        }

        // Handle axios errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            // Network errors
            if (!axiosError.response) {
                return this.createAPIError(
                    0,
                    axiosError.message,
                    'Unable to connect to YouTube. Please check your internet connection.',
                    true
                );
            }

            const status = axiosError.response.status;
            const data = axiosError.response.data as any;

            // Parse YouTube API error response
            const message = data?.error?.message ?? axiosError.message;

            switch (status) {
                case 400:
                    return this.createAPIError(
                        400,
                        message,
                        'Invalid request. Please check your input and try again.',
                        false
                    );
                case 403:
                    // Check if it's a quota error
                    if (message.toLowerCase().includes('quota')) {
                        return this.createAPIError(
                            403,
                            message,
                            'YouTube API quota exceeded. The quota resets daily at midnight PST. Try again in a few hours or contact support for a premium API key.',
                            false
                        );
                    }
                    return this.createAPIError(
                        403,
                        message,
                        'Access denied. Please check your API key configuration.',
                        false
                    );
                case 404:
                    return this.createAPIError(
                        404,
                        message,
                        'The requested resource was not found.',
                        false
                    );
                case 429:
                    return this.createAPIError(
                        429,
                        message,
                        'Too many requests. Please wait a moment and try again.',
                        true
                    );
                case 500:
                case 503:
                    return this.createAPIError(
                        status,
                        message,
                        'YouTube service is temporarily unavailable. Please try again later.',
                        true
                    );
                default:
                    return this.createAPIError(
                        status,
                        message,
                        'An unexpected error occurred. Please try again.',
                        true
                    );
            }
        }

        // Handle unknown errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return this.createAPIError(
            500,
            errorMessage,
            'An unexpected error occurred. Please try again.',
            true
        );
    }

    /**
     * Creates an APIError object
     * @param code - HTTP status code
     * @param message - Technical error message
     * @param userMessage - User-friendly error message
     * @param retryable - Whether the error is retryable
     * @returns APIError object
     */
    private createAPIError(code: number, message: string, userMessage: string, retryable: boolean): APIError {
        return {
            code,
            message,
            userMessage,
            retryable
        };
    }

    /**
     * Type guard to check if an error is an APIError
     * @param error - Error to check
     * @returns True if error is an APIError
     */
    private isAPIError(error: unknown): error is APIError {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            'message' in error &&
            'userMessage' in error &&
            'retryable' in error
        );
    }
}