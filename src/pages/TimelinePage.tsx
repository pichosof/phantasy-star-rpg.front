/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Empty, Popconfirm, Space, Switch, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import { AddOutline, DeleteOutline, FilterOutline, SetOutline } from 'antd-mobile-icons';

import type { TimelineEvent } from '@app/api/timeline.api';
import {
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  setTimelineEventVisibility,
  updateTimelineEvent,
} from '@app/api/timeline.api';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { Card } from '@app/components/common/Card/Card';
import {
  MobileActionBar,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobileFilterSheet,
  MobileForm,
  MobilePageScaffold,
  MobileSearchBar,
  MobileSelector,
} from '@app/components/common/mobile';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Table } from '@app/components/common/Table/Table';

import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import { dividerSm, m0, spaceBetween, tableWrap, textMd, w100 } from '@app/styles/styleUtils';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './TimelinePage.styles';

import EntityDrawer, {
  useEditableDrawerTab,
  visibilityControl,
} from '@app/components/common/EntityDrawer/EntityDrawer';
import EntityCard, { EntityCardGrid } from '@app/components/common/EntityCard/EntityCard';

type ViewMode = 'timeline' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type TimelineSheetTab = 'overview' | 'gm';
type DrawerTab = 'view' | 'edit';

const EVENT_COLORS = ['#00C8E8', '#7722DD', '#FF6B1A', '#FF2244', '#22EFC8', '#C8A020'];

function eventColor(id: number) {
  return EVENT_COLORS[id % EVENT_COLORS.length];
}

