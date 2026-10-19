/**
 * Hephaistos import (Starfinder)
 *
 * Hephaistos (hephaistos.online) exports a filled, form-based PDF of the official
 * Starfinder character sheet. Its AcroForm fields carry every value with stable names
 * (strengthScore, perception[0..5], weapon1[0..8], equipment[i]…), so we read the fields
 * with pdf.js — no text scraping.
 */
import * as pdfjs from 'pdfjs-dist';
import type {
  SfEquipmentItem,
  SfSkill,
  SfSpellLevel,
  SfWeapon,
  StarfinderSheetData,
} from '@app/api/character-sheets.api';
import { PDF_WORKER_URL } from '@app/config/pdf';
import { abilityMod } from '@app/utils/starfinder-calc';

export interface HephaistosImportResult {
  data: StarfinderSheetData;
  warnings: string[];
}

type Fields = Record<string, string>;

/** Reads every AcroForm field of the PDF as name → value. */
async function readFields(file: File): Promise<Fields> {
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  try {
    const objects = ((await doc.getFieldObjects()) ?? {}) as Record<string, Array<{ value?: unknown }>>;
    const out: Fields = {};
    for (const [name, widgets] of Object.entries(objects)) {
      const value = widgets.map((w) => w.value).find((v) => typeof v === 'string' && v !== '');
      out[name] = typeof value === 'string' ? value.trim() : '';
    }
    return out;
  } finally {
    await doc.destroy();
  }
}

