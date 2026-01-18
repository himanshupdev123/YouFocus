/**
 * APIKeyManager - Manages multiple YouTube API keys with automatic rotation
 * 
 * Features:
 * - Round-robin rotation between multiple API keys
 * - Automatic failover when a key hits quota limits
 * - Quota tracking and key health monitoring
 * - Exponential backoff for failed keys
 */

export interface APIKeyStatus {
    key: string;
    isActive: boolean;
    quotaExhausted: boolean;
    lastError?: string;
    lastErrorTime?: number;
    consecutiveErrors: number;
    nextRetryTime?: number;
}

export class APIKeyManager {
    private apiKeys: string[];
    private keyStatuses: Map<string, APIKeyStatus>;
    private currentKeyIndex: number;
    private readonly maxRetryDelay = 60 * 60 * 1000; // 1 hour max retry delay
    private readonly baseRetryDelay = 5 * 60 * 1000; // 5 minutes base delay

    /**
     * Creates a new APIKeyManager instance
     * @param apiKeys - Array of YouTube API keys
     */
    constructor(apiKeys: string[]) {
        if (!apiKeys || apiKeys.length === 0) {
            throw new Error('At least one API key is required');
        }

        this.apiKeys = [...apiKeys];
        this.currentKeyIndex = 0;
        this.keyStatuses = new Map();

        // Initialize all keys as active
        this.apiKeys.forEach(key => {
            this.keyStatuses.set(key, {
                key,
                isActive: true,
                quotaExhausted: false,
                consecutiveErrors: 0
            });
        });
    }

    /**
     * Gets the current active API key
     * @returns Current API key or null if all keys are exhausted
     */
    getCurrentKey(): string | null {
        const availableKeys = this.getAvailableKeys();

        if (availableKeys.length === 0) {
            return null;
        }

        // If current key is not available, find the next available one
        const currentKey = this.apiKeys[this.currentKeyIndex];
        if (!availableKeys.includes(currentKey)) {
            const nextKeyIndex = this.apiKeys.findIndex(key => availableKeys.includes(key));
            if (nextKeyIndex !== -1) {
                this.currentKeyIndex = nextKeyIndex;
            }
        }

        const key = this.apiKeys[this.currentKeyIndex];
        console.log('PRODUCTION DEBUG: getCurrentKey returning:', key ? `${key.substring(0, 10)}...` : 'NULL');

        return key;
    }

    /**
     * Rotates to the next available API key
     * @returns Next API key or null if no keys available
     */
    rotateKey(): string | null {
        const availableKeys = this.getAvailableKeys();

        if (availableKeys.length === 0) {
            return null;
        }

        // Find next available key after current index
        let nextIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        let attempts = 0;

        while (attempts < this.apiKeys.length) {
            const nextKey = this.apiKeys[nextIndex];
            if (availableKeys.includes(nextKey)) {
                this.currentKeyIndex = nextIndex;
                return nextKey;
            }
            nextIndex = (nextIndex + 1) % this.apiKeys.length;
            attempts++;
        }

        return null;
    }

    /**
     * Reports an error for the current API key
     * @param error - Error details
     * @param isQuotaError - Whether this is a quota exhaustion error
     */
    reportError(error: string, isQuotaError: boolean = false): void {
        const currentKey = this.apiKeys[this.currentKeyIndex];
        const status = this.keyStatuses.get(currentKey);

        if (!status) return;

        status.lastError = error;
        status.lastErrorTime = Date.now();
        status.consecutiveErrors++;

        if (isQuotaError) {
            status.quotaExhausted = true;
            status.isActive = false;
            // Quota errors: retry after quota reset (next day)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0); // Midnight PST (approximately)
            status.nextRetryTime = tomorrow.getTime();
        } else {
            // Other errors: exponential backoff
            const delay = Math.min(
                this.baseRetryDelay * Math.pow(2, status.consecutiveErrors - 1),
                this.maxRetryDelay
            );
            status.nextRetryTime = Date.now() + delay;
            status.isActive = false;
        }

        this.keyStatuses.set(currentKey, status);
    }

    /**
     * Reports successful API call for current key
     */
    reportSuccess(): void {
        const currentKey = this.apiKeys[this.currentKeyIndex];
        const status = this.keyStatuses.get(currentKey);

        if (!status) return;

        // Reset error counters on success
        status.consecutiveErrors = 0;
        status.lastError = undefined;
        status.lastErrorTime = undefined;
        status.nextRetryTime = undefined;
        status.isActive = true;
        // Don't reset quotaExhausted - that only resets at quota renewal

        this.keyStatuses.set(currentKey, status);
    }

    /**
     * Gets all currently available (non-exhausted, non-errored) API keys
     * @returns Array of available API keys
     */
    private getAvailableKeys(): string[] {
        const now = Date.now();

        return this.apiKeys.filter(key => {
            const status = this.keyStatuses.get(key);
            if (!status) return false;

            // Check if key is ready to retry after error
            if (status.nextRetryTime && now < status.nextRetryTime) {
                return false;
            }

            // If retry time has passed, reactivate the key (except quota exhausted)
            if (status.nextRetryTime && now >= status.nextRetryTime && !status.quotaExhausted) {
                status.isActive = true;
                status.nextRetryTime = undefined;
                this.keyStatuses.set(key, status);
            }

            return status.isActive && !status.quotaExhausted;
        });
    }

    /**
     * Gets status information for all API keys
     * @returns Array of API key statuses
     */
    getKeyStatuses(): APIKeyStatus[] {
        return Array.from(this.keyStatuses.values());
    }

    /**
     * Gets the total number of API keys
     * @returns Total number of keys
     */
    getTotalKeys(): number {
        return this.apiKeys.length;
    }

    /**
     * Gets the number of currently available keys
     * @returns Number of available keys
     */
    getAvailableKeyCount(): number {
        return this.getAvailableKeys().length;
    }

    /**
     * Checks if any API keys are available
     * @returns True if at least one key is available
     */
    hasAvailableKeys(): boolean {
        return this.getAvailableKeys().length > 0;
    }

    /**
     * Resets quota exhaustion status for all keys (call this daily)
     */
    resetQuotaStatus(): void {
        this.keyStatuses.forEach((status, key) => {
            if (status.quotaExhausted) {
                status.quotaExhausted = false;
                status.isActive = true;
                status.nextRetryTime = undefined;
                this.keyStatuses.set(key, status);
            }
        });
    }

    /**
     * Gets a summary of key manager status
     * @returns Status summary object
     */
    getStatusSummary(): {
        totalKeys: number;
        availableKeys: number;
        quotaExhaustedKeys: number;
        erroredKeys: number;
        currentKey: string | null;
    } {
        const statuses = this.getKeyStatuses();
        const quotaExhaustedKeys = statuses.filter(s => s.quotaExhausted).length;
        const erroredKeys = statuses.filter(s => !s.isActive && !s.quotaExhausted).length;

        return {
            totalKeys: this.getTotalKeys(),
            availableKeys: this.getAvailableKeyCount(),
            quotaExhaustedKeys,
            erroredKeys,
            currentKey: this.getCurrentKey()
        };
    }
}