"""
Fetches the short description of each curated item from Archives of Nethys (OGL content).
Needs the AoN listing pages (*.html, same folder as parse.py) to find each item's page.
Output: public/data/sf-item-info.json = {name: {"d": description, "s": stats line}}.
Polite: one request at a time with a pause; resumable (skips names already fetched).
"""
import glob, html, io, json, os, re, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = os.environ.get('AON_PAGES', HERE)
ITEMS = os.path.join(HERE, '..', '..', 'public', 'data', 'sf-items.json')
OUT = os.path.join(HERE, '..', '..', 'public', 'data', 'sf-item-info.json')

hrefs = {}
for path in glob.glob(os.path.join(PAGES, '*.html')):
    s = io.open(path, encoding='utf8', errors='ignore').read()
    # Same row parsing as parse.py: the item name is the cleaned first cell; its link is the page.
    for row in re.findall(r'<tr.*?</tr>', s, re.S):
        cells = re.findall(r'<td.*?</td>', row, re.S)
        if not cells:
            continue
        link = re.search(r'href="([A-Za-z]+(?:Display)?\.aspx\?ItemName=[^"]+)"', cells[0])
        if not link:
            continue
        name = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', cells[0]))).strip()
        hrefs.setdefault(name, html.unescape(link.group(1)))

items = json.load(io.open(ITEMS, encoding='utf8'))['items']
info = json.load(io.open(OUT, encoding='utf8')) if os.path.exists(OUT) else {}
info = {k: v for k, v in info.items() if v.get('d')}  # retry empty ones


def clean(fragment):
    t = re.sub(r'<br\s*/?>', '\n', fragment)
    t = re.sub(r'<h3[^>]*>', '\n', t)
    t = re.sub(r'<[^>]+>', '', t)
    return html.unescape(t)


def short(text, limit=420):
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind('. '), cut.rfind('.)'))
    return (cut[: end + 1] if end > 120 else cut.rsplit(' ', 1)[0] + '…')


missing, done = 0, 0
for row in items:
    name = row[0]
    if name in info:
        continue
    href = hrefs.get(name)
    if not href:
        missing += 1
        continue
    url = 'https://www.aonsrd.com/' + urllib.parse.quote(href, safe='?=&.')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Picho-RPG generator; one-time import)'})
        page = urllib.request.urlopen(req, timeout=30).read().decode('utf8', 'ignore')
    except Exception as e:  # noqa: BLE001
        print('fail', name, e, file=sys.stderr)
        time.sleep(3)
        continue
    i = page.find('MainContent_DataList')
    block = clean(page[i: i + 20000]) if i >= 0 else ''
    block = block.split('Site Owner')[0]
    desc = ''
    stats = ''
    if 'Description' in block:
        head, desc = block.split('Description', 1)
        stats_lines = [l.strip() for l in head.splitlines() if re.match(r'\s*(Level|Damage|Capacity|Hands|EAC|Max Dex|Bulk|Usage|Type|Slot|System|Range|Critical|Price|Category)', l)]
        stats = ' · '.join(stats_lines)
    elif i >= 0:
        # Armor-style family pages: family blurb after the first heading, then one section per variant.
        raw = page[i: i + 20000]
        m = re.search(r'</h\d>(.*?)<h\d', raw, re.S)
        desc = clean(m.group(1)) if m else ''
        variant = name.split(', ')[-1]
        for sec in re.split(r'<h\d[^>]*>', raw)[1:]:
            title = clean(sec.split('</h', 1)[0]).strip()
            if title == name or title.endswith(', ' + variant) or title == variant:
                body = clean(sec)
                stats = ' · '.join(l.strip() for l in body.splitlines() if re.match(r'\s*(Level|EAC|Upgrade|Armor Check|Damage|Bulk)', l))
                break
        if not desc.strip():
            # Single-item pages without a "Description" header: text follows the stats lines.
            lines = [l.strip() for l in block.splitlines() if l.strip()]
            stat = re.compile(r'(Source|Item Level|Level|Price|Slots|Bulk|Capacity|Usage|Hands|Damage|Range|Critical|Type|System|EAC|Category)\b')
            last = max((k for k, l in enumerate(lines) if stat.match(l) or ';' in l and len(l) < 200), default=0)
            desc = ' '.join(lines[last + 1:])
            stats = stats or ' · '.join(l for l in lines[: last + 1] if stat.match(l) and not l.startswith('Source'))
    info[name] = {'d': short(desc), 's': short(stats, 260)}
    done += 1
    if done % 25 == 0:
        json.dump(info, io.open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
        print(done, 'fetched', flush=True)
    time.sleep(0.8)

json.dump(info, io.open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print('done', len(info), 'missing href', missing)
