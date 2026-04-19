// src/pages/LoresAdminPage.tsx
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

import { createLore, deleteLore, listLores, setLoreVisibility, updateLore } from '@app/api/lore.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Lore, LoreCategory } from '@app/api/lore.api';

const GM_KEY_STORAGE = 'gm_api_key';

const CATEGORY_COLOR: Record<string, string> = {
  history: 'orange',
  culture: 'purple',
  tech: 'cyan',
  biology: 'green',
  myth: 'gold',
};
const CATEGORY_LABEL: Record<string, string> = {
  history: 'History',
  culture: 'Culture',
  tech: 'Technology',
  biology: 'Biology',
  myth: 'Myth',
};
const CATEGORY_STRIP: Record<string, string> = {
  history: '#fa8c16',
  culture: '#722ed1',
  tech: '#13c2c2',
  biology: '#52c41a',
  myth: '#faad14',
};

const categoryOptions: { value: LoreCategory | 'null'; label: string }[] = [
  { value: 'history', label: 'History' },
  { value: 'culture', label: 'Culture' },
  { value: 'tech', label: 'Technology' },
  { value: 'biology', label: 'Biology' },
  { value: 'myth', label: 'Myth' },
  { value: 'null', label: '(No category)' },
];

function isVisible(l: Lore) {
  return (l.visible ?? true) === true;
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
  return d.toLocaleString();
}

