# Design Document: Focused YouTube Viewer

## Overview

The Focused YouTube Viewer is a web application that provides a distraction-free YouTube viewing experience by displaying content exclusively from user-curated channels. The system will be built as a single-page application (SPA) using React and TypeScript, integrating with the YouTube Data API v3 for content retrieval and the YouTube IFrame Player API for video playback.

The core design principle is simplicity: users maintain a list of trusted channels, and the application fetches and displays only videos from those channels in a chronological feed, completely eliminating algorithmic recommendations and unrelated content.

## Architecture

### High-Level Architecture

The application follows a client-side architecture with three main layers:

1. **Presentation Layer**: React components for UI rendering
2. **Business Logic Layer**: State management, data transformation, and API orchestration
3. **Data Layer**: YouTube API integration and local storage persistence

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer (React)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │Onboarding│  │  Feed    │  │   Player     │  │
│  │  Screen  │  │  View    │  │   Screen     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│         Business Logic Layer (Hooks)            │
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │Channel Manager│  │  Video Feed Manager   │  │
│  └──────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│              Data Layer                         │
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │YouTube API   │  │  Local Storage         │  │
│  │  Client      │  │  Manager               │  │
│  └──────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **State Management**: React Context API with hooks
- **HTTP Client**: Axios for API requests
- **Storage**: Browser LocalStorage API
- **Video Player**: YouTube IFrame Player API
- **Styling**: CSS Modules or Tailwind CSS for minimal, distraction-free design
- **Build Tool**: Vite for fast development and optimized builds

## Components and Interfaces

### Core Components

#### 1. OnboardingScreen Component
Displays the initial setup interface for new users.

**Props:**
```typescript
interface OnboardingScreenProps {
  onComplete: (channels: Channel[]) => void;
  onSkip: () => void;
}
```

**Responsibilities:**
- Render channel search interface
- Display search results with thumbnails
- Allow multi-select of channels
- Handle skip and complete actions

#### 2. ChannelSearch Component
Provides search functionality for finding YouTube channels.

**Props:**
```typescript
interface ChannelSearchProps {
  onChannelSelect: (channel: Channel) => void;
  selectedChannels: Channel[];
}
```

**Responsibilities:**
- Accept search input (channel name or URL)
- Query YouTube API for matching channels
- Display search results
- Handle channel selection

#### 3. VideoFeed Component
Displays the chronological list of videos from curated channels.

**Props:**
```typescript
interface VideoFeedProps {
  channels: Channel[];
  onVideoSelect: (videoId: string) => void;
  onRefresh: () => void;
}
```

**Responsibilities:**
- Fetch videos from all channels
- Sort videos by upload date
- Render video grid/list
- Handle video selection
- Provide refresh functionality

#### 4. VideoPlayer Component
Embeds and controls YouTube video playback.

**Props:**
```typescript
interface VideoPlayerProps {
  videoId: string;
  onClose: () => void;
}
```

**Responsibilities:**
- Embed YouTube IFrame Player
- Configure player to hide recommendations (rel=0)
- Handle playback controls
- Return to feed on video end or close

#### 5. ChannelManager Component
Provides interface for managing the channel list.

**Props:**
```typescript
interface ChannelManagerProps {
  channels: Channel[];
  onAddChannel: (channel: Channel) => void;
  onRemoveChannel: (channelId: string) => void;
}
```

**Responsibilities:**
- Display current channel list
- Allow adding new channels
- Allow removing channels
- Persist changes to storage

### API Integration Layer

#### YouTubeAPIClient
Handles all interactions with YouTube Data API v3.

**Interface:**
```typescript
interface YouTubeAPIClient {
  searchChannels(query: string): Promise<Channel[]>;
  getChannelInfo(channelId: string): Promise<Channel>;
  getChannelVideos(channelId: string, maxResults: number): Promise<Video[]>;
  getVideoDetails(videoIds: string[]): Promise<Video[]>;
}
```

**Key Methods:**

1. **searchChannels**: Uses `search.list` endpoint with `type=channel`
   - Cost: 100 units per request
   - Returns channel metadata including thumbnails and subscriber counts

2. **getChannelInfo**: Uses `channels.list` endpoint
   - Cost: 1 unit per request
   - Retrieves channel details and uploads playlist ID

