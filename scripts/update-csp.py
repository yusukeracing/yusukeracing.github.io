#!/usr/bin/env python3
"""Refresh JSON-LD CSP hashes and SHA-384 integrity of linked local CSS/JS."""
from pathlib import Path
import base64
import hashlib
import re

root = Path(__file__).resolve().parents[1]
for path in root.glob('*.html'):
    source = path.read_text(encoding='utf-8')
    scripts = re.findall(r'<script\b(?=[^>]*type="application/ld\+json")[^>]*>(.*?)</script>', source, re.S)
    hashes = ' '.join("'sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() + "'" for s in scripts)
    source = re.sub(r"script-src 'self'(?: 'sha256-[^']+')*;", "script-src 'self' " + hashes + ';', source)
    def integrity(match):
        tag = match.group(0)
        ref = re.search(r'(?:src|href)="([^"]+)"', tag)
        if not ref or not (root / ref.group(1)).is_file():
            return tag
        digest = base64.b64encode(hashlib.sha384((root / ref.group(1)).read_bytes()).digest()).decode()
        tag = re.sub(r'\s+(?:integrity|crossorigin)="[^"]*"', '', tag)
        return re.sub(r'\s*/?>$', '', tag).rstrip() + f' integrity="sha384-{digest}" crossorigin="anonymous">'
    source = re.sub(r'<link\b(?=[^>]*rel="stylesheet")[^>]*>|<script\b(?=[^>]*src=")[^>]*>', integrity, source)
    path.write_text(source, encoding='utf-8')
print('Updated CSP and local stylesheet/module integrity in all HTML pages.')
