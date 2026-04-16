import React from 'react';
import { Collapse, Divider, Input, InputNumber, Space, Switch, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@app/components/common/buttons/Button/Button';
import type { StarfinderSheetData, SfWeapon, SfEquipmentItem } from '@app/api/character-sheets.api';

// ── Calculations ──────────────────────────────────────────────────────────────

export function abilityMod(score: number) { return Math.floor((score - 10) / 2); }

export function calcStarfinder(d: StarfinderSheetData) {
  const str = d.str ?? 10, dex = d.dex ?? 10, con = d.con ?? 10;
  const intScore = d.int ?? 10, wis = d.wis ?? 10, cha = d.cha ?? 10;
  const mods = { str: abilityMod(str), dex: abilityMod(dex), con: abilityMod(con), int: abilityMod(intScore), wis: abilityMod(wis), cha: abilityMod(cha) };

  const effectiveDex = d.armorMaxDex !== undefined ? Math.min(mods.dex, d.armorMaxDex) : mods.dex;
  const eac = 10 + (d.armorBonus ?? 0) + effectiveDex + (d.armorMiscMod ?? 0);
  const kac = 10 + (d.armorKacBonus ?? 0) + effectiveDex + (d.armorMiscMod ?? 0);
  const acvsm = 8 + kac;

  const initiative = mods.dex + (d.initiativeMisc ?? 0);
  const fort = (d.fortBase ?? 0) + mods.con + (d.fortMisc ?? 0);
  const ref  = (d.refBase  ?? 0) + mods.dex + (d.refMisc  ?? 0);
  const will = (d.willBase ?? 0) + mods.wis + (d.willMisc ?? 0);

  const bab = d.bab ?? 0;
  const melee  = bab + mods.str + (d.meleeMisc  ?? 0);
  const ranged = bab + mods.dex + (d.rangedMisc ?? 0);
  const thrown = bab + mods.str + (d.thrownMisc ?? 0);

  const carryUnenc = Math.floor(str / 2);
  const carryEnc   = carryUnenc + 1;
  const carryOver  = carryUnenc + 6;

  return { mods, eac, kac, acvsm, initiative, fort, ref, will, melee, ranged, thrown, carryUnenc, carryEnc, carryOver };
}

// ── SF Skills list ─────────────────────────────────────────────────────────────

const SF_SKILLS: Array<{ key: string; label: string; attr: keyof ReturnType<typeof calcStarfinder>['mods']; trainedOnly?: boolean }> = [
  { key:'acrobatics', label:'Acrobatics', attr:'dex' },
  { key:'athletics', label:'Athletics', attr:'str' },
  { key:'bluff', label:'Bluff', attr:'cha' },
  { key:'computers', label:'Computers', attr:'int', trainedOnly: true },
  { key:'culture', label:'Culture', attr:'int', trainedOnly: true },
  { key:'diplomacy', label:'Diplomacy', attr:'cha' },
  { key:'disguise', label:'Disguise', attr:'cha' },
  { key:'engineering', label:'Engineering', attr:'int', trainedOnly: true },
  { key:'intimidate', label:'Intimidate', attr:'cha' },
  { key:'life_science', label:'Life Science', attr:'int', trainedOnly: true },
  { key:'medicine', label:'Medicine', attr:'int', trainedOnly: true },
  { key:'mysticism', label:'Mysticism', attr:'wis', trainedOnly: true },
  { key:'perception', label:'Perception', attr:'wis' },
  { key:'physical_science', label:'Physical Science', attr:'int', trainedOnly: true },
  { key:'piloting', label:'Piloting', attr:'dex' },
  { key:'profession1', label:'Profession (1)', attr:'cha' },
  { key:'profession2', label:'Profession (2)', attr:'cha' },
  { key:'sense_motive', label:'Sense Motive', attr:'wis' },
  { key:'sleight_of_hand', label:'Sleight of Hand', attr:'dex', trainedOnly: true },
  { key:'stealth', label:'Stealth', attr:'dex' },
  { key:'survival', label:'Survival', attr:'wis' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const LabelInput = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>{label}</Typography.Text>
    {children}
  </div>
);

const CalcBox = ({ label, value, color }: { label: string; value: number | string; color?: string }) => (
  <div style={{ textAlign: 'center', padding: '6px 12px', borderRadius: 6, background: color ? `${color}18` : 'rgba(128,128,128,0.08)', border: color ? `1px solid ${color}44` : undefined, minWidth: 60 }}>
    <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2 }}>{label}</div>
    <div style={{ fontWeight: 800, fontSize: 16, color: color ?? 'inherit' }}>{value}</div>
  </div>
);

