import React from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { type StatBlock, listStatBlocks, setStatBlocks } from '@app/api/bestiary.api';
import { apiErrorMessage } from '@app/utils/api-error';

const signed = (n?: number | null) => (n === null || n === undefined ? '—' : `${n >= 0 ? '+' : ''}${n}`);

const EMPTY: StatBlock = {
  label: 'Adult',
  cr: '1',
  xp: 400,
  initiative: 0,
  hp: 20,
  eac: 11,
  kac: 13,
  fort: 0,
  ref: 0,
  will: 0,
  attacks: [],
  abilities: [],
};

/** Read-only stat block, laid out like a Starfinder sheet. */
export const StatBlockView: React.FC<{ block: StatBlock }> = ({ block: b }) => (
  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
    <Space wrap size={4}>
      <Tag color="volcano">CR {b.cr}</Tag>
      {b.xp ? <Tag>XP {b.xp}</Tag> : null}
      {b.size ? <Tag>{b.size}</Tag> : null}
      {b.type ? <Tag>{b.type}</Tag> : null}
    </Space>
    <Typography.Text>
      <b>Init</b> {signed(b.initiative)}
      {b.senses ? ` · ${b.senses}` : ''}
    </Typography.Text>
    <Typography.Text>
      <b>HP</b> {b.hp}
      {b.sp ? ` · SP ${b.sp}` : ''}
      {b.rp ? ` · RP ${b.rp}` : ''} · <b>EAC</b> {b.eac} · <b>KAC</b> {b.kac} · Fort {signed(b.fort)} · Ref{' '}
      {signed(b.ref)} · Will {signed(b.will)}
    </Typography.Text>
    {b.speed ? (
      <Typography.Text>
        <b>Speed</b> {b.speed}
      </Typography.Text>
    ) : null}
    {b.attacks.map((a, i) => (
      <Typography.Text key={i}>
        <b>{a.name}</b> {a.bonus !== null && a.bonus !== undefined ? signed(a.bonus) : ''}
        {a.damage ? ` (${a.damage})` : ''}
      </Typography.Text>
    ))}
    {b.abilities.map((a, i) => (
      <Typography.Text key={i}>
        <b>{a.name}.</b> {a.text}
      </Typography.Text>
    ))}
    {b.skills ? <Typography.Text type="secondary">Skills: {b.skills}</Typography.Text> : null}
    {b.mods ? (
      <Typography.Text type="secondary">
        {Object.entries(b.mods)
          .map(([k, v]) => `${k.toUpperCase()} ${v === null ? '—' : signed(v)}`)
          .join(' · ')}
      </Typography.Text>
    ) : null}
    {b.source ? (
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        {b.source}
      </Typography.Text>
    ) : null}
  </Space>
);

type FormValues = Omit<StatBlock, 'mods'>;

