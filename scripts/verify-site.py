#!/usr/bin/env python3
"""Dependency-free checks for complete source/download content and security metadata."""
import base64
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index','profile','story','race','news','news-detail','gallery','support','sponsor','contact','privacy','404']
errors = []

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []
        self.h1s = 0
        self.csp = ''
        self.meta = set()
        self.canonical = False
    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if '/' in a: errors.append('Malformed self-closing HTML tag: ' + tag)
        if (tag == 'link' and a.get('rel') == 'stylesheet') or (tag == 'script' and a.get('src')):
            ref = a.get('href',a.get('src',''))
            if (ROOT/ref).is_file():
                expected = 'sha384-' + base64.b64encode(hashlib.sha384((ROOT/ref).read_bytes()).digest()).decode()
                if a.get('integrity') != expected: errors.append('Invalid resource integrity: ' + ref)
        if 'id' in a:
            if a['id'] in self.ids: errors.append('Duplicate id: ' + a['id'])
            self.ids.add(a['id'])
        if tag == 'h1': self.h1s += 1
        if tag == 'meta':
            self.meta.add(a.get('name', a.get('property', '')))
            if a.get('http-equiv','').lower() == 'content-security-policy': self.csp = a.get('content','')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = True
        for key in ('href','src'):
            if a.get(key): self.references.append(a[key])
        if tag == 'a' and a.get('target') == '_blank':
            if not {'noopener','noreferrer'}.issubset(set(a.get('rel','').split())):
                errors.append('Unsafe external link: ' + a.get('href',''))

parsed = {}
for slug in PAGES:
    file = ROOT / (slug + '.html')
    if not file.is_file(): errors.append('Missing page: ' + file.name); continue
    doc = Document(); source = file.read_text(encoding='utf-8'); doc.feed(source); parsed[file.name] = doc
    if doc.h1s != 1: errors.append(f'{file.name}: expected one h1, got {doc.h1s}')
    if not doc.canonical: errors.append(file.name + ': missing canonical')
    for field in ('description','og:title','og:description','og:url','og:image','twitter:card'):
        if field not in doc.meta: errors.append(file.name + ': missing ' + field)
    for body in re.findall(r'<script\b(?=[^>]*type="application/ld\+json")[^>]*>(.*?)</script>',source,re.S):
        json.loads(body)
        digest = base64.b64encode(hashlib.sha256(body.encode()).digest()).decode()
        if "'sha256-" + digest + "'" not in doc.csp: errors.append(file.name + ': stale JSON-LD CSP hash')
    if re.search(r'\son(?:click|load|error)\s*=',source,re.I): errors.append(file.name + ': inline event handler')

for name,doc in parsed.items():
    for ref in doc.references:
        u = urlsplit(ref)
        if u.scheme or u.netloc: continue
        p = (ROOT / unquote(u.path)) if u.path else ROOT / name
        if not p.is_file(): errors.append(name + ': missing local reference ' + ref)
        if u.fragment and p.name in parsed and u.fragment not in parsed[p.name].ids:
            errors.append(name + ': missing anchor ' + ref)
for css in (ROOT/'css').glob('*.css'):
    for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)',css.read_text()):
        if not urlsplit(ref).scheme and not (css.parent / ref).is_file(): errors.append('CSS resource missing: ' + ref)
for js in (ROOT/'js').glob('*.js'):
    for ref in re.findall(r'(?:from\s+|import\s*)[\'"](\.[^\'"]+)',js.read_text()):
        if not (js.parent / ref).is_file(): errors.append('JS import missing: ' + ref)
for name in ('profile','news','races','sponsors'): json.loads((ROOT/'data'/f'{name}.json').read_text())
json.loads((ROOT/'manifest.webmanifest').read_text())
ET.parse(ROOT/'sitemap.xml')
for path in ('robots.txt','.nojekyll','images/ogp.png','assets/icons/favicon.svg','start-server.py','start-windows.bat','start-macos.command'):
    if not (ROOT/path).is_file(): errors.append('Required delivery file missing: ' + path)
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: 12 pages, local files/anchors, CSS fonts, JS imports, JSON, XML, SEO, CSP hashes, launch files')
