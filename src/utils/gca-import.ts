/**
 * GCA Import Utilities
 * Supports: GCA5 native XML (.gca5) and GCA text export (.txt)
 */
import type {
  GurpsSheetData,
  GurpsListItem,
  GurpsSkill,
  GurpsLanguage,
  GurpsWeapon,
  GurpsRangedWeapon,
  GurpsPossession,
} from '@app/api/character-sheets.api';

// ─── Common result type ───────────────────────────────────────────────────────

export interface GcaImportResult {
  data: Partial<GurpsSheetData>;
  warnings: string[];
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function importGcaFile(file: File): Promise<GcaImportResult> {
  const text = await file.text();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'gca5' || ext === 'gca4' || text.trimStart().startsWith('<?xml')) {
    return parseGca5Xml(text);
  }
  if (ext === 'txt') {
    return parseGcaTxt(text);
  }
  throw new Error(`Unrecognized format (.${ext}). Use .gca5 or .txt`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GCA5 XML PARSER
// ═══════════════════════════════════════════════════════════════════════════════

function directChild(el: Element, tag: string): Element | null {
  for (const child of Array.from(el.children)) {
    if (child.tagName === tag) return child;
  }
  return null;
}

function directText(el: Element, tag: string): string {
  return directChild(el, tag)?.textContent?.trim() ?? '';
}

function directNum(el: Element, tag: string): number | undefined {
  const s = directText(el, tag);
  const n = parseFloat(s);
  return s !== '' && !isNaN(n) ? n : undefined;
}

function traitChildren(section: Element | null): Element[] {
  if (!section) return [];
  return Array.from(section.children).filter((c) => c.tagName === 'trait');
}

/** Builds "Name (modifier shortname, cost)" display string from a trait element */
function buildTraitDisplayName(trait: Element): string {
  let name = directText(trait, 'name');
  const modsEl = directChild(trait, 'modifiers');
  if (modsEl && parseInt(modsEl.getAttribute('count') ?? '0', 10) > 0) {
    const parts: string[] = [];
    for (const mod of Array.from(modsEl.children)) {
      if (mod.tagName !== 'modifier') continue;
      const sn = directText(mod, 'shortname') || directText(mod, 'name');
      const cost = directText(mod, 'cost');
      if (sn) parts.push(cost ? `${sn}, ${cost}` : sn);
    }
    if (parts.length > 0) name += ` (${parts.join('; ')})`;
  }
  return name;
}

function parseGca5Xml(xmlText: string): GcaImportResult {
  const warnings: string[] = [];

  // Strip namespace declaration to avoid querySelector namespace issues
  const cleaned = xmlText.replace(/ xmlns="[^"]*"/g, '');
  const doc = new DOMParser().parseFromString(cleaned, 'application/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('Invalid XML file. Try exporting again from GCA.');
  }

  const char = doc.querySelector('character');
  if (!char) throw new Error('<character> element not found in the file.');

  const result: Partial<GurpsSheetData> = {};

  // ── Identity ──────────────────────────────────────────────────────────────
  result.player = directText(char, 'player') || undefined;

  const vitals = directChild(char, 'vitals');
  if (vitals) {
    result.appearance = directText(vitals, 'appearance') || undefined;
    const ht = parseFloat(directText(vitals, 'height'));
    const wt = parseFloat(directText(vitals, 'weight'));
    const ag = parseInt(directText(vitals, 'age'), 10);
    if (!isNaN(ht) && ht > 0) result.heightCm = ht;
    if (!isNaN(wt) && wt > 0) result.weightKg = wt;
    if (!isNaN(ag) && ag > 0) result.age = ag;
  }

  // ── Traits container ──────────────────────────────────────────────────────
  const traitsEl = directChild(char, 'traits');
  if (!traitsEl) {
    warnings.push('<traits> section not found.');
    return { data: result, warnings };
  }

  // ── Attributes ────────────────────────────────────────────────────────────
  const ATTR_BY_NAME: Record<string, keyof GurpsSheetData> = {
    ST: 'st',
    DX: 'dx',
    IQ: 'iq',
    HT: 'ht',
    'Hit Points': 'hp',
    Will: 'will',
    Perception: 'per',
    'Fatigue Points': 'fp',
  };
  let rawBasicSpeed: number | undefined;
  let rawBasicMove: number | undefined;

  const attrsEl = directChild(traitsEl, 'attributes');
  for (const trait of traitChildren(attrsEl)) {
    const name = directText(trait, 'name');
    const score = directNum(trait, 'score');
    if (score === undefined) continue;

    const key = ATTR_BY_NAME[name];
    if (key) {
      (result as Record<string, unknown>)[key] = score;
    } else if (name === 'Basic Speed') {
      rawBasicSpeed = score;
    } else if (name === 'Basic Move') {
      rawBasicMove = score;
    }
  }

  // Compute modifiers after we have primary attrs
  if (rawBasicSpeed !== undefined && result.dx !== undefined && result.ht !== undefined) {
    const calcSpeed = (result.dx + result.ht) / 4;
    const mod = Math.round((rawBasicSpeed - calcSpeed) * 100) / 100;
    if (mod !== 0) result.basicSpeedMod = mod;
  }
  if (rawBasicMove !== undefined && rawBasicSpeed !== undefined) {
    const calcMove = Math.floor(rawBasicSpeed ?? 0);
    const mod = rawBasicMove - calcMove;
    if (mod !== 0) result.basicMoveMod = mod;
  }

  // ── Languages ─────────────────────────────────────────────────────────────
  result.languages = traitChildren(directChild(traitsEl, 'languages'))
    .map((t) => {
      const name = directText(t, 'name');
      return { name } as GurpsLanguage;
    })
    .filter((l) => l.name);

  // ── Cultural Familiarities ─────────────────────────────────────────────────
  result.culturalFamiliarities = traitChildren(directChild(traitsEl, 'cultures'))
    .map(
      (t) =>
        ({
          name: directText(t, 'name'),
          points: directNum(t, 'points'),
        } as GurpsListItem),
    )
    .filter((c) => c.name);

  // ── Advantages ────────────────────────────────────────────────────────────
  result.advantages = traitChildren(directChild(traitsEl, 'advantages'))
    .map(
      (t) =>
        ({
          name: buildTraitDisplayName(t),
          points: directNum(t, 'points'),
        } as GurpsListItem),
    )
    .filter((a) => a.name);

  // ── Disadvantages + Quirks ────────────────────────────────────────────────
  const disadvantages: GurpsListItem[] = [];
  for (const section of ['disadvantages', 'quirks'] as const) {
    for (const t of traitChildren(directChild(traitsEl, section))) {
      const name = buildTraitDisplayName(t);
      if (name) disadvantages.push({ name, points: directNum(t, 'points') });
    }
  }
  result.disadvantages = disadvantages;

  // ── Skills ────────────────────────────────────────────────────────────────
  result.skills = traitChildren(directChild(traitsEl, 'skills'))
    .map((t) => {
      const name = directText(t, 'name');
      const level = directNum(t, 'level');
      const step = directText(t, 'step'); // e.g. "+0", "-2", "+1"
      const stepoff = directText(t, 'stepoff'); // e.g. "IQ", "DX", "Per"
      const points = directNum(t, 'points');
      const relativeLevel = stepoff ? `${stepoff}${step === '+0' ? '' : step}` : undefined;
      return { name, level, relativeLevel, points } as GurpsSkill;
    })
    .filter((s) => s.name);

  // ── Equipment → weapons + possessions ────────────────────────────────────
  const handWeapons: GurpsWeapon[] = [];
  const rangedWeapons: GurpsRangedWeapon[] = [];
  const possessions: GurpsPossession[] = [];

  for (const trait of traitChildren(directChild(traitsEl, 'equipment'))) {
    const itemName = directText(trait, 'name');
    const cost = directNum(trait, 'cost');
    const weight = directNum(trait, 'weight');
    const location = directText(trait, 'location') || undefined;

    const amEl = directChild(trait, 'attackmodes');
    const amCount = parseInt(amEl?.getAttribute('count') ?? '0', 10);

    if (amEl && amCount > 1) {
      // Weapon — extract each attack mode
      for (const am of Array.from(amEl.children).filter((c) => c.tagName === 'attackmode')) {
        const amName = directText(am, 'name');
        if (!amName) continue;

        const chardamage = directText(am, 'chardamage');
        const chardamtype = directText(am, 'chardamtype');
        const damage = chardamage ? `${chardamage} ${chardamtype}`.trim() : undefined;
        const reach = directText(am, 'charreach') || undefined;
        const parry = directText(am, 'charparryscore') || directText(am, 'charparry') || undefined;
        const notes = directText(am, 'notes') || undefined;
        const lc = directText(am, 'lc') || undefined;
        const stReq = directText(am, 'charminst') || undefined;
        const weaponLabel = `${itemName} — ${amName}`;

        // Ranged if it has acc/range fields
        const acc = directText(am, 'acc');
        const range = directText(am, 'charrange') || directText(am, 'range');
        const isRanged = !!(acc || range);

        if (isRanged) {
          rangedWeapons.push({
            weapon: weaponLabel,
            damage,
            acc: acc || undefined,
            range: range || undefined,
            rof: directText(am, 'rof') || undefined,
            shots: directText(am, 'shots') || undefined,
            st: stReq,
            bulk: directText(am, 'bulk') || undefined,
            rcl: directText(am, 'rcl') || undefined,
            lc,
            notes,
          });
        } else {
          handWeapons.push({ weapon: weaponLabel, damage, reach, parry, notes, cost, weight });
        }
      }
    } else {
      possessions.push({ item: itemName, location, cost, weight });
    }
  }

  result.handWeapons = handWeapons;
  result.rangedWeapons = rangedWeapons;
  result.possessions = possessions;

  return { data: result, warnings };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GCA TXT PARSER
// ═══════════════════════════════════════════════════════════════════════════════

function parseGcaTxt(text: string): GcaImportResult {
  const warnings: string[] = [];
  const result: Partial<GurpsSheetData> = {};
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));

  // ── Split into named sections ─────────────────────────────────────────────
  const sections: Record<string, string[]> = {};
  let currentSection = 'header';
  sections[currentSection] = [];

  for (const line of lines) {
    if (/^-{20,}$/.test(line.trim())) continue; // skip separator lines
    const secMatch = line.match(
      /^(Attributes|Advantages|Disadvantages|Quirks|Skills|Melee Attacks|Ranged Attacks|Equipment|Points Summary|Social Background)\s*(\[.*\])?$/,
    );
    if (secMatch) {
      currentSection = secMatch[1].toLowerCase().replace(' ', '_');
      sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  }

  // ── Header: Name / Player / Appearance ───────────────────────────────────
  const header = (sections['header'] ?? []).join('\n');
  const playerMatch = header.match(/^Player:\s*(.+)$/m);
  if (playerMatch) result.player = playerMatch[1].trim();

  const appMatch = header.match(/^Appearance:\s*([\s\S]+?)(?=\n\n\S|\n[A-Z][a-z]+:|\n*$)/m);
  if (appMatch) result.appearance = appMatch[1].trim() || undefined;

  // ── Attributes ────────────────────────────────────────────────────────────
  const attrLines = sections['attributes'] ?? [];
  const ATTR_KEYS: Record<string, keyof GurpsSheetData> = {
    ST: 'st',
    DX: 'dx',
    IQ: 'iq',
    HT: 'ht',
    'Hit Points': 'hp',
    Will: 'will',
    Perception: 'per',
    'Fatigue Points': 'fp',
  };
  for (const line of attrLines) {
    const m = line.match(/^(ST|DX|IQ|HT|Hit Points|Will|Perception|Fatigue Points)\s+(-?\d+(?:\.\d+)?)/);
    if (m) {
      const key = ATTR_KEYS[m[1]];
      if (key) (result as Record<string, unknown>)[key] = parseFloat(m[2]);
    }
    // Basic Speed / Basic Move
    const bsMatch = line.match(/^Basic Speed\s+(-?\d+(?:\.\d+)?)/);
    if (bsMatch && result.dx !== undefined && result.ht !== undefined) {
      const rawSpeed = parseFloat(bsMatch[1]);
      const calcSpeed = (result.dx + result.ht) / 4;
      const mod = Math.round((rawSpeed - calcSpeed) * 100) / 100;
      if (mod !== 0) result.basicSpeedMod = mod;
    }
    const bmMatch = line.match(/^Basic Move\s+(-?\d+(?:\.\d+)?)/);
    if (bmMatch) {
      const rawMove = parseFloat(bmMatch[1]);
      // Will be compared after speed is known
      const calcMove = Math.floor(((result.dx ?? 10) + (result.ht ?? 10)) / 4 + (result.basicSpeedMod ?? 0));
      const mod = rawMove - calcMove;
      if (mod !== 0) result.basicMoveMod = mod;
    }
    // TL
    const tlMatch = line.match(/^TL:\s*(\d+)/);
    if (tlMatch) result.tl = tlMatch[1];
  }

  // ── Helper: parse "[points]" suffix from a trait line ────────────────────
  function parseTraitLine(line: string): { name: string; points?: number } | null {
    const m = line.match(/^(.+?)\s+\[(-?\d+)\]\s*$/);
    if (!m) return null;
    return { name: m[1].trim(), points: parseInt(m[2], 10) };
  }

  // ── Advantages ────────────────────────────────────────────────────────────
  result.advantages = (sections['advantages'] ?? [])
    .filter((l) => l.trim() && !l.startsWith('\t'))
    .map(parseTraitLine)
    .filter(Boolean) as GurpsListItem[];

  // ── Disadvantages ─────────────────────────────────────────────────────────
  result.disadvantages = [...(sections['disadvantages'] ?? []), ...(sections['quirks'] ?? [])]
    .filter((l) => l.trim() && !l.startsWith('\t'))
    .map(parseTraitLine)
    .filter(Boolean) as GurpsListItem[];

  // ── Skills ────────────────────────────────────────────────────────────────
  // Format: "Acting (A) IQ [2]-14"  or "Detect Lies (H) Per+1 [1]-13"
  const skills: GurpsSkill[] = [];
  for (const line of sections['skills'] ?? []) {
    if (!line.trim() || line.startsWith('\t')) continue;
    // Match: Name (optional-spec) (difficulty?) relLevel [pts]-level
    const m = line.match(/^(.+?)\s+\[(-?\d+)\]-(\d+)\s*$/);
    if (!m) continue;

    const descriptor = m[1].trim(); // "Acting (A) IQ" or "Detect Lies (H) Per+1"
    const points = parseInt(m[2], 10);
    const level = parseInt(m[3], 10);

    // Extract relative level (last token before the [pts])
    const relMatch = descriptor.match(/\s+((?:[A-Z][a-z]*|Per|Will)(?:[+\-]\d+)?)\s*$/);
    const relativeLevel = relMatch ? relMatch[1] : undefined;

    // Remove the relative level suffix and difficulty marker to get clean name
    let name = relMatch ? descriptor.slice(0, -relMatch[0].length).trim() : descriptor;
    // Remove trailing difficulty indicator like "(A)", "(H)", "(E)", "(VH)"
    name = name.replace(/\s*\([A-Z]{1,2}\)\s*$/, '').trim();

    skills.push({ name, level, relativeLevel, points });
  }
  result.skills = skills;

  // ── Melee weapons ─────────────────────────────────────────────────────────
  // Lines can be:
  //   "Bite; Dam:X; Reach:Y; Skill:Z; Level:N; Parry:P; LC:L" — direct attack
  //   "Quarterstaff (Expensive, +1 CF)"                        — weapon header
  //   "   Staff Swing; Dam:X; ..."                             — sub-attack (indented)
  const handWeapons: GurpsWeapon[] = [];
  let currentWeaponName = '';
  for (const line of sections['melee_attacks'] ?? []) {
    if (!line.trim()) continue;
    const isIndented = line.startsWith('   ');
    const content = line.trim();

    if (!content.includes(';')) {
      // Weapon container header
      currentWeaponName = content;
      continue;
    }

    const parts: Record<string, string> = {};
    content.split(';').forEach((seg) => {
      const kv = seg.trim().match(/^([^:]+):\s*(.*)$/);
      if (kv) parts[kv[1].trim().toLowerCase()] = kv[2].trim();
    });

    // First segment before first `;` is the weapon/attack name
    const attackName = content.split(';')[0].trim();
    const weaponLabel = isIndented && currentWeaponName ? `${currentWeaponName} — ${attackName}` : attackName;

    const damageParts = parts['dam']?.split(' ') ?? [];
    const damage = damageParts.length >= 2 ? `${damageParts[0]} ${damageParts[1]}` : parts['dam'] || undefined;

    handWeapons.push({
      weapon: weaponLabel,
      damage: damage || undefined,
      reach: parts['reach'] || undefined,
      parry: parts['parry'] === 'No' ? 'No' : parts['parry'] || undefined,
      notes: parts['notes'] || undefined,
    });
  }
  result.handWeapons = handWeapons;

  // ── Ranged weapons ────────────────────────────────────────────────────────
  // "Small Knife; Dam:1d-1 imp; Acc:0; Range:5 / 10; RoF:1; Shots:T(1); Level:7; ST:5; Bulk:-1; Rcl:-; LC:4"
  const rangedWeapons: GurpsRangedWeapon[] = [];
  for (const line of sections['ranged_attacks'] ?? []) {
    if (!line.trim() || !line.includes(';')) continue;
    const parts: Record<string, string> = {};
    line.split(';').forEach((seg) => {
      const kv = seg.trim().match(/^([^:]+):\s*(.*)$/);
      if (kv) parts[kv[1].trim().toLowerCase()] = kv[2].trim();
    });

    const weaponName = line.split(';')[0].trim();
    const damageParts = parts['dam']?.split(' ') ?? [];
    const damage = damageParts.length >= 2 ? `${damageParts[0]} ${damageParts[1]}` : parts['dam'] || undefined;

    rangedWeapons.push({
      weapon: weaponName,
      damage: damage || undefined,
      acc: parts['acc'] || undefined,
      range: parts['range'] || undefined,
      rof: parts['rof'] || undefined,
      shots: parts['shots'] || undefined,
      st: parts['st'] || undefined,
      bulk: parts['bulk'] || undefined,
      rcl: parts['rcl'] || undefined,
      lc: parts['lc'] || undefined,
    });
  }
  result.rangedWeapons = rangedWeapons;

  // ── Equipment/Possessions ─────────────────────────────────────────────────
  // "Backpack, Frame; Qty:1; Wgt:5; ¤100.00"
  const possessions: GurpsPossession[] = [];
  for (const line of sections['equipment'] ?? []) {
    if (!line.trim() || !line.includes(';')) continue;
    const segs = line.split(';').map((s) => s.trim());
    const name = segs[0];
    const parts: Record<string, string> = {};
    segs.slice(1).forEach((seg) => {
      const kv = seg.match(/^([^:]+):\s*(.*)$/);
      if (kv) parts[kv[1].trim().toLowerCase()] = kv[2].trim();
    });
    const weight = parseFloat(parts['wgt'] ?? '');
    // Cost: strip currency symbol (¤) and commas
    const costStr = (parts['¤'] ?? segs.find((s) => s.includes('¤'))?.replace(/.*¤/, '') ?? '').replace(/,/g, '');
    const cost = parseFloat(costStr);
    possessions.push({
      item: name,
      weight: !isNaN(weight) ? weight : undefined,
      cost: !isNaN(cost) ? cost : undefined,
    });
  }
  result.possessions = possessions;

  return { data: result, warnings };
}