function isTimelineEventVisible(event: TimelineEvent) {
  return (event.visible ?? false) === true;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const TimelineDot: React.FC<{ color: string; pulse?: boolean }> = ({ color, pulse }) => (
  <div style={S.timelineDot(color, pulse)} />
);

const EventCard: React.FC<{
  event: TimelineEvent;
  color: string;
  side: 'left' | 'right';
  hovered: boolean;
  onHover: (value: boolean) => void;
  onClick: () => void;
  isGM: boolean;
}> = ({ event, color, onHover, onClick, isGM }) => (
  <div onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
    <EntityCard
      accent={color}
      footer={event.date !== formatDate(event.date) ? event.date : undefined}
      label={formatDate(event.date)}
      noCover
      onClick={onClick}
      openText="Open event"
      status={isGM ? { visible: isTimelineEventVisible(event) } : undefined}
      summary={event.description}
      summaryFallback="No description."
      title={event.title}
    />
  </div>
);

export const TimelinePage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = useGMMode();

  const [items, setItems] = React.useState<TimelineEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('timeline');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [creatingEvent, setCreatingEvent] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDate, setNewDate] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<DrawerTab>('view');
  const [mobileSheetTab, setMobileSheetTab] = React.useState<TimelineSheetTab>('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [editTitle, setEditTitle] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [savingEdit, setSavingEdit] = React.useState(false);

  const [hoveredId, setHoveredId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isGM) {
      setViewMode('timeline');
      setFilterVis('all');
      setCreating(false);
      if (mobileSheetTab === 'gm') {
        setMobileSheetTab('overview');
      }
    }
  }, [isGM, mobileSheetTab]);

  const sortEvents = React.useCallback((data: TimelineEvent[]) => [...data].sort((a, b) => a.id - b.id), []);

  const load = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = await listTimelineEvents();
      setItems(sortEvents(data));
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load timeline.'));
    } finally {
      setLoading(false);
    }
  }, [sortEvents]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openEvent = React.useMemo(() => items.find((entry) => entry.id === openId) ?? null, [items, openId]);

  const resetCreateForm = React.useCallback(() => {
    setNewTitle('');
    setNewDate('');
    setNewDesc('');
  }, []);

  const resetEditForm = React.useCallback(() => {
    if (!openEvent) return;
    setEditTitle(openEvent.title ?? '');
    setEditDate(openEvent.date ?? '');
    setEditDesc(openEvent.description ?? '');
  }, [openEvent]);

  React.useEffect(() => {
    resetEditForm();
  }, [resetEditForm]);

  const q = search.trim().toLowerCase();

  const publicItems = React.useMemo(
    () =>
      items.filter(isTimelineEventVisible).filter((event) => {
        if (!q) return true;
        return (
          (event.title ?? '').toLowerCase().includes(q) ||
          (event.description ?? '').toLowerCase().includes(q) ||
          (event.date ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q],
  );

  const adminItems = React.useMemo(
    () =>
      items.filter((event) => {
        if (filterVis === 'visible' && !isTimelineEventVisible(event)) return false;
        if (filterVis === 'hidden' && isTimelineEventVisible(event)) return false;
        if (!q) return true;
        return (
          (event.title ?? '').toLowerCase().includes(q) ||
          (event.description ?? '').toLowerCase().includes(q) ||
          (event.date ?? '').toLowerCase().includes(q)
        );
      }),
    [filterVis, items, q],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isTimelineEventVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  function closeEventPanels() {
    setOpenId(null);
    setDrawerTab('view');
    setMobileSheetTab('overview');
    setDeleteDialogOpen(false);
  }

  function openForView(id: number) {
    setOpenId(id);
    setDrawerTab('view');
  }

  function openForEdit(id: number) {
    setOpenId(id);
    setDrawerTab('edit');
  }

  function openEventSheet(event: TimelineEvent, tab: TimelineSheetTab = 'overview') {
    setOpenId(event.id);
    setMobileSheetTab(isGM ? tab : 'overview');
  }

  async function handleCreateEvent() {
    const title = newTitle.trim();
    const date = newDate.trim();

    if (!title) {
      message.warning('Please provide a title.');
      return;
    }

    if (!date) {
      message.warning('Please provide a date.');
      return;
    }

    setCreatingEvent(true);
    try {
      const created = await createTimelineEvent({
        title,
        date,
        description: newDesc.trim() || null,
      });

      setItems((prev) => sortEvents([...prev.filter((entry) => entry.id !== created.id), created]));
      setCreating(false);
      resetCreateForm();
      message.success('Event created.');

      if (mobileOnly) {
        setOpenId(created.id);
        setMobileSheetTab(isGM ? 'gm' : 'overview');
      }
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create event.'));
    } finally {
      setCreatingEvent(false);
    }
  }

  async function saveEdit() {
    if (!openEvent) return;

    const title = editTitle.trim();
    const date = editDate.trim();

    if (!title) {
      message.warning('Title cannot be empty.');
      return;
    }

    if (!date) {
      message.warning('Date cannot be empty.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateTimelineEvent(openEvent.id, {
        title,
        date,
        description: editDesc.trim() || null,
      });

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === openEvent.id
            ? {
                ...entry,
                title,
                date,
                description: editDesc.trim() || null,
              }
            : entry,
        ),
      );
      message.success('Event updated.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to save event.'));
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeCurrentEvent() {
    if (!openEvent) return;

    try {
      await deleteTimelineEvent(openEvent.id);
      setItems((prev) => prev.filter((entry) => entry.id !== openEvent.id));
      closeEventPanels();
      message.success('Event removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove event.'));
    }
  }

  async function removeEventById(id: number) {
    try {
      await deleteTimelineEvent(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      if (openId === id) {
        closeEventPanels();
      }
      message.success('Event removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove event.'));
    }
  }

  async function toggleVisible(event: TimelineEvent) {
    const nextVisible = !isTimelineEventVisible(event);
    setItems((prev) => prev.map((entry) => (entry.id === event.id ? { ...entry, visible: nextVisible } : entry)));

    try {
      await setTimelineEventVisibility(event.id, nextVisible);
      message.success(nextVisible ? 'Event visible to players.' : 'Event hidden.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change visibility.'));
      await load();
    }
  }

  const desktopHeader = (
    <Card className="rpg-page-header-card" density="dense">
      <Space orientation="vertical" size={10} style={w100}>
        <Space size={8} style={spaceBetween}>
          <div>
            <Typography.Title level={4} style={m0}>
              <IconLabel icon="timeline">Timeline</IconLabel>
            </Typography.Title>
            <Typography.Text style={textMd} type="secondary">
              {isGM
                ? 'Manage campaign events and their visibility.'
                : 'The major happenings that shaped the fate of the Algol system.'}
            </Typography.Text>
          </div>

          <Space size={6} wrap>
            {isGM && (
              <>
                <Button
                  onClick={() => setViewMode('timeline')}
                  size="small"
                  type={viewMode === 'timeline' ? 'primary' : 'default'}
                >
                  <IconLabel icon="timeline">Timeline</IconLabel>
                </Button>
                <Button
                  onClick={() => setViewMode('admin')}
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                >
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
                <Button onClick={() => setCreating((current) => !current)} size="small" type="primary">
                  {creating ? 'Close' : '+ New Event'}
                </Button>
              </>
            )}
          </Space>
        </Space>

        <Space size={8} wrap>
          <Tag>{stats.total} events</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        {(isGM || search) && (
          <Space size={8} style={w100} wrap>
            <Input
              allowClear
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, date or description..."
              style={S.headerSearch}
              value={search}
            />
            {isGM && viewMode === 'admin' && (
              <Space size={4}>
                {(['all', 'visible', 'hidden'] as const).map((value) => (
                  <Button
                    key={value}
                    onClick={() => setFilterVis(value)}
                    size="small"
                    type={filterVis === value ? 'primary' : 'default'}
                  >
                    {value === 'all' ? 'All' : value === 'visible' ? 'Visible' : 'Hidden'}
                  </Button>
                ))}
              </Space>
            )}
          </Space>
        )}

        {isGM && creating && (
          <>
            <Divider style={dividerSm} />
            <S.createForm
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateEvent();
              }}
            >
              <Typography.Text strong>New Event</Typography.Text>
              <S.createInputRow>
                <Input
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Title *"
                  required
                  style={S.createTitleInput}
                  value={newTitle}
                />
                <Input
                  onChange={(event) => setNewDate(event.target.value)}
                  placeholder="Date *"
                  required
                  style={S.createDateInput}
                  value={newDate}
                />
              </S.createInputRow>
              <TextArea
                onChange={(event) => setNewDesc(event.target.value)}
                placeholder="Description (optional)"
                rows={3}
                value={newDesc}
              />
              <Space>
                <Button htmlType="submit" loading={creatingEvent} type="primary">
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setCreating(false);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </S.createForm>
          </>
        )}
      </Space>
    </Card>
  );

  const desktopAdminView = (
    <Card density="dense" title="Manage Timeline">
      <div style={tableWrap}>
        <Table
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
              render: (value: string) => <span style={textMd}>{formatDate(value)}</span>,
            },
            {
              title: 'Title',
              dataIndex: 'title',
              render: (value: string, record: TimelineEvent) => (
                <Typography.Text onClick={() => openForView(record.id)} style={S.adminTitle}>
                  {value}
                </Typography.Text>
              ),
            },
            {
              title: 'Visible',
              dataIndex: 'visible',
              width: 90,
              render: (_: any, record: TimelineEvent) => (
                <Switch
                  checked={isTimelineEventVisible(record)}
                  checkedChildren={<EyeOutlined />}
                  onChange={() => void toggleVisible(record)}
                  size="small"
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: '',
              key: 'actions',
              width: 90,
              render: (_: any, record: TimelineEvent) => (
                <Space size={4}>
                  <Button icon={<EditOutlined />} onClick={() => openForEdit(record.id)} size="small" type="text" />
                  <Popconfirm
                    cancelText="No"
                    okText="Yes"
                    onConfirm={() => void removeEventById(record.id)}
                    title="Remove this event?"
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="text" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={adminItems}
          pagination={false}
          rowKey="id"
          scroll={{ x: 760 }}
          size="small"
          style={S.tableMinWidth}
        />
      </div>
      {!adminItems.length && !loading && <Empty description="No events found." style={S.emptyTopSpacing} />}
    </Card>
  );

  const timelineView =
    (viewMode === 'admin' && isGM ? adminItems : publicItems).length === 0 ? (
      <Card density="comfy">
        <Empty description="No events on the timeline." />
      </Card>
    ) : (
      <div style={S.timelineWrap(false)}>
        <div style={S.desktopLine} />

        {(viewMode === 'admin' && isGM ? adminItems : publicItems).map((event, index) => {
          const color = eventColor(event.id);
          const isLeft = index % 2 === 0;
          const hovered = hoveredId === event.id;
          const cardProps = {
            color,
            event,
            hovered,
            isGM,
            onClick: () => openForView(event.id),
            onHover: (value: boolean) => setHoveredId(value ? event.id : null),
          };

          return (
            <div key={event.id} style={S.timelineRow}>
              <div style={S.leftSlot}>{isLeft ? <EventCard {...cardProps} side="left" /> : null}</div>
              <div style={S.centerSlot}>
                <TimelineDot color={color} pulse={hovered} />
              </div>
              <div style={S.rightSlot}>{!isLeft ? <EventCard {...cardProps} side="right" /> : null}</div>
            </div>
          );
        })}
      </div>
    );

  const drawerTabs = useEditableDrawerTab(drawerTab, setDrawerTab, { view: 'view', edit: 'edit' }, openEvent?.id);

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} events
      </AdmMobileTag>
      {isGM && (
        <AdmMobileTag color="success" fill="outline" round>
          {stats.visible} visible
        </AdmMobileTag>
      )}
      {isGM && (
        <AdmMobileTag color="warning" fill="outline" round>
          {stats.hidden} hidden
        </AdmMobileTag>
      )}
    </S.MobileMetaTags>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search timeline..." value={search} />
      <S.MobileFilterRow>
        <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
          <FilterOutline fontSize={17} /> Filters
        </AdmMobileButton>
        {isGM && viewMode === 'admin' && (
          <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
            <AddOutline fontSize={17} /> New event
          </AdmMobileButton>
        )}
      </S.MobileFilterRow>
    </>
  );

  const mobileDisplayItems = viewMode === 'admin' && isGM ? adminItems : publicItems;

  const mobileGM = openEvent ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Event data">
        <MobileForm>
          <MobileForm.Item label="Title">
            <AdmMobileInput clearable onChange={setEditTitle} placeholder="Event title" value={editTitle} />
          </MobileForm.Item>
          <MobileForm.Item label="Date">
            <AdmMobileInput clearable onChange={setEditDate} placeholder="Messiah 2284 / 2024-03-15" value={editDate} />
          </MobileForm.Item>
          <MobileForm.Item label="Description">
            <AdmMobileTextArea
              autoSize={{ minRows: 6, maxRows: 10 }}
              onChange={setEditDesc}
              placeholder="Event description"
              value={editDesc}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Danger zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>Deleting an event removes it permanently from the campaign timeline.</S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete event
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const detailDrawer = openEvent ? (
    <EntityDrawer
      activeKey={drawerTabs.activeKey}
      controls={[visibilityControl(isTimelineEventVisible(openEvent), () => void toggleVisible(openEvent), 'events')]}
      createdAt={openEvent.createdAt}
      extra={
        isGM ? (
          <Popconfirm
            cancelText="No"
            okText="Yes"
            onConfirm={() => void removeCurrentEvent()}
            title="Remove this event?"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Remove
            </Button>
          </Popconfirm>
        ) : null
      }
      gmTabs={[
        {
          key: 'edit',
          label: <IconLabel icon="edit">Edit</IconLabel>,
          mobileChildren: mobileGM,
          children: (
            <Space orientation="vertical" size={12} style={w100}>
              <S.editForm
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveEdit();
                }}
              >
                <Input onChange={(event) => setEditTitle(event.target.value)} placeholder="Title" value={editTitle} />
                <Input onChange={(event) => setEditDate(event.target.value)} placeholder="Date" value={editDate} />
                <TextArea
                  onChange={(event) => setEditDesc(event.target.value)}
                  placeholder="Description"
                  rows={5}
                  value={editDesc}
                />
                <Space>
                  <Button htmlType="submit" loading={savingEdit} size="small" type="primary">
                    Save
                  </Button>
                  <Button onClick={() => setDrawerTab('view')} size="small">
                    Cancel
                  </Button>
                </Space>
              </S.editForm>
            </Space>
          ),
        },
      ]}
      gmView={isGM}
      onClose={closeEventPanels}
      onTabChange={drawerTabs.onTabChange}
      open
      overview={{
        key: drawerTabs.overviewKey,
        meta: (
          <Tag color="blue" icon={<AppIcon name="calendar" />}>
            {formatDate(openEvent.date)}
            {openEvent.date !== formatDate(openEvent.date) ? ` (${openEvent.date})` : ''}
          </Tag>
        ),
        sections: [{ title: 'Description', text: openEvent.description, fallback: 'No description.' }],
      }}
      status={{ visible: isTimelineEventVisible(openEvent) }}
      title={openEvent.title}
      updatedAt={(openEvent as { updatedAt?: string }).updatedAt}
      mobileActiveKey={mobileSheetTab}
      mobileFooter={
        openEvent && isGM && mobileSheetTab === 'gm' ? (
          <MobileActionBar
            primary={
              <AdmMobileButton block color="primary" loading={savingEdit} onClick={() => void saveEdit()}>
                Save changes
              </AdmMobileButton>
            }
            secondary={
              <AdmMobileButton block fill="outline" onClick={resetEditForm}>
                Reset
              </AdmMobileButton>
            }
            sticky={false}
          />
        ) : undefined
      }
      onMobileTabChange={(key) => setMobileSheetTab(key as TimelineSheetTab)}
      subtitle={openEvent ? formatDate(openEvent.date) : undefined}
    />
  ) : null;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Timeline</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'timeline' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('timeline')}
                  size="small"
                >
                  Timeline
                </AdmMobileButton>
                <AdmMobileButton
                  color="primary"
                  fill={viewMode === 'admin' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('admin')}
                  size="small"
                >
                  <SetOutline fontSize={16} /> GM
                </AdmMobileButton>
              </S.MobileFilterRow>
            ) : null
          }
          filters={mobileFilters}
          meta={mobileMeta}
          subtitle={
            viewMode === 'admin'
              ? 'Create, publish and edit timeline events from the GM panel.'
              : 'Major happenings that shaped the fate of the Algol system.'
          }
          title={
            <IconLabel icon={viewMode === 'admin' ? 'gm' : 'timeline'}>
              {viewMode === 'admin' ? 'GM Timeline' : 'Timeline'}
            </IconLabel>
          }
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !mobileDisplayItems.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No events on the timeline.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <EntityCardGrid>
              {mobileDisplayItems.map((event) => (
                <EventCard
                  color={eventColor(event.id)}
                  event={event}
                  hovered={false}
                  isGM={isGM && viewMode === 'admin'}
                  key={event.id}
                  onClick={() => openEventSheet(event, 'overview')}
                  onHover={() => undefined}
                  side="right"
                />
              ))}
            </EntityCardGrid>
          )}
        </MobilePageScaffold>

        <MobileFilterSheet
          description="Search the timeline and, in GM mode, filter event visibility."
          footer={
            <MobileActionBar sticky={false}>
              <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                Done
              </AdmMobileButton>
            </MobileActionBar>
          }
          onClose={() => setFilterSheetOpen(false)}
          title="Timeline filters"
          visible={filterSheetOpen}
        >
          <S.MobileSectionStack>
            {isGM ? (
              <div>
                <S.MobileInlineLabel>Panel</S.MobileInlineLabel>
                <MobileSelector
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'timeline')}
                  options={[
                    { label: 'Timeline', value: 'timeline' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </div>
            ) : null}

            {isGM && viewMode === 'admin' ? (
              <div>
                <S.MobileInlineLabel>Visibility</S.MobileInlineLabel>
                <MobileSelector
                  columns={3}
                  inset={false}
                  onChange={(values) => setFilterVis((values[0] as VisibilityFilter | undefined) ?? 'all')}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Visible', value: 'visible' },
                    { label: 'Hidden', value: 'hidden' },
                  ]}
                  value={[filterVis]}
                />
              </div>
            ) : null}
          </S.MobileSectionStack>
        </MobileFilterSheet>

        {detailDrawer}

        <MobileDialog
          actions={[
            {
              key: 'cancel',
              text: 'Cancel',
              onClick: () => setDeleteDialogOpen(false),
            },
            {
              key: 'delete',
              text: 'Delete event',
              bold: true,
              danger: true,
              onClick: () => removeCurrentEvent(),
            },
          ]}
          content={openEvent ? `Delete "${openEvent.title}" permanently from the timeline?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete event?"
          visible={deleteDialogOpen}
        />

        <MobileEntitySheet
          description="Create a new timeline event from mobile."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingEvent} onClick={() => void handleCreateEvent()}>
                  Create event
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton
                  block
                  fill="outline"
                  onClick={() => {
                    setCreating(false);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => {
            setCreating(false);
            resetCreateForm();
          }}
          subtitle="GM only"
          title="New event"
          visible={creating && isGM && viewMode === 'admin'}
        >
          <MobileCard compact title="Event details">
            <MobileForm>
              <MobileForm.Item label="Title">
                <AdmMobileInput clearable onChange={setNewTitle} placeholder="Event title" value={newTitle} />
              </MobileForm.Item>
              <MobileForm.Item label="Date">
                <AdmMobileInput
                  clearable
                  onChange={setNewDate}
                  placeholder="Messiah 2284 / 2024-03-15"
                  value={newDate}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Description">
                <AdmMobileTextArea
                  autoSize={{ minRows: 5, maxRows: 8 }}
                  onChange={setNewDesc}
                  placeholder="Event description"
                  value={newDesc}
                />
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
        </MobileEntitySheet>
      </>
    );
  }

  return (
    <>
      <PageTitle>Timeline</PageTitle>

      {desktopHeader}
      {loading ? <Spinner /> : isGM && viewMode === 'admin' ? desktopAdminView : timelineView}
      {detailDrawer}
    </>
  );
};

export default TimelinePage;
