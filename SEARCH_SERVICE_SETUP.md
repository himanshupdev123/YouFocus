# Search Service Setup Guide

This guide explains how to set up the Python search service to optimize YouTube API quota usage by reducing search-related API calls from 100 units to ~5-15 units per search.

## Overview

The search service provides a hybrid approach:
- **Python Service**: Handles initial search using web scraping (0 API quota)
- **YouTube API**: Used only for detailed channel information (1 unit per channel)
- **Result**: 80-90% reduction in search-related API usage

## Prerequisites

- Python 3.8 or higher
- Node.js and npm (for the React frontend)
- YouTube Data API v3 key

## Step 1: Set Up Python Search Service

### 1.1 Navigate to Search Service Directory
```bash
cd search-service
```

### 1.2 Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 1.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Configure Environment (Optional)
```bash
# Copy environment template
cp .env.example .env

# Edit .env file if needed (defaults are usually fine)
```

### 1.5 Test the Service
```bash
# Start the service
python app.py

# In another terminal, run tests
python test_service.py
```

The service should start on `http://localhost:5000` and the tests should pass.

## Step 2: Configure Frontend

### 2.1 Update Environment Variables
Copy the main `.env.example` to `.env` and configure:

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file:
```env
# Your YouTube API key
VITE_YOUTUBE_API_KEY=your_api_key_here

# Enable search service (set to 'false' to disable)
REACT_APP_SEARCH_SERVICE_ENABLED=true

# Search service URL (default: http://localhost:5000)
REACT_APP_SEARCH_SERVICE_URL=http://localhost:5000

# Request timeout in milliseconds (default: 10000)
REACT_APP_SEARCH_SERVICE_TIMEOUT=10000
```

### 2.2 Install Frontend Dependencies
```bash
# From the main project directory
npm install
```

## Step 3: Run Both Services

### 3.1 Start Python Search Service
```bash
# In one terminal
cd search-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

### 3.2 Start React Frontend
```bash
# In another terminal (from main project directory)
npm run dev
```

## Step 4: Verify Integration

1. **Open the application** in your browser (usually `http://localhost:5173`)
2. **Search for channels** - you should see console logs indicating which service is being used:
   - `"Using SearchService for channel search (0 API quota)"` - Optimal
   - `"Using YouTube API for channel search (100 API quota)"` - Fallback

3. **Check API quota usage** in Google Cloud Console to confirm reduced usage

## Deployment Options

### Option 1: Local Development
- Run both services locally as described above
- Good for development and testing

### Option 2: Deploy Python Service
Deploy the Python service to a cloud provider:

#### Heroku
```bash
cd search-service
# Create Heroku app
heroku create your-app-name
# Deploy
git add .
git commit -m "Deploy search service"
git push heroku main
```

#### Docker
```bash
cd search-service
# Build image
docker build -t youtube-search-service .
# Run container
docker run -p 5000:5000 youtube-search-service
```

#### VPS with systemd
```bash
# Copy service files to server
# Create systemd service file
sudo nano /etc/systemd/system/youtube-search.service

# Service file content:
[Unit]
Description=YouTube Search Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/search-service
Environment=PATH=/path/to/search-service/venv/bin
ExecStart=/path/to/search-service/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable youtube-search.service
sudo systemctl start youtube-search.service
```

### Option 3: Serverless Deployment
The service can be adapted for serverless platforms like AWS Lambda or Vercel Functions, though this requires some modifications to handle the stateless nature.

## Troubleshooting

### Common Issues

#### 1. Search Service Not Starting
```bash
# Check Python version
python --version  # Should be 3.8+

# Check dependencies
pip list

# Check for port conflicts
netstat -an | grep 5000  # On Windows: netstat -an | findstr 5000
```

#### 2. Frontend Can't Connect to Search Service
- Verify search service is running on `http://localhost:5000`
- Check CORS settings in the Python service
- Verify `REACT_APP_SEARCH_SERVICE_URL` in `.env`

#### 3. Search Service Returns Errors
```bash
# Check search service logs
# Look for rate limiting or blocking issues
# Try different search queries
```

#### 4. Fallback to YouTube API
This is normal behavior when:
- Search service is not running
- Search service is unhealthy
- Network issues occur

The application will automatically fall back to direct YouTube API usage.

### Performance Monitoring

#### Monitor API Quota Usage
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Quotas"
3. Search for "YouTube Data API v3"
4. Monitor daily usage

#### Expected Quota Reduction
- **Before**: ~125 units per channel search
- **After**: ~5-15 units per channel search
- **Savings**: 80-90% reduction

#### Monitor Search Service Performance
```bash
# Check cache stats
curl http://localhost:5000/api/cache/stats

# Health check
curl http://localhost:5000/health
```

## Configuration Options

### Search Service Configuration
Edit `search-service/.env`:
```env
# Flask environment
FLASK_ENV=development

# Port (default: 5000)
PORT=5000

# Rate limiting (seconds between requests)
REQUEST_DELAY=0.5

# Maximum results per request
MAX_RESULTS_LIMIT=50

# Cache duration (seconds)
CACHE_DURATION=3600

# Logging level
LOG_LEVEL=INFO
```

### Frontend Configuration
Edit main `.env`:
```env
# Disable search service entirely
REACT_APP_SEARCH_SERVICE_ENABLED=false

# Use different search service URL
REACT_APP_SEARCH_SERVICE_URL=https://your-deployed-service.com

# Adjust timeout for slower networks
REACT_APP_SEARCH_SERVICE_TIMEOUT=15000
```

## Security Considerations

1. **Rate Limiting**: The service includes built-in rate limiting
2. **CORS**: Configured to allow frontend access
3. **Input Validation**: All inputs are validated
4. **Error Handling**: Graceful error handling prevents crashes
5. **Logging**: Comprehensive logging for monitoring

## Maintenance

### Regular Tasks
1. **Monitor logs** for errors or rate limiting
2. **Clear cache** periodically if needed: `POST /api/cache/clear`
3. **Update dependencies** regularly
4. **Monitor API quota** usage in Google Cloud Console

### Updates
```bash
# Update Python dependencies
cd search-service
pip install --upgrade -r requirements.txt

# Update frontend dependencies
npm update
```

This setup provides significant API quota savings while maintaining full functionality and reliability through automatic fallback mechanisms.