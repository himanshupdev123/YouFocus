/**
 * Custom fast-check generators (arbitraries) for property-based testing
 * These generators create valid test data for the Focused YouTube Viewer
 */

import fc from 'fast-check';
import type {
    Channel,
    Video,
    APIError,
    YouTubeChannelSearchItem,
    YouTubeChannelItem,
    YouTubePlaylistItem,
    YouTubeVideoItem,
    YouTubeAPIResponse,
} from '../types';

/**
 * Generates valid YouTube channel IDs (24 characters starting with "UC")
 */
export const channelIdArbitrary = fc
    .array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('')), { minLength: 22, maxLength: 22 })
    .map(chars => 'UC' + chars.join(''));

/**
 * Generates valid YouTube video IDs (11 characters)
 */
export const videoIdArbitrary = fc
    .array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('')), { minLength: 11, maxLength: 11 })
    .map(chars => chars.join(''));

/**
 * Generates valid uploads playlist IDs (24 characters starting with "UU")
 */
export const uploadsPlaylistIdArbitrary = fc
    .array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('')), { minLength: 22, maxLength: 22 })
    .map(chars => 'UU' + chars.join(''));

/**
 * Generates ISO 8601 duration strings (e.g., "PT4M13S", "PT1H2M10S")
 */
export const durationArbitrary = fc
    .record({
        hours: fc.option(fc.nat({ max: 10 }), { nil: undefined }),
        minutes: fc.nat({ max: 59 }),
        seconds: fc.nat({ max: 59 }),
    })
    .map(({ hours, minutes, seconds }) => {
        let duration = 'PT';
        if (hours) duration += `${hours}H`;
        if (minutes) duration += `${minutes}M`;
        if (seconds) duration += `${seconds}S`;
        return duration || 'PT0S';
    });

/**
 * Generates valid Channel objects
 * Handles edge cases: optional subscriber count
 */
export const channelArbitrary: fc.Arbitrary<Channel> = fc.record({
    id: channelIdArbitrary,
    title: fc.string({ minLength: 1, maxLength: 100 }),
    thumbnailUrl: fc.webUrl(),
    uploadsPlaylistId: uploadsPlaylistIdArbitrary,
    subscriberCount: fc.option(fc.nat({ max: 100000000 }), { nil: undefined }),
});

/**
 * Generates valid Video objects
 * Handles edge cases: dates, durations, descriptions
 */
export const videoArbitrary: fc.Arbitrary<Video> = fc.record({
    id: videoIdArbitrary,
    title: fc.string({ minLength: 1, maxLength: 200 }),
    thumbnailUrl: fc.webUrl(),
    channelId: channelIdArbitrary,
    channelTitle: fc.string({ minLength: 1, maxLength: 100 }),
    publishedAt: fc.date({ min: new Date('2005-01-01'), max: new Date() }),
    duration: durationArbitrary,
    description: fc.string({ maxLength: 5000 }),
});

/**
 * Generates APIError objects with various error scenarios
 * Covers: quota exceeded, invalid API key, network errors, rate limiting, not found
 */
export const errorArbitrary: fc.Arbitrary<APIError> = fc.oneof(
    // Quota exceeded (403)
    fc.constant({
        code: 403,
        message: 'quotaExceeded',
        userMessage: 'Daily API quota exceeded. Please try again later.',
        retryable: false,
    }),
    // Invalid API key (400)
    fc.constant({
        code: 400,
        message: 'keyInvalid',
        userMessage: 'Invalid API key. Please check your configuration.',
        retryable: false,
    }),
    // Network error
    fc.constant({
        code: 0,
        message: 'Network Error',
        userMessage: 'Network connection failed. Please check your internet connection.',
        retryable: true,
    }),
    // Rate limiting (429)
    fc.constant({
        code: 429,
        message: 'rateLimitExceeded',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        retryable: true,
    }),
    // Not found (404)
    fc.constant({
        code: 404,
        message: 'videoNotFound',
        userMessage: 'The requested resource was not found.',
        retryable: false,
    }),
    // Channel not found (404)
    fc.constant({
        code: 404,
        message: 'channelNotFound',
        userMessage: 'Channel not found. Please check the channel ID or URL.',
        retryable: false,
    }),
    // Generic server error (500)
    fc.constant({
        code: 500,
        message: 'internalServerError',
        userMessage: 'An unexpected error occurred. Please try again later.',
        retryable: true,
    }),
);

/**
 * Generates YouTube API channel search response items
 */
export const youtubeChannelSearchItemArbitrary: fc.Arbitrary<YouTubeChannelSearchItem> = fc.record({
    id: fc.record({
        kind: fc.constant('youtube#channel'),
        channelId: channelIdArbitrary,
    }),
    snippet: fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ maxLength: 500 }),
        thumbnails: fc.record({
            default: fc.record({ url: fc.webUrl() }),
            medium: fc.record({ url: fc.webUrl() }),
            high: fc.record({ url: fc.webUrl() }),
        }),
    }),
});

/**
 * Generates YouTube API channel list response items
 */
