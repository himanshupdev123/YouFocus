/**
 * SimpleAPIKeyRotator - Basic API key rotation for quota management
 * 
 * Simple approach: when a quota error occurs, rotate to the next key.
 * No complex retry logic or state management - just basic rotation.
 */

export class SimpleAPIKeyRotator {
    private apiKeys: string[];
    private currentIndex: number = 0;

    constructor(apiKeys: string[]) {
        if (!apiKeys || apiKeys.length === 0) {
            throw new Error('At least one API key is required');
        }
        this.apiKeys = [...apiKeys];
    }

    /**
     * Get the current API key
     */
    getCurrentKey(): string {
        return this.apiKeys[this.currentIndex];
    }

    /**
     * Rotate to the next API key
     * Returns true if rotation was successful, false if no more keys
     */
    rotateToNext(): boolean {
        const nextIndex = (this.currentIndex + 1) % this.apiKeys.length;

        // If we've cycled through all keys, return false
        if (nextIndex === 0 && this.currentIndex !== 0) {
            return false; // All keys exhausted
        }

        this.currentIndex = nextIndex;
        return true;
    }

    /**
     * Check if this is a quota error that should trigger rotation
     */
    isQuotaError(error: any): boolean {
        if (!error) return false;

        // Check for 403 status with quota-related message
        if (error.response?.status === 403) {
            const message = error.response?.data?.error?.message || '';
            return message.toLowerCase().includes('quota');
        }

        return false;
    }

    /**
     * Get total number of keys
     */
    getTotalKeys(): number {
        return this.apiKeys.length;
    }

    /**
     * Get current key index (for debugging)
     */
    getCurrentIndex(): number {
        return this.currentIndex;
    }
}