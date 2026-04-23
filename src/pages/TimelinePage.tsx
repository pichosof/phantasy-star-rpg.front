/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Popconfirm, Space, Switch, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
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
import * as S from './TimelinePage.styles';

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
  <div style={S.timelineDot(color, pulse)} />
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
    style={S.eventCard(color, hovered, side)}
  >
    {/* Date badge */}
    <div style={S.dateBadge(color)}>{formatDate(event.date)}</div>

    {isGM && (
      <div style={S.marginBottom6}>
        <Tag color={isVisible(event) ? 'green' : 'red'} style={S.visibleTag}>
          {isVisible(event) ? <EyeOutlined /> : <EyeInvisibleOutlined />} {isVisible(event) ? 'Visible' : 'Hidden'}
        </Tag>
      </div>
    )}

    <Typography.Text strong style={S.eventTitle}>
      {event.title}
    </Typography.Text>

    {event.description && <Typography.Text style={S.eventDescription}>{event.description}</Typography.Text>}
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
              <IconLabel icon="timeline">Timeline</IconLabel>
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
                  <IconLabel icon="timeline">Timeline</IconLabel>
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                  onClick={() => setViewMode('admin')}
                >
                  <IconLabel icon="gm">GM Panel</IconLabel>
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
              style={S.headerSearch}
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
            <S.createForm onSubmit={(e) => void onCreate(e)}>
              <Typography.Text strong>New Event</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Title *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={S.createTitleInput}
                  required
                />
                <Input
                  placeholder="Date (e.g. Messiah 2284 / 2024-03-15) *"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={S.createDateInput}
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
            </S.createForm>
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
              style={S.adminTitle}
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
      <div style={S.timelineWrap(mobileOnly)}>
        {/* linha central do timeline */}
        {mobileOnly ? <div style={S.mobileLine} /> : <div style={S.desktopLine} />}

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
              <div key={evt.id} style={S.mobileItem}>
                {/* dot */}
                <div style={S.mobileDotWrap}>
                  <TimelineDot color={color} pulse={hovered} />
                </div>
                <EventCard {...cardProps} side="right" />
              </div>
            );
          }

          return (
            <div key={evt.id} style={S.timelineRow}>
              {/* left slot */}
              <div style={S.leftSlot}>{isLeft ? <EventCard {...cardProps} side="left" /> : null}</div>

              {/* dot + connector */}
              <div style={S.centerSlot}>
                <TimelineDot color={color} pulse={hovered} />
              </div>

              {/* right slot */}
              <div style={S.rightSlot}>{!isLeft ? <EventCard {...cardProps} side="right" /> : null}</div>
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
        size={mobileOnly ? '100%' : 480}
        title={openEvent?.title ?? 'Event'}
        destroyOnHidden
      >
        {openEvent && (
          <Tabs activeKey={drawerTab} onChange={(k) => setDrawerTab(k as 'view' | 'edit')}>
            <Tabs.TabPane tab={<IconLabel icon="timeline">View</IconLabel>} key="view">
              <Space orientation="vertical" size={14} style={w100}>
                <div>
                  <Typography.Text style={S.drawerSectionLabel}>Data</Typography.Text>
                  <div>
                    <Typography.Text strong style={S.drawerDateText}>
                      {formatDate(openEvent.date)}
                    </Typography.Text>
                    {openEvent.date !== formatDate(openEvent.date) && (
                      <Typography.Text style={S.drawerRawDate}>({openEvent.date})</Typography.Text>
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
                    <Typography.Text style={S.drawerSectionLabel}>Description</Typography.Text>
                    <Typography.Paragraph style={S.drawerDescription}>{openEvent.description}</Typography.Paragraph>
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
              <Tabs.TabPane tab={<IconLabel icon="edit">Edit</IconLabel>} key="edit">
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
                  <S.editForm onSubmit={(e) => void onSaveEdit(e)}>
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
                  </S.editForm>
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
