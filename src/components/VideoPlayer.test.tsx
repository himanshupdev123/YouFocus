import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
    let mockOnClose: () => void;
    let mockPlayer: any;

    beforeEach(() => {
        mockOnClose = vi.fn();

        // Create a mock player instance with all required methods
        mockPlayer = {
            playVideo: vi.fn(),
            pauseVideo: vi.fn(),
            stopVideo: vi.fn(),
            seekTo: vi.fn(),
            setVolume: vi.fn(),
            getVolume: vi.fn(() => 100),
            mute: vi.fn(),
            unMute: vi.fn(),
            isMuted: vi.fn(() => false),
            getPlayerState: vi.fn(() => 1),
            getCurrentTime: vi.fn(() => 0),
            getDuration: vi.fn(() => 100),
            destroy: vi.fn(),
        };

        // Ensure there's at least one script tag in the document for the API loader
        if (document.getElementsByTagName('script').length === 0) {
            const dummyScript = document.createElement('script');
            document.head.appendChild(dummyScript);
        }
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete (window as any).YT;
        delete (window as any).onYouTubeIframeAPIReady;

        // Clean up any YouTube API scripts
        const scripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
        scripts.forEach(script => script.remove());
    });

    it('renders close button', () => {
        // Use a proper constructor function instead of arrow function
        (window as any).YT = {
            Player: function () { return mockPlayer; },
            PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
        };

        render(<VideoPlayer videoId="test-video-id" onClose={mockOnClose} />);

        const closeButton = screen.getByRole('button', { name: /close video player/i });
        expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        // Use a proper constructor function instead of arrow function
        (window as any).YT = {
            Player: function () { return mockPlayer; },
            PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
        };

        const user = userEvent.setup();
        render(<VideoPlayer videoId="test-video-id" onClose={mockOnClose} />);

        const closeButton = screen.getByRole('button', { name: /close video player/i });
        await user.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
        // Use a proper constructor function instead of arrow function
        (window as any).YT = {
            Player: function () { return mockPlayer; },
            PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
        };

        const user = userEvent.setup();
        render(<VideoPlayer videoId="test-video-id" onClose={mockOnClose} />);

        await user.keyboard('{Escape}');

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('renders loading state when API is not ready', () => {
        delete (window as any).YT;

        render(<VideoPlayer videoId="test-video-id" onClose={mockOnClose} />);

        expect(screen.getByText(/loading player/i)).toBeInTheDocument();
    });

    it('loads YouTube IFrame API script if not already loaded', () => {
        const existingScripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
        existingScripts.forEach(script => script.remove());
        delete (window as any).YT;

        render(<VideoPlayer videoId="test-video-id" onClose={mockOnClose} />);

        const script = document.querySelector('script[src*="youtube.com/iframe_api"]');
        expect(script).toBeInTheDocument();
    });

    it('renders player container with correct ID', () => {
        // Use a proper constructor function instead of arrow function
        (window as any).YT = {
            Player: function () { return mockPlayer; },
            PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
        };

        render(<VideoPlayer videoId="test-video-id" onClose={mockOnClose} />);

        const playerContainer = document.getElementById('youtube-player');
        expect(playerContainer).toBeInTheDocument();
    });
});
