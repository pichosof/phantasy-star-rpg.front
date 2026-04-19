import React from 'react';
import {
  Avatar,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  EnvironmentOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PictureOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';

import type { Npc, CreateNpcDTO } from '@app/types/rpg';
import { NpcApi } from '@app/api/npc.api';
import { apiErrorMessage } from '../utils/api-error';

const GM_KEY = 'gm_api_key';

// ── Role enum ─────────────────────────────────────────────────────────────────

export const NPC_ROLES = [
  'Ally',
  'Enemy',
  'Merchant',
  'Contractor',
  'Informant',
  'Guide',
  'Guardian',
  'Healer',
  'Leader',
  'Sage',
  'Neutral',
] as const;

export type NpcRole = typeof NPC_ROLES[number];

// ── Role colour system ────────────────────────────────────────────────────────

const ROLE_META: Record<string, { color: string; hex: string }> = {
  aliado: { color: 'green', hex: '#52c41a' },
  ally: { color: 'green', hex: '#52c41a' },
  amigo: { color: 'green', hex: '#52c41a' },
  mercador: { color: 'blue', hex: '#1677ff' },
  vendor: { color: 'blue', hex: '#1677ff' },
  comerciante: { color: 'blue', hex: '#1677ff' },
  contratante: { color: 'gold', hex: '#faad14' },
  'quest giver': { color: 'gold', hex: '#faad14' },
  informante: { color: 'purple', hex: '#722ed1' },
  inimigo: { color: 'red', hex: '#f5222d' },
  antagonista: { color: 'red', hex: '#f5222d' },
  enemy: { color: 'red', hex: '#f5222d' },
  líder: { color: 'orange', hex: '#fa8c16' },
  lider: { color: 'orange', hex: '#fa8c16' },
  guia: { color: 'cyan', hex: '#13c2c2' },
  guide: { color: 'cyan', hex: '#13c2c2' },
  guardião: { color: 'geekblue', hex: '#2f54eb' },
  guardiao: { color: 'geekblue', hex: '#2f54eb' },
  curandeiro: { color: 'volcano', hex: '#fa541c' },
  mestre: { color: 'magenta', hex: '#eb2f96' },
  sábio: { color: 'magenta', hex: '#eb2f96' },
  sabio: { color: 'magenta', hex: '#eb2f96' },
  neutro: { color: 'default', hex: '#8c8c8c' },
};

function getRoleMeta(role?: string | null): { color: string; hex: string } {
  const key = (role ?? '').toLowerCase().trim();
  for (const [k, v] of Object.entries(ROLE_META)) {
    if (key.includes(k)) return v;
  }
  return { color: 'default', hex: '#8c8c8c' };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function isVisible(n: Npc) {
  return (n.visible ?? true) === true;
}

// ── Admin Drawer ──────────────────────────────────────────────────────────────

type AdminProps = {
  open: boolean;
  npc: Npc | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

const NpcAdminDrawer: React.FC<AdminProps> = ({ open, npc, onClose, onChanged }) => {
  const { mobileOnly } = useResponsive();
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [imgAlt, setImgAlt] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!npc) return;
    setName(npc.name ?? '');
    setRole(npc.role ?? '');
    setLocation(npc.location ?? '');
    setDesc(npc.description ?? '');
    setImgAlt(npc.imageAlt ?? '');
  }, [npc]);

  const meta = npc ? getRoleMeta(npc.role) : { color: 'default' as const, hex: '#8c8c8c' };

  async function save() {
    if (!npc) return;
    if (!name.trim()) return message.warning('Name is required');
    setSaving(true);
    try {
      await NpcApi.update(npc.id, {
        name: name.trim(),
        role: role.trim() || null,
        location: location.trim() || null,
        description: desc.trim() || null,
      });
      await onChanged();
      message.success('NPC updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!npc) return;
    if (!window.confirm(`Delete "${npc.name}"?`)) return;
    try {
      await NpcApi.remove(npc.id);
      await onChanged();
      onClose();
      message.success('NPC deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete'));
    }
  }

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: 'image/*',
    customRequest: async (opts: RcCustomRequestOptions) => {
      if (!npc) return;
      try {
        await NpcApi.uploadImage(npc.id, opts.file as File, imgAlt || undefined);
        await onChanged();
        message.success('Portrait uploaded');
        opts.onSuccess?.({});
      } catch (e) {
        message.error(apiErrorMessage(e, 'Upload failed'));
        opts.onError?.(new Error('Upload failed'));
      }
    },
  };

  return (
    <Drawer
      visible={open}
      onClose={onClose}
      width={mobileOnly ? '100%' : 500}
      title={
        npc ? (
          <Space size={10} align="center">
            <Avatar size={36} style={{ background: meta.hex, flexShrink: 0, fontWeight: 700, fontSize: 14 }}>
              {initials(npc.name)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 700, lineHeight: 1.2 }}>{npc.name}</div>
              {npc.role && (
                <Tag color={meta.color} style={{ margin: 0, marginTop: 2, fontSize: 11 }}>
                  {npc.role}
                </Tag>
              )}
            </div>
          </Space>
        ) : (
          'NPC'
        )
      }
    >
      {npc ? (
        <Tabs defaultActiveKey="edit">
          {/* ── Edit ── */}
          <Tabs.TabPane tab="Edit" key="edit">
            <Form layout="vertical">
              <Form.Item label="Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Role">
                <Select
                  value={role || undefined}
                  onChange={(v) => setRole(v ?? '')}
                  placeholder="Select a role…"
                  allowClear
                  style={{ width: '100%' }}
                  options={NPC_ROLES.map((r) => {
                    const m = getRoleMeta(r);
                    return {
                      value: r,
                      label: (
                        <Space size={6}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: m.hex,
                            }}
                          />
                          {r}
                        </Space>
                      ),
                    };
                  })}
                />
              </Form.Item>
              <Form.Item label="Location" extra="City name where this NPC usually appears">
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#8c8c8c' }} />}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g.: Aiedo, Piata…"
                />
              </Form.Item>
              <Form.Item label="Description / Background">
                <Input.TextArea
                  rows={6}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="History, motivations, behavior…"
                />
              </Form.Item>
              <Space>
                <Button type="primary" loading={saving} onClick={() => void save()}>
                  Save
                </Button>
                <Button danger onClick={() => void remove()}>
                  Delete
                </Button>
              </Space>
            </Form>
          </Tabs.TabPane>

          {/* ── Portrait ── */}
          <Tabs.TabPane tab="Portrait" key="image">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {npc.imageUrl ? (
                <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 260 }}>
                  <img
                    src={resolveApiUrl(npc.imageUrl)}
                    alt={npc.imageAlt ?? npc.name}
                    style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 140,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: meta.hex + '20',
                    border: `1px dashed ${meta.hex}`,
                  }}
                >
                  <Avatar size={80} style={{ background: meta.hex, fontSize: 28, fontWeight: 700 }}>
                    {initials(npc.name)}
                  </Avatar>
                </div>
              )}
              <Form.Item label="Alt text" style={{ marginBottom: 8 }}>
                <Input value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} placeholder={npc.name} />
              </Form.Item>
              <Upload {...uploadProps}>
                <Button icon={<PictureOutlined />}>{npc.imageUrl ? 'Change portrait' : 'Upload portrait'}</Button>
              </Upload>
            </Space>
          </Tabs.TabPane>

          {/* ── Visibility ── */}
          <Tabs.TabPane tab="Visibility" key="ctrl">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <Typography.Text>Visible to players</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Hidden NPCs do not appear in the codex.
                  </Typography.Text>
                </div>
                <Switch
                  checked={isVisible(npc)}
                  onChange={async (v) => {
                    await NpcApi.setVisible(npc.id, v);
                    await onChanged();
                  }}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </Space>
            </Space>
          </Tabs.TabPane>
        </Tabs>
      ) : null}
    </Drawer>
  );
};

