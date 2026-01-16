# Requirements Document

## Introduction

The Focused YouTube Viewer is a system that allows users to watch content exclusively from a curated list of YouTube channels without being exposed to algorithmic recommendations or unrelated content. This addresses the common problem of users getting distracted by recommended videos when they want to focus on specific content creators.

## Glossary

- **System**: The Focused YouTube Viewer application
- **User**: A person who wants to watch YouTube content from specific channels only
- **Channel_List**: A user-defined collection of YouTube channel identifiers
- **Video_Feed**: A chronological list of videos from channels in the Channel_List
- **YouTube_API**: The external YouTube Data API used to fetch channel and video information
- **Player**: The video playback component that displays YouTube videos

## Requirements

### Requirement 1: Initial Setup and Onboarding

**User Story:** As a new user, I want to select my preferred YouTube channels during initial setup, so that I can start using the app with my curated content immediately.

#### Acceptance Criteria

1. WHEN a user opens the application for the first time, THE System SHALL display an onboarding screen
2. THE System SHALL provide a search interface to find YouTube channels by name or URL
3. WHEN a user searches for a channel, THE System SHALL display matching channels with their names, thumbnails, and subscriber counts
4. WHEN a user selects channels during onboarding, THE System SHALL add them to the Channel_List
5. THE System SHALL allow users to skip onboarding and add channels later
6. WHEN onboarding is completed, THE System SHALL save the Channel_List and navigate to the Video_Feed

### Requirement 2: Channel Management

**User Story:** As a user, I want to add and remove YouTube channels from my curated list, so that I can control exactly which content sources I see.

#### Acceptance Criteria

1. WHEN a user provides a valid YouTube channel URL or channel ID, THE System SHALL add the channel to the Channel_List
2. WHEN a user attempts to add an invalid channel identifier, THE System SHALL return a descriptive error message and maintain the current Channel_List
3. WHEN a user requests to remove a channel, THE System SHALL remove it from the Channel_List
4. WHEN a user views their Channel_List, THE System SHALL display all added channels with their names and thumbnails
5. THE System SHALL persist the Channel_List to local storage immediately after any modification

### Requirement 3: Video Feed Display

**User Story:** As a user, I want to see a chronological feed of recent videos from my selected channels, so that I can easily find content to watch without distractions.

#### Acceptance Criteria

1. WHEN a user opens the Video_Feed, THE System SHALL fetch recent videos from all channels in the Channel_List
2. WHEN displaying videos, THE System SHALL show video title, thumbnail, channel name, upload date, and duration
3. THE System SHALL sort videos by upload date in descending order (newest first)
4. WHEN the Video_Feed is refreshed, THE System SHALL fetch the latest videos from the YouTube_API
5. IF a channel in the Channel_List has no recent videos, THE System SHALL continue displaying videos from other channels

### Requirement 4: Video Playback

**User Story:** As a user, I want to watch videos in a distraction-free environment, so that I stay focused on my intended content.

#### Acceptance Criteria

1. WHEN a user selects a video from the Video_Feed, THE System SHALL play the video using the Player
2. THE Player SHALL display only the video content without YouTube's recommendation sidebar or end screens
3. WHEN a video finishes playing, THE System SHALL return the user to the Video_Feed
4. THE Player SHALL support standard playback controls (play, pause, seek, volume, fullscreen)

### Requirement 5: YouTube API Integration

**User Story:** As a developer, I want to integrate with YouTube's API efficiently, so that the system can fetch channel and video data reliably within quota limits.

#### Acceptance Criteria

1. WHEN fetching channel information, THE System SHALL use the YouTube_API channels.list method (cost: 1 unit per channel)
2. WHEN fetching videos from a channel, THE System SHALL use the playlistItems.list method to retrieve videos from the channel's uploads playlist (cost: 1 unit per request, up to 50 videos per request)
3. THE System SHALL cache API responses for a configurable duration (default: 30 minutes) to minimize quota usage
4. WHEN the daily quota limit (10,000 units) is approached, THE System SHALL notify the user and rely on cached data
5. IF the YouTube_API returns an error, THE System SHALL display a user-friendly error message
6. THE System SHALL validate API responses before processing them
7. WHEN fetching videos, THE System SHALL request videos published within a configurable time window (default: last 30 days)

### Requirement 6: Data Persistence

**User Story:** As a user, I want my channel list to be saved automatically, so that I don't lose my configuration between sessions.

#### Acceptance Criteria

1. WHEN the Channel_List is modified, THE System SHALL serialize it to local storage
2. WHEN the application starts, THE System SHALL load the Channel_List from local storage
3. IF local storage is empty on startup, THE System SHALL initialize with an empty Channel_List
4. THE System SHALL handle storage errors gracefully and notify the user

### Requirement 7: Search and Filter

**User Story:** As a user, I want to search and filter videos in my feed, so that I can quickly find specific content.

#### Acceptance Criteria

1. WHEN a user enters a search query, THE System SHALL filter the Video_Feed to show only videos matching the query in title or description
2. WHERE a filter by channel option is available, THE System SHALL allow filtering videos by specific channels from the Channel_List
3. WHEN filters are cleared, THE System SHALL restore the full Video_Feed
4. THE System SHALL perform filtering on the client side without additional API calls

### Requirement 8: User Interface

**User Story:** As a user, I want a clean and intuitive interface, so that I can easily navigate and use the application.

#### Acceptance Criteria

1. THE System SHALL provide a clear interface for managing the Channel_List
2. THE System SHALL display the Video_Feed in a grid or list layout
3. WHEN the application is loading data, THE System SHALL display loading indicators
4. THE System SHALL be responsive and work on desktop and mobile devices
5. THE System SHALL use a calm, distraction-free visual design
