/**
 * The quick generators. All pure functions of an Rng (same seed → same result), so a result
 * can be reproduced from the seed shown in the UI.
 */
import type { StatBlock } from '@app/api/bestiary.api';
import * as C from './data/contracts';
import * as E from './data/encounters';
import { type Culture } from './data/names';
import * as NPC from './data/npc';
import { DEZOLIS_SPOTS, MOTAVIA_PLACES, PIATA_DISTRICTS, PIATA_SPOTS, SAYINGS } from './data/places';
import { LOCAL_GOODS, type LocalGood, SHOP_TYPES, type ShopType } from './data/shops';
import { type Rng, capitalize, fill } from './engine';
import { generateName } from './names';

export type Setting = 'motavia' | 'piata' | 'kolian' | 'dezolis';

const RACE_CULTURE: Record<NPC.Race, Culture> = {
  Palmaniano: 'palman',
  Motaviano: 'motavian',
  Koliano: 'kolian',
  Dezoliano: 'dezorian',
  Esper: 'esper',
  Andróide: 'android',
};

/** Maps the UI choice (world + optional city) to a setting; Piata keeps its districts. */
export function settingFor(world: 'motavia' | 'kolian' | 'dezolis', city?: string): Setting {
  return world === 'motavia' && city === 'Piata' ? 'piata' : world;
}

const cityPlace = (city?: string) => (city ? MOTAVIA_PLACES.find((p) => p.name === city) : undefined);

/** Who you meet: follows the city's population (Cidades_de_Motavia.csv). */
function raceWeights(setting: Setting, city?: string): readonly (readonly [NPC.Race, number])[] {
  const people = cityPlace(city)?.people ?? '';
  if (setting === 'motavia' && /^Motavian/.test(people)) {
    return [
      ['Motaviano', 78],
      ['Palmaniano', 16],
      ['Esper', 2],
      ['Andróide', 2],
      ['Dezoliano', 2],
    ];
  }
  if (setting === 'motavia' && /^Palmanian/.test(people)) {
    return [
      ['Palmaniano', 78],
      ['Motaviano', 16],
      ['Esper', 2],
      ['Andróide', 2],
      ['Dezoliano', 2],
    ];
  }
  return NPC.RACE_WEIGHTS[setting];
}

const placesFor = (setting: Setting, city?: string): string[] => {
  if (setting === 'piata') return [...PIATA_DISTRICTS, ...PIATA_SPOTS];
  if (city) return [city];
  if (setting === 'dezolis') return DEZOLIS_SPOTS;
  if (setting === 'kolian') return MOTAVIA_PLACES.filter((p) => /^Ko[lr]-/.test(p.name)).map((p) => p.name);
  return MOTAVIA_PLACES.filter((p) => p.pop !== 0 || p.vocation).map((p) => p.name);
};

const CREATURE_POOL = [
  'uma Aranha-Leão',
  'um bando de Skelgra',
  'uma colmeia de Mirage Wasp',
  'um Sink-Beetle',
  'um Zerrak Mantis',
  'Sky-Hookers',
  'um enxame de Night-Moth',
  'formigas Duh-Ant',
  'uma Razor-Centipede',
  'algo que ninguém soube descrever',
];

// ── NPC ──

export interface GeneratedNpc {
  name: string;
  race: NPC.Race;
  profession: string;
  sector: string;
  age: string;
  appearance: string[];
  traits: string[];
  motivation: string;
  quirk: string;
  secret: string;
  voice: string;
  saying: string;
  hook: string;
  relation: string;
  location: string;
}

