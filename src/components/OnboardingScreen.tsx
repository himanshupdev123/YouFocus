/**
 * OnboardingScreen Component
 * 
 * Displays the initial setup interface for new users.
 * Features:
 * - Welcome message and instructions
 * - Integrated ChannelSearch component
 * - Selected channels list with removal capability
 * - Skip and complete buttons
 * - Channel selection and deselection handling
 * - Save channels and navigate on complete
 * 
 * Requirements: 1.1, 1.4, 1.5, 1.6
 */

import { useState, useCallback } from 'react';
import { ChannelSearch } from './ChannelSearch';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { Channel } from '../types';
import type { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { StorageManager, StorageError } from '../utils/StorageManager';
import './OnboardingScreen.css';

export interface OnboardingScreenProps {
    /** YouTube API client instance */
    apiClient: YouTubeAPIClient;
    /** Storage manager instance */
    storageManager: StorageManager;
    /** Callback when onboarding is completed with selected channels */
    onComplete: (channels: Channel[]) => void;
    /** Callback when user skips onboarding */
    onSkip: () => void;
}

/**
 * OnboardingScreen component for initial channel selection
 */
export function OnboardingScreen({
    apiClient,
    storageManager,
    onComplete,
    onSkip
}: OnboardingScreenProps) {
    const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<StorageError | null>(null);

    /**
     * Handle channel selection from search results
     * Adds channel to selected list if not already present
     */
    const handleChannelSelect = useCallback((channel: Channel) => {
        setSelectedChannels(prev => {
            // Check if channel is already selected
            const isAlreadySelected = prev.some(ch => ch.id === channel.id);

            if (isAlreadySelected) {
                return prev;
            }

            // Add channel to selected list
            return [...prev, channel];
        });
    }, []);

    /**
     * Handle channel removal from selected list
     */
    const handleChannelRemove = useCallback((channelId: string) => {
        setSelectedChannels(prev => prev.filter(ch => ch.id !== channelId));
    }, []);

    /**
     * Handle skip button click
     * Marks as visited and navigates without saving channels
     */
    const handleSkip = useCallback(() => {
        storageManager.markVisited();
        onSkip();
    }, [storageManager, onSkip]);

    /**
     * Handle complete button click
     * Saves selected channels, marks as visited, and navigates
     */
    const handleComplete = useCallback(() => {
        setIsSaving(true);
        setError(null);

        try {
            // Save channels to storage
            storageManager.saveChannels(selectedChannels);

            // Mark as visited
            storageManager.markVisited();

            // Navigate with selected channels
            onComplete(selectedChannels);
        } catch (err) {
            console.error('Failed to save channels:', err);
            setError(err as StorageError);
            setIsSaving(false);
        }
    }, [selectedChannels, storageManager, onComplete]);

    return (
        <div className="onboarding-screen">
            {isSaving ? (
                <LoadingSpinner message="Saving your channels..." size="large" />
            ) : (
                <div className="onboarding-container">
                    {/* Welcome Section */}
                    <header className="onboarding-header">
                        <h1 className="onboarding-title">Welcome to YouFocus</h1>
                        <p className="onboarding-description">
                            Watch content from your favorite YouTube channels without distractions.
                            Start by selecting the channels you want to follow.
                        </p>
                        <div className="branding-section">
                            <div className="made-in-bharat">
                                <span className="flag">🇮🇳</span>
                                <span className="text">Made in Bharat</span>
                            </div>
                            <div className="developer-credit">
                                a Himanshu P Dev Product
                            </div>
                        </div>
                    </header>

                    {/* Channel Search Section */}
                    <section className="search-section">
                        <h2 className="section-title">Search for Channels</h2>
                        <ChannelSearch
                            apiClient={apiClient}
                            onChannelSelect={handleChannelSelect}
                            selectedChannels={selectedChannels}
                        />
                    </section>

                    {/* Selected Channels Section */}
                    {selectedChannels.length > 0 && (
                        <section className="selected-section">
                            <h2 className="section-title">
                                Selected Channels ({selectedChannels.length})
                            </h2>
                            <ul className="selected-channels-list">
                                {selectedChannels.map((channel) => (
                                    <li key={channel.id} className="selected-channel-item">
                                        <img
                                            src={channel.thumbnailUrl}
                                            alt={`${channel.title} thumbnail`}
                                            className="selected-channel-thumbnail"
                                        />
                                        <div className="selected-channel-info">
                                            <h3 className="selected-channel-title">{channel.title}</h3>
                                        </div>
                                        <button
                                            className="remove-button"
                                            onClick={() => handleChannelRemove(channel.id)}
                                            aria-label={`Remove ${channel.title}`}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Error Display */}
                    {error && (
                        <ErrorMessage
                            error={error}
                            onDismiss={() => setError(null)}
                            size="medium"
                        />
                    )}

                    {/* Action Buttons */}
                    <footer className="onboarding-footer">
                        <button
                            className="skip-button"
                            onClick={handleSkip}
                            aria-label="Skip onboarding"
                        >
                            Skip for Now
                        </button>
                        <button
                            className="complete-button"
                            onClick={handleComplete}
                            disabled={selectedChannels.length === 0}
                            aria-label="Complete onboarding"
                        >
                            {selectedChannels.length === 0
                                ? 'Select at least one channel'
                                : `Continue with ${selectedChannels.length} channel${selectedChannels.length === 1 ? '' : 's'}`
                            }
                        </button>
                    </footer>
                </div>
            )}
        </div>
    );
}
