"""
Curates the AoN Starfinder items for Algol AW 2284 (post-collapse Motávia, ~2000 years after the
terraforming disaster). Canon basis: wiki "Tecnologia e relação com Aiedo" (dominated tech: medical,
sensors, electronics, tools, terminals, local comms; recovered/experimental tech in small runs;
Lúmen crystals), PSIV bible §2.4 (cities have power, meds, firearms; outside: nomad villages and
ruins; magic = survival toolkit, psionics real), Economia v3.0 (SF base prices).
How to rebuild: save AoN listing pages as HTML next to parse.py, run parse.py (-> items.json),
then this script. Output: scripts/generators/data/sf-items.json with a `tier` per item:
  common  = found in towns (level <= 4)
  city    = big cities / Piata / Aerodyn (5-8)
  rare    = experimental / Era das Maravilhas finds (9-12, only antiquities & Piata labs)
"""
import io, json, os, re
from collections import Counter
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from families import FAMILIES

SRC = os.environ.get('AON_ITEMS', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'items.json'))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'sf-items.json')
items = json.load(io.open(SRC, encoding='utf8'))

# Pact Worlds / Golarion / space-faring things that cannot exist in Algol.
DENY = re.compile(r'''\b(
  starship|ship|drift|pact|absalom|eox|eoxian|akiton|castrovel|verces|vercite|triaxus|aballon|apostae|azlanti|
  vesk|vesk-?\w*|kasath\w*|lashunt\w*|ysoki|shirren|shirrenic|skittermander|barathu|pahtra|ikeshti|kish|idari|
  stellifera|liavara|bretheda|diaspora|golarion|hellknight|veskarium|hylax|abadar|desna|pharasma|sarenrae|
  triune|weydan|yaraesa|talavet|ibra|iomedae|lao\ shu\ po|damoritosh|eloritu|lissala|nyarlathotep|oras|urgathoa|
  zon-kuthon|besmara|groetus|hei\ feng|ylluma|angradd|necro\w*|undead|bone|soul|vampir\w*|ghoul|lich|
  aeon|aeonic|xenodruid|solarian|solar\ manifestation|witchwarper|starfinder|vanguard|nanocyte|precog|
  biohacker|evolutionist|void|vacuum|zero-g|null-space|hyperspace|teleport\w*|planar|astral|ethereal|
  spell\ gem|wand|staff|ring|amulet|crown|rune|holy|unholy|deity|divine|demon\w*|devil\w*|fiend\w*|celestial|
  azata|angel\w*|infernal|abyssal|elemental|dragon\w*|stellar|dark\ matter|hyper\w*|quantum|
  powered\ armor|power\ armor|mech|drone\ hive|swarm|hive|
  hover\w*|vidgame|vr|holo\w*|jetpack|jet\ pack|microjets|grav\w*|nanite\w*|planetary|system-wide|
  emotiquest|endearing|gnom\w*|metaphysical|shobhad|formian|kalo|ursikka|devourer|trenarii|huchket|velstrac|kyokor|abadarcorp|golem\w*|fey\w*|mage\w*|dendron|aeonaut|altar|prismatilate|imposter|cavatina|machimind|composter|drop pod|glider|wingsuit|hibernation|union membership|intellivac|sacred|artificial plant|spellcasting|spell|magic|mystic|arcane|psychic|telepath\w*|zero\ gravity|orbital|spacesuit|space
)\b''', re.I | re.X)

# Kinds that fit Motávia, with level ceilings.
ALLOWED = {
    'weapon': 12,
    'armor': 12,
    'armorUpgrade': 10,
    'tech': 12,
    'other': 20,
    'biotech': 8,       # Piata/Rassh-Kour medicine (SEED heritage), small runs
    'cybernetic': 6,    # only simple prosthetics/medical
    'personalUpgrade': 8,
    'hybrid': 8,        # Lúmen/Espe hybrid devices
    'magic': 0,         # magic items: excluded (psionics/Espe are not item markets)
}
WEAPON_GROUPS = {'SmallArms', 'Longarms', 'BasicMelee', 'AdvMelee', 'Ammo', 'Grenade', 'Sniper', 'Heavy'}
OTHER_GROUPS = {'Personal Items', 'Medicinals', 'Food and Drinks', 'Lodgings', 'Professional Services', 'Trade Goods'}
# Heavy weapons and big grenades are military/Aerodyn rarities.
GROUP_CAP = {'Heavy': 8, 'Sniper': 10, 'Grenade': 8}

