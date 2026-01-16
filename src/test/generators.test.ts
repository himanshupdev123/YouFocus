/**
 * Tests for custom generators to ensure they produce valid data
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
    channelIdArbitrary,
    videoIdArbitrary,
    uploadsPlaylistIdArbitrary,
    durationArbitrary,
    channelArbitrary,
    videoArbitrary,
    errorArbitrary,
    youtubeChannelSearchItemArbitrary,
    youtubeChannelItemArbitrary,
    youtubePlaylistItemArbitrary,
    youtubeVideoItemArbitrary,
    youtubeAPIResponseArbitrary,
    emptyChannelListArbitrary,
    emptyVideoListArbitrary,
    invalidChannelIdArbitrary,
    channelListArbitrary,
    videoListArbitrary,
} from './generators';

describe('Generator Tests', () => {
    test('channelIdArbitrary generates valid channel IDs', () => {
        fc.assert(
            fc.property(channelIdArbitrary, (channelId) => {
                expect(channelId).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(channelId.length).toBe(24);
            }),
            { numRuns: 100 }
        );
    });

    test('videoIdArbitrary generates valid video IDs', () => {
        fc.assert(
            fc.property(videoIdArbitrary, (videoId) => {
                expect(videoId.length).toBe(11);
            }),
            { numRuns: 100 }
        );
    });

    test('uploadsPlaylistIdArbitrary generates valid playlist IDs', () => {
        fc.assert(
            fc.property(uploadsPlaylistIdArbitrary, (playlistId) => {
                expect(playlistId).toMatch(/^UU[A-Za-z0-9_-]{22}$/);
                expect(playlistId.length).toBe(24);
            }),
            { numRuns: 100 }
        );
    });

    test('durationArbitrary generates valid ISO 8601 durations', () => {
        fc.assert(
            fc.property(durationArbitrary, (duration) => {
                expect(duration).toMatch(/^PT(\d+H)?(\d+M)?(\d+S)?$/);
                expect(duration.startsWith('PT')).toBe(true);
            }),
            { numRuns: 100 }
        );
    });

    test('channelArbitrary generates valid Channel objects', () => {
        fc.assert(
            fc.property(channelArbitrary, (channel) => {
                expect(channel.id).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(channel.title.length).toBeGreaterThan(0);
                expect(channel.thumbnailUrl).toMatch(/^https?:\/\//);
                expect(channel.uploadsPlaylistId).toMatch(/^UU[A-Za-z0-9_-]{22}$/);
                if (channel.subscriberCount !== undefined) {
                    expect(channel.subscriberCount).toBeGreaterThanOrEqual(0);
                }
            }),
            { numRuns: 100 }
        );
    });

    test('videoArbitrary generates valid Video objects', () => {
        fc.assert(
            fc.property(videoArbitrary, (video) => {
                expect(video.id.length).toBe(11);
                expect(video.title.length).toBeGreaterThan(0);
                expect(video.thumbnailUrl).toMatch(/^https?:\/\//);
                expect(video.channelId).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(video.channelTitle.length).toBeGreaterThan(0);
                expect(video.publishedAt).toBeInstanceOf(Date);
                expect(video.duration).toMatch(/^PT(\d+H)?(\d+M)?(\d+S)?$/);
                expect(typeof video.description).toBe('string');
            }),
            { numRuns: 100 }
        );
    });

    test('errorArbitrary generates valid APIError objects', () => {
        fc.assert(
            fc.property(errorArbitrary, (error) => {
                expect(typeof error.code).toBe('number');
                expect(error.message.length).toBeGreaterThan(0);
                expect(error.userMessage.length).toBeGreaterThan(0);
                expect(typeof error.retryable).toBe('boolean');
                // Verify it's one of the expected error codes
                expect([0, 400, 403, 404, 429, 500]).toContain(error.code);
            }),
            { numRuns: 100 }
        );
    });

    test('youtubeChannelSearchItemArbitrary generates valid search items', () => {
        fc.assert(
            fc.property(youtubeChannelSearchItemArbitrary, (item) => {
                expect(item.id.kind).toBe('youtube#channel');
                expect(item.id.channelId).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(item.snippet.title.length).toBeGreaterThan(0);
                expect(item.snippet.thumbnails.default.url).toMatch(/^https?:\/\//);
            }),
            { numRuns: 100 }
        );
    });

    test('youtubeChannelItemArbitrary generates valid channel items', () => {
        fc.assert(
            fc.property(youtubeChannelItemArbitrary, (item) => {
                expect(item.id).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(item.snippet.title.length).toBeGreaterThan(0);
                expect(item.statistics.subscriberCount).toMatch(/^\d+$/);
                expect(item.contentDetails.relatedPlaylists.uploads).toMatch(/^UU[A-Za-z0-9_-]{22}$/);
            }),
            { numRuns: 100 }
        );
    });

    test('youtubePlaylistItemArbitrary generates valid playlist items', () => {
        fc.assert(
            fc.property(youtubePlaylistItemArbitrary, (item) => {
                expect(item.snippet.channelId).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(item.snippet.resourceId.kind).toBe('youtube#video');
                expect(item.snippet.resourceId.videoId.length).toBe(11);
                expect(item.snippet.title.length).toBeGreaterThan(0);
            }),
            { numRuns: 100 }
        );
    });

    test('youtubeVideoItemArbitrary generates valid video items', () => {
        fc.assert(
            fc.property(youtubeVideoItemArbitrary, (item) => {
                expect(item.id.length).toBe(11);
                expect(item.snippet.channelId).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                expect(item.snippet.title.length).toBeGreaterThan(0);
                expect(item.contentDetails.duration).toMatch(/^PT(\d+H)?(\d+M)?(\d+S)?$/);
            }),
            { numRuns: 100 }
        );
    });

    test('youtubeAPIResponseArbitrary generates valid API responses', () => {
        fc.assert(
            fc.property(
                youtubeAPIResponseArbitrary(youtubeChannelItemArbitrary),
                (response) => {
                    expect(response.kind.length).toBeGreaterThan(0);
                    expect(response.etag.length).toBeGreaterThan(0);
                    expect(Array.isArray(response.items)).toBe(true);
                    expect(response.items.length).toBeLessThanOrEqual(50);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('emptyChannelListArbitrary generates empty arrays', () => {
        fc.assert(
            fc.property(emptyChannelListArbitrary, (list) => {
                expect(list).toEqual([]);
                expect(list.length).toBe(0);
            }),
            { numRuns: 10 }
        );
    });

    test('emptyVideoListArbitrary generates empty arrays', () => {
        fc.assert(
            fc.property(emptyVideoListArbitrary, (list) => {
                expect(list).toEqual([]);
                expect(list.length).toBe(0);
            }),
            { numRuns: 10 }
        );
    });

    test('invalidChannelIdArbitrary generates invalid channel IDs', () => {
        fc.assert(
            fc.property(invalidChannelIdArbitrary, (channelId) => {
                // Should not match valid channel ID pattern
                const isValid = /^UC[A-Za-z0-9_-]{22}$/.test(channelId);
                expect(isValid).toBe(false);
            }),
            { numRuns: 100 }
        );
    });

    test('channelListArbitrary generates various sized lists', () => {
        fc.assert(
            fc.property(channelListArbitrary, (list) => {
                expect(Array.isArray(list)).toBe(true);
                expect(list.length).toBeGreaterThanOrEqual(0);
                expect(list.length).toBeLessThanOrEqual(100);
                // Verify all items are valid channels
                list.forEach(channel => {
                    expect(channel.id).toMatch(/^UC[A-Za-z0-9_-]{22}$/);
                });
            }),
            { numRuns: 100 }
        );
    });

    test('videoListArbitrary generates various sized lists', () => {
        fc.assert(
            fc.property(videoListArbitrary, (list) => {
                expect(Array.isArray(list)).toBe(true);
                expect(list.length).toBeGreaterThanOrEqual(0);
                expect(list.length).toBeLessThanOrEqual(200);
                // Verify all items are valid videos
                list.forEach(video => {
                    expect(video.id.length).toBe(11);
                });
            }),
            { numRuns: 100 }
        );
    });

    test('channelListArbitrary includes edge cases', () => {
        const samples: number[] = [];
        fc.sample(channelListArbitrary, 100).forEach(list => {
            samples.push(list.length);
        });

        // Should include empty lists
        expect(samples).toContain(0);
        // Should include single item lists
        expect(samples).toContain(1);
        // Should include larger lists
        expect(samples.some(n => n > 10)).toBe(true);
    });

    test('videoListArbitrary includes edge cases', () => {
        const samples: number[] = [];
        fc.sample(videoListArbitrary, 100).forEach(list => {
            samples.push(list.length);
        });

        // Should include empty lists
        expect(samples).toContain(0);
        // Should include single item lists
        expect(samples).toContain(1);
        // Should include larger lists
        expect(samples.some(n => n > 20)).toBe(true);
    });
});
