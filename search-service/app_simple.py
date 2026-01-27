"""
YouTube Search Service - API Quota Optimization (Simple Version)
Uses youtube-search library to provide search functionality without consuming YouTube API quota.
"""

import os
import re
import time
import logging
from typing import List, Dict, Optional
from flask import Flask, jsonify, request
from flask_cors import CORS
from youtube_search import YoutubeSearch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
MAX_RESULTS_LIMIT = 50
DEFAULT_MAX_RESULTS = 25
CACHE_DURATION = 3600  # 1 hour cache
REQUEST_DELAY = 0.5  # Delay between requests to avoid rate limiting

# Simple in-memory cache
search_cache = {}

class SearchService:
    """Handles YouTube search operations using youtube-search library"""
    
    def __init__(self):
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Implement basic rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - time_since_last)
        
        self.last_request_time = time.time()
    
    def search_videos(self, query: str, max_results: int = DEFAULT_MAX_RESULTS) -> List[Dict]:
        """
        Search for videos using youtube-search library.
        Returns a list of videos with basic information.
        """
        try:
            # Check cache first
            cache_key = f"videos:{query}:{max_results}"
            if cache_key in search_cache:
                cached_result, timestamp = search_cache[cache_key]
                if time.time() - timestamp < CACHE_DURATION:
                    logger.info(f"Returning cached video results for query: {query}")
                    return cached_result
            
            # Rate limiting
            self._rate_limit()
            
            logger.info(f"Searching for videos with query: {query}, max_results: {max_results}")
            
            # Use youtube-search for video search
            search = YoutubeSearch(query, max_results=max_results)
            results = search.to_dict()
            
            if not results:
                logger.warning(f"No video results found for query: {query}")
                return []
            
            # Process results
            videos = []
            for video in results:
                try:
                    # Get thumbnail URL (first thumbnail if available)
                    thumbnails = video.get('thumbnails', [])
                    thumbnail_url = thumbnails[0] if thumbnails else ''
                    
                    video_info = {
                        'name': video.get('title', 'Unknown Video'),
                        'id': video.get('id', ''),
                        'img': thumbnail_url,
                        'channelId': video.get('channel', ''),  # This might not be the actual channel ID
                        'channelName': video.get('channel', ''),
                        'duration': video.get('duration', ''),
                        'publishedTime': video.get('publish_time', ''),
                        'viewCount': video.get('views', ''),
                        'url': video.get('url_suffix', '')
                    }
                    videos.append(video_info)
                except Exception as e:
                    logger.error(f"Error processing video data: {e}")
                    continue
            
            # Cache the results
            search_cache[cache_key] = (videos, time.time())
            
            logger.info(f"Found {len(videos)} videos for query: {query}")
            return videos
            
        except Exception as e:
            logger.error(f"Error searching videos: {e}")
            raise
    
    def search_channels(self, query: str, max_results: int = DEFAULT_MAX_RESULTS) -> List[Dict]:
        """
        Search for channels by extracting channel information from video results.
        This is a heuristic approach since youtube-search primarily returns videos.
        """
        try:
            # Check cache first
            cache_key = f"channels:{query}:{max_results}"
            if cache_key in search_cache:
                cached_result, timestamp = search_cache[cache_key]
                if time.time() - timestamp < CACHE_DURATION:
                    logger.info(f"Returning cached channel results for query: {query}")
                    return cached_result
            
            # Get video results first (search for more videos to find diverse channels)
            video_results = self.search_videos(query, min(max_results * 3, MAX_RESULTS_LIMIT))
            
            if not video_results:
                return []
            
            # Extract unique channels from video results
            channels = []
            seen_channels = set()
            
            for video in video_results:
                channel_name = video.get('channelName', '').strip()
                if not channel_name or channel_name in seen_channels:
                    continue
                
                # Create channel info from video data
                # Get thumbnail URL (first thumbnail if available)
                thumbnails = video.get('img', '')
                if not thumbnails and 'thumbnails' in video:
                    video_thumbnails = video.get('thumbnails', [])
                    thumbnails = video_thumbnails[0] if video_thumbnails else ''
                
                channel_info = {
                    'id': f"channel_{len(channels)}",  # Temporary ID
                    'title': channel_name,
                    'thumbnailUrl': thumbnails,
                    'videoId': video.get('id', ''),
                    'videoTitle': video.get('name', ''),
                    'videoUrl': video.get('url', ''),
                    'confidence': self._calculate_channel_confidence(channel_name, video.get('name', ''))
                }
                
                channels.append(channel_info)
                seen_channels.add(channel_name)
                
                # Stop when we have enough unique channels
                if len(channels) >= max_results:
                    break
            
            # Sort by confidence score (highest first)
            channels.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Cache the results
            search_cache[cache_key] = (channels, time.time())
            
            logger.info(f"Found {len(channels)} unique channels for query: {query}")
            return channels
            
        except Exception as e:
            logger.error(f"Error searching channels: {e}")
            raise
    
    def _calculate_channel_confidence(self, channel_name: str, video_title: str) -> float:
        """Calculate confidence score for channel extraction"""
        if not channel_name or channel_name.lower() == 'unknown':
            return 0.1
        
        # Higher confidence if channel name appears in video title
        if channel_name.lower() in video_title.lower():
            return 0.9
        
        # Medium confidence for regular results
        return 0.7