export function generateNpc(
  rng: Rng,
  setting: Setting,
  opts: { race?: NPC.Race; sector?: string; city?: string } = {},
): GeneratedNpc {
  const race = opts.race ?? rng.weighted(raceWeights(setting, opts.city));
  const sector = opts.sector ?? rng.pick(NPC.PROFESSION_SECTORS_BY_SETTING[setting]);
  const places = placesFor(setting, opts.city);
  const location = setting === 'piata' ? `Piata — ${rng.pick(places)}` : rng.pick(places);
  const elsewhere = placesFor(setting === 'piata' ? 'motavia' : setting);
  const values = {
    place: elsewhere,
    item: ['um mapa', 'um caderno de expedição', 'uma caixa lacrada', 'uma peça antiga', 'um anel de família'],
    creature: CREATURE_POOL,
    person: (r: Rng) => generateName(r, RACE_CULTURE[r.weighted(raceWeights(setting, opts.city))]),
  };
  return {
    name: generateName(rng, RACE_CULTURE[race]),
    race,
    profession: rng.pick(NPC.PROFESSIONS[sector] ?? NPC.PROFESSIONS.Comércio),
    sector,
    age: rng.pick(NPC.AGES),
    appearance: rng.sample(NPC.APPEARANCE[race], 2),
    traits: rng.sample(NPC.TRAITS, 2),
    motivation: rng.pick(NPC.MOTIVATIONS),
    quirk: rng.pick(NPC.QUIRKS),
    secret: rng.pick(NPC.SECRETS),
    voice: rng.pick(NPC.VOICE),
    saying: rng.pick(SAYINGS),
    hook: capitalize(fill(rng, rng.pick(NPC.HOOKS), values)),
    relation: rng.pick(NPC.RELATION),
    location,
  };
}

/** Markdown description for "Save as NPC". */
export function npcToMarkdown(n: GeneratedNpc): string {
  return [
    `**${n.race}**, ${n.age}. ${capitalize(n.appearance.join('; '))}.`,
    '',
    `**Personalidade:** ${n.traits.join('; ')}. ${capitalize(n.voice)}.`,
    `**Mania:** ${n.quirk}.`,
    `**Quer:** ${n.motivation}.`,
    `**Gancho:** ${n.hook}.`,
    `**Fala típica:** “${n.saying}”`,
    '',
    `> **Segredo (GM):** ${n.secret}.`,
  ].join('\n');
}

// ── Shop ──

export interface SfItem {
  name: string;
  kind: string;
  group: string;
  category: string;
  level: number;
  price: number;
  damage: string;
  tier: 'common' | 'city' | 'rare';
}

export interface ShopLine {
  name: string;
  detail: string;
  base: number;
  price: number;
  unit?: string;
  note?: string;
  source: 'Starfinder' | 'Algol';
}

export interface GeneratedShop {
  name: string;
  type: ShopType;
  place: string;
  placeInfo: string;
  owner: GeneratedNpc;
  flavor: string;
  priceNote: string;
  lines: ShopLine[];
}

const SHOP_ADJ = ['Velha', 'Nova', 'Boa', 'Grande', 'Pequena', 'Última', 'Fiel', 'Segunda', 'Honesta', 'Dourada'];
const SHOP_NOUN = [
  'Duna',
  'Quitina',
  'Escadaria',
  'Lanterna',
  'Caravana',
  'Bússola',
  'Fonte',
  'Krupp',
  'Engrenagem',
  'Pena',
  'Areia',
  'Seda',
  'Raiz',
  'Chave',
];

const round = (n: number) =>
  n < 20 ? Math.max(1, Math.round(n)) : n < 200 ? Math.round(n / 5) * 5 : Math.round(n / 10) * 10;

/**
 * Economia v3.0: local price = base + acquisition/transport/scarcity. Cities whose vocation
 * matches the shop sell cheaper; small or isolated places pay transport and stock less.
 */
