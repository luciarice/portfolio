#!/usr/bin/env python3
"""Download every Portfoliobox-hosted image used by the site into images/portfolio/
and point the HTML at the local copies, so the site no longer depends on
Portfoliobox staying online.

Run from the project folder:   python3 tools/download_images.py
Use --dry-run to only list what would be downloaded.
"""
import argparse, pathlib, re, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PATTERN = re.compile(r'https://dkemhji6i1k0x\.cloudfront\.net/[^"\s)]+')

ap = argparse.ArgumentParser()
ap.add_argument('--dry-run', action='store_true')
ap.add_argument('--mirror', help='fetch from this base URL instead (for testing)')
args = ap.parse_args()

dest = ROOT / 'images' / 'portfolio'
pages = sorted(ROOT.glob('*.html'))
urls = sorted({u for p in pages for u in PATTERN.findall(p.read_text(encoding='utf-8'))})
print(f'{len(urls)} images found')

mapping, failed = {}, []
for u in urls:
    name = u.rsplit('/', 1)[-1]
    if args.dry_run:
        print(' ', name)
        continue
    dest.mkdir(parents=True, exist_ok=True)
    src = (args.mirror.rstrip('/') + '/' + name) if args.mirror else u
    try:
        req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
        (dest / name).write_bytes(urllib.request.urlopen(req, timeout=30).read())
        mapping[u] = f'images/portfolio/{name}'
        print('  ok  ', name)
    except Exception as e:
        failed.append(name)
        print('  FAIL', name, e)

if mapping:
    for p in pages:
        t = p.read_text(encoding='utf-8')
        for old, new in mapping.items():
            t = t.replace(old, new)
        p.write_text(t, encoding='utf-8')
    print('HTML updated for', len(mapping), 'images')
if failed:
    print('Not downloaded (links left as they were):', ', '.join(failed))
    sys.exit(1)
