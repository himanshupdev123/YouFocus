/**
 * Search Service Configuration
 * 
 * Configuration for the Python search service that provides
 * YouTube search functionality without consuming API quota.
 */

import type { SearchServiceConfig } from '../services/SearchService';

/**
 * Get search service configuration based on environment
 */
export function getSearchServiceConfig(): SearchServiceConfig | undefined {
    // Check if search service is enabled
    const isEnabled = import.meta.env.REACT_APP_SEARCH_SERVICE_ENABLED !== 'false';

    if (!isEnabled) {
        console.log('Search service is disabled via environment variable');
        return undefined;
    }

    // Get base URL from environment or use default
    const baseUrl = import.meta.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:5000';

    // Get timeout from environment or use default
    const timeout = import.meta.env.REACT_APP_SEARCH_SERVICE_TIMEOUT
        ? parseInt(import.meta.env.REACT_APP_SEARCH_SERVICE_TIMEOUT, 10)
        : 10000;

    console.log(`Search service configured: ${baseUrl} (timeout: ${timeout}ms)`);

    return {
        baseUrl,
        timeout
    };
}

/**
 * Check if search service should be used
 * This can be used to conditionally enable/disable the service
 */
export function shouldUseSearchService(): boolean {
    return import.meta.env.REACT_APP_SEARCH_SERVICE_ENABLED !== 'false';
}