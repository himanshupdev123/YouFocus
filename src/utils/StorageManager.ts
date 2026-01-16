import type { Channel } from '../types';

/**
 * Storage keys used by the application
 */
const STORAGE_KEYS = {
    CHANNELS: 'focused_yt_channels',
    FIRST_VISIT: 'focused_yt_first_visit',
    CACHE: 'focused_yt_cache',
};

/**
 * Custom error class for storage-related errors
 */
export class StorageError extends Error {
    public readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'StorageError';
        this.cause = cause;
    }
}

/**
 * Manages persistence of user data to LocalStorage
 * Handles channel list storage, first visit tracking, and error handling
 */
export class StorageManager {
    /**
     * Saves the channel list to localStorage
     * @param channels - Array of channels to save
     * @throws {StorageError} If storage quota is exceeded or access is denied
     */
    saveChannels(channels: Channel[]): void {
        try {
            const serialized = JSON.stringify(channels);
            localStorage.setItem(STORAGE_KEYS.CHANNELS, serialized);
        } catch (error) {
            if (error instanceof Error) {
                // Handle quota exceeded error
                if (error.name === 'QuotaExceededError') {
                    throw new StorageError(
                        'Storage quota exceeded. Please clear some data.',
                        error
                    );
                }
                // Handle security/access errors
                if (error.name === 'SecurityError') {
                    throw new StorageError(
                        'Access to localStorage is denied. Please check your browser settings.',
                        error
                    );
                }
            }
            // Generic storage error
            throw new StorageError(
                'Failed to save channels to storage.',
                error
            );
        }
    }

    /**
     * Loads the channel list from localStorage
     * @returns Array of channels, or empty array if none exist or data is corrupted
     */
    loadChannels(): Channel[] {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.CHANNELS);

            // Return empty array if no data exists
            if (!serialized) {
                return [];
            }

            const parsed = JSON.parse(serialized);

            // Validate that parsed data is an array
            if (!Array.isArray(parsed)) {
                console.warn('Corrupted channel data detected. Returning empty array.');
                return [];
            }

            // Basic validation of channel objects
            const validChannels = parsed.filter(this.isValidChannel);

            // Warn if some channels were filtered out
            if (validChannels.length !== parsed.length) {
                console.warn(
                    `Filtered out ${parsed.length - validChannels.length} invalid channel(s).`
                );
            }

            return validChannels;
        } catch (error) {
            // Handle JSON parse errors or other issues
            console.error('Failed to load channels from storage:', error);

            // Clear corrupted data
            try {
                localStorage.removeItem(STORAGE_KEYS.CHANNELS);
            } catch {
                // Ignore errors when clearing
            }

            return [];
        }
    }

    /**
     * Validates that an object has the required Channel properties
     * @param obj - Object to validate
     * @returns True if object is a valid Channel
     */
    private isValidChannel(obj: unknown): obj is Channel {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }

        const channel = obj as Record<string, unknown>;

        return (
            typeof channel.id === 'string' &&
            typeof channel.title === 'string' &&
            typeof channel.thumbnailUrl === 'string' &&
            typeof channel.uploadsPlaylistId === 'string' &&
            (channel.subscriberCount === undefined ||
                typeof channel.subscriberCount === 'number')
        );
    }

    /**
     * Clears all channel data from localStorage
     */
    clearChannels(): void {
        try {
            localStorage.removeItem(STORAGE_KEYS.CHANNELS);
        } catch (error) {
            console.error('Failed to clear channels from storage:', error);
            throw new StorageError('Failed to clear channel data.', error);
        }
    }

    /**
     * Checks if this is the user's first visit
     * @returns True if first visit, false otherwise
     */
    isFirstVisit(): boolean {
        try {
            const visited = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
            return visited !== 'true';
        } catch (error) {
            // If we can't access storage, assume it's not first visit
            // to avoid showing onboarding repeatedly
            console.error('Failed to check first visit status:', error);
            return false;
        }
    }

    /**
     * Marks that the user has visited the application
     */
    markVisited(): void {
        try {
            localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
        } catch (error) {
            // Non-critical error, just log it
            console.error('Failed to mark as visited:', error);
        }
    }
}