3. **getChannelVideos**: Uses `playlistItems.list` endpoint
   - Cost: 1 unit per request
   - Fetches videos from channel's uploads playlist
   - Supports pagination (50 videos per page)

4. **getVideoDetails**: Uses `videos.list` endpoint
   - Cost: 1 unit per request
   - Retrieves video metadata (title, thumbnail, duration, etc.)

**Caching Strategy:**
- Cache responses for 30 minutes (configurable)
- Use in-memory cache with timestamp tracking
- Invalidate cache on manual refresh

#### StorageManager
Manages persistence of user data to LocalStorage.

**Interface:**
```typescript
interface StorageManager {
  saveChannels(channels: Channel[]): void;
  loadChannels(): Channel[];
  clearChannels(): void;
  isFirstVisit(): boolean;
  markVisited(): void;
}
```

**Storage Keys:**
- `focused_yt_channels`: JSON array of channel objects
- `focused_yt_first_visit`: Boolean flag for onboarding
- `focused_yt_cache`: API response cache with timestamps

## Data Models

### Channel Model
```typescript
interface Channel {
  id: string;              // YouTube channel ID
  title: string;           // Channel name
  thumbnailUrl: string;    // Channel avatar URL
  subscriberCount?: number; // Subscriber count (optional)
  uploadsPlaylistId: string; // ID of uploads playlist
}
```

### Video Model
```typescript
interface Video {
  id: string;              // YouTube video ID
  title: string;           // Video title
  thumbnailUrl: string;    // Video thumbnail URL
  channelId: string;       // Parent channel ID
  channelTitle: string;    // Channel name
  publishedAt: Date;       // Upload date
  duration: string;        // Video duration (ISO 8601 format)
  description: string;     // Video description
}
```

### API Response Cache Model
```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface APICache {
  channels: Map<string, CacheEntry<Channel>>;
  videos: Map<string, CacheEntry<Video[]>>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Channel search results contain required fields
*For any* channel search query that returns results, all returned channels should include name, thumbnail URL, and subscriber count.
**Validates: Requirements 1.3**

### Property 2: Channel selection adds to list
*For any* channel selected during onboarding or management, that channel should appear in the Channel_List after selection.
**Validates: Requirements 1.4, 2.1**

### Property 3: Invalid channel identifiers are rejected
*For any* invalid channel URL or ID, attempting to add it should result in an error message and the Channel_List should remain unchanged.
**Validates: Requirements 2.2**

### Property 4: Channel removal removes from list
*For any* channel in the Channel_List, removing it should result in that channel no longer appearing in the list.
**Validates: Requirements 2.3**

### Property 5: Channel list display contains required information
*For any* Channel_List, the rendered display should show names and thumbnails for all channels in the list.
**Validates: Requirements 2.4**

### Property 6: Channel list persistence round-trip
*For any* Channel_List, saving it to local storage then loading it back should produce an equivalent list with all channel data intact.
**Validates: Requirements 2.5, 6.1**

### Property 7: Video feed fetches from all channels
*For any* non-empty Channel_List, opening the Video_Feed should fetch videos from every channel in the list.
**Validates: Requirements 3.1**

### Property 8: Video display contains required fields
*For any* video in the Video_Feed, the rendered display should show title, thumbnail, channel name, upload date, and duration.
**Validates: Requirements 3.2**

### Property 9: Videos are sorted by date descending
*For any* Video_Feed, the videos should be ordered by upload date with the newest videos first.
**Validates: Requirements 3.3**

### Property 10: Video selection triggers playback
*For any* video in the Video_Feed, selecting it should initiate playback of that specific video.
**Validates: Requirements 4.1**

### Property 11: API response caching prevents duplicate calls
*For any* API request, making the same request twice within the cache duration (30 minutes) should result in only one actual API call, with the second request served from cache.
**Validates: Requirements 5.3**

### Property 12: API errors are handled gracefully
*For any* YouTube API error response, the system should display a user-friendly error message and validate the response structure before processing.
**Validates: Requirements 5.5, 5.6**

### Property 13: Storage errors are handled gracefully
*For any* local storage error (quota exceeded, access denied, etc.), the system should handle it without crashing and notify the user.
**Validates: Requirements 6.4**

### Property 14: Search filtering matches query
*For any* search query applied to the Video_Feed, all displayed videos should have titles or descriptions containing the search terms.
**Validates: Requirements 7.1**

### Property 15: Channel filtering shows only selected channel
*For any* channel filter applied to the Video_Feed, all displayed videos should be from the selected channel.
**Validates: Requirements 7.2**

### Property 16: Clearing filters restores full feed
*For any* Video_Feed with filters applied, clearing all filters should restore the complete unfiltered feed.
**Validates: Requirements 7.3**

### Property 17: Loading states display indicators
*For any* asynchronous operation (API calls, data loading), the UI should display loading indicators while the operation is in progress.
**Validates: Requirements 8.3**

## Error Handling

### API Error Handling

The system must gracefully handle various YouTube API errors:

1. **Quota Exceeded (403)**: Display notification to user, rely on cached data, suggest trying again after quota reset
2. **Invalid API Key (400)**: Display configuration error message
3. **Network Errors**: Display connectivity error, allow retry
4. **Invalid Channel ID (404)**: Display "Channel not found" message
5. **Rate Limiting (429)**: Implement exponential backoff, use cached data

**Error Response Structure:**
```typescript
interface APIError {
  code: number;
  message: string;
  userMessage: string;
  retryable: boolean;
}
```

### Storage Error Handling

Handle LocalStorage errors gracefully:

1. **Quota Exceeded**: Notify user, suggest clearing old data
2. **Access Denied**: Notify user about browser restrictions
3. **Corrupted Data**: Clear corrupted data, reinitialize with empty state

### Validation

**Channel Validation:**
- Channel ID format: 24 characters starting with "UC"
- Channel URL patterns:
  - `https://www.youtube.com/channel/{channelId}`
  - `https://www.youtube.com/@{handle}`
  - `https://www.youtube.com/c/{customUrl}`

