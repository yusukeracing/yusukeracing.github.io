#!/usr/bin/env python3
"""Start the downloaded website locally, without third-party dependencies."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import threading
import webbrowser

parser = argparse.ArgumentParser(description="YUSUKE IKEDA local website")
parser.add_argument("--port", type=int, default=8000)
parser.add_argument("--no-browser", action="store_true")
args = parser.parse_args()
root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
except OSError as error:
    parser.exit(1, f"Cannot start port {args.port}: {error}\nTry: python start-server.py --port 8001\n")
url = f"http://127.0.0.1:{args.port}/"
print(f"YUSUKE IKEDA website: {url}", flush=True)
print("Press Ctrl+C to stop. Keep this window open while viewing.", flush=True)
if not args.no_browser:
    threading.Timer(0.7, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