export function generateShop(
  rng: Rng,
  setting: Setting,
  items: SfItem[],
  opts: { typeKey?: string; place?: string } = {},
): GeneratedShop {
  const types = SHOP_TYPES.filter((t) =>
    setting === 'dezolis'
      ? t.settings?.includes('dezolis') || ['apothecary', 'tavern', 'outfitter'].includes(t.key)
      : setting === 'kolian'
        ? t.settings?.includes('kolian') || ['tavern', 'apothecary'].includes(t.key)
        : !t.settings,
  );
  const type = SHOP_TYPES.find((t) => t.key === opts.typeKey) ?? rng.pick(types);

  const placeObj =
    setting === 'piata'
      ? MOTAVIA_PLACES.find((p) => p.name === 'Piata')
      : (MOTAVIA_PLACES.find((p) => p.name === opts.place) ??
        rng.pick(
          setting === 'kolian'
            ? MOTAVIA_PLACES.filter((p) => /^Ko[lr]-/.test(p.name))
            : MOTAVIA_PLACES.filter((p) => p.pop > 0),
        ));
  const place =
    setting === 'piata'
      ? `Piata — ${rng.pick(PIATA_SPOTS.concat(PIATA_DISTRICTS))}`
      : setting === 'dezolis'
        ? `Dezolis — ${rng.pick(DEZOLIS_SPOTS)}`
        : (placeObj?.name ?? 'estrada');
  const pop = setting === 'piata' ? 30000 : setting === 'dezolis' ? 3000 : (placeObj?.pop ?? 2000);
  const vocationText = `${placeObj?.desc ?? ''} ${placeObj?.vocation ?? ''} ${placeObj?.faith ?? ''}`;
  const favored =
    type.favoredBy.some((f) => vocationText.toLowerCase().includes(f.toLowerCase())) || setting === 'piata';

  // Tech reach by size: Piata/Aerodyn-level cities reach "city" tier; rare finds only in antiquities.
  const maxTier = pop >= 25000 || setting === 'piata' ? 'city' : 'common';
  const rareOk = type.key === 'fragments' || type.key === 'tech';
  const isolated = pop < 5000 || setting === 'dezolis';
  const factor = (favored ? 0.85 : 1) * (isolated ? 1.25 : 1) * (0.92 + rng.next() * 0.2);

  const pool = (rule: (typeof type.stock)[number]) =>
    items.filter(
      (i) =>
        i.kind === rule.kind &&
        (!rule.groups || rule.groups.includes(i.group) || (rule.groups.includes('__rare__') && i.tier !== 'common')) &&
        (i.tier === 'common' ||
          (i.tier === 'city' && maxTier === 'city') ||
          (i.tier === 'rare' && rareOk && rng.chance(0.15))),
    );

  const lines: ShopLine[] = [];
  const seen = new Set<string>();
  const [nOfficial, nLocal] = type.size;
  const count = nOfficial === 0 ? 0 : Math.max(1, Math.round(nOfficial * (isolated ? 0.6 : 1) * (favored ? 1.3 : 1)));
  for (let i = 0, guard = 0; i < count && guard < count * 6; guard += 1) {
    const rule = rng.weighted(type.stock.map((r) => [r, r.weight] as const));
    const candidates = pool(rule).filter((x) => !seen.has(x.name));
    if (!candidates.length) continue;
    // Everyday gear is common; higher levels show up less often.
    const it = rng.weighted(candidates.map((c) => [c, 1 / (1 + c.level / 2)] as const));
    seen.add(it.name);
    i += 1;
    // Firearms, ammunition, explosives and artifacts are scarce in Algol: legal shops rarely
    // stock them and charge a lot; the grey market has them, still expensive.
    const firearm =
      it.kind === 'weapon' && ['SmallArms', 'Longarms', 'Sniper', 'Heavy', 'Ammo', 'Grenade'].includes(it.group);
    const artifact = it.kind === 'hybrid' || it.tier === 'rare';
    if ((firearm || artifact) && type.key !== 'grey' && type.key !== 'fragments' && rng.chance(0.5)) continue;
    const scarce = (firearm || artifact ? (type.key === 'grey' ? 2 : 3) : 1) * (it.tier !== 'common' ? 1.15 : 1);
    lines.push({
      name: it.name,
      detail: [
        it.category || it.group,
        `lvl ${it.level}`,
        it.damage && `dmg ${it.damage}`,
        it.tier === 'rare' && 'raro',
        scarce >= 2 && 'escasso',
      ]
        .filter(Boolean)
        .join(' · '),
      base: it.price,
      price: round(it.price * factor * scarce),
      source: 'Starfinder',
    });
  }
  // Regional goods: Dezolis sells Dezolian goods, Kolian lands their own, Motávia neither.
  const regional = (g: LocalGood) =>
    setting === 'dezolis'
      ? g.tags.includes('dezolis') || g.tags.includes('mate')
      : setting === 'kolian'
        ? !g.tags.includes('dezolis') && !g.name.includes('da Baixa')
        : !g.tags.includes('dezolis') && !g.tags.includes('kolian');
  const locals: LocalGood[] = LOCAL_GOODS.filter(
    (g) =>
      regional(g) &&
      g.tags.some(
        (t) =>
          type.local.includes(t) ||
          (setting === 'dezolis' &&
            type.local.some((l) => ['meal', 'drink', 'lodging', 'food'].includes(l)) &&
            t === 'dezolis'),
      ),
  );
  for (const g of rng.sample(locals, nLocal)) {
    lines.push({
      name: g.name,
      detail: g.unit,
      base: g.price,
      price: round(g.price * factor),
      unit: g.unit,
      note: g.note,
      source: 'Algol',
    });
  }

  const owner = generateNpc(rng, setting, {
    sector: type.key === 'fragments' || type.key === 'grey' ? 'Submundo' : 'Comércio',
    city: setting === 'piata' ? undefined : placeObj?.name,
  });
  const name = rng.chance(0.5)
    ? `${rng.pick(type.names)} ${rng.chance(0.5) ? 'de' : 'da'} ${owner.name.split(' ')[0]}`
    : `${rng.pick(type.names)} ${rng.chance(0.5) ? 'A' : 'O'} ${rng.pick(SHOP_ADJ)} ${rng.pick(SHOP_NOUN)}`.replace(
        ' O Velha',
        ' A Velha',
      );

  const pct = Math.round((factor - 1) * 100);
  return {
    name,
    type,
    place,
    placeInfo: placeObj ? `${placeObj.desc}${placeObj.pop ? ` · ~${placeObj.pop.toLocaleString()} hab.` : ''}` : '',
    owner,
    flavor: rng.pick(type.flavor),
    priceNote: `${pct >= 0 ? '+' : ''}${pct}% sobre o preço-base${favored ? ' · especialidade local (mais barato e mais estoque)' : ''}${isolated ? ' · lugar pequeno/isolado (frete e escassez)' : ''}`,
    lines: lines.sort((a, b) => (a.source === b.source ? a.price - b.price : a.source === 'Algol' ? 1 : -1)),
  };
}

