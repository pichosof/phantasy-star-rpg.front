/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Popconfirm, Space, Switch, Tabs, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';

import {
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  setTimelineEventVisibility,
  updateTimelineEvent,
} from '@app/api/timeline.api';
import type { TimelineEvent } from '@app/api/timeline.api';
import { apiErrorMessage } from '../utils/api-error';
import { m0, w100, textMd, spaceBetween, dividerSm } from '@app/styles/styleUtils';

const GM_KEY_STORAGE = 'gm_api_key';

// 6 cores dos mundos de Algol — Dezo / Crystal / Motavia / Palma / Frost / Gold
const EVENT_COLORS = ['#00C8E8', '#7722DD', '#FF6B1A', '#FF2244', '#22EFC8', '#C8A020'];
const eventColor = (id: number) => EVENT_COLORS[id % EVENT_COLORS.length];

function isVisible(e: TimelineEvent) {
  return (e.visible ?? false) === true;
}

function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Dot do timeline ────────────────────────────────────────────────────────────
const TimelineDot: React.FC<{ color: string; pulse?: boolean }> = ({ color, pulse }) => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: color,
      border: `2px solid ${color}`,
      boxShadow: `0 0 ${pulse ? 14 : 8}px ${color}, 0 0 ${pulse ? 28 : 16}px ${color}40`,
      transition: 'all 0.25s ease',
      flexShrink: 0,
    }}
  />
);

// ── Card público de evento ─────────────────────────────────────────────────────
const EventCard: React.FC<{
  event: TimelineEvent;
  color: string;
  side: 'left' | 'right';
  hovered: boolean;
  onHover: (v: boolean) => void;
  onClick: () => void;
  isGM: boolean;
}> = ({ event, color, side, hovered, onHover, onClick, isGM }) => (
  <div
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    onClick={onClick}
    style={{
      background: 'var(--additional-background-color)',
      border: `1px solid ${hovered ? color : 'var(--border-color)'}`,
      borderRadius: 10,
      padding: '14px 16px',
      cursor: 'pointer',
      transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      boxShadow: hovered ? `0 8px 24px ${color}40, 0 0 0 1px ${color}55` : 'var(--box-shadow)',
      transition: 'all 0.2s ease',
      textAlign: side === 'right' ? 'left' : 'right',
    }}
  >
    {/* Date badge */}
    <div
      style={{
        display: 'inline-block',
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderRadius: 4,
        padding: '2px 8px',
        marginBottom: 8,
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color,
        fontWeight: 600,
      }}
    >
      {formatDate(event.date)}
    </div>

    {isGM && (
      <div style={{ marginBottom: 6 }}>
        <Tag color={isVisible(event) ? 'green' : 'red'} style={{ margin: 0, fontSize: 11 }}>
          {isVisible(event) ? <EyeOutlined /> : <EyeInvisibleOutlined />} {isVisible(event) ? 'Visible' : 'Hidden'}
        </Tag>
      </div>
    )}

    <Typography.Text
      strong
      style={{ fontSize: 15, display: 'block', lineHeight: 1.4, color: 'var(--text-main-color)' }}
    >
      {event.title}
    </Typography.Text>

    {event.description && (
      <Typography.Text
        style={{
          fontSize: 13,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginTop: 6,
          lineHeight: 1.5,
          color: 'var(--text-light-color)',
        }}
      >
        {event.description}
      </Typography.Text>
    )}
  </div>
);

