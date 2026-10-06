"""Dependency-free static-site checks. Run: python3 tests/check_site.py"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index', 'profile', 'race', 'sponsor', 'support', 'news', 'contact']
errors = []

class Check(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []
        self.h1 = 0
        self.csp = False
        self.title = False
        self.description = False
        self.canonical = False
        self.og_image = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.title = True
        if 'id' in attrs:
            if attrs['id'] in self.ids: errors.append(f'{self.path.name}: duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'content-security-policy':
            self.csp = True
            for directive in ["default-src 'none'", "script-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'none'", 'upgrade-insecure-requests']:
                if directive not in attrs.get('content', ''): errors.append(f'{self.path.name}: missing CSP {directive}')
        if tag == 'meta' and attrs.get('name') == 'description': self.description = bool(attrs.get('content'))
        if tag == 'meta' and attrs.get('property') == 'og:image': self.og_image = bool(attrs.get('content'))
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical = attrs.get('href', '').startswith('https://')
        if tag == 'img' and 'alt' not in attrs: errors.append(f'{self.path.name}: image missing alt')
        if tag == 'script' and not attrs.get('src'): errors.append(f'{self.path.name}: inline script')
        if tag == 'style' or 'style' in attrs: errors.append(f'{self.path.name}: inline CSS')
        if any(key.lower().startswith('on') for key in attrs): errors.append(f'{self.path.name}: inline event handler')
        for key in ['href', 'src']:
            value = attrs.get(key, '')
            if not value: continue
            if value.startswith(('javascript:', 'data:', 'http:')): errors.append(f'{self.path.name}: unsafe URL {value}')
            if tag == 'script' and key == 'src' and urlparse(value).scheme: errors.append(f'{self.path.name}: third-party script')
            if not urlparse(value).scheme and not value.startswith('//'):
                if value.startswith('/'): errors.append(f'{self.path.name}: absolute local path {value}')
                self.links.append(value)

checks = {}
for page in PAGES:
    path = ROOT / f'{page}.html'
    parser = Check(path)
    parser.feed(path.read_text(encoding='utf-8'))
    checks[path.name] = parser
    if parser.h1 != 1: errors.append(f'{path.name}: expected one h1')
    for name in ['csp', 'title', 'description', 'canonical', 'og_image']:
        if not getattr(parser, name): errors.append(f'{path.name}: missing {name}')
for parser in checks.values():
    for link in parser.links:
        parsed = urlparse(link)
        path = ROOT / unquote(parsed.path) if parsed.path else parser.path
        if not path.exists(): errors.append(f'{parser.path.name}: missing target {link}')
        if parsed.fragment and path.name in checks and parsed.fragment not in checks[path.name].ids:
            errors.append(f'{parser.path.name}: missing anchor {link}')

import re
for path in (ROOT / 'css').glob('*.css'):
    for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)', path.read_text()):
        if not (path.parent / value).resolve().is_file(): errors.append(f'{path.name}: missing font {value}')
if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print(f'PASS: {len(PAGES)} pages, local links/anchors/fonts, image alt text, SEO, CSP, no inline or third-party scripts')