// ── Encounter ──

export interface CreatureOption {
  monsterId: number;
  species: string;
  imageUrl?: string | null;
  block: StatBlock;
}

export interface EncounterGroup {
  option: CreatureOption;
  count: number;
}

export interface GeneratedEncounter {
  biome: E.Biome;
  difficulty: string;
  targetCr: number;
  budget: number;
  xp: number;
  groups: EncounterGroup[];
  terrain: string;
  weather: string;
  reason: string;
}

/** Starfinder budget: XP of CR (APL + difficulty), scaled for party size (base 4 PCs). */
export function generateEncounter(
  rng: Rng,
  options: CreatureOption[],
  biome: E.Biome,
  apl: number,
  partySize: number,
  difficultyKey: string,
): GeneratedEncounter | null {
  const diff = E.DIFFICULTY.find((d) => d.key === difficultyKey) ?? E.DIFFICULTY[1];
  const targetCr = Math.max(0.33, apl + diff.delta);
  const budget = Math.round(E.xpForCr(targetCr) * (partySize / 4));
  const weights = new Map(E.BIOME_CREATURES[biome]);
  const pool = options.filter((o) => weights.has(o.species) && E.xpForCr(E.crValue(o.block.cr)) <= budget);
  if (!pool.length) return null;

  const groups: EncounterGroup[] = [];
  let xp = 0;
  const speciesCount = rng.chance(0.3) ? 2 : 1;
  for (let s = 0; s < speciesCount; s += 1) {
    const remaining = budget - xp;
    const fit = pool.filter(
      (o) => E.xpForCr(E.crValue(o.block.cr)) <= remaining && !groups.some((g) => g.option.species === o.species),
    );
    if (!fit.length) break;
    // Prefer stronger stages that still fit (a real fight), weighted by biome frequency.
    const option = rng.weighted(
      fit.map((o) => [o, (weights.get(o.species) ?? 1) * (1 + E.crValue(o.block.cr) / Math.max(1, targetCr))] as const),
    );
    const each = E.xpForCr(E.crValue(option.block.cr));
    const maxCount = Math.max(1, Math.floor(remaining / each));
    const pack = E.PACK_SPECIES.has(option.species);
    const count = Math.min(
      maxCount,
      pack ? rng.int(Math.min(2, maxCount), Math.min(8, maxCount)) : rng.int(1, Math.min(3, maxCount)),
    );
    groups.push({ option, count });
    xp += each * count;
  }
  return {
    biome,
    difficulty: diff.label,
    targetCr,
    budget,
    xp,
    groups,
    terrain: rng.pick(E.TERRAIN[biome]),
    weather: rng.pick(E.WEATHER),
    reason: rng.pick(E.REASONS),
  };
}

