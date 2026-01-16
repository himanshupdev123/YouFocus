# Focused YouTube Viewer

A distraction-free YouTube viewing experience that displays content exclusively from user-curated channels.

## Overview

Focused YouTube Viewer is a web application designed to help you stay focused while watching YouTube content. Instead of being distracted by algorithmic recommendations and unrelated videos, you curate a list of trusted channels and see only their latest content in a clean, chronological feed.

### Key Features

- **Curated Channel Lists**: Add and manage your favorite YouTube channels
- **Distraction-Free Feed**: See only videos from your selected channels, sorted chronologically
- **No Recommendations**: Completely eliminates YouTube's algorithmic suggestions
- **Clean Video Player**: Watch videos without related video sidebars or end screens
- **Search & Filter**: Quickly find specific videos by title or filter by channel
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Offline-First**: Your channel list is saved locally in your browser
- **Smart Caching**: Minimizes API calls to stay within free quota limits (10,000 units/day)
- **Fast & Lightweight**: Built with React and Vite for optimal performance

### Why Use This?

If you've ever opened YouTube to watch a specific video and found yourself 2 hours later watching something completely unrelated, this app is for you. By limiting your feed to only channels you trust, you can:

- Stay focused on educational or professional content
- Avoid the YouTube rabbit hole
- Control your viewing habits
- Support specific creators without distractions

### Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Testing**: Vitest with fast-check for property-based testing
- **API**: YouTube Data API v3 for fetching channel and video data
- **Storage**: Browser LocalStorage for persisting your channel list
- **Styling**: CSS Modules for component-scoped styles

## Project Setup

This project uses:
- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **Vitest** for unit and property-based testing
- **fast-check** for property-based testing
- **React Testing Library** for component testing
- **Axios** for API requests

## Project Structure

```
src/
├── components/     # React components
├── services/       # API clients and external services
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
└── test/           # Test setup and utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up YouTube API Key

This application requires a YouTube Data API v3 key to function. Follow these steps:

#### Obtain Your API Key

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "Focused YouTube Viewer")

3. **Enable YouTube Data API v3**
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Your API key will be generated - copy it

5. **Configure Your API Key (Recommended)**
   - Click on the API key you just created to edit it
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add `http://localhost:5173/*` for development
     - Add your production domain when deploying
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose "YouTube Data API v3" from the dropdown
   - Click "Save"

#### Add API Key to Your Project

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file**
   - Open `.env` in your text editor
   - Replace `your_api_key_here` with your actual API key:
   ```
   VITE_YOUTUBE_API_KEY=AIzaSyC...your_actual_key_here
   ```