const BlockForm: React.FC<{
  initial: StatBlock;
  onSave: (b: StatBlock) => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ initial, onSave, onCancel, saving }) => {
  const [form] = Form.useForm<FormValues>();
  const num = (name: keyof FormValues, label: string, min = -20, max = 99999, required = false) => (
    <Form.Item label={label} name={name} rules={required ? [{ required: true }] : undefined}>
      <InputNumber max={max} min={min} style={{ width: 90 }} />
    </Form.Item>
  );
  return (
    <Form
      form={form}
      initialValues={initial}
      layout="vertical"
      onFinish={(v) => onSave({ ...initial, ...v, attacks: v.attacks ?? [], abilities: v.abilities ?? [] })}
    >
      <Space wrap align="start">
        <Form.Item label="Stage / variant" name="label" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={80} placeholder="Adult" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item label="CR" name="cr" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={10} placeholder="1/2" style={{ width: 70 }} />
        </Form.Item>
        {num('xp', 'XP', 0)}
        <Form.Item label="Size" name="size">
          <Input maxLength={40} style={{ width: 110 }} />
        </Form.Item>
        <Form.Item label="Type" name="type">
          <Input maxLength={120} style={{ width: 200 }} />
        </Form.Item>
      </Space>
      <Space wrap align="start">
        {num('initiative', 'Init', -20, 60, true)}
        {num('hp', 'HP', 0, 99999, true)}
        {num('sp', 'SP', 0)}
        {num('rp', 'RP', 0, 999)}
        {num('eac', 'EAC', 0, 99, true)}
        {num('kac', 'KAC', 0, 99, true)}
        {num('fort', 'Fort', -20, 60)}
        {num('ref', 'Ref', -20, 60)}
        {num('will', 'Will', -20, 60)}
      </Space>
      <Form.Item label="Speed" name="speed">
        <Input maxLength={200} placeholder="9 m, climb 6 m" />
      </Form.Item>
      <Form.Item label="Senses" name="senses">
        <Input maxLength={300} placeholder="darkvision 18 m; Perception +7" />
      </Form.Item>

      <Typography.Text strong>Attacks</Typography.Text>
      <Form.List name="attacks">
        {(fields, { add, remove }) => (
          <>
            {fields.map((f) => (
              <Space align="baseline" key={f.key} wrap>
                <Form.Item name={[f.name, 'name']} rules={[{ required: true, whitespace: true }]}>
                  <Input maxLength={120} placeholder="Bite" style={{ width: 180 }} />
                </Form.Item>
                <Form.Item name={[f.name, 'bonus']}>
                  <InputNumber max={80} min={-20} placeholder="+8" style={{ width: 80 }} />
                </Form.Item>
                <Form.Item name={[f.name, 'damage']}>
                  <Input maxLength={200} placeholder="1d6+3 P" style={{ width: 200 }} />
                </Form.Item>
                <MinusCircleOutlined aria-label="Remove attack" onClick={() => remove(f.name)} />
              </Space>
            ))}
            <Form.Item>
              <Button icon={<PlusOutlined />} onClick={() => add({ name: '' })} size="small" type="dashed">
                Attack
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Typography.Text strong>Special abilities</Typography.Text>
      <Form.List name="abilities">
        {(fields, { add, remove }) => (
          <>
            {fields.map((f) => (
              <Space align="start" key={f.key} style={{ width: '100%' }} wrap>
                <Form.Item name={[f.name, 'name']} rules={[{ required: true, whitespace: true }]}>
                  <Input maxLength={120} placeholder="Name" style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name={[f.name, 'text']} style={{ minWidth: 260, flex: 1 }}>
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={600} placeholder="What it does" />
                </Form.Item>
                <MinusCircleOutlined aria-label="Remove ability" onClick={() => remove(f.name)} />
              </Space>
            ))}
            <Form.Item>
              <Button icon={<PlusOutlined />} onClick={() => add({ name: '', text: '' })} size="small" type="dashed">
                Ability
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item label="Skills" name="skills">
        <Input maxLength={300} />
      </Form.Item>
      <Form.Item label="Source" name="source">
        <Input maxLength={300} />
      </Form.Item>
      <Space>
        <Button htmlType="submit" loading={saving} type="primary">
          Save
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </Form>
  );
};

/** GM tab of a bestiary entry: its Starfinder stat blocks (one per stage), used by the combat tracker. */
export const StatBlocksEditor: React.FC<{ monsterId: number }> = ({ monsterId }) => {
  const [blocks, setBlocks] = React.useState<StatBlock[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<number | 'new' | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setBlocks(null);
    setEditing(null);
    listStatBlocks()
      .then((all) => alive && setBlocks(all.find((x) => x.monsterId === monsterId)?.blocks ?? []))
      .catch((e) => alive && setError(apiErrorMessage(e, 'Could not load the stat blocks.')));
    return () => {
      alive = false;
    };
  }, [monsterId]);

  async function persist(next: StatBlock[]) {
    setSaving(true);
    try {
      await setStatBlocks(monsterId, next);
      setBlocks(next);
      setEditing(null);
      void message.success('Stat blocks saved.');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  }

  if (error) return <Alert showIcon type="error" message={error} />;
  if (!blocks) return <Spin />;

  const move = (i: number, d: -1 | 1) => {
    const next = [...blocks];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    void persist(next);
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        GM only. Each stage (e.g. juvenile, adult) shows up when adding this creature to a fight.
      </Typography.Text>
      {blocks.length === 0 && editing !== 'new' && <Empty description="No stat blocks yet." />}
      {blocks.map((b, i) =>
        editing === i ? (
          <Card key={i} size="small" title={`Edit · ${b.label}`}>
            <BlockForm
              initial={b}
              onCancel={() => setEditing(null)}
              onSave={(nb) => void persist(blocks.map((x, j) => (j === i ? nb : x)))}
              saving={saving}
            />
          </Card>
        ) : (
          <Card
            extra={
              <Space size={2}>
                <Button
                  aria-label="Move up"
                  disabled={i === 0}
                  icon={<ArrowUpOutlined />}
                  onClick={() => move(i, -1)}
                  size="small"
                  type="text"
                />
                <Button
                  aria-label="Move down"
                  disabled={i === blocks.length - 1}
                  icon={<ArrowDownOutlined />}
                  onClick={() => move(i, 1)}
                  size="small"
                  type="text"
                />
                <Button
                  aria-label="Edit"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(i)}
                  size="small"
                  type="text"
                />
                <Popconfirm
                  onConfirm={() => void persist(blocks.filter((_, j) => j !== i))}
                  title={`Remove “${b.label}”?`}
                >
                  <Button aria-label="Remove" danger icon={<DeleteOutlined />} size="small" type="text" />
                </Popconfirm>
              </Space>
            }
            key={i}
            size="small"
            title={b.label}
          >
            <StatBlockView block={b} />
          </Card>
        ),
      )}
      {editing === 'new' ? (
        <Card size="small" title="New stage">
          <BlockForm
            initial={EMPTY}
            onCancel={() => setEditing(null)}
            onSave={(nb) => void persist([...blocks, nb])}
            saving={saving}
          />
        </Card>
      ) : (
        <Button disabled={editing !== null} icon={<PlusOutlined />} onClick={() => setEditing('new')}>
          Add stage
        </Button>
      )}
    </Space>
  );
};
