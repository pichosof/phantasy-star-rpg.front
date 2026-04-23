import React from 'react';
import { Divider, Drawer, Empty, Form, Input, Popconfirm, Space, Switch, Tag, Typography, Upload, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';

import type { Monster, MonsterForAdmin } from '@app/types/rpg';
import { BestiaryApi } from '@app/api/bestiary.api';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { apiErrorMessage } from '../utils/api-error';
import {
  m0,
  w100,
  textSm,
  mutedSm,
  bold700,
  bold800,
  spaceBetween,
  dividerSm,
  dividerMd,
  tableWrap,
  cardGrid2,
  imgCoverH,
  preWrap,
} from '@app/styles/styleUtils';
import * as S from './BestiaryPage.styles';

const GM_KEY_STORAGE = 'gm_api_key';

type ViewMode = 'players' | 'gm';

const TYPE_COLORS: Record<string, string> = {
  doméstico: 'blue',
  predador: 'red',
  'apex predador': 'volcano',
  enxame: 'orange',
  oportunista: 'gold',
  'selvagem útil': 'green',
  subterrâneo: 'cyan',
  aquático: 'geekblue',
  flora: 'lime',
  evento: 'purple',
};

function typeColor(type?: string | null) {
  if (!type) return 'default';
  const key = type.toLowerCase();
  return TYPE_COLORS[key] ?? 'default';
}

function isVisible(m: Monster) {
  return (m.visible ?? true) === true;
}

function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

// ── Admin Drawer ─────────────────────────────────────────────────────────────

type AdminDrawerProps = {
  open: boolean;
  monster: MonsterForAdmin | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

const MonsterAdminDrawer: React.FC<AdminDrawerProps> = ({ open, monster, onClose, onChanged }) => {
  const { mobileOnly } = useResponsive();

  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('');
  const [habitat, setHabitat] = React.useState('');
  const [weaknesses, setWeaknesses] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [imgAlt, setImgAlt] = React.useState('');

  React.useEffect(() => {
    if (!monster) return;
    setName(monster.name ?? '');
    setType(monster.type ?? '');
    setHabitat(monster.habitat ?? '');
    setWeaknesses(monster.weaknesses ?? '');
    setDesc(monster.description ?? '');
    setImgAlt(monster.imageAlt ?? '');
  }, [monster]);

  async function handleSave() {
    if (!monster) return;
    const n = name.trim();
    if (!n) return message.warning('Name is required');
    setSaving(true);
    try {
      await BestiaryApi.update(monster.id, {
        name: n,
        type: type.trim() || null,
        habitat: habitat.trim() || null,
        weaknesses: weaknesses.trim() || null,
        description: desc.trim() || null,
      });
      await onChanged();
      message.success('Monster updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!monster) return;
    if (!window.confirm(`Delete "${monster.name}"?`)) return;
    try {
      await BestiaryApi.remove(monster.id);
      await onChanged();
      onClose();
      message.success('Monster deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete'));
    }
  }

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: 'image/*',
    customRequest: async (options: RcCustomRequestOptions) => {
      if (!monster) return;
      const file = options.file as File;
      try {
        await BestiaryApi.uploadImage(monster.id, file, imgAlt || undefined);
        await onChanged();
        message.success('Image uploaded');
        options.onSuccess?.({});
      } catch (e) {
        message.error(apiErrorMessage(e, 'Upload failed'));
        options.onError?.(new Error('Upload failed'));
      }
    },
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={mobileOnly ? '100%' : 520}
      title={
        monster ? (
          <Space size={8} wrap>
            <span style={bold700}>{monster.name}</span>
            {monster.type ? <Tag color={typeColor(monster.type)}>{monster.type}</Tag> : null}
            <Tag color={monster.visible ? 'green' : 'red'}>{monster.visible ? 'Visible' : 'Hidden'}</Tag>
            <Tag color={monster.discovered ? 'gold' : 'default'}>
              {monster.discovered ? 'Discovered' : 'Not discovered'}
            </Tag>
          </Space>
        ) : (
          'Monster'
        )
      }
    >
      {monster ? (
        <Tabs defaultActiveKey="edit">
          <Tabs.TabPane tab="Edit" key="edit">
            <Form layout="vertical" style={S.formCompact}>
              <Form.Item label="Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Type" extra="E.g.: Predator, Domestic, Swarm…">
                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (optional)" />
              </Form.Item>
              <Form.Item label="Habitat">
                <Input
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  placeholder="E.g.: Dunes, Canyons, Aquifers…"
                />
              </Form.Item>
              <Form.Item label="Weaknesses / Behavior">
                <Input
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="E.g.: fire, light, sound…"
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea
                  rows={6}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Full description for players…"
                />
              </Form.Item>
              <Form.Item label={<IconLabel icon="tags">Tags</IconLabel>}>
                <TagSelect entityType="beast" entityId={monster.id} />
              </Form.Item>
              <Space>
                <Button type="primary" loading={saving} onClick={() => void handleSave()}>
                  Save
                </Button>
                <Button danger onClick={() => void handleDelete()}>
                  Delete
                </Button>
              </Space>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Image" key="image">
            <Space orientation="vertical" size={12} style={w100}>
              {monster.imageUrl && (
                <div style={S.drawerImagePreview}>
                  <img
                    src={resolveApiUrl(monster.imageUrl)}
                    alt={monster.imageAlt ?? monster.name}
                    style={imgCoverH(220)}
                  />
                </div>
              )}
              <Form.Item label="Image alt text" style={S.drawerImageFormItem}>
                <Input value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} placeholder={monster.name} />
              </Form.Item>
              <Upload {...uploadProps}>
                <Button icon={<PictureOutlined />}>{monster.imageUrl ? 'Change image' : 'Upload image'}</Button>
              </Upload>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Controls" key="controls">
            <Space orientation="vertical" size={16} style={w100}>
              <Space style={spaceBetween}>
                <div>
                  <Typography.Text>Visible to players</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={textSm}>
                    Hidden monsters do not appear in the list.
                  </Typography.Text>
                </div>
                <Switch
                  checked={monster.visible ?? true}
                  onChange={async (v) => {
                    await BestiaryApi.setVisible(monster.id, v);
                    await onChanged();
                  }}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </Space>
              <Space style={spaceBetween}>
                <div>
                  <Typography.Text>Marked as discovered</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={textSm}>
                    Unlocks full description for players.
                  </Typography.Text>
                </div>
                <Switch
                  checked={monster.discovered ?? false}
                  onChange={async (v) => {
                    await BestiaryApi.setDiscovered(monster.id, v);
                    await onChanged();
                  }}
                />
              </Space>
            </Space>
          </Tabs.TabPane>
        </Tabs>
      ) : null}
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const BestiaryPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<Monster[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  const [isGM, setIsGM] = React.useState(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));
  const [viewMode, setViewMode] = React.useState<ViewMode>(() =>
    Boolean(localStorage.getItem(GM_KEY_STORAGE)) ? 'gm' : 'players',
  );

  const [openId, setOpenId] = React.useState<number | null>(null);
  const openMonster = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [adminOpen, setAdminOpen] = React.useState(false);
  const [adminId, setAdminId] = React.useState<number | null>(null);
  const adminMonster = React.useMemo(
    () => (items.find((x) => x.id === adminId) ?? null) as MonsterForAdmin | null,
    [items, adminId],
  );

  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState('');
  const [newHabitat, setNewHabitat] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) {
        const gm = Boolean(e.newValue);
        setIsGM(gm);
        setViewMode(gm ? 'gm' : 'players');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await BestiaryApi.list();
      setItems(data);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load bestiary'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const q = search.trim().toLowerCase();

  const playerItems = React.useMemo(
    () =>
      items
        .filter((m) => isVisible(m))
        .filter((m) =>
          q
            ? m.name.toLowerCase().includes(q) ||
              (m.type ?? '').toLowerCase().includes(q) ||
              (m.habitat ?? '').toLowerCase().includes(q)
            : true,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, q],
  );

  const gmItems = React.useMemo(
    () =>
      items
        .filter((m) => {
          if (filterVis === 'visible' && !isVisible(m)) return false;
          if (filterVis === 'hidden' && isVisible(m)) return false;
          return q
            ? m.name.toLowerCase().includes(q) ||
                (m.type ?? '').toLowerCase().includes(q) ||
                (m.habitat ?? '').toLowerCase().includes(q)
            : true;
        })
        .sort((a, b) => a.id - b.id),
    [items, q, filterVis],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter((m) => isVisible(m)).length;
    const discovered = items.filter((m) => m.discovered).length;
    return { total, visible, hidden: total - visible, discovered, undiscovered: total - discovered };
  }, [items]);

  async function toggleVisible(m: Monster) {
    const next = !isVisible(m);
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, visible: next } : x)));
    try {
      await BestiaryApi.setVisible(m.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility'));
      await load();
    }
  }

  async function toggleDiscovered(m: Monster) {
    const next = !m.discovered;
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, discovered: next } : x)));
    try {
      await BestiaryApi.setDiscovered(m.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change discovered status'));
      await load();
    }
  }

  async function deleteMonster(id: number) {
    try {
      await BestiaryApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      message.success('Monster deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete monster'));
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = newName.trim();
    if (!n) return message.warning('Name is required');
    try {
      await BestiaryApi.create({
        name: n,
        type: newType.trim() || null,
        habitat: newHabitat.trim() || null,
        description: newDesc.trim() || null,
      });
      setCreating(false);
      setNewName('');
      setNewType('');
      setNewHabitat('');
      setNewDesc('');
      await load();
      message.success('Monster created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create monster'));
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space orientation="vertical" size={10} style={w100}>
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'gm' ? (
                <IconLabel icon="gm">GM Panel - Bestiary</IconLabel>
              ) : (
                <IconLabel icon="beast">Bestiary</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text type="secondary" className="rpg-text-md">
              {viewMode === 'gm'
                ? 'Control visibility, discovery and monster data.'
                : 'Motavia creatures — details appear when the GM marks as discovered.'}
            </Typography.Text>
          </div>
          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'players' ? 'primary' : 'default'}
                  onClick={() => setViewMode('players')}
                >
                  <IconLabel icon="read">Bestiary</IconLabel>
                </Button>
                <Button size="small" type={viewMode === 'gm' ? 'primary' : 'default'} onClick={() => setViewMode('gm')}>
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'gm' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New Monster'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} creatures</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
          {isGM && <Tag color="gold">{stats.discovered} discovered</Tag>}
          {isGM && <Tag>{stats.undiscovered} undiscovered</Tag>}
        </Space>

        <Space wrap size={8} style={w100}>
          <Input
            allowClear
            placeholder="Search creature…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.searchField}
          />
          {isGM && viewMode === 'gm' && (
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

        {isGM && viewMode === 'gm' && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={S.createForm}>
              <Typography.Text strong>New Creature</Typography.Text>
              <Input placeholder="Name *" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <Input
                placeholder="Type (e.g.: Predator, Domestic, Swarm…)"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
              <Input
                placeholder="Habitat (e.g.: Dunes, Canyons…)"
                value={newHabitat}
                onChange={(e) => setNewHabitat(e.target.value)}
              />
              <Input.TextArea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
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
  );

  // ── Monster Cards ─────────────────────────────────────────────────────────
  function MonsterCards({ data, mode }: { data: Monster[]; mode: ViewMode }) {
    if (loading) return <Spinner />;
    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty description={mode === 'players' ? 'No creatures visible to players yet.' : 'No creatures found.'} />
        </Card>
      );
    }
    return (
      <div style={cardGrid2(mobileOnly)}>
        {data.map((m) => {
          const playerCanRead = m.discovered === true;
          const vis = isVisible(m);

          return (
            <Card
              key={m.id}
              density={mode === 'players' ? 'comfy' : 'dense'}
              title={
                <Space size={8} wrap>
                  <span style={bold700}>{m.name}</span>
                  {m.type ? <Tag color={typeColor(m.type)}>{m.type}</Tag> : null}
                  {m.habitat ? <Tag>{m.habitat}</Tag> : null}
                  {mode === 'gm' && (
                    <>
                      <Tag color={vis ? 'green' : 'red'}>{vis ? 'Visible' : 'Hidden'}</Tag>
                      <Tag color={m.discovered ? 'gold' : 'default'}>
                        {m.discovered ? 'Discovered' : 'Not discovered'}
                      </Tag>
                    </>
                  )}
                </Space>
              }
              extra={
                mode === 'gm' ? (
                  <Button
                    size="small"
                    onClick={() => {
                      setAdminId(m.id);
                      setAdminOpen(true);
                    }}
                  >
                    Admin
                  </Button>
                ) : (
                  <Button size="small" onClick={() => setOpenId(m.id)}>
                    View
                  </Button>
                )
              }
            >
              {mode === 'players' && playerCanRead && m.imageUrl && (
                <div style={S.monsterCardCover}>
                  <img src={resolveApiUrl(m.imageUrl)} alt={m.imageAlt ?? m.name} style={S.monsterCardCoverImage} />
                </div>
              )}
              <Typography.Paragraph style={m0} ellipsis={{ rows: 3 }}>
                {mode === 'players'
                  ? playerCanRead
                    ? m.description?.trim() || 'No description yet.'
                    : 'Information unavailable.'
                  : m.description?.trim() || '—'}
              </Typography.Paragraph>

              {mode === 'gm' && (
                <>
                  <Divider style={dividerMd} />
                  <Space wrap size={16}>
                    <Space size={8}>
                      <span style={mutedSm}>Visible:</span>
                      <Switch
                        size="small"
                        checked={vis}
                        onChange={() => void toggleVisible(m)}
                        checkedChildren={<EyeOutlined />}
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                    </Space>
                    <Space size={8}>
                      <span style={mutedSm}>Discovered:</span>
                      <Switch size="small" checked={m.discovered} onChange={() => void toggleDiscovered(m)} />
                    </Space>
                  </Space>
                </>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // ── Desktop GM Table ──────────────────────────────────────────────────────
  const DesktopAdminTable = (
    <Card density="dense" title="Manage Bestiary">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={gmItems}
          loading={loading}
          style={S.adminTable}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (v: number) => <Tag style={m0}>#{v}</Tag>,
            },
            {
              title: 'Vis.',
              key: 'visible',
              width: 70,
              render: (_: unknown, m: Monster) => (
                <Switch
                  size="small"
                  checked={isVisible(m)}
                  onChange={() => void toggleVisible(m)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Disc.',
              key: 'discovered',
              width: 80,
              render: (_: unknown, m: Monster) => (
                <Switch size="small" checked={m.discovered} onChange={() => void toggleDiscovered(m)} />
              ),
            },
            {
              title: 'Name',
              key: 'name',
              width: 220,
              render: (_: unknown, m: Monster) => (
                <Space orientation="vertical" size={2} style={w100}>
                  <Space size={6} wrap>
                    <Typography.Text strong>{m.name}</Typography.Text>
                    {m.type ? <Tag color={typeColor(m.type)}>{m.type}</Tag> : null}
                  </Space>
                  {m.habitat && (
                    <Typography.Text type="secondary" className="rpg-text-sm" style={S.habitatEllipsis}>
                      Habitat: {m.habitat}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Description',
              key: 'description',
              ellipsis: true,
              render: (_: unknown, m: Monster) => (
                <Typography.Text type="secondary" style={textSm}>
                  {m.description?.trim() || '—'}
                </Typography.Text>
              ),
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 150,
              render: (v: string) => (
                <Typography.Text type="secondary" style={textSm}>
                  {formatDate(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 90,
              render: (_: unknown, m: Monster) => (
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setAdminId(m.id);
                      setAdminOpen(true);
                    }}
                  />
                  <Popconfirm
                    title={`Delete "${m.name}" permanently?`}
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => void deleteMonster(m.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!gmItems.length && !loading && <Empty description="No creatures found." style={S.emptyWithTopSpacing} />}
    </Card>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageTitle>Bestiary</PageTitle>

      {Header}

      {viewMode === 'gm' && isGM ? (
        <>
          {loading ? <Spinner /> : mobileOnly ? <MonsterCards data={gmItems} mode="gm" /> : DesktopAdminTable}
          <MonsterAdminDrawer
            open={adminOpen}
            monster={adminMonster}
            onClose={() => {
              setAdminOpen(false);
              setAdminId(null);
            }}
            onChanged={load}
          />
        </>
      ) : (
        <>
          {loading ? <Spinner /> : <MonsterCards data={playerItems} mode="players" />}

          <Drawer
            open={openId !== null}
            onClose={() => setOpenId(null)}
            size={mobileOnly ? '100%' : 540}
            title={
              openMonster ? (
                <Space wrap size={8}>
                  <span style={bold800}>{openMonster.name}</span>
                  {openMonster.type ? <Tag color={typeColor(openMonster.type)}>{openMonster.type}</Tag> : null}
                </Space>
              ) : null
            }
          >
            {openMonster && (
              <>
                {openMonster.discovered && openMonster.imageUrl && (
                  <div style={S.publicDrawerImagePreview}>
                    <img
                      src={resolveApiUrl(openMonster.imageUrl)}
                      alt={openMonster.imageAlt ?? openMonster.name}
                      style={imgCoverH(240)}
                    />
                  </div>
                )}

                {openMonster.discovered ? (
                  <Space orientation="vertical" size={12} style={w100}>
                    {openMonster.habitat && (
                      <Card density="dense" title="Habitat">
                        <Typography.Text>{openMonster.habitat}</Typography.Text>
                      </Card>
                    )}
                    {openMonster.weaknesses && (
                      <Card density="dense" title="Weaknesses / Behavior">
                        <Typography.Text>{openMonster.weaknesses}</Typography.Text>
                      </Card>
                    )}
                    <Card density="comfy" title="Description">
                      <Typography.Paragraph style={preWrap}>
                        {openMonster.description?.trim() || 'No description yet.'}
                      </Typography.Paragraph>
                    </Card>
                  </Space>
                ) : (
                  <Card density="comfy">
                    <Typography.Text type="secondary">
                      Information about this creature has not been revealed yet.
                    </Typography.Text>
                  </Card>
                )}
              </>
            )}
          </Drawer>
        </>
      )}
    </>
  );
};

export default BestiaryPage;
