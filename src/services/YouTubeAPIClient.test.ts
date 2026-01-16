/**
 * Unit tests for YouTubeAPIClient
 * 
 * Tests basic functionality, error handling, and validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { YouTubeAPIClient } from './YouTubeAPIClient';
import { APICache } from './APICache';

describe('YouTubeAPIClient', () => {
    let client: YouTubeAPIClient;
    let cache: APICache;

    beforeEach(() => {
        cache = new APICache();
        client = new YouTubeAPIClient({
            apiKey: 'test-api-key',
            cache,
            maxResults: 50,
            videoTimeWindowDays: 30
        });
    });

    describe('constructor', () => {
        it('should create an instance with provided config', () => {
            expect(client).toBeInstanceOf(YouTubeAPIClient);
        });

        it('should create an instance with default cache if not provided', () => {
            const clientWithoutCache = new YouTubeAPIClient({
                apiKey: 'test-api-key'
            });
            expect(clientWithoutCache).toBeInstanceOf(YouTubeAPIClient);
        });
    });

    describe('searchChannels', () => {
        it('should throw error for empty query', async () => {
            await expect(client.searchChannels('')).rejects.toMatchObject({
                code: 400,
                userMessage: 'Please enter a channel name to search',
                retryable: false
            });
        });

        it('should throw error for whitespace-only query', async () => {
            await expect(client.searchChannels('   ')).rejects.toMatchObject({
                code: 400,
                userMessage: 'Please enter a channel name to search',
                retryable: false
            });
        });
    });

    describe('getChannelInfo', () => {
        it('should throw error for empty channel ID', async () => {
            await expect(client.getChannelInfo('')).rejects.toMatchObject({
                code: 400,
                userMessage: 'Please provide a valid channel ID',
                retryable: false
            });
        });

        it('should throw error for whitespace-only channel ID', async () => {
            await expect(client.getChannelInfo('   ')).rejects.toMatchObject({
                code: 400,
                userMessage: 'Please provide a valid channel ID',
                retryable: false
            });
        });
    });

    describe('getChannelVideos', () => {
        it('should throw error for empty channel ID', async () => {
            await expect(client.getChannelVideos('')).rejects.toMatchObject({
                code: 400,
                userMessage: 'Please provide a valid channel ID',
                retryable: false
            });
        });

        it('should throw error for whitespace-only channel ID', async () => {
            await expect(client.getChannelVideos('   ')).rejects.toMatchObject({
                code: 400,
                userMessage: 'Please provide a valid channel ID',
                retryable: false
            });
        });
    });

    describe('getVideoDetails', () => {
        it('should return empty array for empty video IDs', async () => {
            const result = await client.getVideoDetails([]);
            expect(result).toEqual([]);
        });
    });
});