**Video Data Validation:**
- Required fields must be present and non-empty
- Dates must be valid ISO 8601 format
- Duration must be valid ISO 8601 duration format

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

We will use **fast-check** (for TypeScript/JavaScript) as our property-based testing library. Each property test will:

- Run a minimum of 100 iterations to ensure thorough coverage
- Generate random but valid test data (channels, videos, API responses)
- Be tagged with a comment referencing the design property

**Tag Format:**
```typescript
// Feature: focused-youtube-viewer, Property 1: Channel search results contain required fields
```

**Example Property Test Structure:**
```typescript
import fc from 'fast-check';

// Feature: focused-youtube-viewer, Property 6: Channel list persistence round-trip
test('Channel list persistence round-trip', () => {
  fc.assert(
    fc.property(
      fc.array(channelArbitrary), // Generate random channel lists
      (channels) => {
        const storage = new StorageManager();
        storage.saveChannels(channels);
        const loaded = storage.loadChannels();
        
        // Verify round-trip preserves all data
        expect(loaded).toEqual(channels);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Unit tests will focus on:

1. **Specific Examples**: Test known good inputs and expected outputs
2. **Edge Cases**: Empty lists, single items, maximum sizes
3. **Error Conditions**: Invalid inputs, API failures, storage errors
4. **Integration Points**: Component interactions, API client behavior

**Testing Tools:**
- **Test Runner**: Vitest (fast, Vite-native)
- **React Testing**: React Testing Library
- **Mocking**: Vitest mocks for API calls
- **Coverage**: Aim for 80%+ code coverage

### Test Organization

```
src/
  components/
    OnboardingScreen.tsx
    OnboardingScreen.test.tsx
    OnboardingScreen.property.test.tsx
  services/
    YouTubeAPIClient.ts
    YouTubeAPIClient.test.ts
    YouTubeAPIClient.property.test.ts
  utils/
    StorageManager.ts
    StorageManager.test.ts
    StorageManager.property.test.ts