export const youtubeChannelItemArbitrary: fc.Arbitrary<YouTubeChannelItem> = fc.record({
    id: channelIdArbitrary,
    snippet: fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ maxLength: 500 }),
        thumbnails: fc.record({
            default: fc.record({ url: fc.webUrl() }),
            medium: fc.record({ url: fc.webUrl() }),
            high: fc.record({ url: fc.webUrl() }),
        }),
    }),
    statistics: fc.record({
        subscriberCount: fc.nat({ max: 100000000 }).map(String),
        videoCount: fc.nat({ max: 10000 }).map(String),
        viewCount: fc.nat({ max: 1000000000 }).map(String),
    }),
    contentDetails: fc.record({
        relatedPlaylists: fc.record({
            uploads: uploadsPlaylistIdArbitrary,
        }),
    }),
});

/**
 * Generates YouTube API playlist item response
 */
export const youtubePlaylistItemArbitrary: fc.Arbitrary<YouTubePlaylistItem> = fc.record({
    id: fc.string({ minLength: 10, maxLength: 20 }),
    snippet: fc.record({
        publishedAt: fc.integer({ min: new Date('2005-01-01').getTime(), max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
        channelId: channelIdArbitrary,
        title: fc.string({ minLength: 1, maxLength: 200 }),
        description: fc.string({ maxLength: 5000 }),
        thumbnails: fc.record({
            default: fc.record({ url: fc.webUrl() }),
            medium: fc.record({ url: fc.webUrl() }),
            high: fc.record({ url: fc.webUrl() }),
        }),
        channelTitle: fc.string({ minLength: 1, maxLength: 100 }),
        resourceId: fc.record({
            kind: fc.constant('youtube#video'),
            videoId: videoIdArbitrary,
        }),
    }),
});

/**
 * Generates YouTube API video item response
 */
export const youtubeVideoItemArbitrary: fc.Arbitrary<YouTubeVideoItem> = fc.record({
    id: videoIdArbitrary,
    snippet: fc.record({
        publishedAt: fc.integer({ min: new Date('2005-01-01').getTime(), max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
        channelId: channelIdArbitrary,
        title: fc.string({ minLength: 1, maxLength: 200 }),
        description: fc.string({ maxLength: 5000 }),
        thumbnails: fc.record({
            default: fc.record({ url: fc.webUrl() }),
            medium: fc.record({ url: fc.webUrl() }),
            high: fc.record({ url: fc.webUrl() }),
        }),
        channelTitle: fc.string({ minLength: 1, maxLength: 100 }),
    }),
    contentDetails: fc.record({
        duration: durationArbitrary,
    }),
});

/**
 * Generates complete YouTube API response wrapper
 * Handles edge cases: empty results, pagination tokens
 */
export function youtubeAPIResponseArbitrary<T>(
    itemArbitrary: fc.Arbitrary<T>
): fc.Arbitrary<YouTubeAPIResponse<T>> {
    return fc.record({
        kind: fc.string({ minLength: 10, maxLength: 30 }),
        etag: fc.string({ minLength: 10, maxLength: 50 }),
        items: fc.array(itemArbitrary, { minLength: 0, maxLength: 50 }),
        pageInfo: fc.option(
            fc.record({
                totalResults: fc.nat({ max: 1000000 }),
                resultsPerPage: fc.integer({ min: 1, max: 50 }),
            }),
            { nil: undefined }
        ),
        nextPageToken: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
        prevPageToken: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
    });
}

/**
 * Edge case generators
 */

/**
 * Generates empty channel lists
 */
export const emptyChannelListArbitrary = fc.constant<Channel[]>([]);

/**
 * Generates channels with no videos (empty uploads playlist)
 */
export const channelWithNoVideosArbitrary = channelArbitrary;

/**
 * Generates empty video lists
 */
export const emptyVideoListArbitrary = fc.constant<Video[]>([]);

/**
 * Generates invalid channel identifiers (for testing validation)
 */
export const invalidChannelIdArbitrary = fc.oneof(
    fc.constant(''), // Empty string
    fc.string({ minLength: 1, maxLength: 10 }), // Too short
    fc.string({ minLength: 30, maxLength: 50 }), // Too long
    fc.constant('INVALID123'), // Wrong format
    fc.constant('UC'), // Just prefix
    fc.constant('https://not-a-valid-url'), // Invalid URL
);

/**
 * Generates channel lists of various sizes including edge cases
 */
export const channelListArbitrary = fc.oneof(
    emptyChannelListArbitrary, // Empty list
    fc.array(channelArbitrary, { minLength: 1, maxLength: 1 }), // Single channel
    fc.array(channelArbitrary, { minLength: 2, maxLength: 10 }), // Normal list
    fc.array(channelArbitrary, { minLength: 50, maxLength: 100 }), // Large list
);

/**
 * Generates video lists of various sizes including edge cases
 */
export const videoListArbitrary = fc.oneof(
    emptyVideoListArbitrary, // Empty list
    fc.array(videoArbitrary, { minLength: 1, maxLength: 1 }), // Single video
    fc.array(videoArbitrary, { minLength: 2, maxLength: 20 }), // Normal list
    fc.array(videoArbitrary, { minLength: 100, maxLength: 200 }), // Large list
);
