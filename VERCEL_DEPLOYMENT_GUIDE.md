# Vercel Deployment Guide - API Quota Optimization

## 🚀 **Deployment Overview**

Your application now includes both the React frontend and Python search service serverless functions, all deployable to Vercel.

## 📁 **New File Structure**

```
your-project/
├── api/                          # Vercel Serverless Functions
│   └── search/
│       ├── channels.py          # Channel search endpoint
│       └── videos.py            # Video search endpoint
├── src/                         # React frontend (existing)
├── requirements.txt             # Python dependencies for serverless functions
├── vercel.json                  # Updated Vercel configuration
└── .env                         # Updated environment variables
```

## 🔧 **What Changed**

### **1. Added Serverless Functions**
- `api/search/channels.py` - Handles channel search (replaces Python service)
- `api/search/videos.py` - Handles video search
- `requirements.txt` - Python dependencies for Vercel functions

### **2. Updated Configuration**
- `vercel.json` - Added Python function support and CORS headers
- `.env` - Updated search service URL to use Vercel domain

### **3. Environment Variables**
```env
REACT_APP_SEARCH_SERVICE_URL=https://bhaktube.vercel.app
REACT_APP_SEARCH_SERVICE_TIMEOUT=15000  # Increased for serverless
```

## 🚀 **Deployment Steps**

### **Step 1: Commit Changes**
```bash
git add .
git commit -m "Add Python search service as Vercel serverless functions"
```

### **Step 2: Deploy to Vercel**
```bash
# If you have Vercel CLI
vercel --prod

# Or push to your connected Git repository
git push origin main
```

### **Step 3: Set Environment Variables in Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (bhaktube)
3. Go to Settings → Environment Variables
4. Add these variables:

```
VITE_YOUTUBE_API_KEY = your_actual_youtube_api_key
REACT_APP_SEARCH_SERVICE_ENABLED = true
REACT_APP_SEARCH_SERVICE_URL = https://bhaktube.vercel.app
REACT_APP_SEARCH_SERVICE_TIMEOUT = 15000
```

## 🔍 **API Endpoints**

After deployment, your search service will be available at:

- **Channel Search**: `https://bhaktube.vercel.app/api/search/channels?q=mkbhd&maxResults=25`
- **Video Search**: `https://bhaktube.vercel.app/api/search/videos?q=mkbhd&maxResults=25`

## ✅ **Testing Deployment**

### **1. Test API Endpoints**
```bash
# Test channel search
curl "https://bhaktube.vercel.app/api/search/channels?q=mkbhd&maxResults=5"

# Test video search  
curl "https://bhaktube.vercel.app/api/search/videos?q=mkbhd&maxResults=5"
```

### **2. Test Frontend Integration**
1. Open https://bhaktube.vercel.app
2. Try searching for channels
3. Check browser console for logs:
   - ✅ "Using SearchService for channel search (0 API quota)"
   - ❌ "Using YouTube API for channel search (100 API quota)" (fallback)

## 🔄 **How It Works Now**

### **Previous Architecture (Local)**
```
React App → Python Service (localhost:5000) → YouTube Scraping
```

### **New Architecture (Vercel)**
```
React App → Vercel Serverless Functions → YouTube Scraping
```

### **Request Flow**
1. User searches for "mkbhd"
2. Frontend calls `https://bhaktube.vercel.app/api/search/channels?q=mkbhd`
3. Vercel executes `api/search/channels.py`
4. Python function scrapes YouTube using `youtube-search` library
5. Returns channel data to frontend
6. Frontend calls YouTube API for detailed channel info
7. Displays results to user

## 💰 **API Quota Savings**

The quota optimization remains the same:
- **Search**: 0 units (serverless function scraping)
- **Channel Details**: 1-15 units (YouTube API)
- **Total**: 80-90% reduction in API usage

## 🛠 **Troubleshooting**

### **If Serverless Functions Fail**
- Check Vercel function logs in dashboard
- Verify `requirements.txt` includes `youtube-search==2.1.2`
- Ensure Python runtime is set to 3.9 in `vercel.json`

### **If Frontend Shows Fallback**
- Check browser network tab for API call failures
- Verify environment variables are set in Vercel dashboard
- Test API endpoints directly with curl

### **Cold Start Issues**
- Serverless functions may take 2-3 seconds on first request
- This is normal for Vercel Python functions
- Subsequent requests will be faster

## 🎯 **Benefits of This Approach**

1. **Single Deployment**: Everything on Vercel (frontend + API)
2. **No Separate Hosting**: No need for Heroku or other services
3. **Automatic Scaling**: Vercel handles traffic spikes
4. **Cost Effective**: Vercel's generous free tier
5. **Easy Maintenance**: Single repository, single deployment

## 📊 **Expected Performance**

- **Cold Start**: 2-5 seconds (first request after idle)
- **Warm Requests**: 1-3 seconds
- **API Quota Usage**: 80-90% reduction maintained
- **Reliability**: Automatic fallback to YouTube API if functions fail

Your optimized search system is now fully deployable to Vercel! 🚀