3. **Important Notes**
   - Never commit your `.env` file to version control (it's already in `.gitignore`)
   - The daily quota limit is 10,000 units
   - This app is optimized to stay well within limits through caching
   - If you see a quota error, wait until the next day or enable billing in Google Cloud

### 3. Start the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 4. Run Tests

```bash
npm run test
```

## Requirements

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **YouTube Data API v3 key** - See setup instructions above
- Modern web browser (Chrome, Firefox, Safari, or Edge)


## Usage Guide

### First Time Setup

When you first open the application, you'll see the onboarding screen:

1. **Search for Channels**
   - Type a channel name in the search box (e.g., "Veritasium", "Kurzgesagt")
   - Or paste a channel URL (e.g., `https://www.youtube.com/@veritasium`)
   - Search results will show channel thumbnails, names, and subscriber counts

2. **Select Channels**
   - Click on channels to add them to your list
   - You can add as many channels as you want
   - Selected channels appear in the "Selected Channels" section

3. **Complete Setup**
   - Click "Complete" to save your channels and start using the app
   - Or click "Skip" to start with an empty list (you can add channels later)

### Daily Usage

#### Viewing Your Video Feed

After setup, you'll see your personalized video feed:

- **Videos are sorted by upload date** (newest first)
- Each video shows:
  - Thumbnail image
  - Video title
  - Channel name
  - Upload date (e.g., "2 days ago")
  - Video duration

#### Playing Videos

1. **Click any video** to start playback
2. The video player opens in full view
3. **Player controls**:
   - Play/Pause
   - Seek bar for jumping to specific times
   - Volume control
   - Fullscreen mode
4. **Return to feed**:
   - Click the "Back to Feed" button
   - Or wait for the video to end (automatically returns)

#### Managing Channels

Access the channel manager from the main feed:

1. **Add New Channels**
   - Click "Manage Channels" button
   - Use the search interface to find channels
   - Click to add them to your list
   - Changes are saved automatically

2. **Remove Channels**
   - Click the "×" button next to any channel
   - The channel is removed immediately
   - Videos from that channel disappear from your feed

#### Search and Filter

Use the search and filter tools to find specific content:

1. **Search by Title**
   - Type keywords in the search box
   - Feed updates instantly to show matching videos
   - Searches both titles and descriptions

2. **Filter by Channel**
   - Click the channel filter dropdown
   - Select a specific channel
   - See only videos from that channel

3. **Clear Filters**
   - Click "Clear Filters" to see all videos again
   - Or clear the search box manually

#### Refreshing Content

- **Manual Refresh**: Click the "Refresh" button to fetch latest videos
- **Automatic Caching**: Videos are cached for 30 minutes to save API quota
- **Smart Updates**: Only fetches new data when cache expires

### Tips for Best Experience

**Curating Your Channel List:**
- Start with 5-10 channels you genuinely want to follow
- Add channels that align with your goals (learning, entertainment, etc.)
- Remove channels that don't add value to avoid clutter

**Managing API Quota:**
- The app caches data for 30 minutes to minimize API calls
- With 10-15 channels, you'll stay well within the free 10,000 unit daily limit
- If you hit the quota, cached videos will still be available

**Mobile Usage:**
- The app is fully responsive and works great on phones
- Swipe gestures work naturally for scrolling
- Video player adapts to your screen size

**Privacy:**
- All data is stored locally in your browser
- No account required, no tracking
- Your channel list is private to your device

### Keyboard Shortcuts

When watching videos:
- **Space**: Play/Pause
- **F**: Fullscreen
- **M**: Mute/Unmute
- **Arrow Keys**: Seek forward/backward
- **Esc**: Exit fullscreen or return to feed

### Common Workflows

**Morning Routine:**
1. Open the app
2. Click "Refresh" to get latest videos
3. Scan titles for interesting content
4. Watch what catches your attention

**Focused Learning:**
1. Filter by a specific educational channel
2. Watch videos in chronological order
3. Take notes without distractions

**Catching Up:**
1. Use search to find videos on a specific topic
2. Filter by channel if you remember the creator
3. Watch at your own pace


## Troubleshooting

### API Key Issues

**"YouTube API key is not configured"**
- Make sure you created a `.env` file (not `.env.example`)
- Verify the API key is set: `VITE_YOUTUBE_API_KEY=your_key`
- Restart the development server after adding the API key

**"Access denied. Please check your API key configuration."**
- Verify your API key is correct in the `.env` file
- Check that YouTube Data API v3 is enabled in Google Cloud Console
- If you restricted the API key, make sure `http://localhost:5173` is allowed

**"YouTube API quota exceeded"**
- The free tier has a 10,000 unit daily limit
- Wait until the next day (quota resets at midnight Pacific Time)
- Or enable billing in Google Cloud Console for higher limits
- The app caches responses for 30 minutes to minimize quota usage

**"Unable to connect to YouTube"**
- Check your internet connection
- Verify you're not behind a firewall blocking YouTube API
- Try again in a few moments

### General Issues

**Application won't start**
- Make sure you ran `npm install`
- Check that Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Tests failing**
- Make sure all dependencies are installed
- Run `npm run test` to see detailed error messages
- Check that your Node.js version is 18 or higher


## Deployment

This application can be deployed to any static hosting platform. Below are instructions for deploying to Vercel (recommended) and other platforms.

### Deploy to Vercel (Recommended)

Vercel provides the easiest deployment experience with automatic HTTPS, global CDN, and zero configuration.

#### Prerequisites
- A [Vercel account](https://vercel.com/signup) (free tier available)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for command-line deployment)

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/focused-youtube-viewer.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Configure Environment Variables**
   - In the "Environment Variables" section, add:
     - Name: `VITE_YOUTUBE_API_KEY`
     - Value: Your YouTube API key
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

5. **Update API Key Restrictions**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Edit your API key
   - Under "HTTP referrers", add your Vercel domain:
     - `https://your-project-name.vercel.app/*`
   - Click "Save"

#### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts to link your project
   - The CLI will guide you through the setup

4. **Add Environment Variable**
   ```bash
   vercel env add VITE_YOUTUBE_API_KEY
   ```
   - Paste your YouTube API key when prompted
   - Select "Production" environment

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys every push to the `main` branch to production
- Creates preview deployments for pull requests
- Provides deployment URLs for testing

### Deploy to Other Platforms

#### Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://www.netlify.com/)
   - Drag and drop the `dist` folder
   - Or connect your GitHub repository for automatic deployments

3. **Configure Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add `VITE_YOUTUBE_API_KEY` with your API key

#### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/focused-youtube-viewer"
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/focused-youtube-viewer/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Note**: GitHub Pages doesn't support environment variables, so you'll need to hardcode the API key (not recommended for public repos) or use a different hosting solution.

#### AWS S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create a new bucket with public access
   - Enable static website hosting

3. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Create CloudFront Distribution**
   - Point to your S3 bucket
   - Configure custom error pages (404 → /index.html)

5. **Environment Variables**
   - Build with the API key in your local `.env` file
   - The key will be bundled into the JavaScript (public)

### Post-Deployment Checklist

After deploying, verify:

- [ ] Application loads without errors
- [ ] YouTube API key is working (try searching for channels)
- [ ] Videos load and play correctly
- [ ] Responsive design works on mobile devices
- [ ] HTTPS is enabled (required for YouTube API)
- [ ] API key restrictions include your production domain
- [ ] All features work as expected (onboarding, channel management, video feed)

### Production Considerations

**Security:**
- The YouTube API key is exposed in the client-side code (this is normal for client-side apps)
- Restrict your API key to specific domains in Google Cloud Console
- Monitor your API usage in Google Cloud Console

**Performance:**
- The app uses aggressive caching (30 minutes) to minimize API calls
- Bundle size is optimized (~250KB total, ~70KB gzipped)
- Images are lazy-loaded for better performance

**Monitoring:**
- Check Google Cloud Console for API quota usage
- Set up alerts if you approach the 10,000 unit daily limit
- Monitor for any API errors or issues

**Scaling:**
- The free tier (10,000 units/day) supports ~50-100 active users
- If you need more, enable billing in Google Cloud Console
- Consider implementing server-side caching for high-traffic scenarios

### Custom Domain

To use a custom domain with Vercel:

1. **Add Domain in Vercel Dashboard**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain

2. **Update DNS Records**
   - Add the DNS records provided by Vercel
   - Wait for DNS propagation (can take up to 48 hours)

3. **Update API Key Restrictions**
   - Add your custom domain to the API key restrictions in Google Cloud Console

### Troubleshooting Deployment

**Build fails on Vercel**
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

**API key not working in production**
- Verify the environment variable is set correctly
- Check that the domain is allowed in API key restrictions
- Ensure HTTPS is enabled (required for YouTube API)

**Videos not loading**
- Check browser console for errors
- Verify API key has YouTube Data API v3 enabled
- Check that you haven't exceeded the daily quota

**Blank page after deployment**
- Check browser console for errors
- Verify the base URL is correct in `vite.config.ts`
- Ensure all assets are being served correctly

## Contributing

Contributions are welcome! This project is designed to be a simple, focused tool for distraction-free YouTube viewing.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Run tests**
   ```bash
   npm run test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Write descriptive comments for complex logic
- Keep components small and focused
- Use CSS Modules for styling

### Testing

- Write unit tests for utility functions
- Write property-based tests for core logic
- Test components with React Testing Library
- Aim for 80%+ code coverage

### Areas for Contribution

- **UI/UX improvements**: Better mobile experience, dark mode, accessibility
- **Performance**: Optimize rendering, reduce bundle size
- **Features**: Export/import channel lists, watch history, notifications
- **Documentation**: Improve guides, add tutorials, translate to other languages
- **Bug fixes**: Report and fix issues

## License

This project is open source and available under the [MIT License](LICENSE).

### MIT License Summary

You are free to:
- Use this software for any purpose
- Modify the source code
- Distribute copies
- Sublicense the software

Conditions:
- Include the original copyright notice
- Include the license text

The software is provided "as is", without warranty of any kind.

## Acknowledgments

- **YouTube Data API v3** - For providing access to channel and video data
- **React** - For the excellent UI framework
- **Vite** - For blazing fast development experience
- **fast-check** - For property-based testing capabilities
- **Vitest** - For fast and modern testing

## Support

If you encounter issues or have questions:

1. **Check the Troubleshooting section** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information
   - Console error messages (if any)

## Roadmap

Potential future enhancements:

- [ ] Dark mode support
- [ ] Export/import channel lists
- [ ] Watch history tracking
- [ ] Notification system for new uploads
- [ ] Multiple channel list profiles
- [ ] Offline video caching
- [ ] Cloud sync across devices
- [ ] Browser extension version

## Privacy & Data

- **No tracking**: This app doesn't track your usage or collect analytics
- **Local storage only**: All data is stored in your browser's localStorage
- **No accounts**: No sign-up or login required
- **API key**: Your YouTube API key is used only for fetching public data
- **Open source**: All code is available for inspection

---

**Built with ❤️ for focused learning and distraction-free viewing**
