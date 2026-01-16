# Implementation Plan: Focused YouTube Viewer

## Overview

This implementation plan breaks down the Focused YouTube Viewer into discrete, incremental coding tasks. Each task builds on previous work, with property-based tests integrated throughout to catch errors early. The plan follows a bottom-up approach: core utilities first, then API integration, then UI components, and finally integration.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize React + TypeScript project with Vite
  - Install dependencies: axios, fast-check, vitest, react-testing-library
  - Configure TypeScript with strict mode
  - Set up test configuration for unit and property tests
  - Create basic project structure (src/components, src/services, src/utils, src/types)
  - _Requirements: All_

- [x] 2. Define core data models and types
  - Create TypeScript interfaces for Channel, Video, APICache, CacheEntry
  - Create type definitions for API responses
  - Create error types (APIError)
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 3. Implement StorageManager utility
  - [x] 3.1 Create StorageManager class with save/load/clear methods
    - Implement saveChannels() to serialize Channel[] to localStorage
    - Implement loadChannels() to deserialize from localStorage
    - Implement clearChannels() to remove data
    - Implement isFirstVisit() and markVisited() for onboarding flag
    - Add error handling for storage quota and access errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 3.2 Write property test for StorageManager

    - **Property 6: Channel list persistence round-trip**
    - **Validates: Requirements 2.5, 6.1**

  - [ ]* 3.3 Write unit tests for StorageManager edge cases
    - Test empty storage initialization
    - Test storage quota exceeded error
    - Test corrupted data handling
    - _Requirements: 6.3, 6.4_

- [x] 4. Implement API caching layer
  - [x] 4.1 Create APICache class with in-memory cache
    - Implement cache storage with timestamps
    - Implement cache retrieval with expiration checking
    - Implement cache invalidation
    - Set default cache duration to 30 minutes
    - _Requirements: 5.3_

  - [ ]* 4.2 Write property test for API caching
    - **Property 11: API response caching prevents duplicate calls**
    - **Validates: Requirements 5.3**

- [x] 5. Implement YouTubeAPIClient
  - [x] 5.1 Create YouTubeAPIClient class with axios
    - Implement searchChannels() using search.list endpoint
    - Implement getChannelInfo() using channels.list endpoint
    - Implement getChannelVideos() using playlistItems.list endpoint
    - Implement getVideoDetails() using videos.list endpoint
    - Add API key configuration
    - Integrate with APICache for all methods
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.2 Add error handling and validation to API client
    - Implement error response parsing
    - Add validation for API responses (required fields, data types)
    - Handle quota exceeded, rate limiting, network errors
    - Create user-friendly error messages
    - _Requirements: 5.5, 5.6_

  - [ ]* 5.3 Write property test for API error handling
    - **Property 12: API errors are handled gracefully**
    - **Validates: Requirements 5.5, 5.6**

  - [ ]* 5.4 Write unit tests for YouTubeAPIClient
    - Test each API method with mocked responses
    - Test quota exceeded scenario
    - Test network error handling
    - Test response validation
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create custom generators for property tests
  - Create channelArbitrary generator for valid Channel objects
  - Create videoArbitrary generator for valid Video objects
  - Create apiResponseArbitrary for API response structures
  - Create errorArbitrary for various error scenarios
  - Ensure generators handle edge cases (empty lists, no videos, etc.)
  - _Requirements: All (testing infrastructure)_

- [x] 8. Implement ChannelSearch component
  - [x] 8.1 Create ChannelSearch component with search input
    - Create search input with debouncing (300ms)
    - Display search results in a list
    - Show channel thumbnails, names, and subscriber counts
    - Handle channel selection
    - Show loading state during search
    - Display error messages for failed searches
    - _Requirements: 1.2, 1.3_

  - [ ]* 8.2 Write property test for channel search results
    - **Property 1: Channel search results contain required fields**
    - **Validates: Requirements 1.3**

  - [ ]* 8.3 Write unit tests for ChannelSearch component
    - Test search input debouncing
    - Test loading state display
    - Test error message display
    - _Requirements: 1.2, 1.3_

- [x] 9. Implement OnboardingScreen component
  - [x] 9.1 Create OnboardingScreen with ChannelSearch integration
    - Display welcome message and instructions
    - Integrate ChannelSearch component
    - Show selected channels list
    - Add skip and complete buttons
    - Handle channel selection and deselection
    - Save channels and navigate on complete
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [ ]* 9.2 Write property test for channel selection
    - **Property 2: Channel selection adds to list**
    - **Validates: Requirements 1.4, 2.1**

  - [ ]* 9.3 Write unit tests for OnboardingScreen
    - Test first visit detection
    - Test skip functionality
    - Test complete and save flow
    - _Requirements: 1.1, 1.5, 1.6_

