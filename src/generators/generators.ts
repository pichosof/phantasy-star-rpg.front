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
import { SHOP_TYPES, type ShopType } from './data/shops';
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

// ── Items (from the catalogue: /api/gm/items) ──

/** The catalogue entry the generators need (a subset of the GM item). */
export interface GenItem {
  id: number;
  code: string;
  name: string;
  localName: string | null;
  origin: 'starfinder' | 'algol' | 'homebrew';
  kind: string;
  group: string | null;
  category: string | null;
  level: number;
  damage: string | null;
  unit: string | null;
  region: 'motavia' | 'dezolis' | 'kolian';
  refPrice: number | null;
  access: 'free' | 'order' | 'spot' | 'institutional' | 'relic' | 'none';
  channel: string | null;
  tags: string[];
  shops: string[];
  loot: Array<'seed' | 'orbital' | 'cave' | 'cellar'>;
  status: 'proposal' | 'approved' | 'published';
}

const displayName = (i: GenItem) => i.localName ?? i.name;
const FIREARM_GROUPS = ['SmallArms', 'Longarms', 'Sniper', 'Heavy', 'Grenade'];
const ENERGY = ['Laser', 'Plasma', 'Shock', 'Sonic', 'Cryo', 'Flame', 'Acid'];

// ── Shop ──

/** Hubs that make advanced goods; prices for scarce goods climb with distance from them. */
const TECH_HUBS = ['Piata', 'Aerodyn'];

