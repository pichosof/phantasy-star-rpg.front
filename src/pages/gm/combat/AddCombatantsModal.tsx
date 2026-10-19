import React from 'react';
import {
  Alert,
  Avatar,
  Checkbox,
  Empty,
  Form,
  InputNumber,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import type { Combatant, CombatantKind } from '@app/api/encounters.api';
import { BestiaryApi, type StatBlock, listStatBlocks } from '@app/api/bestiary.api';
import { PlayersApi } from '@app/api/rpg.api';
import { type CharacterSheet, type StarfinderSheetData, listCharacterSheets } from '@app/api/character-sheets.api';
import { thumbUrl } from '@app/api/images.api';
import { resolveApiUrl } from '@app/api/http.api';
import { calcStarfinder } from '@app/utils/starfinder-calc';
import type { Monster } from '@app/types/rpg';
import { fullPool, newCombatant } from './combat-engine';

/** Last stats used for a bestiary entry, so the second fight against it is one click. */
export type MonsterStats = Pick<Combatant, 'initBonus' | 'eac' | 'kac'> & { hp: number; sp: number; rp: number };

interface AddCombatantsModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (list: Combatant[]) => void;
  /** Names already in the fight (PCs are added once). */
  presentRefs: Set<string>;
  monsterHistory: Map<number, MonsterStats>;
}

type StatsForm = { hp: number; sp: number; rp: number; eac?: number | null; kac?: number | null; initBonus: number };

const DEFAULT_STATS: StatsForm = { hp: 10, sp: 0, rp: 0, eac: 10, kac: 10, initBonus: 0 };

/** Builds a PC combatant from a Starfinder sheet: totals, current values and AC from the sheet rules. */
export function combatantFromSheet(sheet: CharacterSheet, imageUrl?: string | null): Combatant {
  const d = sheet.data as StarfinderSheetData;
  const calc = calcStarfinder(d);
  const pool = (max?: number, current?: number) => ({ max: max ?? 0, current: current ?? max ?? 0 });
  return newCombatant({
    kind: 'pc',
    name: sheet.name,
    refId: sheet.id,
    imageUrl: imageUrl ?? null,
    initBonus: calc.initiative,
    eac: calc.eac,
    kac: calc.kac,
    sp: pool(d.staminaTotal, d.staminaCurrent),
    hp: pool(d.hpTotal, d.hpCurrent),
    rp: pool(d.resolveTotal, d.resolveCurrent),
  });
}

const StatsFields: React.FC = () => (
  <Space wrap size={[12, 0]}>
    <Form.Item label="HP" name="hp" rules={[{ required: true }]}>
      <InputNumber min={0} max={99999} />
    </Form.Item>
    <Form.Item label="SP" name="sp">
      <InputNumber min={0} max={99999} />
    </Form.Item>
    <Form.Item label="RP" name="rp">
      <InputNumber min={0} max={999} />
    </Form.Item>
    <Form.Item label="EAC" name="eac">
      <InputNumber min={0} max={99} />
    </Form.Item>
    <Form.Item label="KAC" name="kac">
      <InputNumber min={0} max={99} />
    </Form.Item>
    <Form.Item label="Init bonus" name="initBonus">
      <InputNumber min={-20} max={40} />
    </Form.Item>
  </Space>
);

const fromStats = (v: StatsForm) => ({
  hp: fullPool(v.hp ?? 0),
  sp: fullPool(v.sp ?? 0),
  rp: fullPool(v.rp ?? 0),
  eac: v.eac ?? null,
  kac: v.kac ?? null,
  initBonus: v.initBonus ?? 0,
});

const signed = (n?: number | null) => (n === null || n === undefined ? '—' : `${n >= 0 ? '+' : ''}${n}`);

/** Compact text kept on the combatant card: attacks and special abilities. */
function statBlockNotes(b: StatBlock): string {
  const attacks = b.attacks
    .map(
      (a) =>
        `${a.name}${a.bonus !== null && a.bonus !== undefined ? ` ${signed(a.bonus)}` : ''}${a.damage ? ` (${a.damage})` : ''}`,
    )
    .join('; ');
  const abilities = b.abilities.map((a) => a.name).join(', ');
  return [`CR ${b.cr}`, attacks, abilities].filter(Boolean).join(' · ').slice(0, 2000);
}

