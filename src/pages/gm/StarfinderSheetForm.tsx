/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Input, InputNumber, Space, Switch, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Collapse as AdmMobileCollapse,
  Input as AdmMobileInput,
  Stepper as AdmMobileStepper,
  Switch as AdmMobileSwitch,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import { AddOutline, DeleteOutline } from 'antd-mobile-icons';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Collapse } from '@app/components/common/Collapse/Collapse';
import { AppIcon } from '@app/components/common/AppIcon/AppIcon';
import { MobileCard, MobileForm } from '@app/components/common/mobile';
import { useResponsive } from '@app/hooks/useResponsive';
import type { StarfinderSheetData, SfWeapon, SfEquipmentItem } from '@app/api/character-sheets.api';
import { w100, textSm, dividerMd } from '@app/styles/styleUtils';
import * as S from './StarfinderSheetForm.styles';

// ── Calculations ──────────────────────────────────────────────────────────────

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

// ── SF Skills list ─────────────────────────────────────────────────────────────

const SF_SKILLS: Array<{
  key: string;
  label: string;
  attr: keyof ReturnType<typeof calcStarfinder>['mods'];
  trainedOnly?: boolean;
}> = [
  { key: 'acrobatics', label: 'Acrobatics', attr: 'dex' },
  { key: 'athletics', label: 'Athletics', attr: 'str' },
  { key: 'bluff', label: 'Bluff', attr: 'cha' },
  { key: 'computers', label: 'Computers', attr: 'int', trainedOnly: true },
  { key: 'culture', label: 'Culture', attr: 'int', trainedOnly: true },
  { key: 'diplomacy', label: 'Diplomacy', attr: 'cha' },
  { key: 'disguise', label: 'Disguise', attr: 'cha' },
  { key: 'engineering', label: 'Engineering', attr: 'int', trainedOnly: true },
  { key: 'intimidate', label: 'Intimidate', attr: 'cha' },
  { key: 'life_science', label: 'Life Science', attr: 'int', trainedOnly: true },
  { key: 'medicine', label: 'Medicine', attr: 'int', trainedOnly: true },
  { key: 'mysticism', label: 'Mysticism', attr: 'wis', trainedOnly: true },
  { key: 'perception', label: 'Perception', attr: 'wis' },
  { key: 'physical_science', label: 'Physical Science', attr: 'int', trainedOnly: true },
  { key: 'piloting', label: 'Piloting', attr: 'dex' },
  { key: 'profession1', label: 'Profession (1)', attr: 'cha' },
  { key: 'profession2', label: 'Profession (2)', attr: 'cha' },
  { key: 'sense_motive', label: 'Sense Motive', attr: 'wis' },
  { key: 'sleight_of_hand', label: 'Sleight of Hand', attr: 'dex', trainedOnly: true },
  { key: 'stealth', label: 'Stealth', attr: 'dex' },
  { key: 'survival', label: 'Survival', attr: 'wis' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const LabelInput = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Typography.Text type="secondary" style={S.labelText}>
      {label}
    </Typography.Text>
    {children}
  </div>
);

const CalcBox = ({ label, value, color }: { label: string; value: number | string; color?: string }) => (
  <div style={S.calcBox(color)}>
    <div style={S.calcBoxLabel}>{label}</div>
    <div style={S.calcBoxValueColor(color)}>{value}</div>
  </div>
);

function sign(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}

const MobileTextField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <MobileForm.Item label={label}>
    <AdmMobileInput clearable placeholder={placeholder ?? label} value={value ?? ''} onChange={onChange} />
  </MobileForm.Item>
);

const MobileNumberField = ({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  min?: number;
}) => (
  <MobileForm.Item label={label}>
    <AdmMobileStepper min={min} value={value ?? 0} onChange={onChange} />
  </MobileForm.Item>
);

const MobileBooleanField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: (value: boolean) => void;
}) => (
  <MobileForm.Item label={label}>
    <AdmMobileSwitch checked={!!checked} onChange={onChange} />
  </MobileForm.Item>
);

function MobileStringListSection({
  items,
  onChange,
  addLabel,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder: string;
}) {
  return (
    <S.MobileList>
      {items.map((item, idx) => (
        <S.MobileListItem key={`${placeholder}-${idx}`}>
          <MobileForm>
            <MobileTextField
              label={`${placeholder} ${idx + 1}`}
              value={item}
              onChange={(value) => {
                const next = [...items];
                next[idx] = value;
                onChange(next);
              }}
            />
          </MobileForm>
          <S.MobileListActions>
            <AdmMobileButton
              color="danger"
              fill="outline"
              size="small"
              onClick={() => onChange(items.filter((_, itemIdx) => itemIdx !== idx))}
            >
              <DeleteOutline /> Remove
            </AdmMobileButton>
          </S.MobileListActions>
        </S.MobileListItem>
      ))}
      <AdmMobileButton block color="primary" fill="outline" onClick={() => onChange([...items, ''])}>
        <AddOutline /> {addLabel}
      </AdmMobileButton>
    </S.MobileList>
  );
}