export interface ShopLine {
  itemId: number;
  name: string;
  /** Catalogue name when the shop shows the Motávia name. */
  ref?: string;
  channel?: string;
  detail: string;
  base: number;
  /** Estimated local price before the GM's multiplier. */
  price: number;
  unit?: string;
  source: 'Starfinder' | 'Algol' | 'Homebrew';
  proposal?: boolean;
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

export const roundPrice = (n: number) =>
  n < 20 ? Math.max(1, Math.round(n)) : n < 200 ? Math.round(n / 5) * 5 : Math.round(n / 10) * 10;

const SOURCE: Record<GenItem['origin'], ShopLine['source']> = {
  starfinder: 'Starfinder',
  algol: 'Algol',
  homebrew: 'Homebrew',
};

/** Shop line for an item; the price is the GM's estimate (canon: local prices are not fixed). */
export function shopLine(it: GenItem, factor: number, scarce: number, extra: (string | false | null)[] = []): ShopLine {
  const base = it.refPrice ?? 0;
  return {
    itemId: it.id,
    name: displayName(it),
    ref: it.localName ? it.name : undefined,
    channel: it.channel ?? undefined,
    detail: [
      it.origin === 'algol' ? it.unit : it.category || it.group,
      it.origin !== 'algol' && `lvl ${it.level}`,
      it.damage && `dmg ${it.damage}`,
      ...extra,
    ]
      .filter(Boolean)
      .join(' · '),
    base,
    price: roundPrice(base * factor * scarce),
    unit: it.unit ?? undefined,
    source: SOURCE[it.origin],
    proposal: it.status === 'proposal' && it.origin === 'homebrew',
  };
}

/**
 * Canon v1.0: only what a channel really sells. Free goods anywhere, made-to-order goods in
 * big cities or specialist shops, occasional offers only on the grey market; institutional,
 * relic and unavailable items never reach a shop. Prices are the GM's estimate: reference
 * price + transport and scarcity, dearer far from Piata/Aerodyn.
 */
export function generateShop(
  rng: Rng,
  setting: Setting,
  items: GenItem[],
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

  const bigCity = pop >= 25000 || setting === 'piata';
  const isolated = pop < 5000 || setting === 'dezolis';
  const factor = (favored ? 0.85 : 1) * (isolated ? 1.25 : 1) * (0.92 + rng.next() * 0.2);
  const hub = setting === 'piata' || TECH_HUBS.includes(placeObj?.name ?? '');
  const remote = hub
    ? 1
    : setting === 'kolian' || setting === 'dezolis'
      ? 2
      : pop >= 25000
        ? 1.25
        : pop >= 5000
          ? 1.5
          : 2;
  const underground = type.key === 'grey' || type.key === 'fragments';
  // Small towns do not stock high-level gear; big cities and the hubs can.
  const maxLevel = bigCity || hub ? 20 : pop >= 5000 ? 9 : 5;

  // A specialist shop takes commissions for its own trade anywhere; other shops only in big
  // cities. Occasional offers only appear underground.
  const offered = (it: GenItem, specialist: boolean) =>
    it.access === 'free' ||
    (it.access === 'order' && (bigCity || favored || underground || specialist)) ||
    (it.access === 'spot' && underground);
  const region = (it: GenItem) =>
    setting === 'dezolis'
      ? it.region === 'dezolis' || (it.region === 'motavia' && it.origin !== 'algol')
      : setting === 'kolian'
        ? it.region !== 'dezolis'
        : it.region === 'motavia';
  const sellable = items.filter((it) => ['free', 'order', 'spot'].includes(it.access) && region(it));

  const ruleMatch = (it: GenItem, rule: (typeof type.stock)[number]) =>
    it.origin !== 'algol' &&
    it.kind === rule.kind &&
    (!rule.groups ||
      rule.groups.includes(it.group ?? '') ||
      (rule.groups.includes('__rare__') && it.access === 'spot'));
  const forced = (it: GenItem) => it.shops.includes(type.key);

  const lines: ShopLine[] = [];
  const seen = new Set<number>();
  const [nOfficial, nLocal] = type.size;
  const count = nOfficial === 0 ? 0 : Math.max(1, Math.round(nOfficial * (isolated ? 0.6 : 1) * (favored ? 1.3 : 1)));
  for (let i = 0, guard = 0; i < count && guard < count * 6; guard += 1) {
    const rule = rng.weighted(type.stock.map((r) => [r, r.weight] as const));
    const candidates = sellable.filter(
      (x) =>
        !seen.has(x.id) &&
        x.level <= maxLevel &&
        (ruleMatch(x, rule) || (forced(x) && x.origin !== 'algol')) &&
        offered(x, true),
    );
    if (!candidates.length) continue;
    // Everyday gear is common; higher levels show up less often.
    const it = rng.weighted(candidates.map((c) => [c, 1 / (1 + c.level / 2)] as const));
    seen.add(it.id);
    // Small places take fewer commissions at once.
    if (it.access === 'order' && !bigCity && rng.chance(0.35)) continue;
    i += 1;
    const scarceGear =
      it.kind === 'weapon' && (FIREARM_GROUPS.includes(it.group ?? '') || ENERGY.includes(it.category ?? ''));
    // Distance from Piata/Aerodyn only weighs on technology; a blade or an artisan armour costs
    // the commission, not the freight.
    const crafted =
      it.origin === 'homebrew' || (it.kind === 'weapon' && ['', '—'].includes(it.category ?? '') && !scarceGear);
    const scarce =
      it.access === 'spot' || scarceGear
        ? (underground ? 2 : 3) * remote
        : it.access === 'order'
          ? 1.15 * (crafted ? 1 : remote)
          : 1;
    lines.push(
      shopLine(it, factor, scarce, [
        scarce >= 2 && 'escasso',
        it.access === 'order' && 'por encomenda',
        it.access === 'spot' && 'procedência incerta',
      ]),
    );
  }
  const locals = sellable.filter(
    (g) =>
      g.origin === 'algol' &&
      offered(g, true) &&
      (forced(g) ||
        g.tags.some(
          (t) =>
            type.local.includes(t) ||
            (setting === 'dezolis' &&
              type.local.some((l) => ['meal', 'drink', 'lodging', 'food'].includes(l)) &&
              t === 'dezolis'),
        )),
  );
  for (const g of rng.sample(locals, nLocal)) {
    const scarce = g.access === 'spot' ? (underground ? 1.5 : 2) * remote : 1;
    lines.push(shopLine(g, factor, scarce, [g.access === 'order' && 'por encomenda']));
  }

  const owner = generateNpc(rng, setting, {
    sector: underground ? 'Submundo' : 'Comércio',
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
    priceNote: `Estimativa do mestre (preço local não fixado no cânone): ${pct >= 0 ? '+' : ''}${pct}% sobre a referência${favored ? ' · especialidade local' : ''}${isolated ? ' · lugar pequeno/isolado' : ''}${remote > 1 ? ` · itens escassos ×${remote} pela distância de Piata/Aerodyn` : ''}`,
    lines: lines.sort((a, b) => (a.source === b.source ? a.price - b.price : a.source === 'Algol' ? 1 : -1)),
  };
}

// ── Loot ──

export type LootSite = 'seed' | 'orbital' | 'cave' | 'cellar';
export type LootSize = 'small' | 'medium' | 'large';

export interface LootLine {
  itemId: number;
  name: string;
  ref?: string;
  detail: string;
  condition: string;
  base: number;
  access: GenItem['access'];
  source: ShopLine['source'];
}

export interface GeneratedLoot {
  site: LootSite;
  title: string;
  spot: string;
  lines: LootLine[];
  valuables: string[];
  hazard: string;
  gmNote: string;
}

const LOOT_SITES: Record<
  LootSite,
  {
    title: string;
    spots: string[];
    conditions: string[];
    hazards: string[];
    access: Partial<Record<GenItem['access'], number>>;
  }
> = {
  seed: {
    title: 'Instalação da Era das Maravilhas',
    spots: [
      'num armário de manutenção lacrado há séculos',
      'em cápsulas de estase de uma enfermaria esquecida',
      'num depósito de segurança com a porta emperrada',
      'junto aos restos de um posto de controle do sistema',
      'numa bancada de laboratório coberta de pó fino',
    ],
    conditions: ['funcional', 'inerte, sem energia', 'danificado (broken)', 'selado em estase', 'incompleto'],
    hazards: [
      'Sistemas de defesa ainda respondem a movimento.',
      'O ar é rarefeito; filtros recomendados.',
      'Uma porta de contenção fecha atrás do grupo.',
      'Energia residual instável: tocar o painel errado dispara alarme.',
    ],
    access: { relic: 4, institutional: 3, none: 1, order: 0.5 },
  },
  orbital: {
    title: 'Satélite orbital esquecido',
    spots: [
      'num compartimento de carga sem gravidade',
      'num módulo de habitação despressurizado',
      'presos a um rack de manutenção externo',
      'num cofre de emergência ao lado das cápsulas de fuga',
    ],
    conditions: ['funcional', 'congelado, funciona após aquecer', 'danificado por radiação', 'sem carga', 'intacto'],
    hazards: [
      'Vácuo: sem proteção ambiental, cada rodada conta.',
      'Detritos em órbita atravessam o casco em intervalos.',
      'A rotação do satélite muda a gravidade aparente.',
      'Radiação acima do normal no módulo central.',
    ],
    access: { institutional: 4, relic: 2, none: 1, order: 0.5 },
  },
  cave: {
    title: 'Caverna',
    spots: [
      'entre os restos de uma expedição perdida',
      'no ninho de uma criatura, misturado a ossos',
      'num esconderijo de contrabandistas atrás de uma rocha',
      'numa mochila presa numa fenda estreita',
      'num acampamento abandonado às pressas',
    ],
    conditions: ['gasto', 'úmido', 'intacto', 'roído pela fauna', 'funcional'],
    hazards: [
      'O dono do ninho volta antes do esperado.',
      'Teto instável: barulho alto provoca desabamento.',
      'Esporos no ar; sem máscara, teste contra doença.',
      'A água do fundo esconde sanguessugas de lodo.',
    ],
    access: { free: 3, order: 2, spot: 1.5, institutional: 0.3 },
  },
  cellar: {
    title: 'Porão antigo de cidade',
    spots: [
      'em baús sob uma escada desabada',
      'atrás de uma parede falsa de tijolos',
      'num depósito de uma loja fechada há gerações',
      'entre caixas de um arquivo municipal esquecido',
      'num cofre doméstico ainda trancado',
    ],
    conditions: ['empoeirado, funcional', 'velho, precisa de reparo', 'intacto', 'incompleto', 'gasto'],
    hazards: [
      'Ratos de kelp em grande número.',
      'O dono do imóvel acima não sabia do porão — e vai querer a parte dele.',
      'Uma fechadura antiga com armadilha simples.',
      'Infiltração: o piso cede perto da parede norte.',
    ],
    access: { free: 3, order: 2, spot: 2, institutional: 0.5 },
  },
};

const LOOT_COUNT: Record<LootSize, [number, number]> = { small: [2, 3], medium: [4, 6], large: [7, 10] };

/**
 * Loot that fits the place (canon v1.0): wonder-age facilities and orbital wrecks hold
 * institutional tech and possible relics; caves and old cellars hold what people carried,
 * stored or lost. Items come from the catalogue's `loot` sites, near the party level.
 */
export function generateLoot(
  rng: Rng,
  site: LootSite,
  items: GenItem[],
  opts: { level: number; size: LootSize },
): GeneratedLoot {
  const cfg = LOOT_SITES[site];
  const maxLevel = opts.level + (site === 'seed' || site === 'orbital' ? 4 : 2);
  const pool = items.filter((i) => i.loot.includes(site) && i.level <= maxLevel && (cfg.access[i.access] ?? 0) > 0);
  const [lo, hi] = LOOT_COUNT[opts.size];
  const n = lo + Math.floor(rng.next() * (hi - lo + 1));
  const lines: LootLine[] = [];
  const seen = new Set<number>();
  for (let k = 0, guard = 0; k < n && guard < n * 8; guard += 1) {
    const candidates = pool.filter((i) => !seen.has(i.id));
    if (!candidates.length) break;
    const it = rng.weighted(
      candidates.map((c) => [c, (cfg.access[c.access] ?? 0) / (1 + Math.abs(c.level - opts.level))] as const),
    );
    seen.add(it.id);
    k += 1;
    lines.push({
      itemId: it.id,
      name: displayName(it),
      ref: it.localName ? it.name : undefined,
      detail: [
        it.origin === 'algol' ? it.unit : it.category || it.group || it.kind,
        it.origin !== 'algol' && `lvl ${it.level}`,
        it.damage && `dmg ${it.damage}`,
      ]
        .filter(Boolean)
        .join(' · '),
      condition: rng.pick(cfg.conditions),
      base: it.refPrice ?? 0,
      access: it.access,
      source: SOURCE[it.origin],
    });
  }

  const valuables: string[] = [];
  if (site === 'cave' || site === 'cellar') {
    const coins = roundPrice(
      (5 + rng.next() * 25) * Math.max(1, opts.level) * (opts.size === 'large' ? 3 : opts.size === 'medium' ? 2 : 1),
    );
    valuables.push(`${coins} cr em moedas regionais misturadas`);
    if (rng.chance(0.3))
      valuables.push(
        site === 'cellar' ? 'Livro-caixa antigo (talvez com Selo de Integridade Espe)' : 'Pepita de minério bruto',
      );
  } else {
    valuables.push(
      `Componentes recuperáveis (vale ~${roundPrice(40 * Math.max(1, opts.level))} cr para a Universidade)`,
    );
    if (rng.chance(0.25)) valuables.push('Registro de dados ilegível sem equipamento de Piata');
  }

  const relics = lines.filter((l) => l.access === 'relic' || l.access === 'institutional').length;
  return {
    site,
    title: cfg.title,
    spot: rng.pick(cfg.spots),
    lines,
    valuables,
    hazard: rng.pick(cfg.hazards),
    gmNote:
      relics > 0
        ? `${relics} achado(s) fora do comércio (institucional/relíquia): sem preço local, a Custódia de Piata pode reclamar; condição e funcionamento a critério do mestre.`
        : 'Achados comuns: valem o preço de referência só como estimativa.',
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
  const payPerHunter = roundPrice(rng.int(band.pay[0], band.pay[1]));
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
