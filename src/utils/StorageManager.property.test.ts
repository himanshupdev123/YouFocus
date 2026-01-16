import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import fc from 'fast-check';
import { StorageManager } from './StorageManager';
import { channelArbitrary } from '../test/generators';

describe('StorageManager Property Tests', () => {
    let storageManager: StorageManager;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        storageManager = new StorageManager();
    });

    afterEach(() => {
        // Clean up after each test
        localStorage.clear();
    });

    // Feature: focused-youtube-viewer, Property 6: Channel list persistence round-trip
    test('Property 6: Channel list persistence round-trip', () => {
        fc.assert(
            fc.property(
                fc.array(channelArbitrary, { minLength: 0, maxLength: 50 }),
                (channels) => {
                    // Save channels to storage
                    storageManager.saveChannels(channels);

                    // Load channels back from storage
                    const loadedChannels = storageManager.loadChannels();

                    // Verify round-trip preserves all data
                    expect(loadedChannels).toEqual(channels);
                }
            ),
            { numRuns: 100 }
        );
    });
});