function MobileArraySection<T extends object>({
  items,
  onChange,
  blank,
  renderRow,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  blank: T;
  renderRow: (item: T, idx: number, update: (item: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <S.MobileList>
      {items.map((item, idx) => (
        <S.MobileListItem key={idx}>
          {renderRow(item, idx, (nextItem) => {
            const next = [...items];
            next[idx] = nextItem;
            onChange(next);
          })}
          <S.MobileListActions>
            <AdmMobileButton
              color="danger"
              fill="outline"
              size="small"
              onClick={() => onChange(items.filter((_, itemIdx) => itemIdx !== idx))}
            >
              <DeleteOutline /> Remove
            </AdmMobileButton>
          </S.MobileListActions>
        </S.MobileListItem>
      ))}
      <AdmMobileButton block color="primary" fill="outline" onClick={() => onChange([...items, { ...blank }])}>
        <AddOutline /> {addLabel}
      </AdmMobileButton>
    </S.MobileList>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface Props {
  data: StarfinderSheetData;
  onChange: (d: StarfinderSheetData) => void;
}

export const StarfinderSheetForm: React.FC<Props> = ({ data, onChange }) => {
  const { mobileOnly } = useResponsive();
  const calc = React.useMemo(() => calcStarfinder(data), [data]);
  const set = (patch: Partial<StarfinderSheetData>) => onChange({ ...data, ...patch });

  const skills = data.skills ?? {};
  const weapons: SfWeapon[] = data.weapons ?? [{}, {}, {}, {}];
  const equipment: SfEquipmentItem[] = data.equipment ?? [];
  const abilities = data.abilities ?? [];
  const feats = data.feats ?? [];
  const languages = data.languages ?? [];
  const spellsList = data.spellsList ?? [];
  const spellSlots = data.spellSlots ?? {};

  function setSkill(key: string, patch: Partial<{ ranks: number; classBonus: boolean; miscMod: number }>) {
    set({ skills: { ...skills, [key]: { ...skills[key], ...patch } } });
  }

  if (mobileOnly) {
    return (
      <S.MobileStack>
        <AdmMobileCollapse defaultActiveKey={['identity', 'stats']}>
          <AdmMobileCollapse.Panel key="identity" title="Identity">
            <MobileCard compact>
              <MobileForm>
                <S.MobileGrid>
                  <MobileTextField
                    label="Description"
                    value={data.description}
                    onChange={(value) => set({ description: value })}
                  />
                  <MobileTextField
                    label="Class/Level"
                    value={data.classLevel}
                    onChange={(value) => set({ classLevel: value })}
                  />
                  <MobileTextField label="Race" value={data.race} onChange={(value) => set({ race: value })} />
                  <MobileTextField label="Theme" value={data.theme} onChange={(value) => set({ theme: value })} />
                  <MobileTextField label="Size" value={data.size} onChange={(value) => set({ size: value })} />
                  <MobileNumberField
                    label="Speed (ft)"
                    value={data.speedFt}
                    min={0}
                    onChange={(value) => set({ speedFt: value })}
                  />
                  <MobileTextField label="Gender" value={data.gender} onChange={(value) => set({ gender: value })} />
                  <MobileTextField
                    label="Home World"
                    value={data.homeWorld}
                    onChange={(value) => set({ homeWorld: value })}
                  />
                  <MobileTextField
                    label="Alignment"
                    value={data.alignment}
                    onChange={(value) => set({ alignment: value })}
                  />
                  <MobileTextField label="Deity" value={data.deity} onChange={(value) => set({ deity: value })} />
                  <MobileTextField label="Player" value={data.player} onChange={(value) => set({ player: value })} />
                </S.MobileGrid>
              </MobileForm>
            </MobileCard>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="stats" title="Ability Scores">
            <S.MobileList>
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((attr) => {
                const base = data[attr] ?? 10;
                const upgradedKey = `${attr}Upgraded` as const;
                const upgraded = data[upgradedKey];
                const score = upgraded ?? base;
                const mod = abilityMod(score);

                return (
                  <S.MobileListItem key={attr}>
                    <S.MobileListHeader>
                      <span>{attr.toUpperCase()}</span>
                      <S.MobileListMeta>Modifier {sign(mod)}</S.MobileListMeta>
                    </S.MobileListHeader>
                    <MobileForm>
                      <S.MobileGrid>
                        <MobileNumberField
                          label="Base"
                          value={base}
                          min={1}
                          onChange={(value) => set({ [attr]: value })}
                        />
                        <MobileNumberField
                          label="Upgraded"
                          value={upgraded ?? base}
                          min={1}
                          onChange={(value) => set({ [upgradedKey]: value })}
                        />
                      </S.MobileGrid>
                    </MobileForm>
                  </S.MobileListItem>
                );
              })}
            </S.MobileList>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="combat" title="Combat">
            <S.MobileStack>
              <S.MobileStatGrid>
                {[
                  ['Initiative', sign(calc.initiative)],
                  ['EAC', calc.eac],
                  ['KAC', calc.kac],
                  ['AC vs CM', calc.acvsm],
                  ['Melee', sign(calc.melee)],
                  ['Ranged', sign(calc.ranged)],
                  ['Thrown', sign(calc.thrown)],
                  ['BAB', data.bab ?? 0],
                ].map(([label, value]) => (
                  <S.MobileStatCard key={label}>
                    <S.MobileStatLabel>{label}</S.MobileStatLabel>
                    <S.MobileStatValue>{value}</S.MobileStatValue>
                  </S.MobileStatCard>
                ))}
              </S.MobileStatGrid>

              <MobileCard compact>
                <MobileForm>
                  <S.MobileGrid>
                    <MobileNumberField
                      label="Armor Bonus (EAC)"
                      value={data.armorBonus ?? 0}
                      onChange={(value) => set({ armorBonus: value })}
                    />
                    <MobileNumberField
                      label="Armor Bonus (KAC)"
                      value={data.armorKacBonus ?? 0}
                      onChange={(value) => set({ armorKacBonus: value })}
                    />
                    <MobileNumberField
                      label="Max DEX"
                      value={data.armorMaxDex ?? 0}
                      onChange={(value) => set({ armorMaxDex: value })}
                    />
                    <MobileNumberField
                      label="Misc Armor"
                      value={data.armorMiscMod ?? 0}
                      onChange={(value) => set({ armorMiscMod: value })}
                    />
                    <MobileNumberField
                      label="Misc Initiative"
                      value={data.initiativeMisc ?? 0}
                      onChange={(value) => set({ initiativeMisc: value })}
                    />
                    <MobileNumberField label="BAB" value={data.bab ?? 0} onChange={(value) => set({ bab: value })} />
                    <MobileNumberField
                      label="Misc Melee"
                      value={data.meleeMisc ?? 0}
                      onChange={(value) => set({ meleeMisc: value })}
                    />
                    <MobileNumberField
                      label="Misc Ranged"
                      value={data.rangedMisc ?? 0}
                      onChange={(value) => set({ rangedMisc: value })}
                    />
                    <MobileNumberField
                      label="Misc Thrown"
                      value={data.thrownMisc ?? 0}
                      onChange={(value) => set({ thrownMisc: value })}
                    />
                    <MobileTextField label="DR" value={data.dr} onChange={(value) => set({ dr: value })} />
                    <MobileTextField
                      label="Resistances"
                      value={data.resistances}
                      onChange={(value) => set({ resistances: value })}
                    />
                  </S.MobileGrid>
                </MobileForm>
              </MobileCard>

              <S.MobileList>
                {(
                  [
                    ['fort', 'Fortitude', 'con', calc.fort],
                    ['ref', 'Reflex', 'dex', calc.ref],
                    ['will', 'Will', 'wis', calc.will],
                  ] as const
                ).map(([key, label, attr, total]) => (
                  <S.MobileListItem key={key}>
                    <S.MobileListHeader>
                      <span>{label}</span>
                      <S.MobileListMeta>
                        {sign(total)} | {attr.toUpperCase()} {sign(calc.mods[attr])}
                      </S.MobileListMeta>
                    </S.MobileListHeader>
                    <MobileForm>
                      <S.MobileGrid>
                        <MobileNumberField
                          label="Base"
                          value={(data as any)[`${key}Base`] ?? 0}
                          onChange={(value) => set({ [`${key}Base`]: value } as any)}
                        />
                        <MobileNumberField
                          label="Misc"
                          value={(data as any)[`${key}Misc`] ?? 0}
                          onChange={(value) => set({ [`${key}Misc`]: value } as any)}
                        />
                      </S.MobileGrid>
                    </MobileForm>
                  </S.MobileListItem>
                ))}
              </S.MobileList>
            </S.MobileStack>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="hp" title="Hit Points">
            <MobileCard compact>
              <MobileForm>
                <S.MobileGrid>
                  <MobileNumberField
                    label="Stamina Total"
                    value={data.staminaTotal}
                    min={0}
                    onChange={(value) => set({ staminaTotal: value })}
                  />
                  <MobileNumberField
                    label="Stamina Current"
                    value={data.staminaCurrent}
                    min={0}
                    onChange={(value) => set({ staminaCurrent: value })}
                  />
                  <MobileNumberField
                    label="HP Total"
                    value={data.hpTotal}
                    min={0}
                    onChange={(value) => set({ hpTotal: value })}
                  />
                  <MobileNumberField
                    label="HP Current"
                    value={data.hpCurrent}
                    min={0}
                    onChange={(value) => set({ hpCurrent: value })}
                  />
                  <MobileNumberField
                    label="Resolve Total"
                    value={data.resolveTotal}
                    min={0}
                    onChange={(value) => set({ resolveTotal: value })}
                  />
                  <MobileNumberField
                    label="Resolve Current"
                    value={data.resolveCurrent}
                    min={0}
                    onChange={(value) => set({ resolveCurrent: value })}
                  />
                </S.MobileGrid>
              </MobileForm>
            </MobileCard>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="skills" title="Skills">
            <S.MobileStack>
              <MobileCard compact>
                <MobileForm>
                  <S.MobileGrid>
                    <MobileNumberField
                      label="Ranks/Level"
                      value={data.skillRanksPerLevel}
                      min={0}
                      onChange={(value) => set({ skillRanksPerLevel: value })}
                    />
                    <MobileNumberField
                      label="Armor Check Penalty"
                      value={data.armorCheckPenalty ?? 0}
                      onChange={(value) => set({ armorCheckPenalty: value })}
                    />
                  </S.MobileGrid>
                </MobileForm>
              </MobileCard>

              <S.MobileList>
                {SF_SKILLS.map((sk) => {
                  const skill = skills[sk.key] ?? {};
                  const ranks = skill.ranks ?? 0;
                  const classBonus = skill.classBonus ? 3 : 0;
                  const misc = skill.miscMod ?? 0;
                  const attrMod = calc.mods[sk.attr];
                  const total = ranks + classBonus + attrMod + misc;

                  return (
                    <S.MobileListItem key={sk.key}>
                      <S.MobileListHeader>
                        <span>{sk.label}</span>
                        <S.MobileListMeta>
                          {sign(total)} | {sk.attr.toUpperCase()} {sign(attrMod)}
                        </S.MobileListMeta>
                      </S.MobileListHeader>
                      {sk.trainedOnly && <S.MobileHint>Trained only skill.</S.MobileHint>}
                      <MobileForm>
                        <S.MobileGrid>
                          <MobileNumberField
                            label="Ranks"
                            value={ranks}
                            min={0}
                            onChange={(value) => setSkill(sk.key, { ranks: value })}
                          />
                          <MobileBooleanField
                            label="Class Skill (+3)"
                            checked={skill.classBonus}
                            onChange={(value) => setSkill(sk.key, { classBonus: value })}
                          />
                          <MobileNumberField
                            label="Misc"
                            value={misc}
                            onChange={(value) => setSkill(sk.key, { miscMod: value })}
                          />
                        </S.MobileGrid>
                      </MobileForm>
                    </S.MobileListItem>
                  );
                })}
              </S.MobileList>
            </S.MobileStack>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="weapons" title={`Weapons (${weapons.length})`}>
            <MobileArraySection
              items={weapons}
              onChange={(value) => set({ weapons: value })}
              blank={{}}
              addLabel="Add weapon"
              renderRow={(weapon, idx, update) => (
                <MobileForm>
                  <S.MobileListHeader>
                    <span>Weapon {idx + 1}</span>
                  </S.MobileListHeader>
                  <MobileTextField
                    label="Name"
                    value={weapon.name}
                    onChange={(value) => update({ ...weapon, name: value })}
                  />
                  <S.MobileGrid>
                    {(
                      [
                        ['level', 'Level'],
                        ['attackBonus', 'Attack Bonus'],
                        ['damage', 'Damage'],
                        ['critical', 'Critical'],
                        ['range', 'Range'],
                        ['type', 'Type'],
                        ['ammoUsage', 'Ammo/Use'],
                        ['special', 'Special'],
                      ] as const
                    ).map(([field, label]) => (
                      <MobileTextField
                        key={field}
                        label={label}
                        value={weapon[field]}
                        onChange={(value) => update({ ...weapon, [field]: value })}
                      />
                    ))}
                  </S.MobileGrid>
                </MobileForm>
              )}
            />
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="armor" title="Equipped Armor">
            <MobileCard compact>
              <MobileForm>
                <S.MobileGrid>
                  <MobileTextField
                    label="Model"
                    value={data.armorModel}
                    onChange={(value) => set({ armorModel: value })}
                  />
                  <MobileNumberField
                    label="Level"
                    value={data.armorLevel}
                    min={0}
                    onChange={(value) => set({ armorLevel: value })}
                  />
                  <MobileNumberField
                    label="EAC Bonus"
                    value={data.armorEacBonus ?? 0}
                    onChange={(value) => set({ armorEacBonus: value })}
                  />
                  <MobileNumberField
                    label="KAC Bonus"
                    value={data.armorKacBonusEq ?? 0}
                    onChange={(value) => set({ armorKacBonusEq: value })}
                  />
                  <MobileNumberField
                    label="Max DEX"
                    value={data.armorEquipMaxDex}
                    onChange={(value) => set({ armorEquipMaxDex: value })}
                  />
                  <MobileTextField
                    label="Bulk"
                    value={data.armorBulk}
                    onChange={(value) => set({ armorBulk: value })}
                  />
                  <MobileNumberField
                    label="Armor Penalty"
                    value={data.armorAcPenalty ?? 0}
                    onChange={(value) => set({ armorAcPenalty: value })}
                  />
                  <MobileTextField
                    label="Speed Adj."
                    value={data.armorSpeedAdj}
                    onChange={(value) => set({ armorSpeedAdj: value })}
                  />
                  <MobileNumberField
                    label="Upgrade Slots"
                    value={data.armorUpgradeSlots}
                    min={0}
                    onChange={(value) => set({ armorUpgradeSlots: value })}
                  />
                </S.MobileGrid>
                <MobileForm.Item label="Armor Notes">
                  <AdmMobileTextArea
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    value={data.armorNotes ?? ''}
                    onChange={(value) => set({ armorNotes: value })}
                    placeholder="Armor notes..."
                  />
                </MobileForm.Item>
              </MobileForm>
            </MobileCard>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="abilities" title={`Class Abilities (${abilities.length})`}>
            <MobileStringListSection
              items={abilities}
              onChange={(value) => set({ abilities: value })}
              addLabel="Add ability"
              placeholder="Ability"
            />
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="feats" title={`Feats (${feats.length})`}>
            <MobileStringListSection
              items={feats}
              onChange={(value) => set({ feats: value })}
              addLabel="Add feat"
              placeholder="Feat"
            />
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="spells" title="Spells">
            <S.MobileStack>
              <MobileCard compact>
                <MobileForm>
                  <MobileNumberField
                    label="Total spells known"
                    value={data.spellsKnownTotal}
                    min={0}
                    onChange={(value) => set({ spellsKnownTotal: value })}
                  />
                </MobileForm>
              </MobileCard>
              <S.MobileList>
                {['1st', '2nd', '3rd', '4th', '5th', '6th'].map((level) => {
                  const slot = spellSlots[level] ?? {};
                  return (
                    <S.MobileListItem key={level}>
                      <S.MobileListHeader>
                        <span>{level} level</span>
                      </S.MobileListHeader>
                      <MobileForm>
                        <S.MobileGrid>
                          <MobileNumberField
                            label="Known"
                            value={slot.spellsKnown}
                            min={0}
                            onChange={(value) =>
                              set({ spellSlots: { ...spellSlots, [level]: { ...slot, spellsKnown: value } } })
                            }
                          />
                          <MobileNumberField
                            label="Per day"
                            value={slot.spellsPerDay}
                            min={0}
                            onChange={(value) =>
                              set({ spellSlots: { ...spellSlots, [level]: { ...slot, spellsPerDay: value } } })
                            }
                          />
                          <MobileNumberField
                            label="Used"
                            value={slot.spellSlotsUsed}
                            min={0}
                            onChange={(value) =>
                              set({ spellSlots: { ...spellSlots, [level]: { ...slot, spellSlotsUsed: value } } })
                            }
                          />
                        </S.MobileGrid>
                      </MobileForm>
                    </S.MobileListItem>
                  );
                })}
              </S.MobileList>
              <MobileStringListSection
                items={spellsList}
                onChange={(value) => set({ spellsList: value })}
                addLabel="Add spell"
                placeholder="Spell"
              />
            </S.MobileStack>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="equipment" title={`Equipment (${equipment.length})`}>
            <S.MobileStack>
              <MobileArraySection
                items={equipment}
                onChange={(value) => set({ equipment: value })}
                blank={{}}
                addLabel="Add item"
                renderRow={(item, idx, update) => (
                  <MobileForm>
                    <S.MobileListHeader>
                      <span>Item {idx + 1}</span>
                    </S.MobileListHeader>
                    <MobileTextField
                      label="Name"
                      value={item.name}
                      onChange={(value) => update({ ...item, name: value })}
                    />
                    <S.MobileGrid>
                      <MobileTextField
                        label="Level"
                        value={item.level}
                        onChange={(value) => update({ ...item, level: value })}
                      />
                      <MobileTextField
                        label="Bulk"
                        value={item.bulk}
                        onChange={(value) => update({ ...item, bulk: value })}
                      />
                    </S.MobileGrid>
                  </MobileForm>
                )}
              />
              <MobileCard compact>
                <MobileForm>
                  <S.MobileGrid>
                    <MobileNumberField
                      label="Credits"
                      value={data.credits}
                      min={0}
                      onChange={(value) => set({ credits: value })}
                    />
                    <MobileTextField
                      label="Other wealth"
                      value={data.otherWealth}
                      onChange={(value) => set({ otherWealth: value })}
                    />
                    <MobileBooleanField
                      label="Commercial Backpack"
                      checked={data.backpacksCommercial}
                      onChange={(value) => set({ backpacksCommercial: value })}
                    />
                    <MobileBooleanField
                      label="Industrial Backpack"
                      checked={data.backpacksIndustrial}
                      onChange={(value) => set({ backpacksIndustrial: value })}
                    />
                  </S.MobileGrid>
                </MobileForm>
              </MobileCard>
              <S.MobileStatGrid>
                {[
                  ['Unencumbered', calc.carryUnenc],
                  ['Encumbered', calc.carryEnc],
                  ['Overloaded', calc.carryOver],
                ].map(([label, value]) => (
                  <S.MobileStatCard key={label}>
                    <S.MobileStatLabel>{label}</S.MobileStatLabel>
                    <S.MobileStatValue>{value}</S.MobileStatValue>
                  </S.MobileStatCard>
                ))}
              </S.MobileStatGrid>
            </S.MobileStack>
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="languages" title={`Languages (${languages.length})`}>
            <MobileStringListSection
              items={languages}
              onChange={(value) => set({ languages: value })}
              addLabel="Add language"
              placeholder="Language"
            />
          </AdmMobileCollapse.Panel>

          <AdmMobileCollapse.Panel key="xp" title="Experience">
            <MobileCard compact>
              <MobileForm>
                <S.MobileGrid>
                  <MobileNumberField
                    label="XP Earned"
                    value={data.xpEarned}
                    min={0}
                    onChange={(value) => set({ xpEarned: value })}
                  />
                  <MobileNumberField
                    label="Next Level"
                    value={data.xpNextLevel}
                    min={0}
                    onChange={(value) => set({ xpNextLevel: value })}
                  />
                </S.MobileGrid>
              </MobileForm>
            </MobileCard>
          </AdmMobileCollapse.Panel>
        </AdmMobileCollapse>
      </S.MobileStack>
    );
  }

  return (
    <Collapse defaultActiveKey={['identity', 'stats']} style={w100}>
      {/* Identity */}
      <Collapse.Panel header="Identity" key="identity">
        <div style={S.identityGrid}>
          {(
            [
              ['description', 'Description'],
              ['classLevel', 'Class/Level'],
              ['race', 'Race'],
              ['theme', 'Theme'],
              ['size', 'Size'],
              ['speedFt', 'Speed (ft)'],
              ['gender', 'Gender'],
              ['homeWorld', 'Home World'],
              ['alignment', 'Alignment'],
              ['deity', 'Deity'],
              ['player', 'Player'],
            ] as const
          ).map(([k, lbl]) => (
            <LabelInput key={k} label={lbl}>
              {k === 'speedFt' ? (
                <InputNumber style={w100} value={(data as any)[k]} onChange={(v) => set({ [k]: v ?? undefined })} />
              ) : (
                <Input value={(data as any)[k] ?? ''} onChange={(e) => set({ [k]: e.target.value })} />
              )}
            </LabelInput>
          ))}
        </div>
      </Collapse.Panel>

      {/* Ability Scores */}
      <Collapse.Panel header="Ability Scores" key="stats">
        <div style={S.abilitiesGrid}>
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((attr) => {
            const base = data[attr] ?? 10;
            const upgraded = (data as any)[`${attr}Upgraded`] as number | undefined;
            const score = upgraded ?? base;
            const mod = abilityMod(score);
            return (
              <div key={attr} style={S.abilityCell}>
                <div style={S.abilityHeader}>{attr.toUpperCase()}</div>
                <InputNumber style={w100} value={base} min={1} onChange={(v) => set({ [attr]: v ?? 10 })} />
                <div style={S.abilityUpgradeLabel}>Upg:</div>
                <InputNumber
                  style={w100}
                  value={upgraded}
                  placeholder="—"
                  onChange={(v) => set({ [`${attr}Upgraded`]: v ?? undefined } as any)}
                />
                <div style={S.abilityModValue}>{sign(mod)}</div>
              </div>
            );
          })}
        </div>
      </Collapse.Panel>

      {/* Combat stats */}
      <Collapse.Panel header="Combat" key="combat">
        <Space wrap size={8} style={S.combatStatsRow}>
          <CalcBox label="Initiative" value={sign(calc.initiative)} color="#597ef7" />
          <CalcBox label="EAC" value={calc.eac} color="#36cfc9" />
          <CalcBox label="KAC" value={calc.kac} color="#73d13d" />
          <CalcBox label="AC vs CM" value={calc.acvsm} color="#ffc53d" />
        </Space>
        <div style={S.combatGrid}>
          <LabelInput label="Armor Bonus (EAC)">
            <InputNumber style={w100} value={data.armorBonus ?? 0} onChange={(v) => set({ armorBonus: v ?? 0 })} />
          </LabelInput>
          <LabelInput label="Armor Bonus (KAC)">
            <InputNumber
              style={w100}
              value={data.armorKacBonus ?? 0}
              onChange={(v) => set({ armorKacBonus: v ?? 0 })}
            />
          </LabelInput>
          <LabelInput label="Max DEX (armor)">
            <InputNumber
              style={w100}
              value={data.armorMaxDex}
              placeholder="∞"
              onChange={(v) => set({ armorMaxDex: v ?? undefined })}
            />
          </LabelInput>
          <LabelInput label="Misc Armor Mod">
            <InputNumber style={w100} value={data.armorMiscMod ?? 0} onChange={(v) => set({ armorMiscMod: v ?? 0 })} />
          </LabelInput>
          <LabelInput label="Misc Initiative">
            <InputNumber
              style={w100}
              value={data.initiativeMisc ?? 0}
              onChange={(v) => set({ initiativeMisc: v ?? 0 })}
            />
          </LabelInput>
          <LabelInput label="DR">
            <Input value={data.dr ?? ''} onChange={(e) => set({ dr: e.target.value })} />
          </LabelInput>
          <LabelInput label="Resistances">
            <Input value={data.resistances ?? ''} onChange={(e) => set({ resistances: e.target.value })} />
          </LabelInput>
        </div>
        <Divider style={S.sectionDivider} />
        <Typography.Text strong style={textSm}>
          Saving Throws
        </Typography.Text>
        <div style={S.savesGrid}>
          {(
            [
              ['fort', 'Fortitude', 'con', calc.fort],
              ['ref', 'Reflex', 'dex', calc.ref],
              ['will', 'Will', 'wis', calc.will],
            ] as const
          ).map(([k, lbl, attr, total]) => (
            <div key={k} style={S.saveCard}>
              <div style={S.saveTitle}>
                {lbl} = {sign(total)}
              </div>
              <Space orientation="vertical" size={4} style={w100}>
                <InputNumber
                  style={w100}
                  size="small"
                  placeholder="Base save"
                  value={(data as any)[`${k}Base`] ?? 0}
                  onChange={(v) => set({ [`${k}Base`]: v ?? 0 } as any)}
                />
                <div style={S.saveHelper}>
                  {attr.toUpperCase()} mod: {sign(calc.mods[attr as 'con' | 'dex' | 'wis'])}
                </div>
                <InputNumber
                  style={w100}
                  size="small"
                  placeholder="Misc"
                  value={(data as any)[`${k}Misc`] ?? 0}
                  onChange={(v) => set({ [`${k}Misc`]: v ?? 0 } as any)}
                />
              </Space>
            </div>
          ))}
        </div>
        <Divider style={S.sectionDivider} />
        <Typography.Text strong style={textSm}>
          Attack Bonus
        </Typography.Text>
        <div style={S.attacksGrid}>
          <LabelInput label={`BAB`}>
            <InputNumber style={w100} value={data.bab ?? 0} onChange={(v) => set({ bab: v ?? 0 })} />
          </LabelInput>
          <CalcBox label={`Melee (${sign(calc.mods.str)} STR)`} value={sign(calc.melee)} color="#ff4d4f" />
          <CalcBox label={`Ranged (${sign(calc.mods.dex)} DEX)`} value={sign(calc.ranged)} color="#40a9ff" />
          <CalcBox label={`Thrown (${sign(calc.mods.str)} STR)`} value={sign(calc.thrown)} color="#ffc53d" />
          <LabelInput label="Misc Melee">
            <InputNumber style={w100} value={data.meleeMisc ?? 0} onChange={(v) => set({ meleeMisc: v ?? 0 })} />
          </LabelInput>
          <LabelInput label="Misc Ranged">
            <InputNumber style={w100} value={data.rangedMisc ?? 0} onChange={(v) => set({ rangedMisc: v ?? 0 })} />
          </LabelInput>
          <LabelInput label="Misc Thrown">
            <InputNumber style={w100} value={data.thrownMisc ?? 0} onChange={(v) => set({ thrownMisc: v ?? 0 })} />
          </LabelInput>
        </div>
      </Collapse.Panel>

      {/* HP */}
      <Collapse.Panel header="Hit Points" key="hp">
        <div style={S.hpGrid}>
          {(
            [
              ['Stamina', 'staminaTotal', 'staminaCurrent', '#40a9ff'],
              ['Hit Points', 'hpTotal', 'hpCurrent', '#73d13d'],
              ['Resolve', 'resolveTotal', 'resolveCurrent', '#9254de'],
            ] as const
          ).map(([lbl, tk, ck, color]) => (
            <div key={tk} style={S.hpCard(color)}>
              <div style={S.hpCardTitle(color)}>{lbl}</div>
              <Space orientation="vertical" size={4} style={w100}>
                <InputNumber
                  style={w100}
                  placeholder="Total"
                  value={(data as any)[tk]}
                  onChange={(v) => set({ [tk]: v ?? undefined } as any)}
                />
                <InputNumber
                  style={w100}
                  placeholder="Current"
                  value={(data as any)[ck]}
                  onChange={(v) => set({ [ck]: v ?? undefined } as any)}
                />
              </Space>
            </div>
          ))}
        </div>
      </Collapse.Panel>

      {/* Skills */}
      <Collapse.Panel header="Skills" key="skills">
        <div style={S.skillsHeaderGrid}>
          <div />
          <div style={S.skillsHeaderCols}>
            <span>Ranks</span>
            <span>Class (+3)</span>
            <span>Misc</span>
            <span>Total</span>
          </div>
        </div>
        {SF_SKILLS.map((sk) => {
          const s = skills[sk.key] ?? {};
          const ranks = s.ranks ?? 0;
          const classBonus = s.classBonus ? 3 : 0;
          const misc = s.miscMod ?? 0;
          const attrMod = calc.mods[sk.attr];
          const total = ranks + classBonus + attrMod + misc;
          return (
            <div key={sk.key} style={S.skillRow}>
              <div style={S.skillName}>
                {sk.trainedOnly && (
                  <span style={S.trainedOnlyMark}>
                    <AppIcon name="star" size={12} />{' '}
                  </span>
                )}
                {sk.label}
                <span style={S.skillAttr}>
                  ({sk.attr.toUpperCase()} {sign(attrMod)})
                </span>
              </div>
              <div style={S.skillInputsGrid}>
                <InputNumber size="small" min={0} value={ranks} onChange={(v) => setSkill(sk.key, { ranks: v ?? 0 })} />
                <Switch
                  size="small"
                  checked={!!s.classBonus}
                  onChange={(v) => setSkill(sk.key, { classBonus: v })}
                  checkedChildren="Class"
                  unCheckedChildren="—"
                />
                <InputNumber size="small" value={misc} onChange={(v) => setSkill(sk.key, { miscMod: v ?? 0 })} />
                <span style={S.skillTotal}>{sign(total)}</span>
              </div>
            </div>
          );
        })}
        <Divider style={dividerMd} />
        <Space size={12}>
          <LabelInput label="Ranks/Level">
            <InputNumber
              value={data.skillRanksPerLevel}
              onChange={(v) => set({ skillRanksPerLevel: v ?? undefined })}
              style={S.width80}
            />
          </LabelInput>
          <LabelInput label="Armor Check Penalty">
            <InputNumber
              value={data.armorCheckPenalty ?? 0}
              onChange={(v) => set({ armorCheckPenalty: v ?? 0 })}
              style={S.width80}
            />
          </LabelInput>
        </Space>
      </Collapse.Panel>

      {/* Weapons */}
      <Collapse.Panel header="Weapons" key="weapons">
        {weapons.map((w, i) => (
          <div key={i} style={S.weaponCard}>
            <Typography.Text strong style={S.weaponCardTitle}>
              Weapon {i + 1}
            </Typography.Text>
            <div style={S.weaponGrid}>
              {(
                [
                  ['name', 'Name'],
                  ['level', 'Level'],
                  ['attackBonus', 'Attack Bonus'],
                  ['damage', 'Damage'],
                  ['critical', 'Critical'],
                  ['range', 'Range'],
                  ['type', 'Type'],
                  ['ammoUsage', 'Ammo/Use'],
                  ['special', 'Special'],
                ] as const
              ).map(([k, lbl]) => (
                <LabelInput key={k} label={lbl}>
                  <Input
                    size="small"
                    value={w[k as keyof SfWeapon] ?? ''}
                    onChange={(e) => {
                      const next = [...weapons] as SfWeapon[];
                      next[i] = { ...next[i], [k]: e.target.value };
                      set({ weapons: next });
                    }}
                  />
                </LabelInput>
              ))}
            </div>
          </div>
        ))}
      </Collapse.Panel>

      {/* Armor equipment */}
      <Collapse.Panel header="Equipped Armor" key="armor">
        <div style={S.armorGrid}>
          <LabelInput label="Model">
            <Input value={data.armorModel ?? ''} onChange={(e) => set({ armorModel: e.target.value })} />
          </LabelInput>
          <LabelInput label="Level">
            <InputNumber style={w100} value={data.armorLevel} onChange={(v) => set({ armorLevel: v ?? undefined })} />
          </LabelInput>
          <LabelInput label="EAC Bonus">
            <InputNumber
              style={w100}
              value={data.armorEacBonus ?? 0}
              onChange={(v) => set({ armorEacBonus: v ?? 0 })}
            />
          </LabelInput>
          <LabelInput label="KAC Bonus">
            <InputNumber
              style={w100}
              value={data.armorKacBonusEq ?? 0}
              onChange={(v) => set({ armorKacBonusEq: v ?? 0 })}
            />
          </LabelInput>
          <LabelInput label="Max DEX">
            <InputNumber
              style={w100}
              value={data.armorEquipMaxDex}
              onChange={(v) => set({ armorEquipMaxDex: v ?? undefined })}
            />
          </LabelInput>
          <LabelInput label="Bulk">
            <Input value={data.armorBulk ?? ''} onChange={(e) => set({ armorBulk: e.target.value })} />
          </LabelInput>
          <LabelInput label="Armor Pen.">
            <InputNumber
              style={w100}
              value={data.armorAcPenalty ?? 0}
              onChange={(v) => set({ armorAcPenalty: v ?? 0 })}
            />
          </LabelInput>
          <LabelInput label="Speed Adj.">
            <Input value={data.armorSpeedAdj ?? ''} onChange={(e) => set({ armorSpeedAdj: e.target.value })} />
          </LabelInput>
          <LabelInput label="Upgrade Slots">
            <InputNumber
              style={w100}
              value={data.armorUpgradeSlots}
              onChange={(v) => set({ armorUpgradeSlots: v ?? undefined })}
            />
          </LabelInput>
        </div>
        <div style={S.topMargin8}>
          <LabelInput label="Armor Notes">
            <Input.TextArea
              value={data.armorNotes ?? ''}
              onChange={(e) => set({ armorNotes: e.target.value })}
              rows={2}
            />
          </LabelInput>
        </div>
      </Collapse.Panel>

      {/* Abilities */}
      <Collapse.Panel header={`Class Abilities (${abilities.length})`} key="abilities">
        <div style={S.simpleListGrid}>
          {abilities.map((ab, i) => (
            <Input.Group compact key={i} style={S.compactGroup}>
              <Input
                value={ab}
                onChange={(e) => {
                  const n = [...abilities];
                  n[i] = e.target.value;
                  set({ abilities: n });
                }}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => set({ abilities: abilities.filter((_, j) => j !== i) })}
              />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ abilities: [...abilities, ''] })}>
            Add ability
          </Button>
        </div>
      </Collapse.Panel>

      {/* Feats */}
      <Collapse.Panel header={`Feats (${feats.length})`} key="feats">
        <div style={S.simpleListGrid}>
          {feats.map((f, i) => (
            <Input.Group compact key={i} style={S.compactGroup}>
              <Input
                value={f}
                onChange={(e) => {
                  const n = [...feats];
                  n[i] = e.target.value;
                  set({ feats: n });
                }}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => set({ feats: feats.filter((_, j) => j !== i) })}
              />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ feats: [...feats, ''] })}>
            Add feat
          </Button>
        </div>
      </Collapse.Panel>

      {/* Spells */}
      <Collapse.Panel header="Spells" key="spells">
        <LabelInput label="Total spells known">
          <InputNumber
            value={data.spellsKnownTotal}
            onChange={(v) => set({ spellsKnownTotal: v ?? undefined })}
            style={S.width100}
          />
        </LabelInput>
        <Divider style={S.spellsDivider} />
        <div style={S.spellsLevelsGrid}>
          {['1st', '2nd', '3rd', '4th', '5th', '6th'].map((lvl) => {
            const s = spellSlots[lvl] ?? {};
            return (
              <div key={lvl} style={S.spellLevelRow}>
                <Typography.Text strong style={S.spellLevelLabel}>
                  {lvl}
                </Typography.Text>
                <LabelInput label="Known">
                  <InputNumber
                    size="small"
                    style={w100}
                    value={s.spellsKnown}
                    onChange={(v) =>
                      set({ spellSlots: { ...spellSlots, [lvl]: { ...s, spellsKnown: v ?? undefined } } })
                    }
                  />
                </LabelInput>
                <LabelInput label="Per day">
                  <InputNumber
                    size="small"
                    style={w100}
                    value={s.spellsPerDay}
                    onChange={(v) =>
                      set({ spellSlots: { ...spellSlots, [lvl]: { ...s, spellsPerDay: v ?? undefined } } })
                    }
                  />
                </LabelInput>
                <LabelInput label="Used">
                  <InputNumber
                    size="small"
                    style={w100}
                    value={s.spellSlotsUsed}
                    onChange={(v) =>
                      set({ spellSlots: { ...spellSlots, [lvl]: { ...s, spellSlotsUsed: v ?? undefined } } })
                    }
                  />
                </LabelInput>
              </div>
            );
          })}
        </div>
        <Divider style={S.spellsDivider} />
        <Typography.Text type="secondary" style={textSm}>
          Known spells list
        </Typography.Text>
        <div style={S.spellsListGrid}>
          {spellsList.map((sp, i) => (
            <Input.Group compact key={i} style={S.compactGroup}>
              <Input
                value={sp}
                onChange={(e) => {
                  const n = [...spellsList];
                  n[i] = e.target.value;
                  set({ spellsList: n });
                }}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => set({ spellsList: spellsList.filter((_, j) => j !== i) })}
              />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ spellsList: [...spellsList, ''] })}>
            Add spell
          </Button>
        </div>
      </Collapse.Panel>

      {/* Equipment */}
      <Collapse.Panel header={`Equipment (${equipment.length})`} key="equipment">
        <div style={S.simpleListGrid}>
          {equipment.map((eq, i) => (
            <Space wrap key={i} size={4}>
              <Input
                placeholder="Name"
                value={eq.name ?? ''}
                onChange={(e) => {
                  const n = [...equipment];
                  n[i] = { ...n[i], name: e.target.value };
                  set({ equipment: n });
                }}
                style={S.width200}
              />
              <Input
                placeholder="Level"
                value={eq.level ?? ''}
                onChange={(e) => {
                  const n = [...equipment];
                  n[i] = { ...n[i], level: e.target.value };
                  set({ equipment: n });
                }}
                style={S.width70}
              />
              <Input
                placeholder="Bulk"
                value={eq.bulk ?? ''}
                onChange={(e) => {
                  const n = [...equipment];
                  n[i] = { ...n[i], bulk: e.target.value };
                  set({ equipment: n });
                }}
                style={S.width70}
              />
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => set({ equipment: equipment.filter((_, j) => j !== i) })}
              />
            </Space>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ equipment: [...equipment, {}] })}>
            Add item
          </Button>
        </div>
        <Divider style={S.spellsDivider} />
        <Space wrap size={12}>
          <LabelInput label="Credits">
            <InputNumber value={data.credits} onChange={(v) => set({ credits: v ?? undefined })} />
          </LabelInput>
          <LabelInput label="Other wealth">
            <Input
              value={data.otherWealth ?? ''}
              onChange={(e) => set({ otherWealth: e.target.value })}
              style={S.width200}
            />
          </LabelInput>
          <div>
            <Typography.Text type="secondary" style={S.backPacksLabel}>
              Backpacks
            </Typography.Text>
            <Space>
              <Switch
                size="small"
                checked={!!data.backpacksCommercial}
                onChange={(v) => set({ backpacksCommercial: v })}
              />{' '}
              <span style={textSm}>Commercial</span>
              <Switch
                size="small"
                checked={!!data.backpacksIndustrial}
                onChange={(v) => set({ backpacksIndustrial: v })}
              />{' '}
              <span style={textSm}>Industrial</span>
            </Space>
          </div>
        </Space>
        <Divider style={S.carryDivider} />
        <Space wrap size={12}>
          <CalcBox label="Unencumbered (Bulk)" value={calcStarfinder(data).carryUnenc} />
          <CalcBox label="Encumbered (Bulk)" value={calcStarfinder(data).carryEnc} />
          <CalcBox label="Overloaded (Bulk)" value={calcStarfinder(data).carryOver} />
        </Space>
      </Collapse.Panel>

      {/* Languages */}
      <Collapse.Panel header={`Languages (${languages.length})`} key="languages">
        <div style={S.simpleListGrid}>
          {languages.map((l, i) => (
            <Input.Group compact key={i} style={S.compactGroup}>
              <Input
                value={l}
                onChange={(e) => {
                  const n = [...languages];
                  n[i] = e.target.value;
                  set({ languages: n });
                }}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => set({ languages: languages.filter((_, j) => j !== i) })}
              />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ languages: [...languages, ''] })}>
            Add language
          </Button>
        </div>
      </Collapse.Panel>

      {/* XP */}
      <Collapse.Panel header="Experience" key="xp">
        <Space size={16}>
          <LabelInput label="XP Earned">
            <InputNumber value={data.xpEarned} onChange={(v) => set({ xpEarned: v ?? undefined })} />
          </LabelInput>
          <LabelInput label="Next Level">
            <InputNumber value={data.xpNextLevel} onChange={(v) => set({ xpNextLevel: v ?? undefined })} />
          </LabelInput>
        </Space>
      </Collapse.Panel>
    </Collapse>
  );
};
