import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Empty,
  InputNumber,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { CopyOutlined, DeleteOutlined, ReloadOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { NpcApi } from '@app/api/npc.api';
import { createGmNote } from '@app/api/gm-notes.api';
import { BestiaryApi, listStatBlocks } from '@app/api/bestiary.api';
import { createEncounter } from '@app/api/encounters.api';
import { ROUTES } from '@app/constants/routes';
import { apiErrorMessage } from '@app/utils/api-error';
import { History, Rng, fresh } from '@app/generators/engine';
import { CULTURE_LABEL, type Culture } from '@app/generators/data/names';
import { NAME_SPACE, generateName } from '@app/generators/names';
import { PROFESSIONS, type Race } from '@app/generators/data/npc';
import { SHOP_TYPES } from '@app/generators/data/shops';
import { BIOME_CREATURES, DIFFICULTY, type Biome } from '@app/generators/data/encounters';
import { KINDS } from '@app/generators/data/contracts';
import {
  type CreatureOption,
  type GeneratedContract,
  type GeneratedEncounter,
  type GeneratedNpc,
  type GeneratedShop,
  type Setting,
  type SfItem,
  generateContract,
  generateEncounter,
  generateNpc,
  generateShop,
  npcToMarkdown,
  settingFor,
} from '@app/generators/generators';
import { MOTAVIA_PLACES } from '@app/generators/data/places';
import { newCombatant, fullPool } from '@app/pages/gm/combat/combat-engine';

type World = 'motavia' | 'kolian' | 'dezolis';
const WORLDS: { value: World; label: string }[] = [
  { value: 'motavia', label: 'Motavia' },
  { value: 'kolian', label: 'Kolian lands' },
  { value: 'dezolis', label: 'Dezolis' },
];

const isKolian = (name: string) => /^Ko[lr]-/.test(name);
const CITY_OPTIONS: Record<World, { value: string; label: string }[]> = {
  motavia: MOTAVIA_PLACES.filter((p) => !isKolian(p.name) && (p.pop > 0 || p.vocation))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({ value: p.name, label: `${p.name} — ${p.desc}` })),
  kolian: MOTAVIA_PLACES.filter((p) => isKolian(p.name)).map((p) => ({
    value: p.name,
    label: `${p.name} — ${p.desc}`,
  })),
  dezolis: [],
};

/** World + optional city (empty = anywhere in that world). Remembered per tab. */
function useWhere(key: string, initial: { world: World; city?: string }) {
  const [where, setWhere] = React.useState<{ world: World; city?: string }>(() => {
    try {
      const raw = localStorage.getItem(`picho.gen.where.${key}`);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(`picho.gen.where.${key}`, JSON.stringify(where));
    } catch {
      // only a convenience
    }
  }, [key, where]);
  const setting: Setting = settingFor(where.world, where.city);
  const controls = (
    <>
      <Segmented onChange={(v) => setWhere({ world: v as World })} options={WORLDS} value={where.world} />
      {CITY_OPTIONS[where.world].length > 0 && (
        <Select
          allowClear
          onChange={(city?: string) => setWhere((w) => ({ ...w, city }))}
          optionFilterProp="label"
          options={CITY_OPTIONS[where.world]}
          placeholder={where.world === 'kolian' ? 'Any Kolian city' : 'Any city'}
          popupMatchSelectWidth={false}
          showSearch
          style={{ width: 220 }}
          value={where.city}
        />
      )}
    </>
  );
  return { setting, city: where.city, controls };
}

const copy = (text: string) => {
  void navigator.clipboard?.writeText(text).then(() => message.success('Copied.'));
};

/** Shared "N results, keep history" behaviour. */
function useResults<T>(key: string, keyOf: (t: T) => string) {
  const history = React.useMemo(() => new History(key), [key]);
  const [results, setResults] = React.useState<{ seed: number; value: T }[]>([]);
  const run = (make: (rng: Rng) => T, n = 1) => {
    const out: { seed: number; value: T }[] = [];
    for (let i = 0; i < n; i += 1) {
      const rng = new Rng();
      out.push({ seed: rng.seed, value: fresh(history, rng, make, keyOf) });
    }
    setResults((r) => [...out, ...r].slice(0, 30));
  };
  return { results, run, clear: () => setResults([]), history };
}

