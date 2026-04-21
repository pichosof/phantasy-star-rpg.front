/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/QuestsPage.tsx
import React from 'react';
import { Badge, Divider, Drawer, Empty, Popconfirm, Select, Space, Switch, Tabs, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';

import {
  createQuest,
  deleteQuest,
  listQuestsPublic,
  listQuestCities,
  setQuestVisibility,
  updateQuest,
} from '@app/api/quests.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Quest, QuestCity, QuestStatus } from '@app/api/quests.api';
import {
  m0,
  w100,
  textSm,
  textMd,
  bold800,
  spaceBetween,
  dividerSm,
  dividerMd,
  tableWrap,
} from '@app/styles/styleUtils';

const GM_KEY_STORAGE = 'gm_api_key';

const STATUS_COLOR: Record<string, string> = {
  active: 'blue',
  completed: 'green',
  failed: 'volcano',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  failed: 'Failed',
};
const STATUS_STRIP: Record<string, string> = {
  active: '#1677ff',
  completed: '#52c41a',
  failed: '#fa541c',
};

const statusOptions: { value: QuestStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

function isVisible(q: Quest) {
  return (q.visible ?? true) === true;
}
function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatDateTime(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString('en-US');
}

export const QuestsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  const [items, setItems] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'public' | 'admin'>('public');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | QuestStatus>('all');

  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newStatus, setNewStatus] = React.useState<QuestStatus>('active');
  const [newDescription, setNewDescription] = React.useState('');
  const [newReward, setNewReward] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'view' | 'edit'>('view');
  const openQuest = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [questCities, setQuestCities] = React.useState<Record<number, QuestCity[]>>({});
  const [citiesLoading, setCitiesLoading] = React.useState(false);

  const [editTitle, setEditTitle] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<QuestStatus>('active');
  const [editDescription, setEditDescription] = React.useState('');
  const [editReward, setEditReward] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQuestsPublic();
      setItems(data);
      const cityMaps = await Promise.all(
        data.map(async (q) => ({ id: q.id, cities: await listQuestCities(q.id).catch(() => []) })),
      );
      setQuestCities(Object.fromEntries(cityMaps.map((x) => [x.id, x.cities])));
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load quests'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!openQuest) return;
    setEditTitle(openQuest.title ?? '');
    setEditStatus((openQuest.status ?? 'active') as QuestStatus);
    setEditDescription(openQuest.description ?? '');
    setEditReward(openQuest.reward ?? '');
  }, [openQuest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!openId) return;
    if (questCities[openId]) return;
    setCitiesLoading(true);
    listQuestCities(openId)
      .then((cs) => setQuestCities((prev) => ({ ...prev, [openId]: cs })))
      .catch(() => setQuestCities((prev) => ({ ...prev, [openId]: [] })))
      .finally(() => setCitiesLoading(false));
  }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase();

  const filtered = React.useMemo(
    () =>
      items.filter((x) => {
        if (filterVis === 'visible' && !isVisible(x)) return false;
        if (filterVis === 'hidden' && isVisible(x)) return false;
        if (filterStatus !== 'all' && x.status !== filterStatus) return false;
        if (!q) return true;
        return (
          (x.title ?? '').toLowerCase().includes(q) ||
          (x.description ?? '').toLowerCase().includes(q) ||
          (x.reward ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q, filterVis, filterStatus],
  );

  const publicFiltered = React.useMemo(
    () =>
      items.filter((x) => {
        if (!isVisible(x)) return false;
        if (filterStatus !== 'all' && x.status !== filterStatus) return false;
        if (!q) return true;
        return (
          (x.title ?? '').toLowerCase().includes(q) ||
          (x.description ?? '').toLowerCase().includes(q) ||
          (x.reward ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q, filterStatus],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isVisible).length;
    const active = items.filter((x) => (x.status ?? 'active') === 'active').length;
    const completed = items.filter((x) => x.status === 'completed').length;
    const failed = items.filter((x) => x.status === 'failed').length;
    return { total, visible, hidden: total - visible, active, completed, failed };
  }, [items]);

  function openForView(id: number) {
    setDrawerTab('view');
    setOpenId(id);
  }
  function openForEdit(id: number) {
    setDrawerTab('edit');
    setOpenId(id);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return message.warning('Please provide a title');
    try {
      const created = await createQuest({
        title,
        status: newStatus,
        description: newDescription.trim() || null,
        reward: newReward.trim() || null,
      });
      setCreating(false);
      setNewTitle('');
      setNewStatus('active');
      setNewDescription('');
      setNewReward('');
      setItems((prev) => [...prev, created].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
      message.success('Quest created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create quest (GM key?)'));
    }
  }

  async function toggleVisible(qt: Quest) {
    const next = !isVisible(qt);
    setItems((prev) => prev.map((x) => (x.id === qt.id ? { ...x, visible: next } : x)));
    try {
      await setQuestVisibility(qt.id, next);
      message.success(next ? 'Quest visible to players' : 'Quest hidden');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openQuest) return;
    const title = editTitle.trim();
    if (!title) return message.warning('Title cannot be empty');
    try {
      await updateQuest(openQuest.id, {
        title,
        status: editStatus,
        description: editDescription.trim() || null,
        reward: editReward.trim() || null,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.id === openQuest.id
            ? {
                ...x,
                title,
                status: editStatus,
                description: editDescription.trim() || null,
                reward: editReward.trim() || null,
              }
            : x,
        ),
      );
      message.success('Quest updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update quest (GM key?)'));
    }
  }

  async function removeQuest(id: number) {
    try {
      await deleteQuest(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Quest removed');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove quest (GM key?)'));
    }
  }

  const gridCols = mobileOnly ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space direction="vertical" size={10} style={w100}>
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'admin' ? '⚙️ GM Panel — Quests' : 'Quests Board'}
            </Typography.Title>
            <Typography.Text type="secondary" style={textMd}>
              {viewMode === 'admin'
                ? 'Create, edit, enable or remove campaign quests.'
                : 'Active, completed and ongoing quests in the campaign.'}
            </Typography.Text>
          </div>
          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'public' ? 'primary' : 'default'}
                  onClick={() => setViewMode('public')}
                >
                  📖 Quests
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                  onClick={() => setViewMode('admin')}
                >
                  ⚙️ GM Panel
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'admin' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New Quest'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} quests</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
          <Tag color="blue">{stats.active} active</Tag>
          <Tag color="green">{stats.completed} completed</Tag>
          {stats.failed > 0 && <Tag color="volcano">{stats.failed} failed</Tag>}
        </Space>

        <Space wrap size={8} style={w100}>
          <Input
            allowClear
            placeholder="Search by title, description or reward…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <Space size={4}>
            {(['all', 'active', 'completed', 'failed'] as const).map((v) => (
              <Button
                key={v}
                size="small"
                type={filterStatus === v ? 'primary' : 'default'}
                onClick={() => setFilterStatus(v)}
              >
                {v === 'all' ? 'All' : STATUS_LABEL[v]}
              </Button>
            ))}
          </Space>
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

        {isGM && viewMode === 'admin' && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
              <Typography.Text strong>New Quest</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Title *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ minWidth: 280 }}
                  required
                />
                <Select
                  style={{ minWidth: 160 }}
                  value={newStatus}
                  onChange={(v) => setNewStatus(v as QuestStatus)}
                  options={statusOptions}
                />
              </Space>
              <TextArea
                placeholder="Quest description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={mobileOnly ? 6 : 4}
              />
              <Input placeholder="Reward (optional)" value={newReward} onChange={(e) => setNewReward(e.target.value)} />
              <Space>
                <Button type="primary" htmlType="submit">
                  Create Quest
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  // ── Visão Pública ─────────────────────────────────────────────────────────
  const displayItems = viewMode === 'admin' ? filtered : publicFiltered;

  const PublicView = (
    <>
      {loading ? (
        <Spinner />
      ) : displayItems.length === 0 ? (
        <Card density="comfy">
          <Empty description="No quests found." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
          {displayItems.map((qt) => {
            const vis = isVisible(qt);
            const status = (qt.status ?? 'active') as QuestStatus;
            return (
              <div
                key={qt.id}
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  background: 'var(--background-color, #fff)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onClick={() => openForView(qt.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ height: 8, background: STATUS_STRIP[status] ?? '#d9d9d9' }} />
                <div
                  style={{
                    padding: '14px 16px 12px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <Space size={6} style={spaceBetween}>
                    <Tag color={STATUS_COLOR[status]} style={m0}>
                      {STATUS_LABEL[status] ?? status}
                    </Tag>
                    {isGM && (
                      <Tag color={vis ? 'green' : 'red'} style={{ margin: 0, fontSize: 10 }}>
                        {vis ? 'Visible' : 'Hidden'}
                      </Tag>
                    )}
                  </Space>
                  <Typography.Title
                    level={5}
                    style={{ margin: 0, lineHeight: 1.35, fontSize: mobileOnly ? 15 : 16 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {qt.title}
                  </Typography.Title>
                  {qt.description && (
                    <Typography.Paragraph style={{ margin: 0, fontSize: 13, color: '#595959' }} ellipsis={{ rows: 3 }}>
                      {qt.description}
                    </Typography.Paragraph>
                  )}
                  {qt.reward && (
                    <Tag color="gold" style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                      🏆 {qt.reward}
                    </Tag>
                  )}
                  {questCities[qt.id] && questCities[qt.id].length > 0 && (
                    <Space wrap size={4} style={{ marginTop: 2 }}>
                      {questCities[qt.id].map((c) => (
                        <Tag key={c.id} color="geekblue" style={{ margin: 0, fontSize: 11 }}>
                          📍 {c.name}
                        </Tag>
                      ))}
                    </Space>
                  )}
                  <div style={{ flex: 1 }} />
                  <Divider style={dividerMd} />
                  <Space style={spaceBetween} size={6}>
                    <span style={{ fontSize: 11, color: '#bfbfbf' }}>{formatDate((qt as any).createdAt)}</span>
                    <Space size={6} onClick={(e) => e.stopPropagation()}>
                      {isGM && <Switch size="small" checked={vis} onChange={() => void toggleVisible(qt)} />}
                      <Button size="small" type="link" style={{ padding: 0, fontSize: 12 }}>
                        View quest →
                      </Button>
                    </Space>
                  </Space>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ── Admin Mobile ──────────────────────────────────────────────────────────
  const AdminMobileCards = (
    <div style={{ display: 'grid', gap: 10 }}>
      {filtered.map((qt) => {
        const vis = isVisible(qt);
        const status = (qt.status ?? 'active') as QuestStatus;
        return (
          <Card key={qt.id} density="dense">
            <Space direction="vertical" size={8} style={w100}>
              <Space style={spaceBetween} wrap>
                <Space size={6}>
                  <Tag color={STATUS_COLOR[status]} style={m0}>
                    {STATUS_LABEL[status]}
                  </Tag>
                  <Tag color={vis ? 'green' : 'red'} style={m0}>
                    {vis ? 'Visible' : 'Hidden'}
                  </Tag>
                </Space>
                <Space size={4}>
                  <Switch size="small" checked={vis} onChange={() => void toggleVisible(qt)} />
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(qt.id)} />
                  <Popconfirm
                    title="Remove this quest permanently?"
                    okText="Remove"
                    cancelText="Cancel"
                    onConfirm={() => void removeQuest(qt.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </Space>
              <Typography.Text
                strong
                style={{ cursor: 'pointer', display: 'block' }}
                onClick={() => openForView(qt.id)}
              >
                {qt.title}
              </Typography.Text>
              {qt.description && (
                <Typography.Paragraph style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }} ellipsis={{ rows: 2 }}>
                  {qt.description}
                </Typography.Paragraph>
              )}
              {qt.reward && (
                <Tag color="gold" style={{ fontSize: 11 }}>
                  🏆 {qt.reward}
                </Tag>
              )}
            </Space>
          </Card>
        );
      })}
    </div>
  );

  // ── Admin Desktop Table ───────────────────────────────────────────────────
  const AdminDesktopTable = (
    <Card density="dense" title="Manage Quests">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 900 }}
          style={{ minWidth: 900 }}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (v: number) => <Tag style={m0}>#{v}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, qt: Quest) => (
                <Switch
                  size="small"
                  checked={isVisible(qt)}
                  onChange={() => void toggleVisible(qt)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Quest',
              key: 'title',
              render: (_: any, qt: Quest) => (
                <Space direction="vertical" size={2}>
                  <Space size={6} wrap>
                    <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => openForView(qt.id)}>
                      {qt.title}
                    </Typography.Text>
                    <Tag color={STATUS_COLOR[qt.status ?? 'active']} style={m0}>
                      {STATUS_LABEL[qt.status ?? 'active']}
                    </Tag>
                    {qt.reward && (
                      <Tag color="gold" style={m0}>
                        Reward
                      </Tag>
                    )}
                  </Space>
                  {qt.description && (
                    <Typography.Text type="secondary" style={textSm} ellipsis>
                      {qt.description.replace(/\n+/g, ' ').trim().slice(0, 80)}…
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (v: string) => (
                <Typography.Text type="secondary" style={textSm}>
                  {formatDateTime(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 100,
              render: (_: any, qt: Quest) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(qt.id)} />
                  <Popconfirm
                    title="Remove this quest permanently?"
                    okText="Remove"
                    cancelText="Cancel"
                    onConfirm={() => void removeQuest(qt.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!filtered.length && !loading && <Empty description="No quests found." style={{ marginTop: 16 }} />}
    </Card>
  );

  const AdminView = (
    <>
      {loading ? (
        <Spinner />
      ) : mobileOnly ? (
        filtered.length === 0 ? (
          <Card density="comfy">
            <Empty description="No quests found." />
          </Card>
        ) : (
          AdminMobileCards
        )
      ) : (
        AdminDesktopTable
      )}
    </>
  );

  // ── Drawer ────────────────────────────────────────────────────────────────
  const DetailDrawer = openQuest ? (
    <Drawer
      visible
      onClose={() => setOpenId(null)}
      width={mobileOnly ? '100%' : 640}
      title={
        <Space wrap size={8}>
          <span style={bold800}>{openQuest.title}</span>
          <Tag color={STATUS_COLOR[openQuest.status ?? 'active']}>{STATUS_LABEL[openQuest.status ?? 'active']}</Tag>
          <Tag color={isVisible(openQuest) ? 'green' : 'red'}>{isVisible(openQuest) ? 'Visible' : 'Hidden'}</Tag>
          <Badge count={`#${openQuest.id}`} style={{ backgroundColor: '#595959' }} />
        </Space>
      }
      extra={
        isGM ? (
          <Space>
            <Popconfirm
              title="Remove this quest permanently?"
              okText="Remove"
              cancelText="Cancel"
              onConfirm={() => void removeQuest(openQuest.id)}
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Popconfirm>
            {drawerTab === 'edit' && (
              <Button type="primary" size="small" onClick={() => void saveEdit()}>
                Save
              </Button>
            )}
          </Space>
        ) : null
      }
    >
      <Tabs activeKey={drawerTab} onChange={(k) => setDrawerTab(k as 'view' | 'edit')}>
        <Tabs.TabPane tab="📖 Quest" key="view">
          <Space direction="vertical" size={16} style={w100}>
            <Space wrap size={8}>
              <Tag color={STATUS_COLOR[openQuest.status ?? 'active']}>{STATUS_LABEL[openQuest.status ?? 'active']}</Tag>
              {openQuest.reward && <Tag color="gold">🏆 {openQuest.reward}</Tag>}
              {isGM && (
                <Space size={6}>
                  <span className="rpg-text-sm rpg-muted">Publish:</span>
                  <Switch size="small" checked={isVisible(openQuest)} onChange={() => void toggleVisible(openQuest)} />
                </Space>
              )}
            </Space>
            <Divider style={dividerSm} />
            {openQuest.description ? (
              <Card density="dense" title="Description">
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.75, fontSize: 14 }}>
                  {openQuest.description}
                </Typography.Paragraph>
              </Card>
            ) : (
              <Typography.Text type="secondary">No description.</Typography.Text>
            )}
            {(() => {
              const cities = openId ? questCities[openId] ?? null : null;
              if (citiesLoading) return <Spinner />;
              if (!cities || cities.length === 0) return null;
              return (
                <Card density="dense" title="📍 Cities">
                  <Space wrap size={6}>
                    {cities.map((c) => (
                      <Tag key={c.id} color="geekblue">
                        {c.name}
                        {c.region ? ` — ${c.region}` : ''}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              );
            })()}
            <Typography.Text type="secondary" style={textSm}>
              Created at: {formatDateTime((openQuest as any).createdAt)}
              {'  ·  '}
              Updated: {formatDateTime((openQuest as any).updatedAt)}
            </Typography.Text>
          </Space>
        </Tabs.TabPane>

        {isGM && (
          <Tabs.TabPane tab="✏️ Edit" key="edit">
            <Space direction="vertical" size={12} style={w100}>
              <Card density="dense" title="Quest Data">
                <Space direction="vertical" size={10} style={w100}>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Title
                    </Typography.Text>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Quest title" />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Status
                    </Typography.Text>
                    <Select
                      style={w100}
                      value={editStatus}
                      onChange={(v) => setEditStatus(v as QuestStatus)}
                      options={statusOptions}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Description
                    </Typography.Text>
                    <TextArea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Quest description"
                      rows={mobileOnly ? 10 : 8}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Reward
                    </Typography.Text>
                    <Input
                      value={editReward}
                      onChange={(e) => setEditReward(e.target.value)}
                      placeholder="Reward (optional)"
                    />
                  </div>
                </Space>
              </Card>

              <Card density="dense" title="Visibility">
                <Space style={spaceBetween}>
                  <div>
                    <Typography.Text>Visible to players</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={textSm}>
                      Hidden quests are only visible to the GM.
                    </Typography.Text>
                  </div>
                  <Switch
                    checked={isVisible(openQuest)}
                    onChange={() => void toggleVisible(openQuest)}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Space>
              </Card>

              <TagSelect entityType="quest" entityId={openQuest.id} />

              <Button type="primary" block onClick={() => void saveEdit()}>
                Save Changes
              </Button>
            </Space>
          </Tabs.TabPane>
        )}
      </Tabs>
    </Drawer>
  ) : null;

  return (
    <>
      <PageTitle>Quests</PageTitle>
      {Header}
      {viewMode === 'admin' && isGM ? AdminView : PublicView}
      {DetailDrawer}
    </>
  );
};

export default QuestsPage;