- [x] 10. Implement ChannelManager component
  - [x] 10.1 Create ChannelManager for adding/removing channels
    - Display current channel list with thumbnails and names
    - Add channel input (URL or ID)
    - Validate channel identifiers
    - Handle add channel action
    - Handle remove channel action
    - Show error messages for invalid channels
    - Persist changes immediately
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 10.2 Write property test for invalid channel rejection
    - **Property 3: Invalid channel identifiers are rejected**
    - **Validates: Requirements 2.2**

  - [ ]* 10.3 Write property test for channel removal
    - **Property 4: Channel removal removes from list**
    - **Validates: Requirements 2.3**

  - [ ]* 10.4 Write property test for channel list display
    - **Property 5: Channel list display contains required information**
    - **Validates: Requirements 2.4**

  - [ ]* 10.5 Write unit tests for ChannelManager
    - Test channel URL parsing
    - Test add/remove actions
    - Test persistence after modifications
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement VideoFeed component
  - [x] 12.1 Create VideoFeed with video fetching logic
    - Fetch videos from all channels in Channel_List
    - Sort videos by upload date descending
    - Display videos in grid/list layout
    - Show video thumbnails, titles, channel names, dates, durations
    - Handle empty channel list
    - Handle channels with no videos
    - Add refresh button
    - Show loading indicators during fetch
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 12.2 Write property test for video fetching
    - **Property 7: Video feed fetches from all channels**
    - **Validates: Requirements 3.1**

  - [ ]* 12.3 Write property test for video display
    - **Property 8: Video display contains required fields**
    - **Validates: Requirements 3.2**

  - [ ]* 12.4 Write property test for video sorting
    - **Property 9: Videos are sorted by date descending**
    - **Validates: Requirements 3.3**

  - [ ]* 12.5 Write unit tests for VideoFeed
    - Test empty channel list handling
    - Test channels with no videos
    - Test refresh functionality
    - Test loading indicators
    - _Requirements: 3.4, 3.5, 8.3_

- [x] 13. Implement search and filter functionality
  - [x] 13.1 Add search and filter controls to VideoFeed
    - Add search input for filtering by title/description
    - Add channel filter dropdown
    - Implement client-side filtering logic
    - Add clear filters button
    - Ensure no API calls during filtering
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 13.2 Write property test for search filtering
    - **Property 14: Search filtering matches query**
    - **Validates: Requirements 7.1**

  - [ ]* 13.3 Write property test for channel filtering
    - **Property 15: Channel filtering shows only selected channel**
    - **Validates: Requirements 7.2**

  - [ ]* 13.4 Write property test for filter clearing
    - **Property 16: Clearing filters restores full feed**
    - **Validates: Requirements 7.3**

  - [ ]* 13.5 Write unit tests for filtering
    - Test search input filtering
    - Test channel filter dropdown
    - Test clear filters
    - Test no API calls during filtering
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 14. Implement VideoPlayer component
  - [x] 14.1 Create VideoPlayer with YouTube IFrame API
    - Embed YouTube IFrame Player
    - Configure player with rel=0, modestbranding=1
    - Add playback controls (play, pause, seek, volume, fullscreen)
    - Handle video end event to return to feed
    - Add close button to return to feed
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 14.2 Write property test for video selection
    - **Property 10: Video selection triggers playback**
    - **Validates: Requirements 4.1**

  - [ ]* 14.3 Write unit tests for VideoPlayer
    - Test player configuration (rel=0)
    - Test video end navigation
    - Test close button navigation
    - Test playback controls
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement loading state management
  - [x] 16.1 Add loading indicators across all components
    - Create LoadingSpinner component
    - Add loading states to OnboardingScreen
    - Add loading states to VideoFeed
    - Add loading states to ChannelSearch
    - _Requirements: 8.3_

  - [ ]* 16.2 Write property test for loading indicators
    - **Property 17: Loading states display indicators**
    - **Validates: Requirements 8.3**

- [x] 17. Implement error handling UI
  - [x] 17.1 Create error display components
    - Create ErrorMessage component
    - Add error handling to all API calls
    - Display user-friendly error messages
    - Add retry functionality for retryable errors
    - _Requirements: 5.5, 6.4_

  - [ ]* 17.2 Write property test for storage error handling
    - **Property 13: Storage errors are handled gracefully**
    - **Validates: Requirements 6.4**

  - [ ]* 17.3 Write unit tests for error handling
    - Test API error display
    - Test storage error display
    - Test retry functionality
    - _Requirements: 5.5, 6.4_

- [x] 18. Implement responsive design and styling
  - Add CSS modules or Tailwind CSS
  - Create responsive grid layout for VideoFeed (desktop: 3-4 cols, tablet: 2-3 cols, mobile: 1 col)
  - Style OnboardingScreen with clean, minimal design
  - Style ChannelManager with clear interface
  - Ensure touch-friendly tap targets (44x44px minimum)
  - Add calm, distraction-free visual design
  - Test on different screen sizes
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 19. Implement main App component and routing
  - Create App component with routing logic
  - Implement first visit detection for onboarding
  - Set up navigation between onboarding, feed, and player
  - Initialize StorageManager and YouTubeAPIClient
  - Load saved channels on startup
  - Wire all components together
  - _Requirements: All_

- [x] 20. Add API key configuration
  - Create environment variable for YouTube API key
  - Add .env.example file with instructions
  - Document how to obtain YouTube API key
  - Add API key validation on startup
  - _Requirements: 5.1, 5.2_

- [x] 21. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Performance optimizations
  - Implement lazy loading for video thumbnails
  - Add debouncing to search input (300ms)
  - Memoize expensive computations (sorting, filtering)
  - Implement code splitting for VideoPlayer component
  - Optimize bundle size
  - _Requirements: Performance (design document)_

- [x] 23. Build and deployment setup
  - Configure Vite build for production
  - Set up Vercel deployment configuration
  - Create vercel.json with deployment settings
  - Test production build locally
  - Add deployment instructions to README
  - _Requirements: Deployment (design document)_

- [x] 24. Documentation and README
  - Create comprehensive README with:
    - Project description and features
    - Setup instructions
    - How to obtain YouTube API key
    - How to run locally
    - How to deploy
    - Usage guide
  - Add inline code comments
  - Document API client methods
  - _Requirements: All_

- [x] 25. Final integration testing
  - Test complete user flow: onboarding → add channels → view feed → play video
  - Test error scenarios: invalid API key, network errors, quota exceeded
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices
  - Verify all requirements are met
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: utilities → API → UI → integration