export const LoresAdminPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const [isGM, setIsGM] = React.useState<boolean>(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) setIsGM(Boolean(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [items, setItems] = React.useState<Lore[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'public' | 'admin'>('public');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [filterCategory, setFilterCategory] = React.useState<LoreCategory | 'all'>('all');

  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<LoreCategory | null>(null);
  const [newContent, setNewContent] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'view' | 'edit'>('view');
  const openLore = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [editTitle, setEditTitle] = React.useState('');
  const [editCategory, setEditCategory] = React.useState<LoreCategory | null>(null);
  const [editContent, setEditContent] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLores();
      setItems(data);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load lores'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!openLore) return;
    setEditTitle(openLore.title ?? '');
    setEditCategory((openLore.category ?? null) as LoreCategory | null);
    setEditContent(openLore.content ?? '');
  }, [openLore?.id]);

  const q = search.trim().toLowerCase();

  const filtered = React.useMemo(
    () =>
      items.filter((x) => {
        if (filterVis === 'visible' && !isVisible(x)) return false;
        if (filterVis === 'hidden' && isVisible(x)) return false;
        if (filterCategory !== 'all' && x.category !== filterCategory) return false;
        if (!q) return true;
        return (x.title ?? '').toLowerCase().includes(q) || (x.content ?? '').toLowerCase().includes(q);
      }),
    [items, q, filterVis, filterCategory],
  );

  const publicFiltered = React.useMemo(
    () =>
      items.filter((x) => {
        if (!isVisible(x)) return false;
        if (filterCategory !== 'all' && x.category !== filterCategory) return false;
        if (!q) return true;
        return (x.title ?? '').toLowerCase().includes(q) || (x.content ?? '').toLowerCase().includes(q);
      }),
    [items, q, filterCategory],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isVisible).length;
    return { total, visible, hidden: total - visible };
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
    if (!title) return message.warning('Title is required');
    try {
      const created = await createLore({
        title,
        category: newCategory,
        content: newContent.trim() || null,
      });
      setCreating(false);
      setNewTitle('');
      setNewCategory(null);
      setNewContent('');
      setItems((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      message.success('Lore created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create lore (GM key?)'));
    }
  }

  async function toggleVisible(l: Lore) {
    const next = !isVisible(l);
    setItems((prev) => prev.map((x) => (x.id === l.id ? { ...x, visible: next } : x)));
    try {
      await setLoreVisibility(l.id, next);
      message.success(next ? 'Lore visible to players' : 'Lore hidden');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openLore) return;
    const title = editTitle.trim();
    if (!title) return message.warning('Title cannot be empty');
    try {
      await updateLore(openLore.id, {
        title,
        category: editCategory,
        content: editContent.trim() || null,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.id === openLore.id ? { ...x, title, category: editCategory, content: editContent.trim() || null } : x,
        ),
      );
      message.success('Lore updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update lore (GM key?)'));
    }
  }

  async function removeLore(id: number) {
    try {
      await deleteLore(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Lore removed');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove lore (GM key?)'));
    }
  }

  const gridCols = mobileOnly ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={8}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {viewMode === 'admin' ? '⚙️ GM Panel — Lores' : 'Lore Archive'}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {viewMode === 'admin'
                ? 'Create, edit, activate or remove lore entries.'
                : 'Historical, cultural and scientific records of the Algol system.'}
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
                  📖 Lores
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
                {creating ? 'Close' : '+ New Lore'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} lores</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        <Space wrap size={8} style={{ width: '100%' }}>
          <Input
            allowClear
            placeholder="Search by title or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <Space size={4}>
            <Button
              size="small"
              type={filterCategory === 'all' ? 'primary' : 'default'}
              onClick={() => setFilterCategory('all')}
            >
              All
            </Button>
            {(['history', 'culture', 'tech', 'biology', 'myth'] as LoreCategory[]).map((c) => (
              <Button
                key={c}
                size="small"
                type={filterCategory === c ? 'primary' : 'default'}
                onClick={() => setFilterCategory(c)}
              >
                {CATEGORY_LABEL[c]}
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
            <Divider style={{ margin: '4px 0' }} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
              <Typography.Text strong>New Lore</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Title *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ minWidth: 280 }}
                  required
                />
                <Select
                  style={{ minWidth: 180 }}
                  value={(newCategory ?? 'null') as any}
                  onChange={(v) => setNewCategory(v === 'null' ? null : (v as LoreCategory))}
                  options={categoryOptions}
                />
              </Space>
              <TextArea
                placeholder="Content (free text or markdown)"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={mobileOnly ? 6 : 4}
              />
              <Space>
                <Button type="primary" htmlType="submit">
                  Create Lore
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  // ── Public View ───────────────────────────────────────────────────────────
  const displayItems = viewMode === 'admin' ? filtered : publicFiltered;

  const PublicView = (
    <>
      {loading ? (
        <Spinner />
      ) : displayItems.length === 0 ? (
        <Card density="comfy">
          <Empty description="No lores found." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
          {displayItems.map((l) => {
            const vis = isVisible(l);
            const cat = l.category ?? null;
            return (
              <div
                key={l.id}
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
                onClick={() => openForView(l.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ height: 8, background: cat ? CATEGORY_STRIP[cat] ?? '#d9d9d9' : '#d9d9d9' }} />
                <div
                  style={{
                    padding: '14px 16px 12px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <Space size={6} style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Tag color={cat ? CATEGORY_COLOR[cat] : 'default'} style={{ margin: 0 }}>
                      {cat ? CATEGORY_LABEL[cat] ?? cat : 'No category'}
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
                    {l.title}
                  </Typography.Title>
                  {l.content && (
                    <Typography.Paragraph style={{ margin: 0, fontSize: 13, color: '#595959' }} ellipsis={{ rows: 3 }}>
                      {l.content}
                    </Typography.Paragraph>
                  )}
                  <div style={{ flex: 1 }} />
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={6}>
                    <span style={{ fontSize: 11, color: '#bfbfbf' }}>{formatDate((l as any).createdAt)}</span>
                    <Space size={6} onClick={(e) => e.stopPropagation()}>
                      {isGM && <Switch size="small" checked={vis} onChange={() => void toggleVisible(l)} />}
                      <Button size="small" type="link" style={{ padding: 0, fontSize: 12 }}>
                        View lore →
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
      {filtered.map((l) => {
        const vis = isVisible(l);
        const cat = l.category ?? null;
        return (
          <Card key={l.id} density="dense">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                <Space size={6}>
                  <Tag color={cat ? CATEGORY_COLOR[cat] : 'default'} style={{ margin: 0 }}>
                    {cat ? CATEGORY_LABEL[cat] ?? cat : 'No category'}
                  </Tag>
                  <Tag color={vis ? 'green' : 'red'} style={{ margin: 0 }}>
                    {vis ? 'Visible' : 'Hidden'}
                  </Tag>
                </Space>
                <Space size={4}>
                  <Switch size="small" checked={vis} onChange={() => void toggleVisible(l)} />
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(l.id)} />
                  <Popconfirm
                    title="Remove this lore permanently?"
                    okText="Remove"
                    cancelText="Cancel"
                    onConfirm={() => void removeLore(l.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </Space>
              <Typography.Text strong style={{ cursor: 'pointer', display: 'block' }} onClick={() => openForView(l.id)}>
                {l.title}
              </Typography.Text>
              {l.content && (
                <Typography.Paragraph style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }} ellipsis={{ rows: 2 }}>
                  {l.content}
                </Typography.Paragraph>
              )}
            </Space>
          </Card>
        );
      })}
    </div>
  );

  // ── Admin Desktop Table ───────────────────────────────────────────────────
  const AdminDesktopTable = (
    <Card density="dense" title="Manage Lores">
      <div style={{ overflowX: 'auto' }}>
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
              render: (v: number) => <Tag style={{ margin: 0 }}>#{v}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, l: Lore) => (
                <Switch
                  size="small"
                  checked={isVisible(l)}
                  onChange={() => void toggleVisible(l)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Lore',
              key: 'title',
              render: (_: any, l: Lore) => {
                const cat = l.category ?? null;
                return (
                  <Space direction="vertical" size={2}>
                    <Space size={6} wrap>
                      <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => openForView(l.id)}>
                        {l.title}
                      </Typography.Text>
                      <Tag color={cat ? CATEGORY_COLOR[cat] : 'default'} style={{ margin: 0 }}>
                        {cat ? CATEGORY_LABEL[cat] ?? cat : 'No category'}
                      </Tag>
                    </Space>
                    {l.content && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {l.content.replace(/\n+/g, ' ').trim().slice(0, 80)}…
                      </Typography.Text>
                    )}
                  </Space>
                );
              },
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (v: string) => (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDateTime(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 100,
              render: (_: any, l: Lore) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(l.id)} />
                  <Popconfirm
                    title="Remove this lore permanently?"
                    okText="Remove"
                    cancelText="Cancel"
                    onConfirm={() => void removeLore(l.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!filtered.length && !loading && <Empty description="No lores found." style={{ marginTop: 16 }} />}
    </Card>
  );

  const AdminView = (
    <>
      {loading ? (
        <Spinner />
      ) : mobileOnly ? (
        filtered.length === 0 ? (
          <Card density="comfy">
            <Empty description="No lores found." />
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
  const DetailDrawer = openLore ? (
    <Drawer
      visible
      onClose={() => setOpenId(null)}
      width={mobileOnly ? '100%' : 640}
      title={
        <Space wrap size={8}>
          <span style={{ fontWeight: 800 }}>{openLore.title}</span>
          {openLore.category && (
            <Tag color={CATEGORY_COLOR[openLore.category]}>
              {CATEGORY_LABEL[openLore.category] ?? openLore.category}
            </Tag>
          )}
          <Tag color={isVisible(openLore) ? 'green' : 'red'}>{isVisible(openLore) ? 'Visible' : 'Hidden'}</Tag>
          <Badge count={`#${openLore.id}`} style={{ backgroundColor: '#595959' }} />
        </Space>
      }
      extra={
        isGM ? (
          <Space>
            <Popconfirm
              title="Remove this lore permanently?"
              okText="Remove"
              cancelText="Cancel"
              onConfirm={() => void removeLore(openLore.id)}
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
        <Tabs.TabPane tab="📖 Lore" key="view">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space wrap size={8}>
              {openLore.category && (
                <Tag color={CATEGORY_COLOR[openLore.category]}>
                  {CATEGORY_LABEL[openLore.category] ?? openLore.category}
                </Tag>
              )}
              {isGM && (
                <Space size={6}>
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>Publish:</span>
                  <Switch size="small" checked={isVisible(openLore)} onChange={() => void toggleVisible(openLore)} />
                </Space>
              )}
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            {openLore.content ? (
              <Card density="dense" title="Content">
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.75, fontSize: 14 }}>
                  {openLore.content}
                </Typography.Paragraph>
              </Card>
            ) : (
              <Typography.Text type="secondary">No content recorded.</Typography.Text>
            )}
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Created: {formatDateTime((openLore as any).createdAt)}
              {'  ·  '}
              Updated: {formatDateTime((openLore as any).updatedAt)}
            </Typography.Text>
          </Space>
        </Tabs.TabPane>

        {isGM && (
          <Tabs.TabPane tab="✏️ Edit" key="edit">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Card density="dense" title="Lore Data">
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Title
                    </Typography.Text>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Lore title" />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Category
                    </Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={(editCategory ?? 'null') as any}
                      onChange={(v) => setEditCategory(v === 'null' ? null : (v as LoreCategory))}
                      options={categoryOptions}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Content
                    </Typography.Text>
                    <TextArea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Lore content (free text or markdown)"
                      rows={mobileOnly ? 14 : 12}
                    />
                  </div>
                </Space>
              </Card>

              <Card density="dense" title="Visibility">
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Typography.Text>Visible to players</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Hidden lores only appear to the GM.
                    </Typography.Text>
                  </div>
                  <Switch
                    checked={isVisible(openLore)}
                    onChange={() => void toggleVisible(openLore)}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Space>
              </Card>

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
      <PageTitle>Lores</PageTitle>
      {Header}
      {viewMode === 'admin' && isGM ? AdminView : PublicView}
      {DetailDrawer}
    </>
  );
};

export default LoresAdminPage;
