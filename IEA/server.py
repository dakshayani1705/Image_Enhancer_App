import http.server
import socketserver
import os

# The port must be 3000 as per the environment requirements
PORT = 3000

# Simple HTTP Request Handler
Handler = http.server.SimpleHTTPRequestHandler

# Ensure we are serving from the current directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print(f"Starting server at http://localhost:{PORT}")

# Set up the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()