const HistoryNote: React.FC<{ history: History; onReset: () => void }> = ({ history, onReset }) => (
  <Typography.Text style={{ fontSize: 12 }} type="secondary">
    Avoids repeating the last {history.size} results on this device.{' '}
    <Popconfirm onConfirm={onReset} title="Forget generated history?">
      <Typography.Link style={{ fontSize: 12 }}>Reset</Typography.Link>
    </Popconfirm>
  </Typography.Text>
);

// ── Names ──

const NamesTab: React.FC = () => {
  const [culture, setCulture] = React.useState<Culture>('palman');
  const { results, run, clear, history } = useResults<string>(`names`, (n) => n);
  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        <Segmented
          onChange={(v) => setCulture(v as Culture)}
          options={(Object.keys(CULTURE_LABEL) as Culture[]).map((c) => ({ value: c, label: CULTURE_LABEL[c] }))}
          value={culture}
        />
        <Button icon={<ReloadOutlined />} onClick={() => run((rng) => generateName(rng, culture), 12)} type="primary">
          12 names
        </Button>
        <Button disabled={!results.length} onClick={() => copy(results.map((r) => r.value).join('\n'))}>
          Copy all
        </Button>
        <Button disabled={!results.length} icon={<DeleteOutlined />} onClick={clear} />
      </Space>
      <Typography.Text type="secondary">{NAME_SPACE[culture]}</Typography.Text>
      {results.length === 0 ? (
        <Empty description="Pick a people and generate." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Space size={[8, 8]} wrap>
          {results.map((r) => (
            <Tag
              key={`${r.seed}-${r.value}`}
              onClick={() => copy(r.value)}
              style={{ cursor: 'pointer', fontSize: 14, padding: '4px 10px' }}
            >
              {r.value}
            </Tag>
          ))}
        </Space>
      )}
      <HistoryNote history={history} onReset={() => history.clear()} />
    </Space>
  );
};

// ── NPC ──

