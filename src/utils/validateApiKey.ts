/**
 * Validates YouTube API key format
 * 
 * YouTube API keys typically:
 * - Start with "AIza"
 * - Are 39 characters long
 * - Contain only alphanumeric characters, hyphens, and underscores
 */

export interface ApiKeyValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates a YouTube API key
 * @param apiKey - The API key to validate
 * @returns Validation result with error message if invalid
 */
export function validateApiKey(apiKey: string | undefined): ApiKeyValidationResult {
    // Check if API key exists
    if (!apiKey || apiKey.trim() === '') {
        return {
            isValid: false,
            error: 'API key is missing. Please add VITE_YOUTUBE_API_KEY to your .env file.'
        };
    }

    // Check if it's the placeholder value
    if (apiKey === 'your_api_key_here') {
        return {
            isValid: false,
            error: 'Please replace "your_api_key_here" with your actual YouTube API key in the .env file.'
        };
    }

    // Basic format validation
    // YouTube API keys typically start with "AIza" and are 39 characters long
    // However, this can vary, so we'll do a lenient check
    if (apiKey.length < 30) {
        return {
            isValid: false,
            error: 'API key appears to be too short. Please verify you copied the complete key.'
        };
    }

    // Check for valid characters (alphanumeric, hyphens, underscores)
    const validKeyPattern = /^[A-Za-z0-9_-]+$/;
    if (!validKeyPattern.test(apiKey)) {
        return {
            isValid: false,
            error: 'API key contains invalid characters. Please verify you copied the key correctly.'
        };
    }

    return { isValid: true };
}
