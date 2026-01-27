# YouTube Search Service

A Python Flask service that provides YouTube search functionality without consuming YouTube API quota by using the `fast-youtube-search` library.

## Features

- **Zero API Quota Usage**: Uses web scraping instead of YouTube Data API
- **Channel Search**: Extracts channel information from video search results
- **Video Search**: Direct video search functionality
- **Caching**: In-memory caching to improve performance
- **Rate Limiting**: Built-in rate limiting to avoid being blocked
- **REST API**: Simple REST endpoints for frontend integration

## Installation

1. **Create virtual environment**:
```bash
cd search-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env file as needed
```

## Usage

### Development
```bash
python app.py
```

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Health Check
```
GET /health
```

### Search Channels
```
GET /api/search/channels?q=<query>&maxResults=<number>
```

**Parameters:**
- `q` (required): Search query
- `maxResults` (optional): Maximum results (default: 25, max: 50)

**Response:**
```json
{
  "query": "search term",
  "maxResults": 25,
  "totalResults": 15,
  "channels": [
    {
      "id": "channel_from_videoId",
      "title": "Channel Name",
      "thumbnailUrl": "https://...",
      "videoId": "videoId",
      "videoTitle": "Video Title",
      "confidence": 0.8
    }
  ]
}
```

### Search Videos
```
GET /api/search/videos?q=<query>&maxResults=<number>
```

**Parameters:**
- `q` (required): Search query
- `maxResults` (optional): Maximum results (default: 25, max: 50)

**Response:**
```json
{
  "query": "search term",
  "maxResults": 25,
  "totalResults": 25,
  "videos": [
    {
      "name": "Video Title",
      "id": "videoId",
      "img": "https://..."
    }
  ]
}
```

### Cache Management
```
POST /api/cache/clear    # Clear cache
GET /api/cache/stats     # Get cache statistics
```

## Integration with Frontend

The service is designed to work with the existing YouTubeAPIClient. The frontend should:

1. Call this service for initial search results (0 API quota)
2. Use YouTube Data API for detailed channel information (1 unit per channel)
3. Implement fallback to direct YouTube API if service is unavailable

## Deployment Options

### Local Development
- Run directly with `python app.py`
- Service available at `http://localhost:5000`

### Production Deployment
- **Heroku**: Use included `Procfile`
- **Docker**: Use included `Dockerfile`
- **VPS**: Use gunicorn with systemd service
- **Serverless**: Adapt for AWS Lambda/Vercel Functions

## Limitations

1. **Channel Identification**: Uses heuristic methods to extract channel names from video titles
2. **Rate Limiting**: May be slower than direct API calls due to rate limiting
3. **Accuracy**: Channel name extraction is best-effort and may not always be accurate
4. **Dependency**: Relies on YouTube's web interface structure

## Error Handling

The service includes comprehensive error handling:
- Input validation for all parameters
- Rate limiting to prevent blocking
- Graceful degradation on search failures
- Detailed logging for debugging

## Performance Considerations

- **Caching**: Results are cached for 1 hour by default
- **Rate Limiting**: 0.5 second delay between requests
- **Memory Usage**: In-memory cache, consider Redis for production
- **Scaling**: Stateless design allows horizontal scaling