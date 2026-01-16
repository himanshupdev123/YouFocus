# Contributing to Focused YouTube Viewer

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Areas for Contribution](#areas-for-contribution)

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Assume good intentions

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/focused-youtube-viewer.git
   cd focused-youtube-viewer
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your API key** (see README.md for instructions)
5. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm run preview
```

## Code Style Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** - the project uses strict TypeScript settings
- **Define types explicitly** - avoid `any` unless absolutely necessary
- **Use interfaces** for object shapes
- **Use type aliases** for unions and complex types

Example:
```typescript
// Good
interface VideoFeedProps {
  channels: Channel[];
  apiClient: YouTubeAPIClient;
  onVideoSelect: (videoId: string) => void;
}

// Avoid
function VideoFeed(props: any) { ... }
```

### React Components

- **Use functional components** with hooks
- **Use TypeScript** for props and state
- **Keep components focused** - single responsibility
- **Extract reusable logic** into custom hooks
- **Use meaningful prop names**

Example:
```typescript
// Good
export function VideoFeed({ channels, apiClient, onVideoSelect }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  // ...
}

// Avoid
export function VideoFeed(props) {
  const [data, setData] = useState([]);
  // ...
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `VideoFeed`, `ChannelManager`)
- **Files**: PascalCase for components (e.g., `VideoFeed.tsx`)
- **Functions**: camelCase (e.g., `fetchVideos`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces**: PascalCase with descriptive names (e.g., `VideoFeedProps`)

### Comments and Documentation

- **Add JSDoc comments** for public functions and classes
- **Explain "why"** not "what" in inline comments
- **Document complex logic** with clear explanations
- **Keep comments up-to-date** when code changes

Example:
```typescript
/**
 * Fetches videos from all channels and sorts by upload date
 * Uses caching to minimize API quota usage
 * 
 * @throws {APIError} If any channel fetch fails
 */
async function fetchVideos(): Promise<Video[]> {
  // Implementation
}
```

### CSS

- **Use CSS Modules** for component styles
- **Follow BEM naming** for class names
- **Use CSS variables** for theming
- **Keep styles scoped** to components
- **Use responsive units** (rem, em, %, vw, vh)

Example:
```css
/* VideoFeed.css */
.video-feed {
  display: grid;
  gap: 1rem;
}

.video-feed__item {
  border-radius: 0.5rem;
}

.video-feed__item--selected {
  border: 2px solid var(--primary-color);
}
```

## Testing Guidelines

### Unit Tests

- **Test utility functions** thoroughly
- **Test edge cases** (empty inputs, null values, errors)
- **Use descriptive test names** that explain what is being tested
- **Keep tests focused** - one assertion per test when possible

Example:
```typescript
describe('formatDuration', () => {
  it('formats minutes and seconds correctly', () => {
    expect(formatDuration('PT4M13S')).toBe('4:13');
  });

  it('handles hours correctly', () => {
    expect(formatDuration('PT1H30M45S')).toBe('1:30:45');
  });

  it('handles zero duration', () => {
    expect(formatDuration('PT0S')).toBe('0:00');
  });
});
```

### Property-Based Tests

- **Use fast-check** for property-based testing
- **Test universal properties** that should hold for all inputs
- **Run at least 100 iterations** per property test
- **Tag tests** with the property they validate

Example:
```typescript
// Feature: focused-youtube-viewer, Property 6: Channel list persistence round-trip
test('Channel list persistence round-trip', () => {
  fc.assert(
    fc.property(
      fc.array(channelArbitrary),
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

### Component Tests

- **Use React Testing Library** for component tests
- **Test user interactions** not implementation details
- **Use accessible queries** (getByRole, getByLabelText)
- **Test error states** and loading states

Example:
```typescript
test('displays loading spinner while fetching videos', async () => {
  render(<VideoFeed channels={mockChannels} apiClient={mockClient} onVideoSelect={jest.fn()} />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

### Format

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat: add dark mode support

Implements dark mode with CSS variables and theme toggle.
Persists user preference to localStorage.

Closes #42
```

```
fix: prevent duplicate channels in list

Checks for existing channel ID before adding to prevent duplicates.
```

```
docs: update API key setup instructions

Adds screenshots and clarifies steps for obtaining YouTube API key.
```

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass** (`npm run test`)
4. **Update the README** if needed
5. **Create a pull request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to related issues (if any)
   - Screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Added new tests for changes
- [ ] Tested manually in browser

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

## Areas for Contribution

### High Priority

- **Accessibility improvements**: ARIA labels, keyboard navigation, screen reader support
- **Mobile optimization**: Better touch interactions, responsive design improvements
- **Performance**: Bundle size reduction, lazy loading, optimization
- **Error handling**: Better error messages, retry logic, offline support

### Medium Priority

- **Dark mode**: Theme support with user preference
- **Export/Import**: Channel list backup and restore
- **Search improvements**: Better filtering, sorting options
- **UI polish**: Animations, transitions, visual feedback

### Low Priority

- **Watch history**: Track viewed videos
- **Notifications**: Alert for new uploads
- **Multiple lists**: Different channel lists for different topics
- **Cloud sync**: Sync across devices (requires backend)

### Documentation

- **Tutorials**: Step-by-step guides for common tasks
- **API documentation**: Detailed API client documentation
- **Architecture guide**: Explain the codebase structure
- **Translations**: Translate README and UI to other languages

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Be specific about what you need help with

Thank you for contributing to Focused YouTube Viewer! 🎉