const num = (v: string | undefined): number | undefined => {
  if (v === undefined) return undefined;
  const m = v.replace(',', '.').match(/[-+]?\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
};
const str = (v: string | undefined): string | undefined => (v && v.trim() ? v.trim() : undefined);
const list = (f: Fields, base: string, from = 0, to = 40): string[] => {
  const out: string[] = [];
  for (let i = from; i <= to; i += 1) {
    const v = str(f[`${base}[${i}]`]);
    if (v) out.push(v);
  }
  return out;
};

/** Hephaistos field base → key used by the app's Starfinder sheet. */
const SKILL_KEYS: Record<string, string> = {
  acrobatics: 'acrobatics',
  athletics: 'athletics',
  bluff: 'bluff',
  computers: 'computers',
  culture: 'culture',
  diplomacy: 'diplomacy',
  disguise: 'disguise',
  engineering: 'engineering',
  intimidate: 'intimidate',
  lifeScience: 'life_science',
  medicine: 'medicine',
  mysticism: 'mysticism',
  perception: 'perception',
  physicalScience: 'physical_science',
  piloting: 'piloting',
  profession1: 'profession1',
  profession2: 'profession2',
  senseMotive: 'sense_motive',
  sleightOfHand: 'sleight_of_hand',
  stealth: 'stealth',
  survival: 'survival',
};

const SPELL_LEVELS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export function isHephaistosSheet(f: Fields): boolean {
  return 'strengthScore' in f && 'perception[1]' in f && 'weapon1[0]' in f;
}

export function mapHephaistos(f: Fields): HephaistosImportResult {
  const warnings: string[] = [];

  const score = (k: string) => num(f[k]) ?? 10;
  const abilityMods = {
    cha: abilityMod(score('charismaScore')),
    int: abilityMod(score('intelligenceScore')),
    wis: abilityMod(score('wisdomScore')),
  };

  // skills: [0] total · [1] ranks · [2] class bonus · [3] ability · [4] misc · [5] profession name
  const skills: Record<string, SfSkill> = {};
  for (const [heph, key] of Object.entries(SKILL_KEYS)) {
    if (!(`${heph}[1]` in f)) continue;
    const ranks = num(f[`${heph}[1]`]) ?? 0;
    const classBonus = f[`${heph}ClassSkill`] === 'Yes' || num(f[`${heph}[2]`]) === 3;
    const skill: SfSkill = { ranks, classBonus, miscMod: num(f[`${heph}[4]`]) ?? 0 };
    const name = str(f[`${heph}[5]`]);
    if (name) skill.name = name;
    if (key.startsWith('profession')) {
      if (!name && ranks === 0) continue;
      // Profession uses Cha, Int or Wis: pick the one whose modifier the PDF printed.
      const printed = num(f[`${heph}[3]`]);
      const candidates = (['cha', 'int', 'wis'] as const).filter((a) => abilityMods[a] === printed);
      if (candidates.length && !candidates.includes('cha')) skill.ability = candidates[0];
    }
    skills[key] = skill;
  }

  const weapons: SfWeapon[] = [];
  for (let w = 1; w <= 8; w += 1) {
    const name = str(f[`weapon${w}[0]`]);
    if (!name) continue;
    weapons.push({
      name,
      level: str(f[`weapon${w}[1]`]),
      attackBonus: str(f[`weapon${w}[2]`]),
      damage: str(f[`weapon${w}[3]`]),
      critical: str(f[`weapon${w}[4]`]),
      range: str(f[`weapon${w}[5]`]),
      type: str(f[`weapon${w}[6]`]),
      ammoUsage: str(f[`weapon${w}[7]`]),
      special: str(f[`weapon${w}[8]`]),
    });
  }

  const equipment: SfEquipmentItem[] = [];
  for (let i = 0; i <= 40; i += 1) {
    const name = str(f[`equipment[${i}]`]);
    if (name) equipment.push({ name, level: str(f[`level[${i}]`]), bulk: str(f[`bulk[${i}]`]) });
  }

  // "proficiencies" is a titled list: Weapon Proficiencies / Armor Proficiences / Feats
  const profLines = list(f, 'proficiencies');
  const feats: string[] = [];
  const proficiencyNotes: string[] = [];
  let section = '';
  for (const line of profLines) {
    if (/^(weapon|armor)\s+profici/i.test(line)) section = line;
    else if (/^feats$/i.test(line)) section = 'Feats';
    else if (section === 'Feats') feats.push(...line.split(/,\s*/).filter(Boolean));
    else proficiencyNotes.push(section ? `${section}: ${line}` : line);
  }
  const abilities = [...list(f, 'abilities'), ...proficiencyNotes];

  const spellsList: string[] = [];
  for (let lvl = 0; lvl <= 6; lvl += 1) spellsList.push(...list(f, `spell${lvl}`));
  const spellSlots: Record<string, SfSpellLevel> = {};
  SPELL_LEVELS.forEach((label, i) => {
    const level = i + 1;
    const slot: SfSpellLevel = {
      spellsKnown: num(f[`spellsKnown[${level}]`]),
      spellsPerDay: num(f[`spellsPerDay[${level}]`]),
      spellSlotsUsed: num(f[`spellsUsed[${level}]`]),
    };
    if (slot.spellsKnown || slot.spellsPerDay || slot.spellSlotsUsed) spellSlots[label] = slot;
  });

  // Armor: EAC/KAC [1] armor bonus · [2] Dex applied (lower than the Dex mod = armor max Dex) · [3] misc
  const dexMod = num(f.dexterityMod);
  const dexInAc = num(f['eac[2]']);
  const armorMaxDex = dexMod !== undefined && dexInAc !== undefined && dexInAc < dexMod ? dexInAc : undefined;

  const data: StarfinderSheetData = {
    description: str(f.description),
    classLevel: str(f.classLevel),
    race: str(f.race),
    theme: str(f.theme),
    size: str(f.size),
    speedFt: num(f.speed),
    gender: str(f.gender),
    homeWorld: str(f.homeWorld),
    alignment: str(f.alignment),
    deity: str(f.deity),
    player: str(f.player),
    str: num(f.strengthScore),
    dex: num(f.dexterityScore),
    con: num(f.constitutionScore),
    int: num(f.intelligenceScore),
    wis: num(f.wisdomScore),
    cha: num(f.charismaScore),
    initiativeMisc: num(f.initiativeMisc),
    staminaTotal: num(f.staminaPoints),
    staminaCurrent: num(f.currentStaminaPoints) ?? num(f.staminaPoints),
    hpTotal: num(f.hitPoints),
    hpCurrent: num(f.currentHitPoints) ?? num(f.hitPoints),
    resolveTotal: num(f.resolvePoints),
    resolveCurrent: num(f.currentResolvePoints) ?? num(f.resolvePoints),
    armorBonus: num(f['eac[1]']),
    armorKacBonus: num(f['kac[1]']),
    armorMaxDex,
    armorMiscMod: num(f['eac[3]']),
    dr: str(f.dr),
    resistances: str(f.er),
    fortBase: num(f['fortitude[1]']),
    fortMisc: num(f['fortitude[3]']),
    refBase: num(f['reflex[1]']),
    refMisc: num(f['reflex[3]']),
    willBase: num(f['will[1]']),
    willMisc: num(f['will[3]']),
    bab: num(f.bab),
    meleeMisc: num(f['melee[3]']),
    rangedMisc: num(f['ranged[3]']),
    thrownMisc: num(f['thrown[3]']),
    skills,
    skillRanksPerLevel: num(f.skillRanksPerLevel),
    weapons,
    abilities,
    feats,
    spellsList,
    spellSlots,
    equipment,
    credits: num(f.credits),
    otherWealth: list(f, 'otherWealth').join('\n') || undefined,
    languages: (str(f['languages[0]']) ?? '')
      .split(/,\s*/)
      .concat(list(f, 'languages', 1))
      .filter(Boolean),
    xpEarned: num(f.xpEarned),
    xpNextLevel: num(f.xpNextLevel),
  };

  // Hephaistos prints totals too: flag the ones the app would compute differently.
  if (num(f['eac[2]']) !== undefined && f['kac[3]'] && f['kac[3]'] !== f['eac[3]']) {
    warnings.push('EAC and KAC have different misc modifiers; the sheet keeps one shared armor misc.');
  }
  if (!f.name) warnings.push('The PDF has no character name.');
  if (weapons.length === 0) warnings.push('No weapons found in the PDF.');

  return { data, warnings };
}

export async function importHephaistosFile(file: File): Promise<HephaistosImportResult & { name?: string }> {
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    throw new Error('Choose the PDF exported by Hephaistos.');
  }
  const fields = await readFields(file);
  if (!isHephaistosSheet(fields)) {
    throw new Error('This PDF is not a Hephaistos Starfinder sheet (no form fields found).');
  }
  return { ...mapHephaistos(fields), name: str(fields.name) };
}
