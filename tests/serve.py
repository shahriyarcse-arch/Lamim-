import http.server
import socketserver
import os
import sys

# Ensure server starts in the project root directory
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PORT = 9090
Handler = http.server.SimpleHTTPRequestHandler

# Force correct MIME types for Javascript modules and CSS on Windows
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.html': 'text/html',
})

socketserver.TCPServer.allow_reuse_address = True

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT} with custom MIME types...")
        sys.stdout.flush()
        httpd.serve_forever()
except Exception as e:
    print(f"Error starting server: {e}", file=sys.stderr)
    sys.exit(1)
