#!/usr/bin/env python3
"""
Test script for YouTube Search Service
Run this to verify the service is working correctly.
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"
TEST_QUERIES = [
    "mkbhd",
    "veritasium", 
    "kurzgesagt",
    "ted talks",
    "python programming"
]

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_channel_search(query, max_results=10):
    """Test channel search endpoint"""
    print(f"\nTesting channel search for: '{query}'")
    try:
        params = {
            'q': query,
            'maxResults': max_results
        }
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/search/channels", params=params)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search successful ({end_time - start_time:.2f}s)")
            print(f"Found {data['totalResults']} channels")
            
            # Display first few results
            for i, channel in enumerate(data['channels'][:3]):
                print(f"  {i+1}. {channel['title']} (confidence: {channel['confidence']:.2f})")
                print(f"     Video: {channel['videoTitle'][:50]}...")
            
            return True
        else:
            print(f"❌ Search failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Search error: {e}")
        return False

def test_video_search(query, max_results=5):
    """Test video search endpoint"""
    print(f"\nTesting video search for: '{query}'")
    try:
        params = {
            'q': query,
            'maxResults': max_results
        }
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/search/videos", params=params)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Video search successful ({end_time - start_time:.2f}s)")
            print(f"Found {data['totalResults']} videos")
            
            # Display first few results
            for i, video in enumerate(data['videos'][:3]):
                print(f"  {i+1}. {video['name'][:50]}...")
                print(f"     ID: {video['id']}")
            
            return True
        else:
            print(f"❌ Video search failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Video search error: {e}")
        return False

def test_cache_endpoints():
    """Test cache management endpoints"""
    print("\nTesting cache endpoints...")
    
    try:
        # Get cache stats
        response = requests.get(f"{BASE_URL}/api/cache/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Cache stats: {stats['cacheSize']} entries")
        
        # Clear cache
        response = requests.post(f"{BASE_URL}/api/cache/clear")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Cache cleared: {result['message']}")
            
        return True
        
    except Exception as e:
        print(f"❌ Cache test error: {e}")
        return False

def test_error_handling():
    """Test error handling"""
    print("\nTesting error handling...")
    
    # Test missing query parameter
    response = requests.get(f"{BASE_URL}/api/search/channels")
    if response.status_code == 400:
        print("✅ Missing query parameter handled correctly")
    else:
        print(f"❌ Expected 400, got {response.status_code}")
    
    # Test invalid maxResults
    response = requests.get(f"{BASE_URL}/api/search/channels", params={'q': 'test', 'maxResults': 'invalid'})
    if response.status_code == 400:
        print("✅ Invalid maxResults handled correctly")
    else:
        print(f"❌ Expected 400, got {response.status_code}")
    
    # Test maxResults out of range
    response = requests.get(f"{BASE_URL}/api/search/channels", params={'q': 'test', 'maxResults': 100})
    if response.status_code == 400:
        print("✅ maxResults out of range handled correctly")
    else:
        print(f"❌ Expected 400, got {response.status_code}")

def main():
    """Run all tests"""
    print("🚀 Starting YouTube Search Service Tests")
    print("=" * 50)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Service is not running. Please start the service first:")
        print("   python app.py")
        return
    
    # Test channel searches
    success_count = 0
    total_tests = len(TEST_QUERIES)
    
    for query in TEST_QUERIES:
        if test_channel_search(query):
            success_count += 1
        time.sleep(1)  # Rate limiting
    
    # Test video search
    test_video_search(TEST_QUERIES[0])
    
    # Test cache endpoints
    test_cache_endpoints()
    
    # Test error handling
    test_error_handling()
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {success_count}/{total_tests} channel searches successful")
    
    if success_count == total_tests:
        print("🎉 All tests passed! Service is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()