"""Extracts every AoN listing table (scratchpad/aon/*.html) into items.json: name, category, level, price."""
import glob, html, io, json, os, re

D = os.path.dirname(os.path.abspath(__file__))
SOURCE = {
    'Weapons_aspx_Proficiency_': 'weapon',
    'Armor_aspx_Category_': 'armor',
    'ArmorUpgrades': 'armorUpgrade',
    'TechItems': 'tech',
    'HybridItems': 'hybrid',
    'MagicItems': 'magic',
    'Biotech': 'biotech',
    'Cybernetics': 'cybernetic',
    'PersonalUpgrades': 'personalUpgrade',
    'OtherItems_aspx_Category_': 'other',
    'Shields': 'shield',
    'Computers': 'computer',
}

def clean(cell):
    cell = re.sub(r'<br\s*/?>', ' ', cell)
    cell = re.sub(r'<[^>]+>', '', cell)
    return re.sub(r'\s+', ' ', html.unescape(cell)).strip()

def num(v):
    m = re.search(r'[\d,]+', v or '')
    return int(m.group(0).replace(',', '')) if m else None

items = []
for path in sorted(glob.glob(os.path.join(D, '*.html'))):
    base = os.path.basename(path)
    kind = next((k for p, k in SOURCE.items() if base.startswith(p)), None)
    if not kind:
        continue
    sub = base.split('_')[-1].replace('.html', '') if kind in ('weapon', 'armor', 'other') else None
    if kind == 'other':
        sub = base.replace('OtherItems_aspx_Category_', '').replace('.html', '').replace('_', ' ')
    s = io.open(path, encoding='utf8', errors='ignore').read()
    for t in re.findall(r'<table.*?</table>', s, re.S):
        rows = re.findall(r'<tr.*?</tr>', t, re.S)
        if not rows:
            continue
        head = [clean(c) for c in re.findall(r'<th.*?</th>', rows[0], re.S)]
        for r in rows[1:]:
            cells = [clean(c) for c in re.findall(r'<td.*?</td>', r, re.S)]
            if len(cells) != len(head):
                continue
            row = dict(zip(head, cells))
            name = row.get('Name') or row.get('Item')
            if not name:
                continue
            items.append({
                'kind': kind,
                'group': sub,
                'name': name,
                'category': row.get('Category') or row.get('Type') or None,
                'level': num(row.get('Level')),
                'price': num(row.get('Price') or row.get('Cost')),
                'extra': {k: v for k, v in row.items() if k in ('Damage', 'Range', 'Critical', 'EAC Bonus', 'KAC Bonus', 'Bulk', 'Capacity', 'Usage', 'Special', 'Max Dex Bonus')},
            })

dedup = {}
for it in items:
    dedup.setdefault((it['kind'], it['name']), it)
items = list(dedup.values())
json.dump(items, io.open(os.path.join(D, 'items.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
from collections import Counter
print(len(items), Counter(i['kind'] for i in items))
print('no price:', sum(1 for i in items if i['price'] is None), 'no level:', sum(1 for i in items if i['level'] is None))
print(items[0]); print([i for i in items if i['kind'] == 'other'][:3])