const StatBlockPreview: React.FC<{ block: StatBlock }> = ({ block: b }) => (
  <Typography.Paragraph style={{ margin: 0 }} type="secondary">
    <b>
      CR {b.cr}
      {b.xp ? ` · XP ${b.xp}` : ''}
    </b>
    {b.size ? ` · ${b.size}` : ''}
    {b.type ? ` · ${b.type}` : ''} · Fort {signed(b.fort)} · Ref {signed(b.ref)} · Will {signed(b.will)}
    {b.speed ? ` · ${b.speed}` : ''}
    <br />
    {b.attacks.map((a) => `${a.name} ${signed(a.bonus)}${a.damage ? ` (${a.damage})` : ''}`).join(' · ')}
    {b.abilities.length > 0 && (
      <>
        <br />
        {b.abilities.map((a) => a.name).join(' · ')}
      </>
    )}
  </Typography.Paragraph>
);

export const AddCombatantsModal: React.FC<AddCombatantsModalProps> = ({
  open,
  onClose,
  onAdd,
  presentRefs,
  monsterHistory,
}) => {
  const [tab, setTab] = React.useState('party');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sheets, setSheets] = React.useState<CharacterSheet[]>([]);
  const [portraits, setPortraits] = React.useState<Map<string, string>>(new Map());
  const [monsters, setMonsters] = React.useState<Monster[]>([]);
  const [picked, setPicked] = React.useState<number[]>([]);
  const [monsterId, setMonsterId] = React.useState<number | null>(null);
  const [statBlocks, setStatBlocks] = React.useState<Map<number, StatBlock[]>>(new Map());
  const [stage, setStage] = React.useState<number | 'last' | 'manual'>('manual');
  const [count, setCount] = React.useState(1);
  const [kind, setKind] = React.useState<CombatantKind>('npc');
  const [monsterForm] = Form.useForm<StatsForm>();
  const [customForm] = Form.useForm<StatsForm & { name: string }>();

  React.useEffect(() => {
    if (!open) return;
    setPicked([]);
    setError(null);
    setLoading(true);
    Promise.all([
      listCharacterSheets('starfinder'),
      BestiaryApi.list(),
      PlayersApi.list().catch(() => []),
      listStatBlocks().catch(() => []),
    ])
      .then(([s, m, players, blocks]) => {
        setStatBlocks(new Map(blocks.map((b) => [b.monsterId, b.blocks])));
        setSheets(s);
        setMonsters([...m].sort((a, b) => a.name.localeCompare(b.name)));
        const map = new Map<string, string>();
        for (const p of players) if (p.imageUrl) map.set(p.name.trim().toLowerCase(), p.imageUrl);
        setPortraits(map);
      })
      .catch(() => setError('Could not load sheets and bestiary.'))
      .finally(() => setLoading(false));
  }, [open]);

  const stages = monsterId !== null ? (statBlocks.get(monsterId) ?? []) : [];
  const block = typeof stage === 'number' ? stages[stage] : undefined;

  // Default stage when a creature is picked: its book stat block, else the last fight's stats.
  React.useEffect(() => {
    if (monsterId === null) return;
    if ((statBlocks.get(monsterId) ?? []).length) setStage(0);
    else setStage(monsterHistory.has(monsterId) ? 'last' : 'manual');
  }, [monsterId, statBlocks, monsterHistory]);

  // Fill the stat fields from the chosen stage.
  React.useEffect(() => {
    if (monsterId === null) return;
    if (block) {
      monsterForm.setFieldsValue({
        hp: block.hp,
        sp: block.sp ?? 0,
        rp: block.rp ?? 0,
        eac: block.eac,
        kac: block.kac,
        initBonus: block.initiative,
      });
    } else if (stage === 'last' && monsterHistory.has(monsterId)) {
      monsterForm.setFieldsValue({ ...monsterHistory.get(monsterId) });
    } else {
      monsterForm.setFieldsValue(DEFAULT_STATS);
    }
  }, [monsterId, stage, block, monsterHistory, monsterForm]);

  const portraitOf = (name: string) => portraits.get(name.trim().toLowerCase()) ?? null;

  async function handleOk() {
    if (tab === 'party') {
      const list = sheets.filter((s) => picked.includes(s.id)).map((s) => combatantFromSheet(s, portraitOf(s.name)));
      if (!list.length) return setError('Pick at least one character.');
      onAdd(list);
    } else if (tab === 'bestiary') {
      const monster = monsters.find((m) => Number(m.id) === monsterId);
      if (!monster) return setError('Pick a creature.');
      const stats = await monsterForm.validateFields();
      const n = Math.max(1, Math.min(20, count));
      const base = block && stages.length > 1 ? `${monster.name} (${block.label})` : monster.name;
      const list = Array.from({ length: n }, (_, i) =>
        newCombatant({
          kind: 'monster',
          name: n > 1 ? `${base} ${i + 1}` : base,
          refId: Number(monster.id),
          imageUrl: monster.imageUrl ?? null,
          notes: block ? statBlockNotes(block) : null,
          ...fromStats(stats),
        }),
      );
      onAdd(list);
    } else {
      const v = await customForm.validateFields();
      const n = Math.max(1, Math.min(20, count));
      onAdd(
        Array.from({ length: n }, (_, i) =>
          newCombatant({ kind, name: n > 1 ? `${v.name.trim()} ${i + 1}` : v.name.trim(), ...fromStats(v) }),
        ),
      );
    }
    onClose();
  }

  const party = (
    <>
      {sheets.length === 0 ? (
        <Empty description="No Starfinder sheets yet (GM → Sheets)." />
      ) : (
        <Checkbox.Group onChange={(v) => setPicked(v as number[])} style={{ width: '100%' }} value={picked}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            {sheets.map((s) => {
              const c = combatantFromSheet(s);
              const inFight = presentRefs.has(`pc:${s.id}`);
              const portrait = portraitOf(s.name);
              return (
                <Checkbox disabled={inFight} key={s.id} value={s.id}>
                  <Space>
                    <Avatar size="small" src={portrait ? resolveApiUrl(thumbUrl(portrait, 320)) : undefined}>
                      {s.name.slice(0, 1)}
                    </Avatar>
                    <span>
                      <b>{s.name}</b>{' '}
                      <Typography.Text type="secondary">
                        HP {c.hp.current}/{c.hp.max} · SP {c.sp.current}/{c.sp.max} · EAC {c.eac} · KAC {c.kac} · Init{' '}
                        {c.initBonus >= 0 ? '+' : ''}
                        {c.initBonus}
                        {inFight ? ' · already in the fight' : ''}
                      </Typography.Text>
                    </span>
                  </Space>
                </Checkbox>
              );
            })}
          </Space>
        </Checkbox.Group>
      )}
    </>
  );

  const bestiary = (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        <Select
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(v) => setMonsterId(v)}
          options={monsters.map((m) => ({ value: Number(m.id), label: m.name }))}
          placeholder="Creature"
          showSearch
          style={{ minWidth: 240 }}
          value={monsterId ?? undefined}
        />
        <Space>
          <span>How many</span>
          <InputNumber max={20} min={1} onChange={(v) => setCount(v ?? 1)} value={count} />
        </Space>
      </Space>
      {monsterId !== null && (
        <>
          <Select
            onChange={(v) => setStage(v)}
            options={[
              ...stages.map((b, i) => ({ value: i, label: `${b.label} · CR ${b.cr} · ${b.hp} HP` })),
              ...(monsterHistory.has(monsterId)
                ? [{ value: 'last' as const, label: 'Stats from the last fight' }]
                : []),
              { value: 'manual' as const, label: 'Enter manually' },
            ]}
            style={{ minWidth: 280 }}
            value={stage}
          />
          {block ? (
            <StatBlockPreview block={block} />
          ) : (
            <Typography.Text type="secondary">
              {stage === 'last'
                ? 'Stats from the last fight against this creature.'
                : 'No book stat block for this creature: fill them in once, they are remembered next time.'}
            </Typography.Text>
          )}
          <Form form={monsterForm} initialValues={DEFAULT_STATS} layout="vertical">
            <StatsFields />
          </Form>
        </>
      )}
    </Space>
  );

  const custom = (
    <Form form={customForm} initialValues={{ ...DEFAULT_STATS, name: '' }} layout="vertical">
      <Space wrap align="end">
        <Form.Item label="Name" name="name" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={100} style={{ minWidth: 220 }} />
        </Form.Item>
        <Form.Item label="Type">
          <Radio.Group onChange={(e) => setKind(e.target.value)} value={kind}>
            <Radio.Button value="npc">NPC / ally</Radio.Button>
            <Radio.Button value="monster">Enemy</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="How many">
          <InputNumber max={20} min={1} onChange={(v) => setCount(v ?? 1)} value={count} />
        </Form.Item>
      </Space>
      <StatsFields />
    </Form>
  );

  return (
    <Modal
      destroyOnHidden
      okText="Add"
      onCancel={onClose}
      onOk={() => void handleOk()}
      open={open}
      title="Add to the fight"
      width={680}
    >
      {error && <Alert showIcon style={{ marginBottom: 12 }} type="error" message={error} />}
      {loading ? (
        <Spin />
      ) : (
        <Tabs
          activeKey={tab}
          items={[
            { key: 'party', label: 'Party (Starfinder sheets)', children: party },
            { key: 'bestiary', label: 'Bestiary', children: bestiary },
            { key: 'custom', label: 'Custom', children: custom },
          ]}
          onChange={(k) => {
            setTab(k);
            setError(null);
            setCount(1);
          }}
        />
      )}
    </Modal>
  );
};