// ── Página ────────────────────────────────────────────────────────────────────
export const TimelinePage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  const [items, setItems] = React.useState<TimelineEvent[]>([]);
  const [loading, setLoading] = React.useState(false);

  // timeline | admin
  const [viewMode, setViewMode] = React.useState<'timeline' | 'admin'>('timeline');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  // criar
  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDate, setNewDate] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  // drawer
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'view' | 'edit'>('view');
  const openEvent = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [editTitle, setEditTitle] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');

  // hover state para efeito visual
  const [hoveredId, setHoveredId] = React.useState<number | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTimelineEvents();
      // ordena por ID (ordem de criação = ordem cronológica)
      setItems([...data].sort((a, b) => a.id - b.id));
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load timeline'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!openEvent) return;
    setEditTitle(openEvent.title ?? '');
    setEditDate(openEvent.date ?? '');
    setEditDesc(openEvent.description ?? '');
  }, [openEvent?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtros ───────────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();

  const displayItems = React.useMemo(
    () =>
      items.filter((e) => {
        if (!isGM && !isVisible(e)) return false;
        if (isGM && filterVis === 'visible' && !isVisible(e)) return false;
        if (isGM && filterVis === 'hidden' && isVisible(e)) return false;
        if (!q) return true;
        return (
          (e.title ?? '').toLowerCase().includes(q) ||
          (e.description ?? '').toLowerCase().includes(q) ||
          (e.date ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q, filterVis, isGM],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTimelineEvent({
        title: newTitle.trim(),
        date: newDate.trim(),
        description: newDesc.trim() || null,
      });
      setCreating(false);
      setNewTitle('');
      setNewDate('');
      setNewDesc('');
      await load();
      message.success('Event created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create event (GM key?)'));
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!openId) return;
    try {
      await updateTimelineEvent(openId, {
        title: editTitle.trim() || undefined,
        date: editDate.trim() || undefined,
        description: editDesc.trim() || null,
      });
      await load();
      message.success('Event updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save (GM key?)'));
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteTimelineEvent(id);
      if (openId === id) setOpenId(null);
      await load();
      message.success('Event removed');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove (GM key?)'));
    }
  }

  async function onToggleVisible(evt: TimelineEvent) {
    try {
      await setTimelineEventVisibility(evt.id, !isVisible(evt));
      await load();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space orientation="vertical" size={10} style={w100}>
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              Timeline
            </Typography.Title>
            <Typography.Text type="secondary" style={textMd}>
              {isGM
                ? 'Manage campaign events and their visibility.'
                : 'The major happenings that shaped the fate of the Algol system.'}
            </Typography.Text>
          </div>

          <Space size={6} wrap>
            {isGM && (
              <>
                <Button
                  size="small"
                  type={viewMode === 'timeline' ? 'primary' : 'default'}
                  onClick={() => setViewMode('timeline')}
                >
                  📅 Timeline
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                  onClick={() => setViewMode('admin')}
                >
                  ⚙️ GM Panel
                </Button>
                <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                  {creating ? 'Close' : '+ New Event'}
                </Button>
              </>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} events</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        {(isGM || search) && (
          <Space wrap size={8} style={w100}>
            <Input
              allowClear
              placeholder="Search by title, date or description…"
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
        )}

        {isGM && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
              <Typography.Text strong>New Event</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Title *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ minWidth: 240 }}
                  required
                />
                <Input
                  placeholder="Date (e.g. Messiah 2284 / 2024-03-15) *"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ minWidth: 200 }}
                  required
                />
              </Space>
              <TextArea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
              <Space>
                <Button htmlType="submit" type="primary">
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

  // ── Vista admin (tabela) ───────────────────────────────────────────────────
  const AdminView = (
    <Table
      dataSource={displayItems}
      rowKey="id"
      size="small"
      pagination={false}
      columns={[
        {
          title: '#',
          dataIndex: 'id',
          width: 52,
          render: (id: number) => <Tag style={m0}>{id}</Tag>,
        },
        {
          title: 'Date',
          dataIndex: 'date',
          width: 180,
          render: (v: string) => <span style={textMd}>{formatDate(v)}</span>,
        },
        {
          title: 'Title',
          dataIndex: 'title',
          render: (v: string, rec: TimelineEvent) => (
            <Typography.Text
              style={{ cursor: 'pointer', fontSize: 13 }}
              onClick={() => {
                setOpenId(rec.id);
                setDrawerTab('view');
              }}
            >
              {v}
            </Typography.Text>
          ),
        },
        {
          title: 'Visible',
          dataIndex: 'visible',
          width: 80,
          render: (_: any, rec: TimelineEvent) => (
            <Switch
              size="small"
              checked={isVisible(rec)}
              onChange={() => void onToggleVisible(rec)}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          ),
        },
        {
          title: '',
          key: 'actions',
          width: 80,
          render: (_: any, rec: TimelineEvent) => (
            <Space size={4}>
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setOpenId(rec.id);
                  setDrawerTab('edit');
                }}
              />
              <Popconfirm
                title="Remove this event?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => void onDelete(rec.id)}
              >
                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />
  );

  // ── Vista timeline visual ──────────────────────────────────────────────────
  const TimelineView =
    displayItems.length === 0 ? (
      <Card density="comfy">
        <Empty description="No events on the timeline." />
      </Card>
    ) : (
      <div style={{ position: 'relative', padding: mobileOnly ? '8px 0 8px 32px' : '8px 0' }}>
        {/* linha central do timeline */}
        {mobileOnly ? (
          <div
            style={{
              position: 'absolute',
              left: 7,
              top: 0,
              bottom: 0,
              width: 2,
              background:
                'linear-gradient(180deg, transparent 0%, #00C8E8 5%, #7722DD 30%, #FF6B1A 58%, #FF2244 82%, transparent 100%)',
              borderRadius: 1,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              transform: 'translateX(-50%)',
              background:
                'linear-gradient(180deg, transparent 0%, #00C8E8 5%, #7722DD 30%, #FF6B1A 58%, #FF2244 82%, transparent 100%)',
              borderRadius: 1,
            }}
          />
        )}

        {displayItems.map((evt, idx) => {
          const color = eventColor(evt.id);
          const isLeft = idx % 2 === 0;
          const hovered = hoveredId === evt.id;
          const cardProps = {
            event: evt,
            color,
            hovered,
            onHover: (v: boolean) => setHoveredId(v ? evt.id : null),
            onClick: () => {
              setOpenId(evt.id);
              setDrawerTab('view');
            },
            isGM,
          };

          if (mobileOnly) {
            return (
              <div key={evt.id} style={{ position: 'relative', marginBottom: 24 }}>
                {/* dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: -28,
                    top: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TimelineDot color={color} pulse={hovered} />
                </div>
                <EventCard {...cardProps} side="right" />
              </div>
            );
          }

          return (
            <div
              key={evt.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 56px 1fr',
                alignItems: 'flex-start',
                marginBottom: 32,
                gap: 0,
              }}
            >
              {/* left slot */}
              <div style={{ paddingRight: 20, paddingTop: 4 }}>
                {isLeft ? <EventCard {...cardProps} side="left" /> : null}
              </div>

              {/* dot + connector */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}>
                <TimelineDot color={color} pulse={hovered} />
              </div>

              {/* right slot */}
              <div style={{ paddingLeft: 20, paddingTop: 4 }}>
                {!isLeft ? <EventCard {...cardProps} side="right" /> : null}
              </div>
            </div>
          );
        })}
      </div>
    );

  // ── Drawer de evento ──────────────────────────────────────────────────────
  return (
    <>
      <PageTitle>Timeline</PageTitle>

      {Header}

      {loading ? <Spinner /> : isGM && viewMode === 'admin' ? AdminView : TimelineView}

      {/* Drawer de detalhes / edição */}
      <Drawer
        open={openId !== null}
        onClose={() => setOpenId(null)}
        width={mobileOnly ? '100%' : 480}
        title={openEvent?.title ?? 'Event'}
        destroyOnClose
      >
        {openEvent && (
          <Tabs activeKey={drawerTab} onChange={(k) => setDrawerTab(k as 'view' | 'edit')}>
            <Tabs.TabPane tab="📅 View" key="view">
              <Space orientation="vertical" size={14} style={w100}>
                <div>
                  <Typography.Text
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      color: 'var(--text-light-color)',
                    }}
                  >
                    Data
                  </Typography.Text>
                  <div>
                    <Typography.Text strong style={{ fontSize: 15, color: 'var(--text-main-color)' }}>
                      {formatDate(openEvent.date)}
                    </Typography.Text>
                    {openEvent.date !== formatDate(openEvent.date) && (
                      <Typography.Text style={{ fontSize: 12, marginLeft: 8, color: 'var(--text-light-color)' }}>
                        ({openEvent.date})
                      </Typography.Text>
                    )}
                  </div>
                </div>
                {isGM && (
                  <div>
                    <Tag color={isVisible(openEvent) ? 'green' : 'red'}>
                      {isVisible(openEvent) ? 'Visible to players' : 'Hidden from players'}
                    </Tag>
                  </div>
                )}
                {openEvent.description && (
                  <div>
                    <Typography.Text
                      style={{
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        color: 'var(--text-light-color)',
                      }}
                    >
                      Description
                    </Typography.Text>
                    <Typography.Paragraph style={{ marginTop: 4, marginBottom: 0, fontSize: 14, lineHeight: 1.7 }}>
                      {openEvent.description}
                    </Typography.Paragraph>
                  </div>
                )}
                {isGM && (
                  <>
                    <Divider style={dividerSm} />
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => setDrawerTab('edit')}>
                        Edit
                      </Button>
                      <Popconfirm
                        title="Remove this event?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => void onDelete(openEvent.id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                          Remove
                        </Button>
                      </Popconfirm>
                    </Space>
                  </>
                )}
              </Space>
            </Tabs.TabPane>

            {isGM && (
              <Tabs.TabPane tab="✏️ Edit" key="edit">
                <Space orientation="vertical" size={12} style={w100}>
                  <Space style={spaceBetween}>
                    <Typography.Text style={textMd}>Visible to players</Typography.Text>
                    <Switch
                      size="small"
                      checked={isVisible(openEvent)}
                      onChange={() => void onToggleVisible(openEvent)}
                      checkedChildren={<EyeOutlined />}
                      unCheckedChildren={<EyeInvisibleOutlined />}
                    />
                  </Space>
                  <Divider style={dividerSm} />
                  <form onSubmit={(e) => void onSaveEdit(e)} style={{ display: 'grid', gap: 10 }}>
                    <Input placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <Input
                      placeholder="Date (e.g. Messiah 2284 / 2024-03-15)"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                    <TextArea
                      placeholder="Description"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={5}
                    />
                    <Space>
                      <Button htmlType="submit" type="primary" size="small">
                        Save
                      </Button>
                      <Button size="small" onClick={() => setDrawerTab('view')}>
                        Cancel
                      </Button>
                    </Space>
                  </form>
                </Space>
              </Tabs.TabPane>
            )}
          </Tabs>
        )}
      </Drawer>
    </>
  );
};

export default TimelinePage;
