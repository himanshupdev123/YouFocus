"""
YouTube Search Service - API Quota Optimization
Uses youtube-search-python to provide search functionality without consuming YouTube API quota.
"""

import os
import re
import time
import logging
from typing import List, Dict, Optional
from urllib.parse import urlparse, parse_qs
from flask import Flask, jsonify, request
from flask_cors import CORS
from youtubesearchpython import VideosSearch, ChannelsSearch
import requests

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
    """Handles YouTube search operations using fast-youtube-search library"""
    
    def __init__(self):
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Implement basic rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - time_since_last)
        
        self.last_request_time = time.time()
    
    def _extract_channel_info_from_video(self, video_result: Dict) -> Optional[Dict]:
        """
        Extract channel information from video search result.
        This is a best-effort approach since fast-youtube-search returns video results.
        """
        try:
            video_title = video_result.get('name', '')
            video_id = video_result.get('id', '')
            thumbnail_url = video_result.get('img', '')
            
            # Try to extract channel name from video title
            # Common patterns: "Channel Name - Video Title" or "Video Title | Channel Name"
            channel_name = self._guess_channel_name(video_title)
            
            return {
                'id': f'channel_from_{video_id}',  # Temporary ID, will be resolved later
                'title': channel_name,
                'thumbnailUrl': thumbnail_url,
                'videoId': video_id,  # Store for channel ID resolution
                'videoTitle': video_title,
                'confidence': self._calculate_confidence(video_title, channel_name)
            }
        except Exception as e:
            logger.error(f"Error extracting channel info: {e}")
            return None
    
    def _guess_channel_name(self, video_title: str) -> str:
        """
        Attempt to guess channel name from video title.
        This is heuristic-based and may not always be accurate.
        """
        # Remove common video title patterns
        patterns_to_remove = [
            r'\[.*?\]',  # Remove [brackets]
            r'\(.*?\)',  # Remove (parentheses) 
            r'#\w+',     # Remove hashtags
            r'ft\.|feat\.|featuring',  # Remove featuring
            r'official.*video|official.*audio|music.*video',  # Remove official video/audio
        ]
        
        cleaned_title = video_title
        for pattern in patterns_to_remove:
            cleaned_title = re.sub(pattern, '', cleaned_title, flags=re.IGNORECASE)
        
        # Try to extract channel name from common patterns
        # Pattern 1: "Channel Name - Video Title"
        if ' - ' in cleaned_title:
            parts = cleaned_title.split(' - ', 1)
            if len(parts) == 2 and len(parts[0].strip()) > 0:
                return parts[0].strip()
        
        # Pattern 2: "Channel Name | Video Title"  
        if ' | ' in cleaned_title:
            parts = cleaned_title.split(' | ', 1)
            if len(parts) == 2 and len(parts[0].strip()) > 0:
                return parts[0].strip()
        
        # Pattern 3: First part before common separators
        separators = [' by ', ' from ', ' on ']
        for sep in separators:
            if sep in cleaned_title.lower():
                parts = cleaned_title.lower().split(sep, 1)
                if len(parts) == 2:
                    return parts[0].strip().title()
        
        # Fallback: Use first few words as potential channel name
        words = cleaned_title.strip().split()
        if len(words) >= 2:
            return ' '.join(words[:2])
        elif len(words) == 1:
            return words[0]
        
        return "Unknown Channel"
    
    def _calculate_confidence(self, video_title: str, channel_name: str) -> float:
        """Calculate confidence score for channel name extraction"""
        if channel_name == "Unknown Channel":
            return 0.1
        
        # Higher confidence for common patterns
        if ' - ' in video_title or ' | ' in video_title:
            return 0.8
        
        if any(sep in video_title.lower() for sep in [' by ', ' from ', ' on ']):
            return 0.7
        
        # Lower confidence for fallback methods
        return 0.5
    
    def search_channels(self, query: str, max_results: int = DEFAULT_MAX_RESULTS) -> List[Dict]:
        """
        Search for channels using youtube-search-python.
        Returns a list of channels with detailed information.
        """
        try:
            # Check cache first
            cache_key = f"{query}:{max_results}"
            if cache_key in search_cache:
                cached_result, timestamp = search_cache[cache_key]
                if time.time() - timestamp < CACHE_DURATION:
                    logger.info(f"Returning cached results for query: {query}")
                    return cached_result
            
            # Rate limiting
            self._rate_limit()
            
            logger.info(f"Searching for channels with query: {query}, max_results: {max_results}")
            
            # Use youtube-search-python for channel search
            channels_search = ChannelsSearch(query, limit=max_results)
            search_result = channels_search.result()
            
            if not search_result or 'result' not in search_result:
                logger.warning(f"No results found for query: {query}")
                return []
            
            # Extract channel information
            channels = []
            for channel_data in search_result['result']:
                try:
                    channel_info = {
                        'id': channel_data.get('id', ''),
                        'title': channel_data.get('title', 'Unknown Channel'),
                        'thumbnailUrl': self._get_best_thumbnail(channel_data.get('thumbnails', [])),
                        'subscriberCount': self._parse_subscriber_count(channel_data.get('subscribers', '')),
                        'videoCount': self._parse_video_count(channel_data.get('videoCount', '')),
                        'description': channel_data.get('descriptionSnippet', [{}])[0].get('text', ''),
                        'confidence': 0.9  # High confidence for direct channel search
                    }
                    channels.append(channel_info)
                except Exception as e:
                    logger.error(f"Error processing channel data: {e}")
                    continue
            
            # Cache the results
            search_cache[cache_key] = (channels, time.time())
            
            logger.info(f"Found {len(channels)} channels for query: {query}")
            return channels
            
        except Exception as e:
            logger.error(f"Error searching channels: {e}")
            raise
    
    def search_videos(self, query: str, max_results: int = DEFAULT_MAX_RESULTS) -> List[Dict]:
        """
        Search for videos using youtube-search-python.
        Returns a list of videos with detailed information.
        """
        try:
            # Rate limiting
            self._rate_limit()
            
            logger.info(f"Searching for videos with query: {query}, max_results: {max_results}")
            
            # Use youtube-search-python for video search
            videos_search = VideosSearch(query, limit=max_results)
            search_result = videos_search.result()
            
            if not search_result or 'result' not in search_result:
                logger.warning(f"No video results found for query: {query}")
                return []
            
            # Extract video information
            videos = []
            for video_data in search_result['result']:
                try:
                    video_info = {
                        'name': video_data.get('title', 'Unknown Video'),
                        'id': video_data.get('id', ''),
                        'img': self._get_best_thumbnail(video_data.get('thumbnails', [])),
                        'channelId': video_data.get('channel', {}).get('id', ''),
                        'channelName': video_data.get('channel', {}).get('name', ''),
                        'duration': video_data.get('duration', ''),
                        'publishedTime': video_data.get('publishedTime', ''),
                        'viewCount': video_data.get('viewCount', {}).get('text', '')
                    }
                    videos.append(video_info)
                except Exception as e:
                    logger.error(f"Error processing video data: {e}")
                    continue
            
            logger.info(f"Found {len(videos)} videos for query: {query}")
            return videos
            
        except Exception as e:
            logger.error(f"Error searching videos: {e}")
            raise
    
    def _get_best_thumbnail(self, thumbnails: List[Dict]) -> str:
        """Get the best quality thumbnail URL from thumbnails list"""
        if not thumbnails:
            return ''
        
        # Prefer higher quality thumbnails
        for quality in ['high', 'medium', 'default']:
            for thumb in thumbnails:
                if thumb.get('quality') == quality:
                    return thumb.get('url', '')
        
        # Fallback to first available thumbnail
        return thumbnails[0].get('url', '') if thumbnails else ''
    
    def _parse_subscriber_count(self, subscriber_text: str) -> Optional[int]:
        """Parse subscriber count from text like '1.2M subscribers'"""
        if not subscriber_text:
            return None
        
        try:
            # Remove 'subscribers' and other text
            clean_text = re.sub(r'[^\d.KMB]', '', subscriber_text.upper())
            
            if 'M' in clean_text:
                number = float(clean_text.replace('M', ''))
                return int(number * 1000000)
            elif 'K' in clean_text:
                number = float(clean_text.replace('K', ''))
                return int(number * 1000)
            elif 'B' in clean_text:
                number = float(clean_text.replace('B', ''))
                return int(number * 1000000000)
            else:
                return int(float(clean_text)) if clean_text else None
        except (ValueError, TypeError):
            return None
    
    def _parse_video_count(self, video_count_text: str) -> Optional[int]:
        """Parse video count from text"""
        if not video_count_text:
            return None
        
        try:
            # Extract numbers from text
            numbers = re.findall(r'\d+', video_count_text.replace(',', ''))
            return int(numbers[0]) if numbers else None
        except (ValueError, TypeError):
            return None
    
    def get_video_details(self, video_id: str) -> Optional[Dict]:
        """
        Get additional video details that might help with channel identification.
        This is a placeholder for potential future enhancements.
        """
        # For now, we don't have additional video details from fast-youtube-search
        # This could be enhanced with additional scraping if needed
        return None

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