// ── Guild contract ──

export interface GeneratedContract {
  title: string;
  kind: string;
  access: string;
  text: string;
  contractor: GeneratedNpc;
  band: C.PayBand;
  days: number;
  payPerHunter: number;
  partyPay: number;
  clauses: string[];
  complication: string;
}

export function generateContract(
  rng: Rng,
  setting: Setting,
  partySize: number,
  opts: { kind?: string; city?: string } = {},
): GeneratedContract {
  const kind = opts.kind && C.KINDS[opts.kind] ? opts.kind : rng.pick(Object.keys(C.KINDS));
  const places = placesFor(setting === 'piata' ? 'motavia' : setting);
  const values = {
    place: setting === 'piata' ? ['Piata'] : opts.city ? [opts.city] : places,
    place2: places,
    cargo: C.CARGO,
    site: C.SITES,
    deadline: C.DEADLINES,
    creature: CREATURE_POOL,
    n: (r: Rng) => String(r.int(2, 9)),
    person: (r: Rng) => generateName(r, r.pick(['palman', 'motavian'] as Culture[])),
  };
  const text = fill(rng, rng.pick(C.KINDS[kind]), values);
  const risky = ['Caça', 'Expedição', 'Recuperação', 'Proteção'].includes(kind);
  const band =
    kind === 'Urgente' ? C.PAY_BANDS[1] : risky ? rng.pick(C.PAY_BANDS.slice(2)) : rng.pick(C.PAY_BANDS.slice(0, 4));
  const days = rng.int(band.days[0], band.days[1]);
  const payPerHunter = round(rng.int(band.pay[0], band.pay[1]));
  return {
    title: `${kind}: ${text.split('.')[0].slice(0, 70)}`,
    kind,
    access: rng.weighted(C.ACCESS),
    text,
    contractor: generateNpc(rng, setting, {
      city: setting === 'piata' ? undefined : opts.city,
      sector: rng.pick(['Comércio', 'Universidade', 'Governo', 'Caravanas', 'Campo', 'Guilda']),
    }),
    band,
    days,
    payPerHunter,
    partyPay: payPerHunter * partySize,
    clauses: rng.sample(C.CLAUSES, rng.int(2, 3)),
    complication: rng.pick(C.COMPLICATIONS),
  };
}
