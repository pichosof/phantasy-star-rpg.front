import { http } from './http.api';

// ── GURPS data shape ──────────────────────────────────────────────────────────

export interface GurpsWeapon { weapon?: string; damage?: string; reach?: string; parry?: string; notes?: string; cost?: number; weight?: number }
export interface GurpsRangedWeapon { weapon?: string; damage?: string; acc?: string; range?: string; rof?: string; shots?: string; st?: string; bulk?: string; rcl?: string; lc?: string; notes?: string; cost?: number; weight?: number }
export interface GurpsPossession { item?: string; location?: string; cost?: number; weight?: number }
export interface GurpsListItem { name?: string; points?: number }
export interface GurpsSkill { name?: string; level?: number; relativeLevel?: string; points?: number }
export interface GurpsLanguage { name?: string; spoken?: string; written?: string }

export interface GurpsSheetData {
  // Identity
  player?: string; pointTotal?: number; unspentPts?: number;
  heightCm?: number; weightKg?: number; sizeModifier?: number; age?: number; appearance?: string;
  // Primary attributes
  st?: number; dx?: number; iq?: number; ht?: number;
  // Secondary (overrideable)
  hp?: number; will?: number; per?: number; fp?: number;
  currentHp?: number; currentFp?: number;
  // Secondary modifiers
  basicSpeedMod?: number; basicMoveMod?: number;
  // Combat
  dr?: string; parry?: string; block?: string; tl?: string;
  // Arrays
  languages?: GurpsLanguage[];
  culturalFamiliarities?: Array<{ name?: string; points?: number }>;
  advantages?: GurpsListItem[];
  disadvantages?: GurpsListItem[];
  skills?: GurpsSkill[];
  handWeapons?: GurpsWeapon[];
  rangedWeapons?: GurpsRangedWeapon[];
  possessions?: GurpsPossession[];
  reactionModifiers?: { appearance?: string; status?: string; reputation?: string };
  characterNotes?: string;
}

// ── Starfinder data shape ──────────────────────────────────────────────────────

export interface SfSkill { ranks?: number; classBonus?: boolean; miscMod?: number }
export interface SfWeapon { name?: string; level?: string; attackBonus?: string; damage?: string; critical?: string; range?: string; type?: string; ammoUsage?: string; special?: string }
export interface SfEquipmentItem { name?: string; level?: string; bulk?: string }
export interface SfSpellLevel { spellsKnown?: number; spellsPerDay?: number; spellSlotsUsed?: number }

export interface StarfinderSheetData {
  // Identity
  description?: string; classLevel?: string; race?: string; theme?: string;
  size?: string; speedFt?: number; gender?: string; homeWorld?: string;
  alignment?: string; deity?: string; player?: string;
  // Ability scores
  str?: number; dex?: number; con?: number; int?: number; wis?: number; cha?: number;
  strUpgraded?: number; dexUpgraded?: number; conUpgraded?: number;
  intUpgraded?: number; wisUpgraded?: number; chaUpgraded?: number;
  // Initiative
  initiativeMisc?: number;
  // HP
  staminaTotal?: number; staminaCurrent?: number;
  hpTotal?: number; hpCurrent?: number;
  resolveTotal?: number; resolveCurrent?: number;
  // Armor
  armorBonus?: number; armorKacBonus?: number; armorMaxDex?: number; armorMiscMod?: number;
  dr?: string; resistances?: string;
  // Saving throws
  fortBase?: number; fortMisc?: number;
  refBase?: number; refMisc?: number;
  willBase?: number; willMisc?: number;
  // Attack
  bab?: number; meleeMisc?: number; rangedMisc?: number; thrownMisc?: number;
  // Skills
  skills?: Record<string, SfSkill>;
  armorCheckPenalty?: number; skillRanksPerLevel?: number;
  // Weapons
  weapons?: SfWeapon[];
  // Armor equipment
  armorModel?: string; armorLevel?: number; armorEacBonus?: number; armorKacBonusEq?: number;
  armorEquipMaxDex?: number; armorBulk?: string; armorAcPenalty?: number;
  armorSpeedAdj?: string; armorUpgradeSlots?: number; armorNotes?: string;
  // Abilities / feats
  abilities?: string[]; feats?: string[];
  // Spells
  spellsKnownTotal?: number; spellsList?: string[];
  spellSlots?: Record<string, SfSpellLevel>;
  // Equipment
  equipment?: SfEquipmentItem[]; credits?: number; otherWealth?: string;
  backpacksCommercial?: boolean; backpacksIndustrial?: boolean;
  // Languages / XP
  languages?: string[]; xpEarned?: number; xpNextLevel?: number;
}

// ── API types ─────────────────────────────────────────────────────────────────

export type SheetType = 'gurps' | 'starfinder';

export interface CharacterSheet {
  id: number;
  type: SheetType;
  name: string;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export async function listCharacterSheets(type?: SheetType): Promise<CharacterSheet[]> {
  const { data } = await http.get('/api/gm/sheets', { params: type ? { type } : undefined });
  return data;
}

export async function getCharacterSheet(id: number): Promise<CharacterSheet> {
  const { data } = await http.get(`/api/gm/sheets/${id}`);
  return data;
}

export async function createCharacterSheet(body: { type: SheetType; name: string; data?: Record<string, unknown> }): Promise<CharacterSheet> {
  const { data } = await http.post('/api/gm/sheets', body);
  return data;
}

export async function updateCharacterSheet(id: number, body: { name?: string; data?: Record<string, unknown> }): Promise<void> {
  await http.patch(`/api/gm/sheets/${id}`, body);
}

export async function deleteCharacterSheet(id: number): Promise<void> {
  await http.delete(`/api/gm/sheets/${id}`);
}
