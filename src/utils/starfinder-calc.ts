import type { SfSkill, StarfinderSheetData } from '@app/api/character-sheets.api';

/** Starfinder 1e derived values (pure: used by the sheet form and the Hephaistos import checks). */
export function abilityMod(score: number) {
  return Math.floor((score - 10) / 2);
}

export function calcStarfinder(d: StarfinderSheetData) {
  const str = d.str ?? 10,
    dex = d.dex ?? 10,
    con = d.con ?? 10;
  const intScore = d.int ?? 10,
    wis = d.wis ?? 10,
    cha = d.cha ?? 10;
  const mods = {
    str: abilityMod(str),
    dex: abilityMod(dex),
    con: abilityMod(con),
    int: abilityMod(intScore),
    wis: abilityMod(wis),
    cha: abilityMod(cha),
  };

  const effectiveDex = d.armorMaxDex !== undefined ? Math.min(mods.dex, d.armorMaxDex) : mods.dex;
  const eac = 10 + (d.armorBonus ?? 0) + effectiveDex + (d.armorMiscMod ?? 0);
  const kac = 10 + (d.armorKacBonus ?? 0) + effectiveDex + (d.armorMiscMod ?? 0);
  const acvsm = 8 + kac;

  const initiative = mods.dex + (d.initiativeMisc ?? 0);
  const fort = (d.fortBase ?? 0) + mods.con + (d.fortMisc ?? 0);
  const ref = (d.refBase ?? 0) + mods.dex + (d.refMisc ?? 0);
  const will = (d.willBase ?? 0) + mods.wis + (d.willMisc ?? 0);

  const bab = d.bab ?? 0;
  const melee = bab + mods.str + (d.meleeMisc ?? 0);
  const ranged = bab + mods.dex + (d.rangedMisc ?? 0);
  const thrown = bab + mods.str + (d.thrownMisc ?? 0);

  const carryUnenc = Math.floor(str / 2);
  const carryEnc = carryUnenc + 1;
  const carryOver = carryUnenc + 6;

  return { mods, eac, kac, acvsm, initiative, fort, ref, will, melee, ranged, thrown, carryUnenc, carryEnc, carryOver };
}

export type SfAbility = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

/**
 * Skill bonus per the Starfinder rules: the +3 class-skill bonus only applies with at
 * least 1 rank, and a skill may override its default ability (Profession).
 */
export function skillBreakdown(skill: SfSkill | undefined, defaultAbility: SfAbility, mods: Record<SfAbility, number>) {
  const ranks = skill?.ranks ?? 0;
  const ability = skill?.ability ?? defaultAbility;
  const classBonus = skill?.classBonus && ranks > 0 ? 3 : 0;
  const misc = skill?.miscMod ?? 0;
  const attrMod = mods[ability];
  return { ranks, ability, classBonus, misc, attrMod, total: ranks + classBonus + attrMod + misc };
}
