"""
Applies the GM's Motávia curation (02_curadoria_integral_AW2284_*.csv) to the generator data.
Usage: python scripts/generators/apply_curation.py <path to 02_curadoria_integral CSV>

- Drops EXCLUIR / DUPLICATA rows from scripts/generators/data/sf-items.json.
- Writes scripts/generators/data/item-curation.json = {name: [access, channel, motavia name, note]}
  access: a = adopt (any shop), d = adapt (big cities / specialist), r = restrict (grey market,
  antiquities, rare commission), x = relic (GM-only find, never in shops).
  FORA_DE_MOTAVIA is regional, not a removal: those goods keep selling in their own world.
"""
import csv, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'data')

ACCESS = {
    'ADOTAR': 'a',
    'FORA_DE_MOTAVIA': 'a',
    'ADAPTAR': 'd',
    'REVISAR': 'd',
    'RESTRINGIR': 'r',
    'RELIQUIA': 'x',
}
DROP = {'EXCLUIR', 'DUPLICATA'}
RESTRICTED_CHANNEL = re.compile(
    r'relíquia|laboratório|arsenal|instituc|achado|colecionador|encomenda|hospital|peça usada|guarda|oficina universitária|programa|cl[ií]nica de reab',
    re.I,
)

# Review fixes agreed with the GM (curation v0.2 → generator).
POWERED_MELEE = {
    'Heat-Amp Gauntlet, Mk 1',
    'Spark Knife, Runner',
    'Crystal Spear, Tactical',
    'Flare Axe, Red Star',
    'Needler Estoc, Standard',
}
FIREARM_AMMO = {'Flechette (25)', 'Flare (1)'}
FIXES = {
    **{n: ('r', 'Oficina institucional / colecionador',
           'Arma de corpo a corpo com bateria, cristal ou mecanismo energizado: depende de células e manutenção especializada; não é peça de ferreiro comum.')
       for n in POWERED_MELEE},
    **{n: ('r', 'Armeiro licenciado — reparo e transferência de peça usada',
           'Munição de arma rara: acompanha o destino das armas de fogo, com lote e compatibilidade incertos.')
       for n in FIREARM_AMMO},
}

src = sys.argv[1]
rows = list(csv.DictReader(io.open(src, encoding='utf-8-sig'), delimiter=';'))
curation, dropped = {}, set()
for r in rows:
    name, decision = r['nome'], r['decisao_proposta']
    if decision in DROP:
        dropped.add(name)
        continue
    channel, note = r['canal_principal'], r['observacao']
    access = ACCESS.get(decision, 'd')
    # "manter com ressalvas" + ADOTAR means "adopt the rules, restrict the access": the channel says how much.
    if r['manter'] == 'manter com ressalvas' and access == 'a':
        access = 'r' if RESTRICTED_CHANNEL.search(channel) else 'd'
    elif r['manter'] == 'sim':
        access = 'a'
    if name in FIXES:
        access, channel, note = FIXES[name]
    motavia = r['nome_motavia'] if r['nome_motavia'] != name else ''
    curation[name] = [access, channel, motavia, note]

path = os.path.join(DATA, 'sf-items.json')
sf = json.load(io.open(path, encoding='utf8'))
before = len(sf['items'])
sf['items'] = [i for i in sf['items'] if i[0] not in dropped]
sf['curation'] = os.path.basename(src)
json.dump(sf, io.open(path, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
json.dump(curation, io.open(os.path.join(DATA, 'item-curation.json'), 'w', encoding='utf8'),
          ensure_ascii=False, separators=(',', ':'))

counts = {}
for v in curation.values():
    counts[v[0]] = counts.get(v[0], 0) + 1
print('items', before, '->', len(sf['items']), '| curation', len(curation), counts)
