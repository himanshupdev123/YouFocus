"""
Vercel Serverless Function for YouTube Channel Search
"""

import json
import re
from typing import List, Dict
from youtube_search import YoutubeSearch
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse URL and query parameters
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # Get query parameters
            query = query_params.get('q', [''])[0].strip()
            max_results = int(query_params.get('maxResults', ['25'])[0])
            
            # Validate parameters
            if not query:
                self.wfile.write(json.dumps({
                    'error': 'Query parameter "q" is required'
                }).encode())
                return
            
            if max_results < 1 or max_results > 50:
                self.wfile.write(json.dumps({
                    'error': 'maxResults must be between 1 and 50'
                }).encode())
                return
            
            # Perform search
            channels = self.search_channels(query, max_results)
            
            # Return results
            response = {
                'query': query,
                'maxResults': max_results,
                'totalResults': len(channels),
                'channels': channels
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.wfile.write(json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            }).encode())
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def search_channels(self, query: str, max_results: int) -> List[Dict]:
        """Search for channels using youtube-search library"""
        try:
            # Search for videos (3x max_results to get diverse channels)
            search_limit = min(max_results * 3, 50)
            search = YoutubeSearch(query, max_results=search_limit)
            video_results = search.to_dict()
            
            if not video_results:
                return []
            
            # Extract unique channels from video results
            channels = []
            seen_channels = set()
            
            for video in video_results:
                channel_name = video.get('channel', '').strip()
                if not channel_name or channel_name in seen_channels:
                    continue
                
                # Get thumbnail URL (first thumbnail if available)
                thumbnails = video.get('thumbnails', [])
                thumbnail_url = thumbnails[0] if thumbnails else ''
                
                # Create channel info
                channel_info = {
                    'id': f"channel_{len(channels)}",  # Temporary ID
                    'title': channel_name,
                    'thumbnailUrl': thumbnail_url,
                    'videoId': video.get('id', ''),
                    'videoTitle': video.get('title', ''),
                    'videoUrl': video.get('url_suffix', ''),
                    'confidence': self.calculate_confidence(channel_name, video.get('title', ''))
                }
                
                channels.append(channel_info)
                seen_channels.add(channel_name)
                
                # Stop when we have enough unique channels
                if len(channels) >= max_results:
                    break
            
            # Sort by confidence score (highest first)
            channels.sort(key=lambda x: x['confidence'], reverse=True)
            
            return channels
            
        except Exception as e:
            raise Exception(f"Search failed: {str(e)}")
    
    def calculate_confidence(self, channel_name: str, video_title: str) -> float:
        """Calculate confidence score for channel extraction"""
        if not channel_name or channel_name.lower() == 'unknown':
            return 0.1
        
        # Higher confidence if channel name appears in video title
        if channel_name.lower() in video_title.lower():
            return 0.9
        
        # Medium confidence for regular results
        return 0.7