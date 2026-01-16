/**
 * VideoPlayer Component Examples
 * 
 * Demonstrates usage of the VideoPlayer component with different scenarios.
 */

import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';

/**
 * Example 1: Basic video player usage
 */
export function BasicVideoPlayerExample() {
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const videoId = 'dQw4w9WgXcQ'; // Example video ID

    return (
        <div>
            <h2>Basic Video Player</h2>
            <button onClick={() => setIsPlayerOpen(true)}>
                Play Video
            </button>

            {isPlayerOpen && (
                <VideoPlayer
                    videoId={videoId}
                    onClose={() => setIsPlayerOpen(false)}
                />
            )}
        </div>
    );
}

/**
 * Example 2: Video player with video selection
 */
export function VideoSelectionExample() {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    const exampleVideos = [
        { id: 'dQw4w9WgXcQ', title: 'Example Video 1' },
        { id: 'jNQXAC9IVRw', title: 'Example Video 2' },
        { id: 'kJQP7kiw5Fk', title: 'Example Video 3' },
    ];

    return (
        <div>
            <h2>Video Selection</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {exampleVideos.map(video => (
                    <button
                        key={video.id}
                        onClick={() => setSelectedVideoId(video.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                        }}
                    >
                        {video.title}
                    </button>
                ))}
            </div>

            {selectedVideoId && (
                <VideoPlayer
                    videoId={selectedVideoId}
                    onClose={() => setSelectedVideoId(null)}
                />
            )}
        </div>
    );
}

/**
 * Example 3: Video player with feed integration simulation
 */
export function FeedIntegrationExample() {
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    const [viewHistory, setViewHistory] = useState<string[]>([]);

    const handleVideoSelect = (videoId: string) => {
        setCurrentVideoId(videoId);
    };

    const handlePlayerClose = () => {
        if (currentVideoId) {
            setViewHistory(prev => [...prev, currentVideoId]);
        }
        setCurrentVideoId(null);
    };

    const mockVideos = [
        { id: 'dQw4w9WgXcQ', title: 'Video 1', channel: 'Channel A' },
        { id: 'jNQXAC9IVRw', title: 'Video 2', channel: 'Channel B' },
        { id: 'kJQP7kiw5Fk', title: 'Video 3', channel: 'Channel C' },
    ];

    return (
        <div>
            <h2>Feed Integration Example</h2>

            <div style={{ marginBottom: '2rem' }}>
                <h3>Video Feed</h3>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    {mockVideos.map(video => (
                        <div
                            key={video.id}
                            onClick={() => handleVideoSelect(video.id)}
                            style={{
                                padding: '1rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{video.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{video.channel}</p>
                        </div>
                    ))}
                </div>
            </div>

            {viewHistory.length > 0 && (
                <div>
                    <h3>View History</h3>
                    <p>Watched {viewHistory.length} video(s)</p>
                </div>
            )}

            {currentVideoId && (
                <VideoPlayer
                    videoId={currentVideoId}
                    onClose={handlePlayerClose}
                />
            )}
        </div>
    );
}