// ── NPC Codex Card ────────────────────────────────────────────────────────────

type CardProps = {
  npc: Npc;
  gmMode: boolean;
  onView: () => void;
  onAdmin: () => void;
  onToggleVisible: () => void;
};

const NpcCodexCard: React.FC<CardProps> = ({ npc, gmMode, onView, onAdmin, onToggleVisible }) => {
  const meta = getRoleMeta(npc.role);
  const vis = isVisible(npc);

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--background-color, #fff)',
        border: `1px solid ${gmMode && !vis ? '#ff4d4f40' : meta.hex + '40'}`,
        boxShadow: gmMode && !vis ? 'none' : `0 2px 12px ${meta.hex}18, 0 1px 3px rgba(0,0,0,.08)`,
        transition: 'box-shadow .2s, transform .15s',
        opacity: gmMode && !vis ? 0.65 : 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (!gmMode) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
      }}
    >
      {/* Portrait */}
      <div style={{ position: 'relative', height: 180, flexShrink: 0, overflow: 'hidden' }}>
        {npc.imageUrl ? (
          <img
            src={resolveApiUrl(npc.imageUrl)}
            alt={npc.imageAlt ?? npc.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${meta.hex}30 0%, ${meta.hex}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              size={80}
              style={{
                background: meta.hex,
                fontSize: 28,
                fontWeight: 700,
                boxShadow: `0 4px 16px ${meta.hex}60`,
              }}
            >
              {initials(npc.name)}
            </Avatar>
          </div>
        )}

        {/* Role badge */}
        {npc.role && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <Tag
              color={meta.color}
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                background: meta.hex + 'dd',
                border: 'none',
                color: '#fff',
              }}
            >
              {npc.role}
            </Tag>
          </div>
        )}

        {/* GM status badge */}
        {gmMode && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <Tooltip title={vis ? 'Visible' : 'Hidden'}>
              <Tag
                style={{ margin: 0, cursor: 'pointer', fontSize: 11 }}
                color={vis ? 'green' : 'red'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible();
                }}
              >
                {vis ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </Tag>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Typography.Text strong style={{ fontSize: 15, lineHeight: 1.3 }}>
          {npc.name}
        </Typography.Text>

        {npc.location && (
          <Space size={4} style={{ color: '#8c8c8c', fontSize: 12 }}>
            <EnvironmentOutlined />
            <span>{npc.location}</span>
          </Space>
        )}

        {npc.description && (
          <Typography.Paragraph
            style={{ margin: 0, fontSize: 12, color: '#595959', lineHeight: 1.5 }}
            ellipsis={{ rows: 3 }}
          >
            {npc.description}
          </Typography.Paragraph>
        )}

        {/* accent line */}
        <div style={{ height: 2, borderRadius: 2, background: meta.hex + '40', marginTop: 'auto', paddingTop: 8 }} />

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {!gmMode ? (
            <Button size="small" type="link" style={{ padding: 0, height: 'auto', color: meta.hex }} onClick={onView}>
              View profile →
            </Button>
          ) : (
            <Space size={6}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdmin();
                }}
              >
                Admin
              </Button>
              <Switch
                size="small"
                checked={vis}
                onChange={() => onToggleVisible()}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
              />
            </Space>
          )}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: meta.hex,
              boxShadow: `0 0 6px ${meta.hex}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Detail Drawer ─────────────────────────────────────────────────────────────

type DetailProps = { open: boolean; npc: Npc | null; onClose: () => void };

const NpcDetailDrawer: React.FC<DetailProps> = ({ open, npc, onClose }) => {
  const { mobileOnly } = useResponsive();
  const meta = npc ? getRoleMeta(npc.role) : { color: 'default' as const, hex: '#8c8c8c' };

  return (
    <Drawer
      visible={open}
      onClose={onClose}
      width={mobileOnly ? '100%' : 520}
      bodyStyle={{ padding: 0 }}
      title={null}
      closable={false}
    >
      {npc && (
        <>
          {/* Hero portrait */}
          <div style={{ position: 'relative' }}>
            {npc.imageUrl ? (
              <div style={{ height: 260, overflow: 'hidden' }}>
                <img
                  src={resolveApiUrl(npc.imageUrl)}
                  alt={npc.imageAlt ?? npc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : (
              <div
                style={{
                  height: 180,
                  background: `linear-gradient(135deg, ${meta.hex}50 0%, ${meta.hex}15 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar size={100} style={{ background: meta.hex, fontSize: 36, fontWeight: 700 }}>
                  {initials(npc.name)}
                </Avatar>
              </div>
            )}
            {/* Close button */}
            <Button size="small" style={{ position: 'absolute', top: 10, right: 10 }} onClick={onClose}>
              ✕
            </Button>
            {/* Gradient fade */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                background: 'linear-gradient(transparent, var(--background-color, #fff))',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ padding: '0 20px 24px' }}>
            <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 12 }}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {npc.name}
              </Typography.Title>
              <Space size={8} wrap>
                {npc.role && (
                  <Tag
                    color={meta.color}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '2px 10px',
                      background: meta.hex + '20',
                      borderColor: meta.hex,
                      color: meta.hex,
                    }}
                  >
                    {npc.role}
                  </Tag>
                )}
                {npc.location && (
                  <Space size={4} style={{ color: '#8c8c8c', fontSize: 13 }}>
                    <EnvironmentOutlined />
                    <span>{npc.location}</span>
                  </Space>
                )}
              </Space>
            </Space>

            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${meta.hex}, ${meta.hex}20)`,
                marginBottom: 16,
              }}
            />

            {npc.description ? (
              <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#262626' }}>
                {npc.description}
              </Typography.Paragraph>
            ) : (
              <Typography.Text type="secondary">No information available.</Typography.Text>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const NPCsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();

  const [npcs, setNpcs] = React.useState<Npc[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isGM, setIsGM] = React.useState(() => Boolean(localStorage.getItem(GM_KEY)));

  const [search, setSearch] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<string | null>(null);
  const [filterLoc, setFilterLoc] = React.useState<string | null>(null);
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [adminId, setAdminId] = React.useState<number | null>(null);
  const [adminOpen, setAdminOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newRole, setNewRole] = React.useState('');
  const [newLoc, setNewLoc] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY) setIsGM(Boolean(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setNpcs(await NpcApi.list());
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load NPCs'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Derived filter lists
  const allRoles = React.useMemo(() => {
    const s = new Set<string>();
    npcs.forEach((n) => {
      if (n.role) s.add(n.role);
    });
    return Array.from(s).sort();
  }, [npcs]);

  const allLocations = React.useMemo(() => {
    const s = new Set<string>();
    npcs.forEach((n) => {
      if (n.location) s.add(n.location);
    });
    return Array.from(s).sort();
  }, [npcs]);

  const q = search.trim().toLowerCase();

  const filtered = React.useMemo(
    () =>
      npcs.filter((n) => {
        if (!isGM && !isVisible(n)) return false;
        if (isGM && filterVis === 'visible' && !isVisible(n)) return false;
        if (isGM && filterVis === 'hidden' && isVisible(n)) return false;
        if (filterRole && n.role !== filterRole) return false;
        if (filterLoc && n.location !== filterLoc) return false;
        if (q)
          return (
            n.name.toLowerCase().includes(q) ||
            (n.role ?? '').toLowerCase().includes(q) ||
            (n.location ?? '').toLowerCase().includes(q) ||
            (n.description ?? '').toLowerCase().includes(q)
          );
        return true;
      }),
    [npcs, isGM, filterVis, filterRole, filterLoc, q],
  );

  const stats = React.useMemo(
    () => ({
      total: npcs.length,
      visible: npcs.filter(isVisible).length,
      hidden: npcs.filter((n) => !isVisible(n)).length,
    }),
    [npcs],
  );

  async function toggleVisible(n: Npc) {
    const next = !isVisible(n);
    setNpcs((prev) => prev.map((x) => (x.id === n.id ? { ...x, visible: next } : x)));
    try {
      await NpcApi.setVisible(n.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility'));
      await load();
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = newName.trim();
    if (!n) return message.warning('Name is required');
    try {
      await NpcApi.create({
        name: n,
        role: newRole || null,
        location: newLoc.trim() || null,
        description: newDesc.trim() || null,
      } as CreateNpcDTO);
      setCreating(false);
      setNewName('');
      setNewRole('');
      setNewLoc('');
      setNewDesc('');
      await load();
      message.success('NPC created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create NPC'));
    }
  }

  const detailNpc = npcs.find((x) => x.id === openId) ?? null;
  const adminNpc = npcs.find((x) => x.id === adminId) ?? null;
  const cols = mobileOnly ? 1 : isTablet ? 2 : 3;

  return (
    <>
      <PageTitle>Codex — NPCs</PageTitle>

      {/* ── Header card ── */}
      <Card density="dense" style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {/* Title row */}
          <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={8}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {isGM ? '⚙️ Codex — GM Panel' : 'Character Codex'}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {isGM
                  ? 'Manage NPCs, portraits, roles and visibility.'
                  : 'Characters known to the adventurers in the Algol system.'}
              </Typography.Text>
            </div>
            {isGM && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New NPC'}
              </Button>
            )}
          </Space>

          {/* Stats chips */}
          <Space wrap size={6}>
            <Tag icon={<UserOutlined />}>{stats.total} characters</Tag>
            {isGM && <Tag color="green">{stats.visible} visible</Tag>}
            {isGM && stats.hidden > 0 && <Tag color="red">{stats.hidden} hidden</Tag>}
            {filtered.length !== npcs.length && <Tag color="blue">{filtered.length} shown</Tag>}
          </Space>

          {/* Filter bar */}
          <Space wrap size={8} style={{ width: '100%' }}>
            {/* Text search */}
            <Input
              allowClear
              placeholder="Search character…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 240 }}
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            />

            {/* Role filter — buttons (limited set, coloured) */}
            <Space size={4} wrap>
              <Button size="small" type={!filterRole ? 'primary' : 'default'} onClick={() => setFilterRole(null)}>
                All
              </Button>
              {allRoles.map((r) => {
                const m = getRoleMeta(r);
                return (
                  <Button
                    key={r}
                    size="small"
                    type={filterRole === r ? 'primary' : 'default'}
                    onClick={() => setFilterRole(filterRole === r ? null : r)}
                    style={filterRole === r ? { background: m.hex, borderColor: m.hex } : {}}
                  >
                    {r}
                  </Button>
                );
              })}
            </Space>

            {/* Location filter — Select (scales to hundreds) */}
            {allLocations.length > 0 && (
              <Select
                allowClear
                placeholder={
                  <>
                    <EnvironmentOutlined /> Location
                  </>
                }
                value={filterLoc ?? undefined}
                onChange={(v) => setFilterLoc(v ?? null)}
                style={{ minWidth: 160 }}
                options={allLocations.map((loc) => ({ value: loc, label: loc }))}
              />
            )}

            {/* GM visibility filter */}
            {isGM && (
              <Space size={4}>
                {(['all', 'visible', 'hidden'] as const).map((v) => (
                  <Button
                    key={v}
                    size="small"
                    type={filterVis === v ? 'primary' : 'default'}
                    onClick={() => setFilterVis(v)}
                  >
                    {v === 'all' ? 'All' : v === 'visible' ? 'Visible' : 'Hidden'}
                  </Button>
                ))}
              </Space>
            )}
          </Space>

          {/* Create form */}
          {isGM && creating && (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
                <Typography.Text strong>New NPC</Typography.Text>
                <Space wrap size={8}>
                  <Input
                    placeholder="Nome *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ minWidth: 200 }}
                    required
                  />
                  <Select
                    value={newRole || undefined}
                    onChange={(v) => setNewRole(v ?? '')}
                    placeholder="Role…"
                    allowClear
                    style={{ minWidth: 160 }}
                    options={NPC_ROLES.map((r) => {
                      const m = getRoleMeta(r);
                      return {
                        value: r,
                        label: (
                          <Space size={6}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: m.hex,
                              }}
                            />
                            {r}
                          </Space>
                        ),
                      };
                    })}
                  />
                </Space>
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Location (ex: Aiedo)"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                />
                <Input.TextArea
                  placeholder="Description / Background"
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <Space>
                  <Button type="primary" htmlType="submit">
                    Create
                  </Button>
                  <Button onClick={() => setCreating(false)}>Cancel</Button>
                </Space>
              </form>
            </>
          )}
        </Space>
      </Card>

      {/* ── Content grid ── */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Card density="comfy">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              search || filterRole || filterLoc
                ? 'No characters match the filters.'
                : isGM
                ? 'No NPCs registered yet.'
                : 'No characters revealed yet.'
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {filtered.map((n) => (
            <NpcCodexCard
              key={n.id}
              npc={n}
              gmMode={isGM}
              onView={() => setOpenId(n.id)}
              onAdmin={() => {
                setAdminId(n.id);
                setAdminOpen(true);
              }}
              onToggleVisible={() => void toggleVisible(n)}
            />
          ))}
        </div>
      )}

      {/* ── Drawers — always mounted, driven by open prop ── */}
      <NpcDetailDrawer open={openId !== null} npc={detailNpc} onClose={() => setOpenId(null)} />
      <NpcAdminDrawer
        open={adminOpen}
        npc={adminNpc}
        onClose={() => {
          setAdminOpen(false);
          setAdminId(null);
        }}
        onChanged={load}
      />
    </>
  );
};

export default NPCsPage;
