/**
 * Exports every generator item (Starfinder curated + Algol local goods) to one CSV for curation.
 * Run: npx tsx scripts/generators/export_items.ts  →  scripts/generators/items-curadoria.csv
 * Excel-friendly: UTF-8 BOM, ";" separator.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCAL_DESC } from '../../src/generators/data/local-desc';
import { LOCAL_GOODS } from '../../src/generators/data/shops';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, 'data');
const sf = JSON.parse(readFileSync(join(pub, 'sf-items.json'), 'utf8')) as { items: (string | number)[][] };
const info = JSON.parse(readFileSync(join(pub, 'sf-item-info.json'), 'utf8')) as Record<
  string,
  { d: string; s: string }
>;

const cols = [
  'manter',
  'origem',
  'nome',
  'tipo',
  'grupo',
  'categoria',
  'nivel',
  'preco',
  'dano',
  'tier',
  'unidade',
  'tags',
  'nota',
  'stats',
  'descricao',
];
const cell = (v: unknown) => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows: unknown[][] = [];
for (const [name, kind, group, category, level, price, damage, tier] of sf.items) {
  const i = info[name as string];
  rows.push([
    'sim',
    'Starfinder',
    name,
    kind,
    group,
    category,
    level,
    price,
    damage,
    tier,
    '',
    '',
    '',
    i?.s ?? '',
    i?.d ?? '',
  ]);
}
for (const g of LOCAL_GOODS) {
  rows.push([
    'sim',
    'Algol',
    g.name,
    'local',
    '',
    '',
    '',
    g.price,
    '',
    '',
    g.unit,
    g.tags.join(' '),
    g.note ?? '',
    '',
    LOCAL_DESC[g.name] ?? '',
  ]);
}

const out = join(here, 'items-curadoria.csv');
writeFileSync(out, '﻿' + [cols, ...rows].map((r) => r.map(cell).join(';')).join('\r\n'), 'utf8');
console.log(rows.length, 'items →', out);