# Exotic kinds: hand-picked list (SEED-heritage medicine of Piata, simple prosthetics,
# Lúmen/Espe field instruments). Everything else of these kinds does not exist in Algol.
PICKED = {
    'biotech': {'Auxiliary Eyelids', 'Eagle Eyes', 'Neutralizer Lobe', 'Pressure Filter', 'Pressurized Lungs',
                'Regenerative Blood, Mk 1', 'Regenerative Blood, Mk 2', 'Resistant Hide, Mk 1', 'Resistant Hide, Mk 2',
                'Thermal-Sensitive Eyes'},
    'cybernetic': {'Antitoxin Membrane', 'Bionic Knee', 'Bronchial Valves', 'Darkvision Capacitors, Standard',
                   'Datajack, Standard', 'Dermal Plating, Mk 1', 'Detoxifier, Standard', 'Fortified Feet',
                   'Lightvision Shades', 'Prosthetic Limb, Standard', 'Prosthetic Limb, Storage',
                   'Respiration Compounder', 'Retinal Reflectors', 'Voice Amplifier', 'Wide-Spectrum Ocular Implant',
                   'Olfaction Core, Mk 1'},
    'hybrid': {'Absolute Compass, Mk 1', 'Autopsic Scanner', 'Dust Goggles', 'Eagle Eye Goggles', 'Efficient Bandolier',
               'Everlength Rope', 'Fung-eye Goggles', 'Hardlight Pole', 'Thermal Regulator', 'Trap Scanner',
               'Universal Solvent, Basic', 'Motion-Detection Badge', 'Emergency Life Shell, Mk 1', 'Redundancy Belt',
               'Sense Silk, Mk 1', 'Cleanliness Circuits', 'Data Perusal Unit, Mk 1', 'Alluvion Theodolite'},
    'personalUpgrade': {'Synaptic Accelerators (Technology), MK 1', 'Synaptic Accelerators (Technology), MK 2'},
}

kept, cut = [], Counter()
for i in items:
    name, kind, group, level, price = i['name'], i['kind'], i['group'], i['level'] or 0, i['price']
    if price is None:
        cut['no price'] += 1
        continue
    cap = ALLOWED.get(kind, 0)
    if cap == 0:
        cut[f'kind {kind}'] += 1
        continue
    if kind == 'weapon' and group not in WEAPON_GROUPS:
        cut['weapon group'] += 1
        continue
    if kind == 'other' and group not in OTHER_GROUPS:
        cut[f'other {group}'] += 1
        continue
    if kind in ('weapon', 'armor'):
        fam_key = 'Heavy armor' if (kind == 'armor' and group == 'Heavy') else group
        if name.split(',')[0].strip() not in FAMILIES.get(fam_key, set()):
            cut[f'{kind} family not in Algol'] += 1
            continue
    cap = min(cap, GROUP_CAP.get(group or '', cap))
    if level > cap:
        cut['too advanced'] += 1
        continue
    if kind in PICKED:
        if name not in PICKED[kind]:
            cut[f'{kind} not picked'] += 1
            continue
    elif DENY.search(f"{name} {i.get('category') or ''}"):
        cut['not in Algol'] += 1
        continue
    text = f"{name} {i.get('category') or ''} {(i['extra'] or {}).get('Special', '')}"
    if kind not in PICKED and DENY.search(text):
        cut['not in Algol'] += 1
        continue
    tier = 'common' if level <= 4 else 'city' if level <= 8 else 'rare'
    kept.append([name, kind, group or '', i.get('category') or '', level, price, (i['extra'] or {}).get('Damage', '') if kind == 'weapon' else '', tier])

doc = {
    'source': 'Archives of Nethys (aonsrd.com), Starfinder 1e SRD — Open Game License. Curated for Algol AW 2284.',
    'fields': ['name', 'kind', 'group', 'category', 'level', 'price', 'damage', 'tier'],
    'items': kept,
}
io.open(OUT, 'w', encoding='utf8').write(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
print('kept', len(kept), 'of', len(items))
print('cut', dict(cut))
print(Counter((k[1], k[7]) for k in kept))