function sign(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

// ── Main form ─────────────────────────────────────────────────────────────────

interface Props { data: StarfinderSheetData; onChange: (d: StarfinderSheetData) => void }

export const StarfinderSheetForm: React.FC<Props> = ({ data, onChange }) => {
  const calc = React.useMemo(() => calcStarfinder(data), [data]);
  const set = (patch: Partial<StarfinderSheetData>) => onChange({ ...data, ...patch });

  const skills = data.skills ?? {};
  const weapons: SfWeapon[] = data.weapons ?? [{},{},{},{}];
  const equipment: SfEquipmentItem[] = data.equipment ?? [];
  const abilities = data.abilities ?? [];
  const feats = data.feats ?? [];
  const languages = data.languages ?? [];
  const spellsList = data.spellsList ?? [];
  const spellSlots = data.spellSlots ?? {};

  function setSkill(key: string, patch: Partial<{ ranks: number; classBonus: boolean; miscMod: number }>) {
    set({ skills: { ...skills, [key]: { ...skills[key], ...patch } } });
  }

  return (
    <Collapse defaultActiveKey={['identity','stats']} style={{ width: '100%' }}>

      {/* Identity */}
      <Collapse.Panel header="Identity" key="identity">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
          {([['description','Description'],['classLevel','Class/Level'],['race','Race'],['theme','Theme'],['size','Size'],['speedFt','Speed (ft)'],['gender','Gender'],['homeWorld','Home World'],['alignment','Alignment'],['deity','Deity'],['player','Player']] as const).map(([k,lbl]) => (
            <LabelInput key={k} label={lbl}>
              {k === 'speedFt' ? <InputNumber style={{ width:'100%' }} value={(data as any)[k]} onChange={(v) => set({ [k]: v ?? undefined })} /> : <Input value={(data as any)[k] ?? ''} onChange={(e) => set({ [k]: e.target.value })} />}
            </LabelInput>
          ))}
        </div>
      </Collapse.Panel>

      {/* Ability Scores */}
      <Collapse.Panel header="Ability Scores" key="stats">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
          {(['str','dex','con','int','wis','cha'] as const).map((attr) => {
            const base = data[attr] ?? 10;
            const upgraded = (data as any)[`${attr}Upgraded`] as number | undefined;
            const score = upgraded ?? base;
            const mod = abilityMod(score);
            return (
              <div key={attr} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>{attr.toUpperCase()}</div>
                <InputNumber style={{ width: '100%' }} value={base} min={1} onChange={(v) => set({ [attr]: v ?? 10 })} />
                <div style={{ fontSize: 10, opacity: 0.5, margin: '3px 0' }}>Upg:</div>
                <InputNumber style={{ width: '100%' }} value={upgraded} placeholder="—" onChange={(v) => set({ [`${attr}Upgraded`]: v ?? undefined } as any)} />
                <div style={{ marginTop: 4, fontWeight: 700, fontSize: 13 }}>{sign(mod)}</div>
              </div>
            );
          })}
        </div>
      </Collapse.Panel>

      {/* Combat stats */}
      <Collapse.Panel header="Combat" key="combat">
        <Space wrap size={8} style={{ marginBottom: 12 }}>
          <CalcBox label="Initiative" value={sign(calc.initiative)} color="#597ef7" />
          <CalcBox label="EAC" value={calc.eac} color="#36cfc9" />
          <CalcBox label="KAC" value={calc.kac} color="#73d13d" />
          <CalcBox label="AC vs CM" value={calc.acvsm} color="#ffc53d" />
        </Space>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
          <LabelInput label="Armor Bonus (EAC)"><InputNumber style={{ width:'100%' }} value={data.armorBonus ?? 0} onChange={(v) => set({ armorBonus: v ?? 0 })} /></LabelInput>
          <LabelInput label="Armor Bonus (KAC)"><InputNumber style={{ width:'100%' }} value={data.armorKacBonus ?? 0} onChange={(v) => set({ armorKacBonus: v ?? 0 })} /></LabelInput>
          <LabelInput label="Max DEX (armor)"><InputNumber style={{ width:'100%' }} value={data.armorMaxDex} placeholder="∞" onChange={(v) => set({ armorMaxDex: v ?? undefined })} /></LabelInput>
          <LabelInput label="Misc Armor Mod"><InputNumber style={{ width:'100%' }} value={data.armorMiscMod ?? 0} onChange={(v) => set({ armorMiscMod: v ?? 0 })} /></LabelInput>
          <LabelInput label="Misc Initiative"><InputNumber style={{ width:'100%' }} value={data.initiativeMisc ?? 0} onChange={(v) => set({ initiativeMisc: v ?? 0 })} /></LabelInput>
          <LabelInput label="DR"><Input value={data.dr ?? ''} onChange={(e) => set({ dr: e.target.value })} /></LabelInput>
          <LabelInput label="Resistances"><Input value={data.resistances ?? ''} onChange={(e) => set({ resistances: e.target.value })} /></LabelInput>
        </div>
        <Divider style={{ margin: '12px 0 8px' }} />
        <Typography.Text strong style={{ fontSize: 12 }}>Saving Throws</Typography.Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8 }}>
          {([['fort','Fortitude','con',calc.fort],['ref','Reflex','dex',calc.ref],['will','Will','wis',calc.will]] as const).map(([k,lbl,attr,total]) => (
            <div key={k} style={{ padding: 8, borderRadius: 8, background: 'rgba(128,128,128,0.06)', textAlign:'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{lbl} = {sign(total)}</div>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <InputNumber style={{ width:'100%' }} size="small" placeholder="Base save" value={(data as any)[`${k}Base`] ?? 0} onChange={(v) => set({ [`${k}Base`]: v ?? 0 } as any)} />
                <div style={{ fontSize: 10, opacity: 0.5 }}>{attr.toUpperCase()} mod: {sign(calc.mods[attr as 'con'|'dex'|'wis'])}</div>
                <InputNumber style={{ width:'100%' }} size="small" placeholder="Misc" value={(data as any)[`${k}Misc`] ?? 0} onChange={(v) => set({ [`${k}Misc`]: v ?? 0 } as any)} />
              </Space>
            </div>
          ))}
        </div>
        <Divider style={{ margin: '12px 0 8px' }} />
        <Typography.Text strong style={{ fontSize: 12 }}>Attack Bonus</Typography.Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8, marginTop: 8 }}>
          <LabelInput label={`BAB`}><InputNumber style={{ width:'100%' }} value={data.bab ?? 0} onChange={(v) => set({ bab: v ?? 0 })} /></LabelInput>
          <CalcBox label={`Melee (${sign(calc.mods.str)} STR)`} value={sign(calc.melee)} color="#ff4d4f" />
          <CalcBox label={`Ranged (${sign(calc.mods.dex)} DEX)`} value={sign(calc.ranged)} color="#40a9ff" />
          <CalcBox label={`Thrown (${sign(calc.mods.str)} STR)`} value={sign(calc.thrown)} color="#ffc53d" />
          <LabelInput label="Misc Melee"><InputNumber style={{ width:'100%' }} value={data.meleeMisc ?? 0} onChange={(v) => set({ meleeMisc: v ?? 0 })} /></LabelInput>
          <LabelInput label="Misc Ranged"><InputNumber style={{ width:'100%' }} value={data.rangedMisc ?? 0} onChange={(v) => set({ rangedMisc: v ?? 0 })} /></LabelInput>
          <LabelInput label="Misc Thrown"><InputNumber style={{ width:'100%' }} value={data.thrownMisc ?? 0} onChange={(v) => set({ thrownMisc: v ?? 0 })} /></LabelInput>
        </div>
      </Collapse.Panel>

      {/* HP */}
      <Collapse.Panel header="Hit Points" key="hp">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {([['Stamina','staminaTotal','staminaCurrent','#40a9ff'],['Hit Points','hpTotal','hpCurrent','#73d13d'],['Resolve','resolveTotal','resolveCurrent','#9254de']] as const).map(([lbl,tk,ck,color]) => (
            <div key={tk} style={{ padding: 10, borderRadius: 8, background: `${color}10`, border: `1px solid ${color}33`, textAlign:'center' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color, marginBottom: 8 }}>{lbl}</div>
              <Space direction="vertical" size={4} style={{ width:'100%' }}>
                <InputNumber style={{ width:'100%' }} placeholder="Total" value={(data as any)[tk]} onChange={(v) => set({ [tk]: v ?? undefined } as any)} />
                <InputNumber style={{ width:'100%' }} placeholder="Current" value={(data as any)[ck]} onChange={(v) => set({ [ck]: v ?? undefined } as any)} />
              </Space>
            </div>
          ))}
        </div>
      </Collapse.Panel>

      {/* Skills */}
      <Collapse.Panel header="Skills" key="skills">
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 0', marginBottom: 8 }}>
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 60px 60px', gap: 4, padding: '0 4px', fontSize: 11, opacity: 0.6 }}>
            <span>Ranks</span><span>Class (+3)</span><span>Misc</span><span>Total</span>
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
            <div key={sk.key} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <div style={{ minWidth: 170, fontSize: 12 }}>
                {sk.trainedOnly && <span style={{ color: '#ff4d4f', fontSize: 10 }}>✦ </span>}
                {sk.label}
                <span style={{ opacity: 0.5, fontSize: 10, marginLeft: 4 }}>({sk.attr.toUpperCase()} {sign(attrMod)})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 60px 60px', gap: 4, alignItems: 'center' }}>
                <InputNumber size="small" min={0} value={ranks} onChange={(v) => setSkill(sk.key, { ranks: v ?? 0 })} />
                <Switch size="small" checked={!!s.classBonus} onChange={(v) => setSkill(sk.key, { classBonus: v })} checkedChildren="Class" unCheckedChildren="—" />
                <InputNumber size="small" value={misc} onChange={(v) => setSkill(sk.key, { miscMod: v ?? 0 })} />
                <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{sign(total)}</span>
              </div>
            </div>
          );
        })}
        <Divider style={{ margin: '8px 0' }} />
        <Space size={12}>
          <LabelInput label="Ranks/Level"><InputNumber value={data.skillRanksPerLevel} onChange={(v) => set({ skillRanksPerLevel: v ?? undefined })} style={{ width: 80 }} /></LabelInput>
          <LabelInput label="Armor Check Penalty"><InputNumber value={data.armorCheckPenalty ?? 0} onChange={(v) => set({ armorCheckPenalty: v ?? 0 })} style={{ width: 80 }} /></LabelInput>
        </Space>
      </Collapse.Panel>

      {/* Weapons */}
      <Collapse.Panel header="Weapons" key="weapons">
        {weapons.map((w, i) => (
          <div key={i} style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(128,128,128,0.05)', border: '1px solid rgba(128,128,128,0.1)' }}>
            <Typography.Text strong style={{ fontSize: 12, opacity: 0.6 }}>Weapon {i + 1}</Typography.Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 6, marginTop: 6 }}>
              {([['name','Name'],['level','Level'],['attackBonus','Attack Bonus'],['damage','Damage'],['critical','Critical'],['range','Range'],['type','Type'],['ammoUsage','Ammo/Use'],['special','Special']] as const).map(([k,lbl]) => (
                <LabelInput key={k} label={lbl}>
                  <Input size="small" value={w[k as keyof SfWeapon] ?? ''} onChange={(e) => {
                    const next = [...weapons] as SfWeapon[];
                    next[i] = { ...next[i], [k]: e.target.value };
                    set({ weapons: next });
                  }} />
                </LabelInput>
              ))}
            </div>
          </div>
        ))}
      </Collapse.Panel>

      {/* Armor equipment */}
      <Collapse.Panel header="Equipped Armor" key="armor">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          <LabelInput label="Model"><Input value={data.armorModel ?? ''} onChange={(e) => set({ armorModel: e.target.value })} /></LabelInput>
          <LabelInput label="Level"><InputNumber style={{ width:'100%' }} value={data.armorLevel} onChange={(v) => set({ armorLevel: v ?? undefined })} /></LabelInput>
          <LabelInput label="EAC Bonus"><InputNumber style={{ width:'100%' }} value={data.armorEacBonus ?? 0} onChange={(v) => set({ armorEacBonus: v ?? 0 })} /></LabelInput>
          <LabelInput label="KAC Bonus"><InputNumber style={{ width:'100%' }} value={data.armorKacBonusEq ?? 0} onChange={(v) => set({ armorKacBonusEq: v ?? 0 })} /></LabelInput>
          <LabelInput label="Max DEX"><InputNumber style={{ width:'100%' }} value={data.armorEquipMaxDex} onChange={(v) => set({ armorEquipMaxDex: v ?? undefined })} /></LabelInput>
          <LabelInput label="Bulk"><Input value={data.armorBulk ?? ''} onChange={(e) => set({ armorBulk: e.target.value })} /></LabelInput>
          <LabelInput label="Armor Pen."><InputNumber style={{ width:'100%' }} value={data.armorAcPenalty ?? 0} onChange={(v) => set({ armorAcPenalty: v ?? 0 })} /></LabelInput>
          <LabelInput label="Speed Adj."><Input value={data.armorSpeedAdj ?? ''} onChange={(e) => set({ armorSpeedAdj: e.target.value })} /></LabelInput>
          <LabelInput label="Upgrade Slots"><InputNumber style={{ width:'100%' }} value={data.armorUpgradeSlots} onChange={(v) => set({ armorUpgradeSlots: v ?? undefined })} /></LabelInput>
        </div>
        <div style={{ marginTop: 8 }}>
          <LabelInput label="Armor Notes"><Input.TextArea value={data.armorNotes ?? ''} onChange={(e) => set({ armorNotes: e.target.value })} rows={2} /></LabelInput>
        </div>
      </Collapse.Panel>

      {/* Abilities */}
      <Collapse.Panel header={`Class Abilities (${abilities.length})`} key="abilities">
        <div style={{ display: 'grid', gap: 6 }}>
          {abilities.map((ab, i) => (
            <Input.Group compact key={i} style={{ width:'100%', display:'flex' }}>
              <Input value={ab} onChange={(e) => { const n=[...abilities]; n[i]=e.target.value; set({ abilities: n }); }} />
              <Button danger icon={<DeleteOutlined />} onClick={() => set({ abilities: abilities.filter((_,j)=>j!==i) })} />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ abilities: [...abilities, ''] })}>Add ability</Button>
        </div>
      </Collapse.Panel>

      {/* Feats */}
      <Collapse.Panel header={`Feats (${feats.length})`} key="feats">
        <div style={{ display: 'grid', gap: 6 }}>
          {feats.map((f, i) => (
            <Input.Group compact key={i} style={{ width:'100%', display:'flex' }}>
              <Input value={f} onChange={(e) => { const n=[...feats]; n[i]=e.target.value; set({ feats: n }); }} />
              <Button danger icon={<DeleteOutlined />} onClick={() => set({ feats: feats.filter((_,j)=>j!==i) })} />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ feats: [...feats, ''] })}>Add feat</Button>
        </div>
      </Collapse.Panel>

      {/* Spells */}
      <Collapse.Panel header="Spells" key="spells">
        <LabelInput label="Total spells known">
          <InputNumber value={data.spellsKnownTotal} onChange={(v) => set({ spellsKnownTotal: v ?? undefined })} style={{ width: 100 }} />
        </LabelInput>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'grid', gap: 10 }}>
          {['1st','2nd','3rd','4th','5th','6th'].map((lvl) => {
            const s = spellSlots[lvl] ?? {};
            return (
              <div key={lvl} style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3,1fr)', gap: 6, alignItems: 'center' }}>
                <Typography.Text strong style={{ width: 40 }}>{lvl}</Typography.Text>
                <LabelInput label="Known"><InputNumber size="small" style={{ width:'100%' }} value={s.spellsKnown} onChange={(v) => set({ spellSlots: { ...spellSlots, [lvl]: { ...s, spellsKnown: v ?? undefined } } })} /></LabelInput>
                <LabelInput label="Per day"><InputNumber size="small" style={{ width:'100%' }} value={s.spellsPerDay} onChange={(v) => set({ spellSlots: { ...spellSlots, [lvl]: { ...s, spellsPerDay: v ?? undefined } } })} /></LabelInput>
                <LabelInput label="Used"><InputNumber size="small" style={{ width:'100%' }} value={s.spellSlotsUsed} onChange={(v) => set({ spellSlots: { ...spellSlots, [lvl]: { ...s, spellSlotsUsed: v ?? undefined } } })} /></LabelInput>
              </div>
            );
          })}
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>Known spells list</Typography.Text>
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          {spellsList.map((sp, i) => (
            <Input.Group compact key={i} style={{ width:'100%', display:'flex' }}>
              <Input value={sp} onChange={(e) => { const n=[...spellsList]; n[i]=e.target.value; set({ spellsList: n }); }} />
              <Button danger icon={<DeleteOutlined />} onClick={() => set({ spellsList: spellsList.filter((_,j)=>j!==i) })} />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ spellsList: [...spellsList, ''] })}>Add spell</Button>
        </div>
      </Collapse.Panel>

      {/* Equipment */}
      <Collapse.Panel header={`Equipment (${equipment.length})`} key="equipment">
        <div style={{ display: 'grid', gap: 6 }}>
          {equipment.map((eq, i) => (
            <Space wrap key={i} size={4}>
              <Input placeholder="Name" value={eq.name ?? ''} onChange={(e) => { const n=[...equipment]; n[i]={...n[i],name:e.target.value}; set({ equipment: n }); }} style={{ width: 200 }} />
              <Input placeholder="Level" value={eq.level ?? ''} onChange={(e) => { const n=[...equipment]; n[i]={...n[i],level:e.target.value}; set({ equipment: n }); }} style={{ width: 70 }} />
              <Input placeholder="Bulk" value={eq.bulk ?? ''} onChange={(e) => { const n=[...equipment]; n[i]={...n[i],bulk:e.target.value}; set({ equipment: n }); }} style={{ width: 70 }} />
              <Button danger size="small" icon={<DeleteOutlined />} onClick={() => set({ equipment: equipment.filter((_,j)=>j!==i) })} />
            </Space>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ equipment: [...equipment, {}] })}>Add item</Button>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <Space wrap size={12}>
          <LabelInput label="Credits"><InputNumber value={data.credits} onChange={(v) => set({ credits: v ?? undefined })} /></LabelInput>
          <LabelInput label="Other wealth"><Input value={data.otherWealth ?? ''} onChange={(e) => set({ otherWealth: e.target.value })} style={{ width: 200 }} /></LabelInput>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Backpacks</Typography.Text>
            <Space>
              <Switch size="small" checked={!!data.backpacksCommercial} onChange={(v) => set({ backpacksCommercial: v })} /> <span style={{ fontSize: 12 }}>Commercial</span>
              <Switch size="small" checked={!!data.backpacksIndustrial} onChange={(v) => set({ backpacksIndustrial: v })} /> <span style={{ fontSize: 12 }}>Industrial</span>
            </Space>
          </div>
        </Space>
        <Divider style={{ margin: '10px 0 6px' }} />
        <Space wrap size={12}>
          <CalcBox label="Unencumbered (Bulk)" value={calcStarfinder(data).carryUnenc} />
          <CalcBox label="Encumbered (Bulk)" value={calcStarfinder(data).carryEnc} />
          <CalcBox label="Overloaded (Bulk)" value={calcStarfinder(data).carryOver} />
        </Space>
      </Collapse.Panel>

      {/* Languages */}
      <Collapse.Panel header={`Languages (${languages.length})`} key="languages">
        <div style={{ display: 'grid', gap: 6 }}>
          {languages.map((l, i) => (
            <Input.Group compact key={i} style={{ width:'100%', display:'flex' }}>
              <Input value={l} onChange={(e) => { const n=[...languages]; n[i]=e.target.value; set({ languages: n }); }} />
              <Button danger icon={<DeleteOutlined />} onClick={() => set({ languages: languages.filter((_,j)=>j!==i) })} />
            </Input.Group>
          ))}
          <Button size="small" icon={<PlusOutlined />} onClick={() => set({ languages: [...languages, ''] })}>Add language</Button>
        </div>
      </Collapse.Panel>

      {/* XP */}
      <Collapse.Panel header="Experience" key="xp">
        <Space size={16}>
          <LabelInput label="XP Earned"><InputNumber value={data.xpEarned} onChange={(v) => set({ xpEarned: v ?? undefined })} /></LabelInput>
          <LabelInput label="Next Level"><InputNumber value={data.xpNextLevel} onChange={(v) => set({ xpNextLevel: v ?? undefined })} /></LabelInput>
        </Space>
      </Collapse.Panel>

    </Collapse>
  );
};