const NpcCard: React.FC<{ npc: GeneratedNpc; seed: number }> = ({ npc, seed }) => {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await NpcApi.create({
        name: npc.name,
        role: npc.profession,
        location: npc.location,
        description: npcToMarkdown(npc),
      });
      setSaved(true);
      void message.success(`${npc.name} saved as a hidden NPC.`);
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not save the NPC.'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card
      extra={
        <Space size={4}>
          <Tooltip title="Copy as Markdown">
            <Button
              icon={<CopyOutlined />}
              onClick={() => copy(`## ${npc.name}\n*${npc.profession} — ${npc.location}*\n\n${npcToMarkdown(npc)}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Save as NPC (hidden from players)">
            <Button disabled={saved} icon={<SaveOutlined />} loading={saving} onClick={() => void save()} size="small">
              {saved ? 'Saved' : 'Save'}
            </Button>
          </Tooltip>
        </Space>
      }
      size="small"
      title={
        <Space orientation="vertical" size={0}>
          <span>{npc.name}</span>
          <Typography.Text style={{ fontSize: 12, fontWeight: 400 }} type="secondary">
            {npc.race} · {npc.profession} · {npc.location}
          </Typography.Text>
        </Space>
      }
    >
      <Typography.Paragraph style={{ marginBottom: 6 }}>
        {npc.age}; {npc.appearance.join('; ')}.
      </Typography.Paragraph>
      <Typography.Paragraph style={{ marginBottom: 6 }}>
        <b>Personality:</b> {npc.traits.join('; ')}. {npc.voice}. <b>Quirk:</b> {npc.quirk}.
      </Typography.Paragraph>
      <Typography.Paragraph style={{ marginBottom: 6 }}>
        <b>Wants:</b> {npc.motivation}. <b>Hook:</b> {npc.hook}.
      </Typography.Paragraph>
      <Typography.Paragraph style={{ marginBottom: 6 }}>
        <b>Says:</b> “{npc.saying}” <Typography.Text type="secondary">({npc.relation})</Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
        <b>Secret (GM):</b> {npc.secret}. <span style={{ fontSize: 11 }}>· seed {seed}</span>
      </Typography.Paragraph>
    </Card>
  );
};

const NpcTab: React.FC = () => {
  const { setting, city, controls } = useWhere('npc', { world: 'motavia', city: 'Piata' });
  const [race, setRace] = React.useState<Race | undefined>();
  const [sector, setSector] = React.useState<string | undefined>();
  const { results, run, clear, history } = useResults<GeneratedNpc>('npc', (n) => `${n.name}|${n.profession}`);
  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        {controls}
        <Select
          allowClear
          onChange={setRace}
          options={(['Palmaniano', 'Motaviano', 'Koliano', 'Dezoliano', 'Esper', 'Andróide'] as Race[]).map((r) => ({
            value: r,
            label: r,
          }))}
          placeholder="Any people"
          style={{ minWidth: 150 }}
          value={race}
        />
        <Select
          allowClear
          onChange={setSector}
          options={Object.keys(PROFESSIONS).map((s) => ({ value: s, label: s }))}
          placeholder="Any sector"
          style={{ minWidth: 150 }}
          value={sector}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => run((rng) => generateNpc(rng, setting, { race, sector, city }), 3)}
          type="primary"
        >
          3 NPCs
        </Button>
        <Button disabled={!results.length} icon={<DeleteOutlined />} onClick={clear} />
      </Space>
      {results.length === 0 ? (
        <Empty description="Generate NPCs for the scene." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {results.map((r) => (
            <NpcCard key={r.seed} npc={r.value} seed={r.seed} />
          ))}
        </div>
      )}
      <HistoryNote history={history} onReset={() => history.clear()} />
    </Space>
  );
};

// ── Shop ──

let itemsCache: Promise<SfItem[]> | null = null;
const loadItems = () =>
  (itemsCache ??= fetch('/data/sf-items.json')
    .then((r) => r.json())
    .then((d: { items: [string, string, string, string, number, number, string, SfItem['tier']][] }) =>
      d.items.map(([name, kind, group, category, level, price, damage, tier]) => ({
        name,
        kind,
        group,
        category,
        level,
        price,
        damage,
        tier,
      })),
    ));

const shopMarkdown = (s: GeneratedShop) =>
  [
    `## ${s.name}`,
    `*${s.type.label} — ${s.place}* · dono(a): **${s.owner.name}** (${s.owner.race})`,
    '',
    s.flavor,
    '',
    `| Item | Detalhe | Preço (cr) |`,
    `|---|---|---:|`,
    ...s.lines.map((l) => `| ${l.name} | ${l.detail}${l.note ? ` — ${l.note}` : ''} | ${l.price} |`),
    '',
    `*${s.priceNote}*`,
  ].join('\n');

const ShopTab: React.FC = () => {
  const { setting, city, controls } = useWhere('shop', { world: 'motavia' });
  const [typeKey, setTypeKey] = React.useState<string | undefined>();
  const [items, setItems] = React.useState<SfItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { results, run, clear, history } = useResults<GeneratedShop>('shop', (s) => s.name);
  React.useEffect(() => {
    loadItems()
      .then(setItems)
      .catch(() => setError('Could not load the Starfinder item list.'));
  }, []);
  const current = results[0]?.value;

  const saveNote = async (s: GeneratedShop) => {
    try {
      await createGmNote({ title: `Loja: ${s.name}`, content: shopMarkdown(s), tags: 'loja, gerador' });
      void message.success('Saved to GM notes.');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not save.'));
    }
  };

  if (error) return <Alert showIcon type="error" message={error} />;
  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        {controls}
        <Select
          allowClear
          onChange={setTypeKey}
          options={SHOP_TYPES.map((t) => ({ value: t.key, label: t.label }))}
          placeholder="Any shop"
          style={{ minWidth: 200 }}
          value={typeKey}
        />
        <Button
          disabled={!items}
          icon={<ReloadOutlined />}
          onClick={() => items && run((rng) => generateShop(rng, setting, items, { typeKey, place: city }))}
          type="primary"
        >
          New shop
        </Button>
      </Space>
      <Typography.Text type="secondary">
        Starfinder 1e base prices, curated for Algol (no Pact Worlds gear, magic items or starship tech), plus local
        goods. Local price follows the Motavia economy: specialty cities are cheaper; small or isolated places pay
        freight.
      </Typography.Text>
      {!current ? (
        <Empty description="Generate a shop." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Card
          extra={
            <Space size={4}>
              <Button icon={<CopyOutlined />} onClick={() => copy(shopMarkdown(current))} size="small" />
              <Button icon={<SaveOutlined />} onClick={() => void saveNote(current)} size="small">
                GM note
              </Button>
            </Space>
          }
          size="small"
          title={
            <Space orientation="vertical" size={0}>
              <span>{current.name}</span>
              <Typography.Text style={{ fontSize: 12, fontWeight: 400 }} type="secondary">
                {current.type.label} · {current.place}
                {current.placeInfo ? ` — ${current.placeInfo}` : ''}
              </Typography.Text>
            </Space>
          }
        >
          <Typography.Paragraph>
            {current.flavor} Run by <b>{current.owner.name}</b> ({current.owner.race}, {current.owner.traits[0]}).
          </Typography.Paragraph>
          <Table
            columns={[
              {
                title: 'Item',
                dataIndex: 'name',
                render: (n: string, l) => (l.note ? <Tooltip title={l.note}>{n} *</Tooltip> : n),
              },
              { title: 'Details', dataIndex: 'detail' },
              {
                title: 'Price (cr)',
                dataIndex: 'price',
                align: 'right' as const,
                render: (p: number, l) => (
                  <Tooltip title={`Base ${l.base} cr`}>
                    <b>{p.toLocaleString()}</b>
                  </Tooltip>
                ),
              },
              {
                title: '',
                dataIndex: 'source',
                width: 90,
                render: (s: string) => <Tag color={s === 'Algol' ? 'gold' : undefined}>{s}</Tag>,
              },
            ]}
            dataSource={current.lines}
            pagination={false}
            rowKey="name"
            scroll={{ x: 520 }}
            size="small"
          />
          <Typography.Paragraph style={{ marginTop: 8, marginBottom: 0 }} type="secondary">
            {current.priceNote}
          </Typography.Paragraph>
        </Card>
      )}
      {results.length > 1 && (
        <Typography.Text type="secondary">
          Earlier:{' '}
          {results
            .slice(1, 6)
            .map((r) => r.value.name)
            .join(' · ')}{' '}
          <Button icon={<DeleteOutlined />} onClick={clear} size="small" type="text" />
        </Typography.Text>
      )}
      <HistoryNote history={history} onReset={() => history.clear()} />
    </Space>
  );
};

// ── Encounter ──

const EncounterTab: React.FC = () => {
  const navigate = useNavigate();
  const [options, setOptions] = React.useState<CreatureOption[] | null>(null);
  const [biome, setBiome] = React.useState<Biome>('Rota de caravana');
  const [apl, setApl] = React.useState(2);
  const [size, setSize] = React.useState(4);
  const [difficulty, setDifficulty] = React.useState('average');
  const [sending, setSending] = React.useState(false);
  const { results, run, history } = useResults<GeneratedEncounter | null>('encounter', (e) =>
    e ? e.groups.map((g) => `${g.count}x${g.option.species}/${g.option.block.label}`).join('+') : 'none',
  );

  React.useEffect(() => {
    Promise.all([BestiaryApi.list(), listStatBlocks()])
      .then(([monsters, blocks]) => {
        const byId = new Map(monsters.map((m) => [Number(m.id), m]));
        setOptions(
          blocks.flatMap((b) => {
            const m = byId.get(b.monsterId);
            return m
              ? b.blocks.map((block) => ({ monsterId: b.monsterId, species: m.name, imageUrl: m.imageUrl, block }))
              : [];
          }),
        );
      })
      .catch(() => setOptions([]));
  }, []);

  const current = results[0]?.value;

  const sendToCombat = async (e: GeneratedEncounter) => {
    setSending(true);
    try {
      const combatants = e.groups.flatMap(({ option, count }) =>
        Array.from({ length: count }, (_, i) =>
          newCombatant({
            kind: 'monster',
            name: `${option.species}${option.block.label ? ` (${option.block.label})` : ''}${count > 1 ? ` ${i + 1}` : ''}`,
            refId: option.monsterId,
            imageUrl: option.imageUrl ?? null,
            initBonus: option.block.initiative,
            eac: option.block.eac,
            kac: option.block.kac,
            hp: fullPool(option.block.hp),
            sp: fullPool(option.block.sp ?? 0),
            rp: fullPool(option.block.rp ?? 0),
            notes: `CR ${option.block.cr} · ${option.block.attacks.map((a) => `${a.name}${a.bonus != null ? ` +${a.bonus}` : ''}${a.damage ? ` (${a.damage})` : ''}`).join('; ')}`,
          }),
        ),
      );
      const created = await createEncounter({
        name: `${e.biome} — ${e.groups.map((g) => `${g.count}× ${g.option.species}`).join(', ')}`,
        state: { round: 0, turn: 0, combatants, log: [] },
      });
      try {
        localStorage.setItem('picho.combat.current', String(created.id));
      } catch {
        // the tracker opens the latest active encounter anyway
      }
      navigate(ROUTES.GM_COMBAT);
    } catch (err) {
      void message.error(apiErrorMessage(err, 'Could not create the encounter.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        <Select
          onChange={setBiome}
          options={(Object.keys(BIOME_CREATURES) as Biome[]).map((b) => ({ value: b, label: b }))}
          style={{ minWidth: 230 }}
          value={biome}
        />
        <Space>
          <span>Party level</span>
          <InputNumber max={20} min={1} onChange={(v) => setApl(v ?? 1)} value={apl} />
        </Space>
        <Space>
          <span>PCs</span>
          <InputNumber max={8} min={1} onChange={(v) => setSize(v ?? 4)} value={size} />
        </Space>
        <Segmented
          onChange={(v) => setDifficulty(String(v))}
          options={DIFFICULTY.map((d) => ({ value: d.key, label: d.label }))}
          value={difficulty}
        />
        <Button
          disabled={!options}
          icon={<ReloadOutlined />}
          onClick={() => options && run((rng) => generateEncounter(rng, options, biome, apl, size, difficulty))}
          type="primary"
        >
          New encounter
        </Button>
      </Space>
      <Typography.Text type="secondary">
        Starfinder XP budget for CR = party level + difficulty, from the stat blocks in the bestiary (Combat stats).
      </Typography.Text>
      {results.length > 0 && !current && (
        <Alert
          showIcon
          type="warning"
          message="No creature of this biome fits that budget. Try another biome or difficulty."
        />
      )}
      {current && (
        <Card
          extra={
            <Button
              icon={<ThunderboltOutlined />}
              loading={sending}
              onClick={() => void sendToCombat(current)}
              size="small"
              type="primary"
            >
              Open in combat tracker
            </Button>
          }
          size="small"
          title={`${current.difficulty} · CR ${Number(current.targetCr.toFixed(2))} · ${current.xp.toLocaleString()} / ${current.budget.toLocaleString()} XP`}
        >
          {current.groups.map((g) => (
            <Typography.Paragraph key={g.option.species} style={{ marginBottom: 6 }}>
              <b>
                {g.count}× {g.option.species}
              </b>{' '}
              ({g.option.block.label}, CR {g.option.block.cr}, {g.option.block.hp} HP, EAC {g.option.block.eac} / KAC{' '}
              {g.option.block.kac}) — {g.option.block.attacks.map((a) => a.name).join(', ')}
            </Typography.Paragraph>
          ))}
          <Typography.Paragraph style={{ marginBottom: 4 }}>
            <b>Why here:</b> {current.reason}. <b>Terrain:</b> {current.terrain}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
            {current.weather}
          </Typography.Paragraph>
        </Card>
      )}
      <HistoryNote history={history} onReset={() => history.clear()} />
    </Space>
  );
};

// ── Guild board ──

const contractMarkdown = (c: GeneratedContract) =>
  [
    `## ${c.title}`,
    `**Acesso:** ${c.access} · **Prazo:** ${c.days} dia(s) · **Pagamento:** ${c.payPerHunter} cr por Caçador (${c.partyPay} cr para o grupo)`,
    '',
    c.text,
    '',
    `**Contratante:** ${c.contractor.name} — ${c.contractor.profession} (${c.contractor.location})`,
    `**Cláusulas:** ${c.clauses.join(' ')}`,
    '',
    `> **Complicação (GM):** ${c.complication}`,
  ].join('\n');

const ContractsTab: React.FC = () => {
  const { setting, city, controls } = useWhere('contracts', { world: 'motavia' });
  const [kind, setKind] = React.useState<string | undefined>();
  const [size, setSize] = React.useState(4);
  const { results, run, clear, history } = useResults<GeneratedContract>('contract', (c) => c.text);
  const saveNote = async (c: GeneratedContract) => {
    try {
      await createGmNote({ title: `Contrato: ${c.title}`, content: contractMarkdown(c), tags: 'contrato, gerador' });
      void message.success('Saved to GM notes.');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not save.'));
    }
  };
  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        {controls}
        <Select
          allowClear
          onChange={setKind}
          options={Object.keys(KINDS).map((k) => ({ value: k, label: k }))}
          placeholder="Any job"
          style={{ minWidth: 160 }}
          value={kind}
        />
        <Space>
          <span>Hunters</span>
          <InputNumber max={8} min={1} onChange={(v) => setSize(v ?? 4)} value={size} />
        </Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => run((rng) => generateContract(rng, setting, size, { kind, city }), 3)}
          type="primary"
        >
          3 contracts
        </Button>
        <Button disabled={!results.length} icon={<DeleteOutlined />} onClick={clear} />
      </Space>
      <Typography.Text type="secondary">
        Pay follows the Motavia economy reference (local day 15–25 cr per Hunter … high risk 1,000–1,600 cr).
      </Typography.Text>
      {results.length === 0 ? (
        <Empty description="Fill the Guild board." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {results.map(({ seed, value: c }) => (
            <Card
              extra={
                <Space size={4}>
                  <Button icon={<CopyOutlined />} onClick={() => copy(contractMarkdown(c))} size="small" />
                  <Button icon={<SaveOutlined />} onClick={() => void saveNote(c)} size="small" />
                </Space>
              }
              key={seed}
              size="small"
              title={
                <Space size={4} wrap>
                  <Tag>{c.kind}</Tag>
                  <Tag color={c.access.startsWith('Público') ? 'green' : 'orange'}>{c.access}</Tag>
                </Space>
              }
            >
              <Typography.Paragraph strong style={{ marginBottom: 6 }}>
                {c.text}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 6 }}>
                <b>{c.payPerHunter} cr</b> per Hunter ({c.partyPay} cr total) · {c.days} day(s) · {c.band.label}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 6 }}>
                <b>Client:</b> {c.contractor.name}, {c.contractor.profession.toLowerCase()} ({c.contractor.location})
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 6 }} type="secondary">
                {c.clauses.join(' ')}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                <b>Complication (GM):</b> {c.complication}
              </Typography.Paragraph>
            </Card>
          ))}
        </div>
      )}
      <HistoryNote history={history} onReset={() => history.clear()} />
    </Space>
  );
};

export const GeneratorsPage: React.FC = () => (
  <>
    <PageTitle>GM - Generators</PageTitle>
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        <IconLabel icon="dice">Quick generators</IconLabel>
      </Typography.Title>
      <Card size="small">
        <Tabs
          destroyOnHidden={false}
          items={[
            { key: 'npc', label: 'NPC', children: <NpcTab /> },
            { key: 'names', label: 'Names', children: <NamesTab /> },
            { key: 'shop', label: 'Shop', children: <ShopTab /> },
            { key: 'encounter', label: 'Encounter', children: <EncounterTab /> },
            { key: 'contracts', label: 'Guild board', children: <ContractsTab /> },
          ]}
        />
      </Card>
    </Space>
  </>
);

export default GeneratorsPage;
