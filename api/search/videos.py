"""
Vercel Serverless Function for YouTube Video Search
"""

import json
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
            search = YoutubeSearch(query, max_results=max_results)
            video_results = search.to_dict()
            
            # Process results
            videos = []
            for video in video_results:
                # Get thumbnail URL (first thumbnail if available)
                thumbnails = video.get('thumbnails', [])
                thumbnail_url = thumbnails[0] if thumbnails else ''
                
                video_info = {
                    'name': video.get('title', 'Unknown Video'),
                    'id': video.get('id', ''),
                    'img': thumbnail_url,
                    'channelId': video.get('channel', ''),
                    'channelName': video.get('channel', ''),
                    'duration': video.get('duration', ''),
                    'publishedTime': video.get('publish_time', ''),
                    'viewCount': video.get('views', ''),
                    'url': video.get('url_suffix', '')
                }
                videos.append(video_info)
            
            # Return results
            response = {
                'query': query,
                'maxResults': max_results,
                'totalResults': len(videos),
                'videos': videos
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