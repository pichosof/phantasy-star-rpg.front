import React from 'react';
import { Button, Divider, Input, InputNumber, Modal, Space, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type {
  GurpsSheetData,
  GurpsWeapon,
  GurpsRangedWeapon,
  GurpsPossession,
  GurpsListItem,
  GurpsSkill,
  GurpsLanguage,
} from '@app/api/character-sheets.api';
import { importGcaFile } from '@app/utils/gca-import';
import { Collapse } from '@app/components/common/Collapse/Collapse';
import { w100, hiddenInput } from '@app/styles/styleUtils';
import * as S from './GurpsSheetForm.styles';

// ── GURPS Calculations ────────────────────────────────────────────────────────

const THRUST: Record<number, string> = {
  1: '1d-6',
  2: '1d-6',
  3: '1d-5',
  4: '1d-4',
  5: '1d-3',
  6: '1d-2',
  7: '1d-1',
  8: '1d',
  9: '1d+1',
  10: '1d+2',
  11: '1d+3',
  12: '2d-1',
  13: '2d',
  14: '2d+1',
  15: '2d+2',
  16: '2d+3',
  17: '3d-1',
  18: '3d',
  19: '3d+1',
  20: '3d+2',
};
const SWING: Record<number, string> = {
  1: '1d-5',
  2: '1d-4',
  3: '1d-3',
  4: '1d-2',
  5: '1d-1',
  6: '1d',
  7: '1d+1',
  8: '1d+2',
  9: '2d-1',
  10: '2d',
  11: '2d+1',
  12: '2d+2',
  13: '2d+3',
  14: '3d-1',
  15: '3d',
  16: '3d+1',
  17: '3d+2',
  18: '3d+3',
  19: '4d-1',
  20: '4d',
};

function getDamage(st: number) {
  const clamped = Math.min(Math.max(st, 1), 20);
  return {
    thr: THRUST[clamped] ?? `${Math.floor((st - 1) / 4)}d+${Math.round(((st - 1) % 4) - 2)}`,
    sw: SWING[clamped] ?? `${Math.floor(st / 4)}d+${Math.round((st % 4) - 2)}`,
  };
}

export function calcGurps(d: GurpsSheetData) {
  const st = d.st ?? 10,
    dx = d.dx ?? 10,
    iq = d.iq ?? 10,
    ht = d.ht ?? 10;
  const basicLift = Math.round(((st * st) / 5) * 10) / 10;
  const basicSpeed = Math.round(((dx + ht) / 4 + (d.basicSpeedMod ?? 0)) * 100) / 100;
  const basicMove = Math.floor(basicSpeed) + (d.basicMoveMod ?? 0);
  const dodge = Math.floor(basicSpeed) + 3;
  const damage = getDamage(st);
  const hp = d.hp ?? st;
  const will = d.will ?? iq;
  const per = d.per ?? iq;
  const fp = d.fp ?? ht;
  const bl = basicLift;
  const encumbrance = [
    { label: 'None (0)', bl: bl, move: basicMove, dodge },
    { label: 'Light (1)', bl: bl * 2, move: Math.floor(basicMove * 0.8), dodge: dodge - 1 },
    { label: 'Medium (2)', bl: bl * 3, move: Math.floor(basicMove * 0.6), dodge: dodge - 2 },
    { label: 'Heavy (3)', bl: bl * 6, move: Math.floor(basicMove * 0.4), dodge: dodge - 3 },
    { label: 'X-Heavy (4)', bl: bl * 10, move: Math.floor(basicMove * 0.2), dodge: dodge - 4 },
  ];
  return { basicLift, basicSpeed, basicMove, dodge, damage, hp, will, per, fp, encumbrance };
}

// ── Array editor helpers ───────────────────────────────────────────────────────

function ArraySection<T extends object>({
  items,
  onChange,
  blank,
  renderRow,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  blank: T;
  renderRow: (item: T, idx: number, set: (v: T) => void, del: () => void) => React.ReactNode;
}) {
  return (
    <div style={S.gridGap8}>
      {items.map((item, idx) =>
        renderRow(
          item,
          idx,
          (v) => {
            const next = [...items];
            next[idx] = v;
            onChange(next);
          },
          () => onChange(items.filter((_, i) => i !== idx)),
        ),
      )}
      <Button size="small" icon={<PlusOutlined />} onClick={() => onChange([...items, { ...blank }])}>
        Add
      </Button>
    </div>
  );
}

// ── Row components ─────────────────────────────────────────────────────────────

function NamePointsRow({
  item,
  set,
  del,
  pointLabel = 'Points',
}: {
  item: GurpsListItem;
  set: (v: GurpsListItem) => void;
  del: () => void;
  pointLabel?: string;
}) {
  return (
    <Input.Group compact style={S.compactGroup}>
      <Input placeholder="Name" value={item.name ?? ''} onChange={(e) => set({ ...item, name: e.target.value })} />
      <InputNumber
        placeholder={pointLabel}
        value={item.points}
        onChange={(v) => set({ ...item, points: v ?? undefined })}
        style={S.width90}
      />
      <Button danger icon={<DeleteOutlined />} onClick={del} />
    </Input.Group>
  );
}

function SkillRow({ item, set, del }: { item: GurpsSkill; set: (v: GurpsSkill) => void; del: () => void }) {
  return (
    <Space wrap size={4} style={w100}>
      <Input
        placeholder="Skill"
        value={item.name ?? ''}
        onChange={(e) => set({ ...item, name: e.target.value })}
        style={S.width160}
      />
      <InputNumber
        placeholder="Level"
        value={item.level}
        onChange={(v) => set({ ...item, level: v ?? undefined })}
        style={S.width70}
      />
      <Input
        placeholder="Rel. Level"
        value={item.relativeLevel ?? ''}
        onChange={(e) => set({ ...item, relativeLevel: e.target.value })}
        style={S.width80}
      />
      <InputNumber
        placeholder="Pts"
        value={item.points}
        onChange={(v) => set({ ...item, points: v ?? undefined })}
        style={S.width60}
      />
      <Button danger size="small" icon={<DeleteOutlined />} onClick={del} />
    </Space>
  );
}

function LangRow({ item, set, del }: { item: GurpsLanguage; set: (v: GurpsLanguage) => void; del: () => void }) {
  return (
    <Input.Group compact style={S.compactGroup}>
      <Input placeholder="Language" value={item.name ?? ''} onChange={(e) => set({ ...item, name: e.target.value })} />
      <Input
        placeholder="Spoken"
        value={item.spoken ?? ''}
        onChange={(e) => set({ ...item, spoken: e.target.value })}
        style={S.width100}
      />
      <Input
        placeholder="Written"
        value={item.written ?? ''}
        onChange={(e) => set({ ...item, written: e.target.value })}
        style={S.width100}
      />
      <Button danger icon={<DeleteOutlined />} onClick={del} />
    </Input.Group>
  );
}

function HandWeaponRow({ item, set, del }: { item: GurpsWeapon; set: (v: GurpsWeapon) => void; del: () => void }) {
  return (
    <Space wrap size={4}>
      <Input
        placeholder="Weapon"
        value={item.weapon ?? ''}
        onChange={(e) => set({ ...item, weapon: e.target.value })}
        style={S.width120}
      />
      <Input
        placeholder="Damage"
        value={item.damage ?? ''}
        onChange={(e) => set({ ...item, damage: e.target.value })}
        style={S.width80}
      />
      <Input
        placeholder="Reach"
        value={item.reach ?? ''}
        onChange={(e) => set({ ...item, reach: e.target.value })}
        style={S.width70}
      />
      <Input
        placeholder="Parry"
        value={item.parry ?? ''}
        onChange={(e) => set({ ...item, parry: e.target.value })}
        style={S.width60}
      />
      <Input
        placeholder="Notes"
        value={item.notes ?? ''}
        onChange={(e) => set({ ...item, notes: e.target.value })}
        style={S.width140}
      />
      <InputNumber
        placeholder="Cost"
        value={item.cost}
        onChange={(v) => set({ ...item, cost: v ?? undefined })}
        style={S.width80}
      />
      <InputNumber
        placeholder="Weight"
        value={item.weight}
        onChange={(v) => set({ ...item, weight: v ?? undefined })}
        style={S.width70}
      />
      <Button danger size="small" icon={<DeleteOutlined />} onClick={del} />
    </Space>
  );
}

function RangedRow({
  item,
  set,
  del,
}: {
  item: GurpsRangedWeapon;
  set: (v: GurpsRangedWeapon) => void;
  del: () => void;
}) {
  return (
    <Space wrap size={4}>
      {(['weapon', 'damage', 'acc', 'range', 'rof', 'shots', 'st', 'bulk', 'rcl', 'lc', 'notes'] as const).map((f) => (
        <Input
          key={f}
          placeholder={f}
          value={item[f] ?? ''}
          onChange={(e) => set({ ...item, [f]: e.target.value })}
          style={S.rangedInputWidth(f)}
        />
      ))}
      <Button danger size="small" icon={<DeleteOutlined />} onClick={del} />
    </Space>
  );
}

function PossessionRow({
  item,
  set,
  del,
}: {
  item: GurpsPossession;
  set: (v: GurpsPossession) => void;
  del: () => void;
}) {
  return (
    <Input.Group compact style={S.compactGroup}>
      <Input placeholder="Item" value={item.item ?? ''} onChange={(e) => set({ ...item, item: e.target.value })} />
      <Input
        placeholder="Location"
        value={item.location ?? ''}
        onChange={(e) => set({ ...item, location: e.target.value })}
        style={S.width100}
      />
      <InputNumber
        placeholder="Cost"
        value={item.cost}
        onChange={(v) => set({ ...item, cost: v ?? undefined })}
        style={S.width80}
      />
      <InputNumber
        placeholder="Weight"
        value={item.weight}
        onChange={(v) => set({ ...item, weight: v ?? undefined })}
        style={S.width70}
      />
      <Button danger icon={<DeleteOutlined />} onClick={del} />
    </Input.Group>
  );
}

// ── Label helper ──────────────────────────────────────────────────────────────

const LabelInput = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Typography.Text type="secondary" style={S.labelText}>
      {label}
    </Typography.Text>
    {children}
  </div>
);

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div style={S.statCard}>
    <div style={S.statLabel}>{label}</div>
    <div style={S.statValue}>{value}</div>
  </div>
);

