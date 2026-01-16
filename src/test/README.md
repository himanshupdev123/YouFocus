# Property-Based Testing Generators

This directory contains custom generators (arbitraries) for property-based testing using [fast-check](https://github.com/dubzzz/fast-check).

## Overview

Property-based testing validates that properties hold true across many randomly generated inputs. These generators create valid test data for the Focused YouTube Viewer application.

## Available Generators

### Core Data Generators

#### `channelArbitrary`
Generates valid `Channel` objects with all required fields.

```typescript
import { channelArbitrary } from '../test/generators';

fc.assert(
  fc.property(channelArbitrary, (channel) => {
    // Test your property here
  })
);
```

#### `videoArbitrary`
Generates valid `Video` objects with proper dates, durations, and metadata.

```typescript
import { videoArbitrary } from '../test/generators';

fc.assert(
  fc.property(videoArbitrary, (video) => {
    // Test your property here
  })
);
```

#### `errorArbitrary`
Generates various `APIError` scenarios including quota exceeded, network errors, rate limiting, etc.

```typescript
import { errorArbitrary } from '../test/generators';

fc.assert(
  fc.property(errorArbitrary, (error) => {
    // Test error handling
  })
);
```

### YouTube API Response Generators

#### `youtubeChannelSearchItemArbitrary`
Generates YouTube API channel search response items.

#### `youtubeChannelItemArbitrary`
Generates YouTube API channel list response items.

#### `youtubePlaylistItemArbitrary`
Generates YouTube API playlist item responses.

#### `youtubeVideoItemArbitrary`
Generates YouTube API video item responses.

#### `youtubeAPIResponseArbitrary<T>`
Generates complete YouTube API response wrappers with pagination support.

```typescript
import { youtubeAPIResponseArbitrary, youtubeChannelItemArbitrary } from '../test/generators';

const responseArbitrary = youtubeAPIResponseArbitrary(youtubeChannelItemArbitrary);

fc.assert(
  fc.property(responseArbitrary, (response) => {
    // Test API response handling
  })
);
```

### ID Generators

#### `channelIdArbitrary`
Generates valid YouTube channel IDs (24 characters starting with "UC").

#### `videoIdArbitrary`
Generates valid YouTube video IDs (11 characters).

#### `uploadsPlaylistIdArbitrary`
Generates valid uploads playlist IDs (24 characters starting with "UU").

### Edge Case Generators

#### `emptyChannelListArbitrary`
Always generates an empty channel list `[]`.

#### `emptyVideoListArbitrary`
Always generates an empty video list `[]`.

#### `invalidChannelIdArbitrary`
Generates invalid channel identifiers for testing validation logic.

#### `channelListArbitrary`
Generates channel lists of various sizes including edge cases (empty, single item, normal, large).

#### `videoListArbitrary`
Generates video lists of various sizes including edge cases (empty, single item, normal, large).

## Usage Examples

### Testing Channel Persistence

```typescript
import fc from 'fast-check';
import { channelArbitrary } from '../test/generators';
import { StorageManager } from '../utils/StorageManager';

test('Channel list persistence round-trip', () => {
  fc.assert(
    fc.property(
      fc.array(channelArbitrary, { minLength: 0, maxLength: 50 }),
      (channels) => {
        const storage = new StorageManager();
        storage.saveChannels(channels);
        const loaded = storage.loadChannels();
        expect(loaded).toEqual(channels);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Testing Video Sorting

```typescript
import fc from 'fast-check';
import { videoListArbitrary } from '../test/generators';

test('Videos are sorted by date descending', () => {
  fc.assert(
    fc.property(videoListArbitrary, (videos) => {
      const sorted = sortVideosByDate(videos);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].publishedAt >= sorted[i + 1].publishedAt).toBe(true);
      }
    }),
    { numRuns: 100 }
  );
});
```

### Testing Error Handling

```typescript
import fc from 'fast-check';
import { errorArbitrary } from '../test/generators';

test('API errors are handled gracefully', () => {
  fc.assert(
    fc.property(errorArbitrary, (error) => {
      const result = handleAPIError(error);
      
      expect(result.userMessage).toBeDefined();
      expect(result.userMessage.length).toBeGreaterThan(0);
    }),
    { numRuns: 100 }
  );
});
```

## Best Practices

1. **Run Many Iterations**: Use at least 100 iterations (`numRuns: 100`) for thorough testing.

2. **Test Edge Cases**: Use the edge case generators (`emptyChannelListArbitrary`, etc.) to ensure your code handles boundary conditions.

3. **Combine Generators**: Use `fc.tuple`, `fc.record`, or `fc.array` to combine generators for complex test scenarios.

4. **Tag Your Tests**: Always tag property tests with comments referencing the design document:
   ```typescript
   // Feature: focused-youtube-viewer, Property 6: Channel list persistence round-trip
   ```

5. **Keep Properties Simple**: Each property should test one specific behavior or invariant.

## Generator Implementation Details

### ID Format Validation

- **Channel IDs**: 24 characters, format `UC[A-Za-z0-9_-]{22}`
- **Video IDs**: 11 characters, format `[A-Za-z0-9_-]{11}`
- **Playlist IDs**: 24 characters, format `UU[A-Za-z0-9_-]{22}`

### Duration Format

Durations follow ISO 8601 format: `PT[hours]H[minutes]M[seconds]S`

Examples:
- `PT4M13S` (4 minutes, 13 seconds)
- `PT1H2M10S` (1 hour, 2 minutes, 10 seconds)
- `PT0S` (0 seconds)

### Date Ranges

Video and playlist dates are generated between `2005-01-01` (YouTube's founding) and the current date.

## Testing the Generators

The generators themselves are tested in `generators.test.ts` to ensure they produce valid data. Run these tests with:

```bash
npm test -- src/test/generators.test.ts
```

## References

- [fast-check Documentation](https://github.com/dubzzz/fast-check/tree/main/documentation)
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/1-Guides/PropertyBasedTesting.md)
- [YouTube Data API Reference](https://developers.google.com/youtube/v3/docs)
