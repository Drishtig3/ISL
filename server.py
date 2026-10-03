import http.server
import socketserver
import webbrowser
import os
import sys
import socket

DEFAULT_PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and Cache-Control headers for smooth MediaPipe and WebRTC loading
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress spammy log outputs for smooth console
        return

def find_available_port(start_port=8000, max_attempts=20):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("", port))
                return port
            except OSError:
                continue
    return start_port

def main():
    os.chdir(DIRECTORY)
    port = find_available_port(DEFAULT_PORT)
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        httpd = socketserver.TCPServer(("", port), Handler)
    except Exception as e:
        print(f"[ERROR] Could not start server on port {port}: {e}")
        return

    url = f"http://localhost:{port}"
    print("=" * 65)
    print("   INDIAN SIGN LANGUAGE (ISL) TRANSLATOR IS RUNNING!")
    print(f"   Project Location: {DIRECTORY}")
    print(f"   Live URL: {url}")
    print("=" * 65)
    print(" * Opening browser automatically...")
    print(" * Press Ctrl+C in this window to stop the server.")
    print("=" * 65)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped gracefully.")
    finally:
        httpd.server_close()

if __name__ == "__main__":
    main()