# Initialize service
search_service = SearchService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'youtube-search-service',
        'version': '1.0.0'
    })

@app.route('/api/search/channels', methods=['GET'])
def search_channels():
    """
    Search for YouTube channels
    Query parameters:
    - q: Search query (required)
    - maxResults: Maximum number of results (optional, default: 25, max: 50)
    """
    try:
        # Get query parameters
        query = request.args.get('q', '').strip()
        max_results = request.args.get('maxResults', DEFAULT_MAX_RESULTS)
        
        # Validate query
        if not query:
            return jsonify({
                'error': 'Query parameter "q" is required'
            }), 400
        
        # Validate max_results
        try:
            max_results = int(max_results)
            if max_results < 1 or max_results > MAX_RESULTS_LIMIT:
                return jsonify({
                    'error': f'maxResults must be between 1 and {MAX_RESULTS_LIMIT}'
                }), 400
        except ValueError:
            return jsonify({
                'error': 'maxResults must be a valid integer'
            }), 400
        
        # Perform search
        channels = search_service.search_channels(query, max_results)
        
        return jsonify({
            'query': query,
            'maxResults': max_results,
            'totalResults': len(channels),
            'channels': channels,
            'cached': False  # Could be enhanced to track cache hits
        })
        
    except Exception as e:
        logger.error(f"Error in search_channels endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/search/videos', methods=['GET'])
def search_videos():
    """
    Search for YouTube videos directly
    Query parameters:
    - q: Search query (required)
    - maxResults: Maximum number of results (optional, default: 25, max: 50)
    """
    try:
        # Get query parameters
        query = request.args.get('q', '').strip()
        max_results = request.args.get('maxResults', DEFAULT_MAX_RESULTS)
        
        # Validate query
        if not query:
            return jsonify({
                'error': 'Query parameter "q" is required'
            }), 400
        
        # Validate max_results
        try:
            max_results = int(max_results)
            if max_results < 1 or max_results > MAX_RESULTS_LIMIT:
                return jsonify({
                    'error': f'maxResults must be between 1 and {MAX_RESULTS_LIMIT}'
                }), 400
        except ValueError:
            return jsonify({
                'error': 'maxResults must be a valid integer'
            }), 400
        
        # Perform search
        videos = search_service.search_videos(query, max_results)
        
        return jsonify({
            'query': query,
            'maxResults': max_results,
            'totalResults': len(videos),
            'videos': videos
        })
        
    except Exception as e:
        logger.error(f"Error in search_videos endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear the search cache"""
    global search_cache
    cache_size = len(search_cache)
    search_cache.clear()
    
    return jsonify({
        'message': f'Cache cleared. Removed {cache_size} entries.'
    })

@app.route('/api/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics"""
    return jsonify({
        'cacheSize': len(search_cache),
        'cacheDuration': CACHE_DURATION,
        'entries': list(search_cache.keys())
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting YouTube Search Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)