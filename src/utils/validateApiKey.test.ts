/**
 * Tests for API key validation utility
 */

import { describe, it, expect } from 'vitest';
import { validateApiKey } from './validateApiKey';

describe('validateApiKey', () => {
    describe('invalid API keys', () => {
        it('should reject undefined API key', () => {
            const result = validateApiKey(undefined);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('missing');
        });

        it('should reject empty string API key', () => {
            const result = validateApiKey('');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('missing');
        });

        it('should reject whitespace-only API key', () => {
            const result = validateApiKey('   ');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('missing');
        });

        it('should reject placeholder value', () => {
            const result = validateApiKey('your_api_key_here');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('replace');
        });

        it('should reject API key that is too short', () => {
            const result = validateApiKey('AIzaSyC123');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('too short');
        });

        it('should reject API key with invalid characters', () => {
            const result = validateApiKey('AIzaSyC123456789012345678901234567890!@#');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('invalid characters');
        });

        it('should reject API key with spaces', () => {
            const result = validateApiKey('AIzaSyC12345678901234567890 1234567890');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('invalid characters');
        });
    });

    describe('valid API keys', () => {
        it('should accept valid API key format', () => {
            const result = validateApiKey('AIzaSyC1234567890123456789012345678901');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept API key with hyphens', () => {
            const result = validateApiKey('AIzaSyC123456789012345678901234567890-test');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept API key with underscores', () => {
            const result = validateApiKey('AIzaSyC123456789012345678901234567890_test');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept longer API keys', () => {
            const result = validateApiKey('AIzaSyC12345678901234567890123456789012345678901234567890');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept API key with mixed case', () => {
            const result = validateApiKey('AIzaSyC1234567890aBcDeFgHiJkLmNoPqRsTuVwXyZ');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });
});
