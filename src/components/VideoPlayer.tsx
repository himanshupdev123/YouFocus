/**
 * VideoPlayer Component
 * 
 * Embeds YouTube IFrame Player for distraction-free video playback.
 * Configures player to minimize recommendations and provides controls
 * for returning to the feed.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { useEffect, useRef, useState } from 'react';
import './VideoPlayer.css';

export interface VideoPlayerProps {
    /** YouTube video ID to play */
    videoId: string;
    /** Callback when user closes the player */
    onClose: () => void;
}

/**
 * YouTube IFrame Player API types
 */
declare global {
    interface Window {
        YT: {
            Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
            PlayerState: {
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
                BUFFERING: number;
                CUED: number;
            };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

interface YTPlayerConfig {
    height?: string;
    width?: string;
    videoId: string;
    playerVars?: {
        rel?: number;
        modestbranding?: number;
        controls?: number;
        showinfo?: number;
        fs?: number;
        autoplay?: number;
    };
    events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { target: YTPlayer; data: number }) => void;
        onError?: (event: { target: YTPlayer; data: number }) => void;
    };
}

interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setVolume: (volume: number) => void;
    getVolume: () => number;
    mute: () => void;
    unMute: () => void;
    isMuted: () => boolean;
    getPlayerState: () => number;
    getCurrentTime: () => number;
    getDuration: () => number;
    destroy: () => void;
}

/**
 * VideoPlayer component - embeds YouTube IFrame Player with distraction-free configuration
 */
export function VideoPlayer({ videoId, onClose }: VideoPlayerProps) {
    const playerRef = useRef<YTPlayer | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [isAPIReady, setIsAPIReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load YouTube IFrame API script
     */
    useEffect(() => {
        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
            setIsAPIReady(true);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
            // Wait for API to be ready
            window.onYouTubeIframeAPIReady = () => {
                setIsAPIReady(true);
            };
            return;
        }

        // Load the IFrame Player API script
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // Set up callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
            setIsAPIReady(true);
        };

        return () => {
            // Cleanup callback
            if (window.onYouTubeIframeAPIReady) {
                window.onYouTubeIframeAPIReady = undefined;
            }
        };
    }, []);

    /**
     * Initialize YouTube player when API is ready
     */
    useEffect(() => {
        if (!isAPIReady || !playerContainerRef.current) {
            return;
        }

        // Create player instance
        try {
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    rel: 0,              // Show related videos from same channel only
                    modestbranding: 1,   // Minimal YouTube branding
                    controls: 1,         // Show player controls
                    showinfo: 0,         // Hide video info before playback
                    fs: 1,               // Allow fullscreen
                    autoplay: 0,         // Don't autoplay
                },
                events: {
                    onReady: () => {
                        // Player is ready
                        console.log('YouTube player ready');
                    },
                    onStateChange: (event) => {
                        // Handle video end event
                        if (event.data === window.YT.PlayerState.ENDED) {
                            onClose();
                        }
                    },
                    onError: (event) => {
                        // Handle player errors
                        const errorMessages: { [key: number]: string } = {
                            2: 'Invalid video ID',
                            5: 'HTML5 player error',
                            100: 'Video not found or private',
                            101: 'Video cannot be embedded',
                            150: 'Video cannot be embedded',
                        };
                        setError(errorMessages[event.data] || 'An error occurred while loading the video');
                    },
                },
            });
        } catch (err) {
            console.error('Failed to initialize YouTube player:', err);
            setError('Failed to load video player');
        }

        // Cleanup player on unmount
        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isAPIReady, videoId, onClose]);

    /**
     * Handle close button click
     */
    const handleClose = () => {
        onClose();
    };

    /**
     * Handle escape key to close player
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="video-player-container">
            <div className="video-player-header">
                <button
                    className="close-button"
                    onClick={handleClose}
                    aria-label="Close video player"
                >
                    ✕ Close
                </button>
            </div>

            <div className="video-player-content">
                {error ? (
                    <div className="player-error">
                        <p>{error}</p>
                        <button onClick={handleClose}>Return to Feed</button>
                    </div>
                ) : !isAPIReady ? (
                    <div className="player-loading">
                        <div className="spinner"></div>
                        <p>Loading player...</p>
                    </div>
                ) : (
                    <div
                        ref={playerContainerRef}
                        className="player-wrapper"
                    >
                        <div id="youtube-player"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
