/**
 * App Component - Main application entry point
 * 
 * Manages routing between onboarding, feed, and player views.
 * Handles first visit detection, channel management, and video playback.
 * 
 * Requirements: All
 */

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { VideoFeed } from './components/VideoFeed';
import { ChannelManager } from './components/ChannelManager';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { StorageManager } from './utils/StorageManager';
import { YouTubeAPIClient } from './services/YouTubeAPIClient';
import { validateApiKey } from './utils/validateApiKey';
import type { Channel } from './types';
import './App.css';

// Lazy load VideoPlayer component for code splitting
const VideoPlayer = lazy(() => import('./components/VideoPlayer').then(module => ({ default: module.VideoPlayer })));

/**
 * Application views/screens
 */
type AppView = 'onboarding' | 'feed' | 'player' | 'settings';

/**
 * Main App component
 */
function App() {
  // Initialize services (memoized to prevent recreation on re-renders)
  const storageManager = useMemo(() => new StorageManager(), []);

  const apiClient = useMemo(() => {
    // Get API keys from environment variables
    const apiKeys: string[] = [];

    // Primary API key (required)
    const primaryKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (primaryKey) {
      apiKeys.push(primaryKey);
    }

    // Additional API keys (optional)
    for (let i = 2; i <= 5; i++) {
      const key = import.meta.env[`VITE_YOUTUBE_API_KEY_${i}`];
      if (key) {
        apiKeys.push(key);
      }
    }

    if (apiKeys.length === 0) {
      console.warn('No YouTube API keys configured. Set VITE_YOUTUBE_API_KEY in .env file.');
      // Return client with empty key - will fail gracefully
      return new YouTubeAPIClient({ apiKey: '' });
    }

    console.log(`Initialized YouTube API client with ${apiKeys.length} API key(s)`);
    return new YouTubeAPIClient({ apiKeys } as any);
  }, []);

  // Application state
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  /**
   * Initialize application on mount
   * - Check for first visit
   * - Load saved channels
   * - Validate API key
   */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      try {
        // Validate API key
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const validation = validateApiKey(apiKey);

        if (!validation.isValid) {
          setApiKeyError(validation.error || 'Invalid API key configuration.');
          setIsLoading(false);
          return;
        }

        // Load saved channels
        const savedChannels = storageManager.loadChannels();
        setChannels(savedChannels);

        // Check if first visit
        const isFirstVisit = storageManager.isFirstVisit();

        if (isFirstVisit) {
          // Show onboarding for first-time users
          setCurrentView('onboarding');
        } else if (savedChannels.length === 0) {
          // No channels saved, show onboarding
          setCurrentView('onboarding');
        } else {
          // Has channels, go to feed
          setCurrentView('feed');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // On error, default to onboarding
        setCurrentView('onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [storageManager]);

  /**
   * Handle onboarding completion
   */
  const handleOnboardingComplete = useCallback((selectedChannels: Channel[]) => {
    setChannels(selectedChannels);
    setCurrentView('feed');
  }, []);

  /**
   * Handle onboarding skip
   */
  const handleOnboardingSkip = useCallback(() => {
    setCurrentView('feed');
  }, []);

  /**
   * Handle video selection from feed
   */
  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentView('player');
  }, []);

  /**
   * Handle closing video player
   */
  const handlePlayerClose = useCallback(() => {
    setSelectedVideoId(null);
    setCurrentView('feed');
  }, []);

  /**
   * Handle adding a channel
   */
  const handleAddChannel = useCallback((channel: Channel) => {
    setChannels(prev => {
      // Check if channel already exists
      if (prev.some(ch => ch.id === channel.id)) {
        return prev;
      }
      return [...prev, channel];
    });
  }, []);

  /**
   * Handle removing a channel
   */
  const handleRemoveChannel = useCallback((channelId: string) => {
    setChannels(prev => prev.filter(ch => ch.id !== channelId));
  }, []);

  /**
   * Navigate to settings/channel manager
   */
  const handleOpenSettings = useCallback(() => {
    setCurrentView('settings');
  }, []);

  /**
   * Navigate back to feed from settings
   */
  const handleCloseSettings = useCallback(() => {
    setCurrentView('feed');
  }, []);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="app">
        <LoadingSpinner message="Loading YouFocus..." size="large" />
      </div>
    );
  }

  /**
   * Render API key error
   */
  if (apiKeyError) {
    return (
      <div className="app">
        <div className="app-container">
          <div className="api-key-error">
            <ErrorMessage
              error={{ message: apiKeyError, userMessage: apiKeyError, code: 0, retryable: false }}
              size="large"
            />
            <div className="api-key-instructions">
              <h2>How to set up your YouTube API key:</h2>
              <ol>
                <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the YouTube Data API v3</li>
                <li>Create credentials (API key)</li>
                <li>Create a <code>.env</code> file in the project root</li>
                <li>Add: <code>VITE_YOUTUBE_API_KEY=your_api_key_here</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render current view
   */
  return (
    <div className="app">
      {/* Navigation header (shown on feed and settings views) */}
      {(currentView === 'feed' || currentView === 'settings') && (
        <header className="app-header">
          <div className="app-header-content">
            <div className="app-title-section">
              <h1 className="app-title">YouFocus</h1>
              <div className="app-branding">
                <div className="made-in-bharat-small">
                  <span className="flag">🇮🇳</span>
                  <span className="text">Made in Bharat</span>
                </div>
                <div className="developer-credit-small">
                  a Himanshu P Dev Product
                </div>
              </div>
            </div>
            <nav className="app-nav">
              {currentView === 'feed' && (
                <button
                  className="nav-button"
                  onClick={handleOpenSettings}
                  aria-label="Manage channels"
                >
                  Manage Channels
                </button>
              )}
              {currentView === 'settings' && (
                <button
                  className="nav-button"
                  onClick={handleCloseSettings}
                  aria-label="Back to feed"
                >
                  ← Back to Feed
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Main content area */}
      <main className="app-main">
        {currentView === 'onboarding' && (
          <OnboardingScreen
            apiClient={apiClient}
            storageManager={storageManager}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}

        {currentView === 'feed' && (
          <VideoFeed
            channels={channels}
            apiClient={apiClient}
            onVideoSelect={handleVideoSelect}
          />
        )}

        {currentView === 'player' && selectedVideoId && (
          <Suspense fallback={<LoadingSpinner message="Loading video player..." size="large" />}>
            <VideoPlayer
              videoId={selectedVideoId}
              onClose={handlePlayerClose}
            />
          </Suspense>
        )}

        {currentView === 'settings' && (
          <ChannelManager
            channels={channels}
            onAddChannel={handleAddChannel}
            onRemoveChannel={handleRemoveChannel}
            apiClient={apiClient}
            storageManager={storageManager}
          />
        )}
      </main>
    </div>
  );
}

export default App;