// ── Main form ─────────────────────────────────────────────────────────────────

interface Props {
  data: GurpsSheetData;
  onChange: (d: GurpsSheetData) => void;
}

export const GurpsSheetForm: React.FC<Props> = ({ data, onChange }) => {
  const calc = React.useMemo(() => calcGurps(data), [data]);
  const set = (patch: Partial<GurpsSheetData>) => onChange({ ...data, ...patch });
  const importRef = React.useRef<HTMLInputElement>(null);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    let imported: Awaited<ReturnType<typeof importGcaFile>>;
    try {
      imported = await importGcaFile(file);
    } catch (err) {
      message.error((err as Error).message);
      return;
    }
    Modal.confirm({
      title: 'Import GCA data',
      content: 'This will replace all current sheet data. Continue?',
      okText: 'Import',
      cancelText: 'Cancel',
      onOk: () => {
        onChange(imported.data as GurpsSheetData);
        if (imported.warnings.length > 0) {
          imported.warnings.forEach((w) => message.warning(w));
        } else {
          message.success('Sheet imported successfully!');
        }
      },
    });
  }

  const adv = data.advantages ?? [];
  const dis = data.disadvantages ?? [];
  const skills = data.skills ?? [];
  const languages = data.languages ?? [];
  const cf = data.culturalFamiliarities ?? [];
  const hw = data.handWeapons ?? [];
  const rw = data.rangedWeapons ?? [];
  const poss = data.possessions ?? [];

  return (
    <div>
      <div style={S.importActions}>
        <input ref={importRef} type="file" accept=".gca5,.gca4,.txt,.xml" style={hiddenInput} onChange={handleImport} />
        <Button size="small" icon={<UploadOutlined />} onClick={() => importRef.current?.click()}>
          Import GCA (.gca5 / .txt)
        </Button>
      </div>
      <Collapse defaultActiveKey={['identity', 'attrs']} style={w100}>
        {/* Identity */}
        <Collapse.Panel header="Identity" key="identity">
          <div style={S.identityGrid}>
            <LabelInput label="Player">
              <Input value={data.player ?? ''} onChange={(e) => set({ player: e.target.value })} />
            </LabelInput>
            <LabelInput label="Point Total">
              <InputNumber style={w100} value={data.pointTotal} onChange={(v) => set({ pointTotal: v ?? undefined })} />
            </LabelInput>
            <LabelInput label="Unspent Pts">
              <InputNumber style={w100} value={data.unspentPts} onChange={(v) => set({ unspentPts: v ?? undefined })} />
            </LabelInput>
            <LabelInput label="Height (cm)">
              <InputNumber style={w100} value={data.heightCm} onChange={(v) => set({ heightCm: v ?? undefined })} />
            </LabelInput>
            <LabelInput label="Weight (kg)">
              <InputNumber style={w100} value={data.weightKg} onChange={(v) => set({ weightKg: v ?? undefined })} />
            </LabelInput>
            <LabelInput label="Size Modifier">
              <InputNumber
                style={w100}
                value={data.sizeModifier}
                onChange={(v) => set({ sizeModifier: v ?? undefined })}
              />
            </LabelInput>
            <LabelInput label="Age">
              <InputNumber style={w100} value={data.age} onChange={(v) => set({ age: v ?? undefined })} />
            </LabelInput>
            <LabelInput label="TL">
              <Input value={data.tl ?? ''} onChange={(e) => set({ tl: e.target.value })} />
            </LabelInput>
          </div>
          <div style={S.sectionTopMargin}>
            <LabelInput label="Appearance">
              <Input value={data.appearance ?? ''} onChange={(e) => set({ appearance: e.target.value })} />
            </LabelInput>
          </div>
        </Collapse.Panel>

        {/* Primary Attributes */}
        <Collapse.Panel header="Primary Attributes" key="attrs">
          <div style={S.attributesGrid}>
            {(['st', 'dx', 'iq', 'ht'] as const).map((attr) => (
              <LabelInput key={attr} label={attr.toUpperCase()}>
                <InputNumber style={w100} value={data[attr] ?? 10} min={1} onChange={(v) => set({ [attr]: v ?? 10 })} />
              </LabelInput>
            ))}
          </div>
          <Divider style={S.sectionDivider} />
          <Space wrap size={8}>
            <Stat label="Basic Lift" value={`${calc.basicLift} kg`} />
            <Stat label="Thr Damage" value={calc.damage.thr} />
            <Stat label="Sw Damage" value={calc.damage.sw} />
            <Stat label="Basic Speed" value={calc.basicSpeed} />
            <Stat label="Basic Move" value={calc.basicMove} />
            <Stat label="Dodge" value={calc.dodge} />
          </Space>
          <div style={S.speedAdjustGrid}>
            <LabelInput label="Basic Speed Mod">
              <InputNumber
                style={w100}
                value={data.basicSpeedMod ?? 0}
                step={0.25}
                onChange={(v) => set({ basicSpeedMod: v ?? 0 })}
              />
            </LabelInput>
            <LabelInput label="Basic Move Mod">
              <InputNumber
                style={w100}
                value={data.basicMoveMod ?? 0}
                onChange={(v) => set({ basicMoveMod: v ?? 0 })}
              />
            </LabelInput>
          </div>
        </Collapse.Panel>

        {/* Secondary */}
        <Collapse.Panel header="Secondary Attributes" key="secondary">
          <div style={S.secondaryGrid}>
            {(
              [
                ['hp', 'HP (base: ST)'],
                ['will', 'Will (base: IQ)'],
                ['per', 'Perception (base: IQ)'],
                ['fp', 'Fatigue Points (base: HT)'],
              ] as const
            ).map(([k, lbl]) => (
              <LabelInput key={k} label={lbl}>
                <InputNumber
                  style={w100}
                  value={data[k] ?? calc[k as 'hp' | 'will' | 'per' | 'fp']}
                  onChange={(v) => set({ [k]: v ?? undefined })}
                />
              </LabelInput>
            ))}
            <LabelInput label="Current HP">
              <InputNumber
                style={w100}
                value={data.currentHp ?? calc.hp}
                onChange={(v) => set({ currentHp: v ?? undefined })}
              />
            </LabelInput>
            <LabelInput label="Current FP">
              <InputNumber
                style={w100}
                value={data.currentFp ?? calc.fp}
                onChange={(v) => set({ currentFp: v ?? undefined })}
              />
            </LabelInput>
          </div>
        </Collapse.Panel>

        {/* Encumbrance */}
        <Collapse.Panel header="Encumbrance" key="encumbrance">
          <div style={S.encumbranceWrap}>
            <table style={S.encumbranceTable}>
              <thead>
                <tr>
                  {['Level', 'Max Weight (kg)', 'Movement', 'Dodge'].map((h) => (
                    <th key={h} style={S.encumbranceHeaderCell}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.encumbrance.map((row) => (
                  <tr key={row.label}>
                    <td style={S.encumbranceCell}>{row.label}</td>
                    <td style={S.encumbranceCell}>{row.bl}</td>
                    <td style={S.encumbranceCell}>{row.move}</td>
                    <td style={S.encumbranceCell}>{row.dodge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Collapse.Panel>

        {/* Combat */}
        <Collapse.Panel header="Combat" key="combat">
          <div style={S.combatGrid}>
            <LabelInput label="DR">
              <Input value={data.dr ?? ''} onChange={(e) => set({ dr: e.target.value })} />
            </LabelInput>
            <LabelInput label="Parry">
              <Input value={data.parry ?? ''} onChange={(e) => set({ parry: e.target.value })} />
            </LabelInput>
            <LabelInput label="Block">
              <Input value={data.block ?? ''} onChange={(e) => set({ block: e.target.value })} />
            </LabelInput>
          </div>
        </Collapse.Panel>

        {/* Languages */}
        <Collapse.Panel header={`Languages (${languages.length})`} key="lang">
          <ArraySection
            items={languages}
            onChange={(v) => set({ languages: v })}
            blank={{ name: '', spoken: '', written: '' }}
            renderRow={(item, _, s, d) => <LangRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Cultural Familiarities */}
        <Collapse.Panel header={`Cultural Familiarities (${cf.length})`} key="cf">
          <ArraySection
            items={cf}
            onChange={(v) => set({ culturalFamiliarities: v })}
            blank={{ name: '', points: 0 }}
            renderRow={(item, _, s, d) => <NamePointsRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Advantages */}
        <Collapse.Panel header={`Advantages & Skills (${adv.length})`} key="adv">
          <ArraySection
            items={adv}
            onChange={(v) => set({ advantages: v })}
            blank={{ name: '', points: 0 }}
            renderRow={(item, _, s, d) => <NamePointsRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Disadvantages */}
        <Collapse.Panel header={`Disadvantages & Quirks (${dis.length})`} key="dis">
          <ArraySection
            items={dis}
            onChange={(v) => set({ disadvantages: v })}
            blank={{ name: '', points: 0 }}
            renderRow={(item, _, s, d) => <NamePointsRow key={_} item={item} set={s} del={d} pointLabel="Pts (neg)" />}
          />
        </Collapse.Panel>

        {/* Skills */}
        <Collapse.Panel header={`Skills (${skills.length})`} key="skills">
          <ArraySection
            items={skills}
            onChange={(v) => set({ skills: v })}
            blank={{ name: '', level: 0, relativeLevel: '', points: 0 }}
            renderRow={(item, _, s, d) => <SkillRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Hand Weapons */}
        <Collapse.Panel header={`Melee Weapons (${hw.length})`} key="hw">
          <ArraySection
            items={hw}
            onChange={(v) => set({ handWeapons: v })}
            blank={{ weapon: '', damage: '', reach: '', parry: '', notes: '' }}
            renderRow={(item, _, s, d) => <HandWeaponRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Ranged Weapons */}
        <Collapse.Panel header={`Ranged Weapons (${rw.length})`} key="rw">
          <div style={S.rangedHint}>Weapon · Damage · Acc · Range · RoF · Shots · ST · Bulk · Rcl · LC · Notes</div>
          <ArraySection
            items={rw}
            onChange={(v) => set({ rangedWeapons: v })}
            blank={{
              weapon: '',
              damage: '',
              acc: '',
              range: '',
              rof: '',
              shots: '',
              st: '',
              bulk: '',
              rcl: '',
              lc: '',
              notes: '',
            }}
            renderRow={(item, _, s, d) => <RangedRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Possessions */}
        <Collapse.Panel header={`Possessions & Armor (${poss.length})`} key="poss">
          <ArraySection
            items={poss}
            onChange={(v) => set({ possessions: v })}
            blank={{ item: '', location: '', cost: 0, weight: 0 }}
            renderRow={(item, _, s, d) => <PossessionRow key={_} item={item} set={s} del={d} />}
          />
        </Collapse.Panel>

        {/* Reaction Modifiers */}
        <Collapse.Panel header="Reaction Modifiers" key="reaction">
          <div style={S.gridGap8}>
            {(['appearance', 'status', 'reputation'] as const).map((k) => (
              <LabelInput key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                <Input
                  value={data.reactionModifiers?.[k] ?? ''}
                  onChange={(e) => set({ reactionModifiers: { ...data.reactionModifiers, [k]: e.target.value } })}
                />
              </LabelInput>
            ))}
          </div>
        </Collapse.Panel>

        {/* Notes */}
        <Collapse.Panel header="Character Notes" key="notes">
          <Input.TextArea
            value={data.characterNotes ?? ''}
            onChange={(e) => set({ characterNotes: e.target.value })}
            rows={6}
            style={S.notesTextarea}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