```

### Generators for Property Tests

Custom generators (arbitraries) will be created for:

1. **Channel Generator**: Creates valid Channel objects with random but realistic data
2. **Video Generator**: Creates valid Video objects with proper date ordering
3. **API Response Generator**: Creates valid YouTube API response structures
4. **Error Generator**: Creates various error scenarios

**Edge Case Handling in Generators:**
- Empty channel lists
- Channels with no videos (Requirement 3.5)
- Empty local storage (Requirement 6.3)
- Various API error codes
- Invalid channel identifiers

## Implementation Notes

### YouTube IFrame Player Configuration

To hide recommendations and create a distraction-free experience, configure the player with these parameters:

```typescript
const playerVars = {
  rel: 0,              // Show related videos from same channel only
  modestbranding: 1,   // Minimal YouTube branding
  controls: 1,         // Show player controls
  showinfo: 0,         // Hide video info before playback
  fs: 1,               // Allow fullscreen
  autoplay: 0,         // Don't autoplay
};
```

Note: As of September 2018, `rel=0` no longer completely disables related videos, but limits them to videos from the same channel, which aligns with our goal of focused viewing.

### API Quota Management

With a 10,000 unit daily quota:

**Typical Usage Calculation:**
- Initial channel search: 100 units (one-time during onboarding)
- Fetching 10 channels info: 10 units
- Fetching videos from 10 channels: 10 units
- Refreshing feed 5 times/day: 50 units

**Total: ~170 units/day** - well within limits

**Optimization Strategies:**
1. Cache aggressively (30-minute default)
2. Batch video detail requests (up to 50 videos per request)
3. Use playlistItems.list instead of search.list (1 unit vs 100 units)
4. Monitor quota usage and warn users at 80% threshold

### Responsive Design Considerations

The application should adapt to different screen sizes:

- **Desktop (>1024px)**: Grid layout with 3-4 videos per row
- **Tablet (768-1024px)**: Grid layout with 2-3 videos per row
- **Mobile (<768px)**: Single column list layout

### Performance Optimizations

1. **Lazy Loading**: Load video thumbnails as they enter viewport
2. **Virtual Scrolling**: For large video feeds (100+ videos)
3. **Debounced Search**: Wait 300ms after user stops typing before searching
4. **Memoization**: Cache expensive computations (sorting, filtering)
5. **Code Splitting**: Lazy load player component only when needed

## Deployment Strategy

### Hosting and Accessibility

The application will be deployed as a static web application, making it accessible to everyone on any device with a web browser:

**Deployment Platform Options:**
1. **Vercel** (Recommended): Free tier, automatic HTTPS, global CDN, perfect for React apps
2. **Netlify**: Similar features to Vercel, easy continuous deployment
3. **GitHub Pages**: Free hosting for static sites
4. **AWS S3 + CloudFront**: More control, slightly more complex setup

**Recommended: Vercel**
- Zero configuration deployment
- Automatic HTTPS certificates
- Global CDN for fast loading worldwide
- Free tier sufficient for personal use
- Mobile-optimized by default

### Accessibility Requirements

The deployed application must be:

1. **Publicly Accessible**: Anyone with the URL can access it
2. **Mobile-Responsive**: Works seamlessly on phones, tablets, and laptops
3. **Cross-Browser Compatible**: Works on Chrome, Firefox, Safari, Edge
4. **HTTPS Enabled**: Secure connection for API calls
5. **Fast Loading**: Optimized bundle size (<500KB initial load)

### Deployment Process

```bash
# Build optimized production bundle
npm run build

# Deploy to Vercel (one command)
vercel --prod
```

The build process will:
- Minify JavaScript and CSS
- Optimize images and assets
- Generate service worker for caching
- Create responsive layouts for all screen sizes

### Mobile Optimization

To ensure excellent mobile experience:

1. **Responsive Design**: CSS media queries for different screen sizes
2. **Touch-Friendly**: Large tap targets (minimum 44x44px)
3. **Fast Loading**: Lazy load images, code splitting
4. **PWA Features**: Add to home screen capability
5. **Offline Support**: Cache static assets for offline access

### User Access Flow

1. User visits the deployed URL (e.g., `https://focused-youtube.vercel.app`)
2. Works immediately on any device (laptop, phone, tablet)
3. No installation required - just a web browser
4. Data stored locally in browser (no server-side storage needed)
5. Each user's channel list is private to their device

## Future Enhancements

Potential features for future iterations:

1. **Export/Import Channel Lists**: Share curated lists with others
2. **Watch History**: Track watched videos
3. **Notifications**: Alert when favorite channels upload new content
4. **Offline Mode**: Cache videos for offline viewing
5. **Multiple Lists**: Create different channel lists for different topics
6. **Dark Mode**: Theme support for different viewing preferences
7. **Cloud Sync**: Sync channel lists across devices (requires backend)
