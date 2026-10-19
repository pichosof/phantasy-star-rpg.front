import React from 'react';
import {
  AutoComplete,
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  HeartOutlined,
  MoreOutlined,
  StopOutlined,
  TagOutlined,
  ThunderboltOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { Combatant, Pool } from '@app/api/encounters.api';
import { thumbUrl } from '@app/api/images.api';
import { resolveApiUrl } from '@app/api/http.api';
import { STARFINDER_CONDITIONS } from './combat-engine';
import * as S from './CombatTracker.styles';

export interface CombatantActions {
  damage: (id: string, amount: number) => void;
  heal: (id: string, pool: 'sp' | 'hp' | 'rp', amount: number) => void;
  spendResolve: (id: string) => void;
  addCondition: (id: string, name: string, rounds: number | null) => void;
  removeCondition: (id: string, conditionId: string) => void;
  setInitiative: (id: string, value: number | null) => void;
  setDefeated: (id: string, defeated: boolean) => void;
  edit: (id: string, patch: Partial<Combatant>) => void;
  remove: (id: string) => void;
}

interface CombatantCardProps {
  c: Combatant;
  acting: boolean;
  actions: CombatantActions;
}

const KIND_LABEL = { pc: 'Player', monster: 'Enemy', npc: 'NPC' } as const;
const KIND_COLOR = { pc: 'blue', monster: 'red', npc: 'green' } as const;

const percent = (p: Pool) => (p.max > 0 ? Math.max(0, Math.min(100, Math.round((p.current / p.max) * 100))) : 0);

const PoolBar: React.FC<{ label: string; pool: Pool; status?: 'exception' | 'normal' | 'success' }> = ({
  label,
  pool,
  status,
}) => (
  <S.Pool>
    <S.PoolLabel>{label}</S.PoolLabel>
    <Progress percent={percent(pool)} showInfo={false} size="small" status={status} />
    <S.PoolValue>
      {pool.current}/{pool.max}
    </S.PoolValue>
  </S.Pool>
);

const ConditionPicker: React.FC<{ onAdd: (name: string, rounds: number | null) => void }> = ({ onAdd }) => {
  const [name, setName] = React.useState('');
  const [rounds, setRounds] = React.useState<number | null>(null);
  const submit = () => {
    if (!name.trim()) return;
    onAdd(name, rounds);
    setName('');
    setRounds(null);
  };
  return (
    <Space orientation="vertical" size={8}>
      <AutoComplete
        autoFocus
        filterOption={(input, option) =>
          String(option?.value ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        onChange={setName}
        options={STARFINDER_CONDITIONS.map((v) => ({ value: v }))}
        placeholder="Condition"
        style={{ width: 220 }}
        value={name}
      />
      <Space>
        <InputNumber
          max={999}
          min={1}
          onChange={(v) => setRounds(v ?? null)}
          onPressEnter={submit}
          placeholder="Rounds"
          value={rounds}
        />
        <Button onClick={submit} type="primary">
          Add
        </Button>
      </Space>
      <Typography.Text type="secondary">Leave rounds empty for “until removed”.</Typography.Text>
    </Space>
  );
};

type EditForm = {
  name: string;
  initiative: number | null;
  initBonus: number;
  eac: number | null;
  kac: number | null;
  spCurrent: number;
  spMax: number;
  hpCurrent: number;
  hpMax: number;
  rpCurrent: number;
  rpMax: number;
  notes: string;
};

const EditCombatantModal: React.FC<{
  c: Combatant;
  open: boolean;
  onClose: () => void;
  onSave: (p: Partial<Combatant>) => void;
}> = ({ c, open, onClose, onSave }) => {
  const [form] = Form.useForm<EditForm>();
  React.useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: c.name,
      initiative: c.initiative,
      initBonus: c.initBonus,
      eac: c.eac ?? null,
      kac: c.kac ?? null,
      spCurrent: c.sp.current,
      spMax: c.sp.max,
      hpCurrent: c.hp.current,
      hpMax: c.hp.max,
      rpCurrent: c.rp.current,
      rpMax: c.rp.max,
      notes: c.notes ?? '',
    });
  }, [open, c, form]);

  const save = async () => {
    const v = await form.validateFields();
    onSave({
      name: v.name.trim(),
      initiative: v.initiative ?? null,
      initBonus: v.initBonus ?? 0,
      eac: v.eac ?? null,
      kac: v.kac ?? null,
      sp: { current: v.spCurrent ?? 0, max: v.spMax ?? 0 },
      hp: { current: v.hpCurrent ?? 0, max: v.hpMax ?? 0 },
      rp: { current: v.rpCurrent ?? 0, max: v.rpMax ?? 0 },
      notes: v.notes?.trim() || null,
    });
    onClose();
  };

  const pair = (label: string, cur: keyof EditForm, max: keyof EditForm) => (
    <Space>
      <Form.Item label={`${label} now`} name={cur}>
        <InputNumber max={99999} min={-9999} />
      </Form.Item>
      <Form.Item label={`${label} max`} name={max}>
        <InputNumber max={99999} min={0} />
      </Form.Item>
    </Space>
  );

  return (
    <Modal
      destroyOnHidden
      okText="Save"
      onCancel={onClose}
      onOk={() => void save()}
      open={open}
      title={`Edit ${c.name}`}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Space wrap>
          <Form.Item label="Initiative" name="initiative">
            <InputNumber max={999} min={-99} />
          </Form.Item>
          <Form.Item label="Init bonus" name="initBonus">
            <InputNumber max={40} min={-20} />
          </Form.Item>
          <Form.Item label="EAC" name="eac">
            <InputNumber max={99} min={0} />
          </Form.Item>
          <Form.Item label="KAC" name="kac">
            <InputNumber max={99} min={0} />
          </Form.Item>
        </Space>
        {pair('SP', 'spCurrent', 'spMax')}
        {pair('HP', 'hpCurrent', 'hpMax')}
        {pair('RP', 'rpCurrent', 'rpMax')}
        <Form.Item label="Notes" name="notes">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={2000} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const CombatantCard: React.FC<CombatantCardProps> = ({ c, acting, actions }) => {
  const [amount, setAmount] = React.useState<number | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [conditionOpen, setConditionOpen] = React.useState(false);
  const image = c.imageUrl ? resolveApiUrl(thumbUrl(c.imageUrl, 320)) : undefined;
  const ref = React.useRef<HTMLDivElement>(null);

  // Follow the turn: bring the acting combatant into view (phones especially).
  React.useEffect(() => {
    if (acting) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [acting]);

  const withAmount = (fn: (n: number) => void) => () => {
    if (!amount || amount <= 0) return;
    fn(amount);
    setAmount(null);
  };

  const down = c.hp.max > 0 && c.hp.current <= 0;

  return (
    <S.Card $acting={acting} $defeated={c.defeated} ref={ref}>
      <S.CardHeader>
        <Avatar shape="square" size={44} src={image}>
          {c.name.slice(0, 1)}
        </Avatar>
        <S.CardTitle>
          <S.Name title={c.name}>{c.name}</S.Name>
          <Space size={4} wrap>
            <Tag color={KIND_COLOR[c.kind]}>{KIND_LABEL[c.kind]}</Tag>
            {acting && <Tag color="gold">Acting</Tag>}
            {c.defeated && <Tag>Out</Tag>}
            {!c.defeated && down && <Tag color="red">0 HP</Tag>}
            {(c.eac ?? null) !== null && <S.Stat>EAC {c.eac}</S.Stat>}
            {(c.kac ?? null) !== null && <S.Stat>KAC {c.kac}</S.Stat>}
          </Space>
        </S.CardTitle>
        <S.Initiative>
          <S.PoolLabel>Init</S.PoolLabel>
          <InputNumber
            aria-label={`Initiative of ${c.name}`}
            max={999}
            min={-99}
            onChange={(v) => actions.setInitiative(c.id, v ?? null)}
            size="small"
            style={{ width: 64 }}
            value={c.initiative}
          />
        </S.Initiative>
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: 'Edit stats' },
              c.defeated
                ? { key: 'back', icon: <UndoOutlined />, label: 'Back in the fight' }
                : { key: 'out', icon: <StopOutlined />, label: 'Out of the fight' },
              { type: 'divider' },
              { key: 'remove', icon: <DeleteOutlined />, label: 'Remove', danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'edit') setEditing(true);
              else if (key === 'out') actions.setDefeated(c.id, true);
              else if (key === 'back') actions.setDefeated(c.id, false);
              else if (key === 'remove') actions.remove(c.id);
            },
          }}
          trigger={['click']}
        >
          <Button aria-label="More actions" icon={<MoreOutlined />} type="text" />
        </Dropdown>
      </S.CardHeader>

      <S.Pools>
        {c.sp.max > 0 && <PoolBar label="SP" pool={c.sp} />}
        <PoolBar label="HP" pool={c.hp} status={down ? 'exception' : 'normal'} />
        {c.rp.max > 0 && <PoolBar label="RP" pool={c.rp} />}
      </S.Pools>

      {(c.conditions.length > 0 || c.notes) && (
        <S.Conditions>
          {c.conditions.map((k) => (
            <Tag closable color="orange" key={k.id} onClose={() => actions.removeCondition(c.id, k.id)}>
              {k.name}
              {k.rounds !== null ? ` · ${k.rounds}r` : ''}
            </Tag>
          ))}
          {c.notes && <Typography.Text type="secondary">{c.notes}</Typography.Text>}
        </S.Conditions>
      )}

      <S.Actions>
        <InputNumber
          aria-label="Amount"
          inputMode="numeric"
          min={1}
          max={9999}
          onChange={(v) => setAmount(v)}
          onPressEnter={withAmount((n) => actions.damage(c.id, n))}
          placeholder="Amount"
          style={{ width: 92 }}
          value={amount}
        />
        <Tooltip title="Stamina first, then Hit Points">
          <Button danger icon={<ThunderboltOutlined />} onClick={withAmount((n) => actions.damage(c.id, n))}>
            Damage
          </Button>
        </Tooltip>
        <Dropdown
          menu={{
            items: [
              ...(c.sp.max > 0 ? [{ key: 'sp', label: 'Heal Stamina (SP)' }] : []),
              { key: 'hp', label: 'Heal Hit Points (HP)' },
              ...(c.rp.max > 0 ? [{ key: 'rp', label: 'Regain Resolve (RP)' }] : []),
            ],
            onClick: ({ key }) => withAmount((n) => actions.heal(c.id, key as 'sp' | 'hp' | 'rp', n))(),
          }}
          trigger={['click']}
        >
          <Button icon={<HeartOutlined />}>Heal</Button>
        </Dropdown>
        {c.rp.max > 0 && (
          <Button disabled={c.rp.current <= 0} onClick={() => actions.spendResolve(c.id)}>
            −1 RP
          </Button>
        )}
        <Popover
          content={
            <ConditionPicker
              onAdd={(name, rounds) => {
                actions.addCondition(c.id, name, rounds);
                setConditionOpen(false);
              }}
            />
          }
          onOpenChange={setConditionOpen}
          open={conditionOpen}
          title="Add condition"
          trigger="click"
        >
          <Button icon={<TagOutlined />}>Condition</Button>
        </Popover>
      </S.Actions>

      <EditCombatantModal
        c={c}
        onClose={() => setEditing(false)}
        onSave={(p) => actions.edit(c.id, p)}
        open={editing}
      />
    </S.Card>
  );
};
