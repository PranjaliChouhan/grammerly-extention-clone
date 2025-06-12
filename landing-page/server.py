#!/usr/bin/env python3
"""
Simple HTTP server for testing the Grammar Extension landing page.
Run with: python server.py
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8080
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    print(f"🚀 Grammar Extension Landing Page")
    print(f"📁 Serving directory: {DIRECTORY}")
    print(f"🌐 Server running at: http://localhost:{PORT}")
    print(f"🔗 Opening browser...")
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        # Open browser
        webbrowser.open(f'http://localhost:{PORT}')
        
        print(f"\n✅ Ready! Visit: http://localhost:{PORT}")
        print(f"🛑 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped.")

if __name__ == "__main__":
    main() 