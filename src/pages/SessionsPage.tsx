/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/SessionsPage.tsx
import React from 'react';
import { Badge, Divider, Drawer, Empty, Popconfirm, Space, Switch, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { useResponsive } from '@app/hooks/useResponsive';

import { createSession, deleteSession, listSessions, setSessionVisibility, updateSession } from '@app/api/sessions.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Session } from '@app/api/sessions.api';
import {
  m0,
  w100,
  textSm,
  textMd,
  bold800,
  mutedSm,
  spaceBetween,
  dividerSm,
  dividerMd,
  tableWrap,
  lineHeight175,
} from '@app/styles/styleUtils';

const GM_KEY_STORAGE = 'gm_api_key';

// Gradientes dos 4 mundos de Algol — Dezo / Crystal / Motavia / Palma / variações
const SESSION_GRADIENTS = [
  'linear-gradient(135deg, #040A18 0%, #0A1C3A 50%, #0E2A58 100%)', // Dezolis — noite ártica
  'linear-gradient(135deg, #08041C 0%, #1E0A50 50%, #2E0E72 100%)', // Mundo Cristal — vazio violeta
  'linear-gradient(135deg, #1C0A04 0%, #4A1E08 50%, #7A2E06 100%)', // Motavia — deserto brasa
  'linear-gradient(135deg, #0C0808 0%, #2A0C0C 50%, #180808 100%)', // Cinturão de Palma — cinza e sangue
  'linear-gradient(135deg, #050C1E 0%, #082240 50%, #0A2A58 100%)', // Dezo profundo — abismo glacial
  'linear-gradient(135deg, #0A041C 0%, #1E0840 50%, #0C0428 100%)', // Vazio Cristal — roxo void
  'linear-gradient(135deg, #04100C 0%, #082820 50%, #0A1E18 100%)', // Frost Teal — gelo mineral
  'linear-gradient(135deg, #0C0A10 0%, #1A1428 50%, #22183A 100%)', // Espaço profundo — entre mundos
];
function sessionGradient(id: number) {
  return SESSION_GRADIENTS[id % SESSION_GRADIENTS.length];
}
function isVisible(s: Session) {
  return (s.visible ?? false) === true;
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

// ── Cover ─────────────────────────────────────────────────────────────────────
const SessionCover: React.FC<{ session: Session; height?: number }> = ({ session, height = 180 }) => {
  if (session.imageUrl) {
    return (
      <div style={{ position: 'relative', height, overflow: 'hidden' }}>
        <img
          src={session.imageUrl}
          alt={session.imageAlt ?? session.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)',
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        height,
        background: sessionGradient(session.id),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.12)', userSelect: 'none' }}>
        <AppIcon name="star" size={64} />
      </span>
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Phantasy Star RPG
        </span>
      </div>
    </div>
  );
};

// ── Página ────────────────────────────────────────────────────────────────────
export const SessionsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  const [items, setItems] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(false);

  // blog | admin  (admin só para GM)
  const [viewMode, setViewMode] = React.useState<'blog' | 'admin'>('blog');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  // criar
  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDate, setNewDate] = React.useState('');
  const [newSummary, setNewSummary] = React.useState('');
  const [newImageUrl, setNewImageUrl] = React.useState('');

  // drawer
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'view' | 'edit'>('view');
  const openSession = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [editTitle, setEditTitle] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editSummary, setEditSummary] = React.useState('');
  const [editImageUrl, setEditImageUrl] = React.useState('');
  const [editImageAlt, setEditImageAlt] = React.useState('');

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSessions();
      setItems([...data].sort((a, b) => b.id - a.id));
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!openSession) return;
    setEditTitle(openSession.title ?? '');
    setEditDate(openSession.date ?? '');
    setEditSummary(openSession.summary ?? '');
    setEditImageUrl(openSession.imageUrl ?? '');
    setEditImageAlt(openSession.imageAlt ?? '');
  }, [openSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtros ───────────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(
    () =>
      items.filter((s) => {
        if (filterVis === 'visible' && !isVisible(s)) return false;
        if (filterVis === 'hidden' && isVisible(s)) return false;
        if (!q) return true;
        return (
          (s.title ?? '').toLowerCase().includes(q) ||
          (s.date ?? '').toLowerCase().includes(q) ||
          (s.summary ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q, filterVis],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  // ── Ações ─────────────────────────────────────────────────────────────────
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
    const date = newDate.trim();
    if (!title) return message.warning('Please provide a title');
    if (!date) return message.warning('Please provide a date');
    try {
      const created = await createSession({
        title,
        date,
        summary: newSummary.trim() || null,
        imageUrl: newImageUrl.trim() || null,
      });
      setCreating(false);
      setNewTitle('');
      setNewDate('');
      setNewSummary('');
      setNewImageUrl('');
      setItems((prev) => [created, ...prev]);
      message.success('Session created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create session — check the GM key.'));
    }
  }

  async function toggleVisible(s: Session) {
    const next = !isVisible(s);
    setItems((prev) => prev.map((x) => (x.id === s.id ? { ...x, visible: next } : x)));
    try {
      await setSessionVisibility(s.id, next);
      message.success(next ? 'Session visible to players' : 'Session hidden');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openSession) return;
    const title = editTitle.trim();
    if (!title) return message.warning('Title cannot be empty');
    const date = editDate.trim();
    if (!date) return message.warning('Date cannot be empty');
    try {
      await updateSession(openSession.id, {
        title,
        date,
        summary: editSummary.trim() || null,
        imageUrl: editImageUrl.trim() || null,
        imageAlt: editImageAlt.trim() || null,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.id === openSession.id
            ? {
                ...x,
                title,
                date,
                summary: editSummary.trim() || null,
                imageUrl: editImageUrl.trim() || null,
                imageAlt: editImageAlt.trim() || null,
              }
            : x,
        ),
      );
      message.success('Session updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update session (GM key?)'));
    }
  }

  async function removeSession(id: number) {
    try {
      await deleteSession(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Session removed');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove session (GM key?)'));
    }
  }

  const sessionNumber = React.useCallback(
    (id: number) => {
      const sorted = [...items].sort((a, b) => a.id - b.id);
      const idx = sorted.findIndex((s) => s.id === id);
      return idx === -1 ? id : idx + 1;
    },
    [items],
  );

  const gridCols = mobileOnly ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // ── Header (compartilhado entre os dois modos) ────────────────────────────
  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space orientation="vertical" size={10} style={w100}>
        {/* Título + toggles de modo */}
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'admin' ? (
                <IconLabel icon="gm">GM Panel - Sessions</IconLabel>
              ) : (
                <IconLabel icon="notes">Campaign Diary</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text type="secondary" style={textMd}>
              {viewMode === 'admin'
                ? 'Create, edit, enable or remove campaign sessions.'
                : 'Record of all sessions — dates, events and epic moments.'}
            </Typography.Text>
          </div>

          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'blog' ? 'primary' : 'default'}
                  onClick={() => setViewMode('blog')}
                >
                  <IconLabel icon="read">Blog</IconLabel>
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                  onClick={() => setViewMode('admin')}
                >
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'admin' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New Session'}
              </Button>
            )}
          </Space>
        </Space>

        {/* Stats */}
        <Space wrap size={8}>
          <Tag>{stats.total} sessions</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        {/* Busca + filtros */}
        <Space wrap size={8} style={w100}>
          <Input
            allowClear
            placeholder="Search by title, date or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
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

        {/* Formulário de criação (só no modo admin) */}
        {isGM && viewMode === 'admin' && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
              <Typography.Text strong>New Session</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Title *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ minWidth: 280 }}
                  required
                />
                <Input
                  placeholder="Date (e.g. AW 2284, Day 3 or 2025-04-13) *"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ minWidth: 280 }}
                  required
                />
              </Space>
              <TextArea
                placeholder={
                  'Summary — use sections:\n## Milestones\n- ...\n## Key Points\n- ...\n## Links\n- Quest: ...'
                }
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                rows={mobileOnly ? 6 : 5}
              />
              <Input
                placeholder="Cover image URL (optional)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Space>
                <Button type="primary" htmlType="submit">
                  Create Session
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  // ── Modo Blog ─────────────────────────────────────────────────────────────
  const BlogView = (
    <>
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Card density="comfy">
          <Empty description="No sessions found." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
          {filtered.map((session) => {
            const num = sessionNumber(session.id);
            const vis = isVisible(session);
            return (
              <div
                key={session.id}
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
                onClick={() => openForView(session.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <SessionCover session={session} height={mobileOnly ? 140 : 180} />
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
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        color: '#8c8c8c',
                      }}
                    >
                      Session #{num}
                    </span>
                    {isGM && (
                      <Tag color={vis ? 'green' : 'red'} style={{ margin: 0, fontSize: 10 }}>
                        {vis ? 'Visible' : 'Hidden'}
                      </Tag>
                    )}
                  </Space>
                  <div style={{ fontSize: 12, color: '#595959' }}>
                    <IconLabel icon="calendar" gap={6}>
                      {formatDate(session.date)}
                    </IconLabel>
                  </div>
                  <Typography.Title
                    level={5}
                    style={{ margin: 0, lineHeight: 1.35, fontSize: mobileOnly ? 15 : 16 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {session.title}
                  </Typography.Title>
                  {session.summary && (
                    <Typography.Paragraph style={{ margin: 0, fontSize: 13, color: '#595959' }} ellipsis={{ rows: 3 }}>
                      {session.summary}
                    </Typography.Paragraph>
                  )}
                  <div style={{ flex: 1 }} />
                  <Divider style={dividerMd} />
                  <Space style={spaceBetween} size={6}>
                    <span style={{ fontSize: 11, color: '#bfbfbf' }}>{formatDateTime(session.createdAt)}</span>
                    <Space size={6} onClick={(e) => e.stopPropagation()}>
                      {isGM && (
                        <Switch
                          size="small"
                          checked={vis}
                          onChange={() => void toggleVisible(session)}
                          title={vis ? 'Hide' : 'Publish'}
                        />
                      )}
                      <Button size="small" type="link" style={{ padding: 0, fontSize: 12 }}>
                        View session →
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

  // ── Modo Admin ────────────────────────────────────────────────────────────
  const AdminMobileCards = (
    <div style={{ display: 'grid', gap: 10 }}>
      {filtered.map((s) => {
        const num = sessionNumber(s.id);
        const vis = isVisible(s);
        return (
          <Card key={s.id} density="dense">
            <Space orientation="vertical" size={8} style={w100}>
              {/* linha 1: número + tags */}
              <Space style={spaceBetween} wrap>
                <Space size={6}>
                  <Tag style={m0}>#{num}</Tag>
                  <Tag color={vis ? 'green' : 'red'} style={m0}>
                    {vis ? 'Visible' : 'Hidden'}
                  </Tag>
                </Space>
                <Space size={4}>
                  <Switch size="small" checked={vis} onChange={() => void toggleVisible(s)} />
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(s.id)} />
                  <Popconfirm
                    title="Remove this session permanently?"
                    okText="Remove"
                    cancelText="Cancel"
                    onConfirm={() => void removeSession(s.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </Space>
              {/* título */}
              <Typography.Text strong style={{ cursor: 'pointer', display: 'block' }} onClick={() => openForView(s.id)}>
                {s.title}
              </Typography.Text>
              {/* data */}
              <Typography.Text type="secondary" style={textSm}>
                <IconLabel icon="calendar" gap={6}>
                  {s.date}
                </IconLabel>
              </Typography.Text>
              {/* preview resumo */}
              {s.summary && (
                <Typography.Paragraph style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }} ellipsis={{ rows: 2 }}>
                  {s.summary}
                </Typography.Paragraph>
              )}
            </Space>
          </Card>
        );
      })}
    </div>
  );

  const AdminDesktopTable = (
    <Card density="dense" title="Manage Sessions">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 860 }}
          style={{ minWidth: 860 }}
          columns={[
            {
              title: '#',
              key: 'num',
              width: 60,
              render: (_: any, s: Session) => <Tag style={m0}>#{sessionNumber(s.id)}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, s: Session) => (
                <Switch
                  size="small"
                  checked={isVisible(s)}
                  onChange={() => void toggleVisible(s)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Title',
              key: 'title',
              render: (_: any, s: Session) => (
                <Space orientation="vertical" size={2}>
                  <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => openForView(s.id)}>
                    {s.title}
                  </Typography.Text>
                  {s.summary && (
                    <Typography.Text type="secondary" style={textSm} ellipsis>
                      {s.summary
                        .replace(/##[^\n]*/g, '')
                        .replace(/\n+/g, ' ')
                        .trim()
                        .slice(0, 80)}
                      …
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Date',
              dataIndex: 'date',
              key: 'date',
              width: 200,
              render: (v: string) => <Typography.Text style={textMd}>{v}</Typography.Text>,
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
              render: (_: any, s: Session) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(s.id)} />
                  <Popconfirm
                    title="Remove this session permanently?"
                    okText="Remove"
                    cancelText="Cancel"
                    onConfirm={() => void removeSession(s.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!filtered.length && !loading && <Empty description="No sessions found." style={{ marginTop: 16 }} />}
    </Card>
  );

  const AdminView = (
    <>
      {loading ? (
        <Spinner />
      ) : mobileOnly ? (
        filtered.length === 0 ? (
          <Card density="comfy">
            <Empty description="No sessions found." />
          </Card>
        ) : (
          AdminMobileCards
        )
      ) : (
        AdminDesktopTable
      )}
    </>
  );

  // ── Drawer (compartilhado) ────────────────────────────────────────────────
  const DetailDrawer = openSession ? (
    <Drawer
      open
      onClose={() => setOpenId(null)}
      size={mobileOnly ? '100%' : 700}
      title={
        <Space wrap size={8}>
          <span style={bold800}>
            Session #{sessionNumber(openSession.id)} · {openSession.title}
          </span>
          <Tag color={isVisible(openSession) ? 'green' : 'red'}>{isVisible(openSession) ? 'Visible' : 'Hidden'}</Tag>
          <Badge count={`#${openSession.id}`} style={{ backgroundColor: '#595959' }} />
        </Space>
      }
      extra={
        isGM ? (
          <Space>
            <Popconfirm
              title="Remove this session permanently?"
              okText="Remove"
              cancelText="Cancel"
              onConfirm={() => void removeSession(openSession.id)}
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
        {/* ── Ver ── */}
        <Tabs.TabPane tab={<IconLabel icon="notes">Session</IconLabel>} key="view">
          <Space orientation="vertical" size={16} style={w100}>
            <div style={{ borderRadius: 8, overflow: 'hidden' }}>
              <SessionCover session={openSession} height={240} />
            </div>
            <Space wrap size={8}>
              <Tag icon={<AppIcon name="calendar" />} color="blue">
                {formatDate(openSession.date)}
              </Tag>
              <Tag color="default">Session #{sessionNumber(openSession.id)}</Tag>
              {isGM && (
                <Space size={6}>
                  <span style={mutedSm}>Publish:</span>
                  <Switch
                    size="small"
                    checked={isVisible(openSession)}
                    onChange={() => void toggleVisible(openSession)}
                  />
                </Space>
              )}
            </Space>
            <Divider style={dividerSm} />
            {openSession.summary ? (
              <Card density="dense" title="Summary">
                <Typography.Paragraph style={{ ...lineHeight175, fontSize: 14 }}>
                  {openSession.summary}
                </Typography.Paragraph>
              </Card>
            ) : (
              <Typography.Text type="secondary">No summary recorded.</Typography.Text>
            )}
            <Typography.Text type="secondary" style={textSm}>
              Created at: {formatDateTime(openSession.createdAt)}
              {'  ·  '}
              Updated: {formatDateTime(openSession.updatedAt)}
            </Typography.Text>
          </Space>
        </Tabs.TabPane>

        {/* ── Editar (GM) ── */}
        {isGM && (
          <Tabs.TabPane tab={<IconLabel icon="edit">Edit</IconLabel>} key="edit">
            <Space orientation="vertical" size={12} style={w100}>
              <Card density="dense" title="Session Data">
                <Space orientation="vertical" size={10} style={w100}>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Title
                    </Typography.Text>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Session title"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Date
                    </Typography.Text>
                    <Input
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="E.g.: AW 2284, Day 3 or 2025-04-13"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Summary — use sections to organize
                    </Typography.Text>
                    <TextArea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      placeholder={
                        '## Milestones\n- Milestone 1\n\n## Key Points\n- Important point\n\n## Links\n- Quest: Quest name\n- City: City name'
                      }
                      rows={mobileOnly ? 14 : 12}
                    />
                  </div>
                </Space>
              </Card>

              <Card density="dense" title="Cover Image">
                <Space orientation="vertical" size={8} style={w100}>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Image URL
                    </Typography.Text>
                    <Input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Alt text (accessibility)
                    </Typography.Text>
                    <Input
                      value={editImageAlt}
                      onChange={(e) => setEditImageAlt(e.target.value)}
                      placeholder="Image description"
                    />
                  </div>
                  {(editImageUrl || openSession.imageUrl) && (
                    <div style={{ borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
                      <SessionCover
                        session={{ ...openSession, imageUrl: editImageUrl || openSession.imageUrl }}
                        height={120}
                      />
                    </div>
                  )}
                </Space>
              </Card>

              <Card density="dense" title="Visibility">
                <Space style={spaceBetween}>
                  <div>
                    <Typography.Text>Visible to players</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={textSm}>
                      Hidden sessions are only visible to the GM.
                    </Typography.Text>
                  </div>
                  <Switch
                    checked={isVisible(openSession)}
                    onChange={() => void toggleVisible(openSession)}
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageTitle>Sessions</PageTitle>
      {Header}
      {viewMode === 'admin' && isGM ? AdminView : BlogView}
      {DetailDrawer}
    </>
  );
};

export default SessionsPage;
