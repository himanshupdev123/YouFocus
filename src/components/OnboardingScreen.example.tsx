/**
 * OnboardingScreen Example Usage
 * 
 * This file demonstrates how to use the OnboardingScreen component
 * in a real application context.
 */

import { OnboardingScreen } from './OnboardingScreen';
import { YouTubeAPIClient } from '../services/YouTubeAPIClient';
import { StorageManager } from '../utils/StorageManager';
import type { Channel } from '../types';

// Example: Using OnboardingScreen in an App component
export function OnboardingExample() {
    // Initialize API client with your YouTube API key
    const apiClient = new YouTubeAPIClient({ apiKey: 'YOUR_API_KEY_HERE' });

    // Initialize storage manager
    const storageManager = new StorageManager();

    // Handle completion - user selected channels
    const handleComplete = (channels: Channel[]) => {
        console.log('Onboarding completed with channels:', channels);
        // Navigate to main feed view
        // Example: navigate('/feed');
    };

    // Handle skip - user chose to skip onboarding
    const handleSkip = () => {
        console.log('User skipped onboarding');
        // Navigate to main feed view with empty channel list
        // Example: navigate('/feed');
    };

    return (
        <OnboardingScreen
            apiClient={apiClient}
            storageManager={storageManager}
            onComplete={handleComplete}
            onSkip={handleSkip}
        />
    );
}

// Example: Conditional rendering based on first visit
export function AppWithOnboarding() {
    const storageManager = new StorageManager();
    const isFirstVisit = storageManager.isFirstVisit();

    if (isFirstVisit) {
        return <OnboardingExample />;
    }

    // Return main app view
    return <div>Main App View</div>;
}
