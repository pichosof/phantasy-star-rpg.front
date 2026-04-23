/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Popconfirm, Space, Switch, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Switch as AdmMobileSwitch,
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
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
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
  MobileTabs,
} from '@app/components/common/mobile';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Table } from '@app/components/common/Table/Table';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import { dividerSm, m0, spaceBetween, tableWrap, textMd, w100 } from '@app/styles/styleUtils';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './TimelinePage.styles';

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

function getEventPreview(event: TimelineEvent) {
  const description = event.description?.trim();
  if (!description) return 'No timeline description recorded yet.';
  return description.length > 170 ? `${description.slice(0, 167)}...` : description;
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
}> = ({ event, color, side, hovered, onHover, onClick, isGM }) => (
  <div
    onClick={onClick}
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    style={S.eventCard(color, hovered, side)}
  >
    <div style={S.dateBadge(color)}>{formatDate(event.date)}</div>

    {isGM && (
      <div style={S.marginBottom6}>
        <Tag color={isTimelineEventVisible(event) ? 'green' : 'red'} style={S.visibleTag}>
          {isTimelineEventVisible(event) ? <EyeOutlined /> : <EyeInvisibleOutlined />}{' '}
          {isTimelineEventVisible(event) ? 'Visible' : 'Hidden'}
        </Tag>
      </div>
    )}

    <Typography.Text strong style={S.eventTitle}>
      {event.title}
    </Typography.Text>

    {event.description ? <Typography.Text style={S.eventDescription}>{event.description}</Typography.Text> : null}
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
      <Space direction="vertical" size={10} style={w100}>
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

  const desktopDrawerItems = openEvent
    ? [
        {
          key: 'view',
          label: <IconLabel icon="timeline">View</IconLabel>,
          children: (
            <Space direction="vertical" size={14} style={w100}>
              <div>
                <Typography.Text style={S.drawerSectionLabel}>Date</Typography.Text>
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
                  <Tag color={isTimelineEventVisible(openEvent) ? 'green' : 'red'}>
                    {isTimelineEventVisible(openEvent) ? 'Visible to players' : 'Hidden from players'}
                  </Tag>
                </div>
              )}

              <div>
                <Typography.Text style={S.drawerSectionLabel}>Description</Typography.Text>
                <Typography.Paragraph style={S.drawerDescription}>
                  {openEvent.description?.trim() || 'No description.'}
                </Typography.Paragraph>
              </div>

              {isGM && (
                <>
                  <Divider style={dividerSm} />
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => setDrawerTab('edit')} size="small">
                      Edit
                    </Button>
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
                  </Space>
                </>
              )}
            </Space>
          ),
        },
        ...(isGM
          ? [
              {
                key: 'edit',
                label: <IconLabel icon="edit">Edit</IconLabel>,
                children: (
                  <Space direction="vertical" size={12} style={w100}>
                    <Space style={spaceBetween}>
                      <Typography.Text style={textMd}>Visible to players</Typography.Text>
                      <Switch
                        checked={isTimelineEventVisible(openEvent)}
                        checkedChildren={<EyeOutlined />}
                        onChange={() => void toggleVisible(openEvent)}
                        size="small"
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                    </Space>
                    <Divider style={dividerSm} />
                    <S.editForm
                      onSubmit={(event) => {
                        event.preventDefault();
                        void saveEdit();
                      }}
                    >
                      <Input
                        onChange={(event) => setEditTitle(event.target.value)}
                        placeholder="Title"
                        value={editTitle}
                      />
                      <Input
                        onChange={(event) => setEditDate(event.target.value)}
                        placeholder="Date"
                        value={editDate}
                      />
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
            ]
          : []),
      ]
    : [];

  const detailDrawer =
    openEvent && !mobileOnly ? (
      <Drawer destroyOnHidden onClose={closeEventPanels} open size={480} title={openEvent.title}>
        <Tabs activeKey={drawerTab} items={desktopDrawerItems} onChange={(key) => setDrawerTab(key as DrawerTab)} />
      </Drawer>
    ) : null;

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

  const mobileOverview = openEvent ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Description">
        <S.MobileBodyText>{openEvent.description?.trim() || 'No description recorded yet.'}</S.MobileBodyText>
      </MobileCard>

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Date</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDate(openEvent.date)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Raw date</S.MobileDetailLabel>
            <S.MobileDetailValue>{openEvent.date}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Visibility</S.MobileDetailLabel>
            <S.MobileDetailValue>{isTimelineEventVisible(openEvent) ? 'Visible' : 'Hidden'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Event ID</S.MobileDetailLabel>
            <S.MobileDetailValue>#{openEvent.id}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Created</S.MobileDetailLabel>
            <S.MobileDetailValue>
              {(openEvent as any).createdAt ? formatDate((openEvent as any).createdAt) : '-'}
            </S.MobileDetailValue>
          </S.MobileDetailItem>
        </S.MobileDetailGrid>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const mobileGM = openEvent ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isTimelineEventVisible(openEvent)} onChange={() => void toggleVisible(openEvent)} />
        </S.MobileVisibilityRow>
      </MobileCard>

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
            <S.MobileTimelineRoot>
              <S.MobileTimelineRail />
              {mobileDisplayItems.map((event) => {
                const color = eventColor(event.id);

                return (
                  <S.MobileTimelineItem key={event.id}>
                    <S.MobileTimelineDot $color={color} />
                    <MobileCard compact>
                      <S.MobileEventBody>
                        <S.MobileEventDate $color={color}>{formatDate(event.date)}</S.MobileEventDate>
                        <S.MobileEventTitle>{event.title}</S.MobileEventTitle>
                        <S.MobileMetaTags>
                          {isGM && viewMode === 'admin' ? (
                            <AdmMobileTag
                              color={isTimelineEventVisible(event) ? 'success' : 'warning'}
                              fill="outline"
                              round
                            >
                              {isTimelineEventVisible(event) ? 'Visible' : 'Hidden'}
                            </AdmMobileTag>
                          ) : null}
                          <AdmMobileTag fill="outline" round>
                            #{event.id}
                          </AdmMobileTag>
                        </S.MobileMetaTags>
                        <S.MobileEventPreview>{getEventPreview(event)}</S.MobileEventPreview>
                        <S.MobileEventActions>
                          <AdmMobileButton block color="primary" onClick={() => openEventSheet(event, 'overview')}>
                            Open event
                          </AdmMobileButton>
                          {isGM && viewMode === 'admin' ? (
                            <AdmMobileButton block fill="outline" onClick={() => openEventSheet(event, 'gm')}>
                              <SetOutline fontSize={17} /> GM controls
                            </AdmMobileButton>
                          ) : (
                            <AdmMobileButton block fill="outline" onClick={() => openEventSheet(event, 'overview')}>
                              Details
                            </AdmMobileButton>
                          )}
                        </S.MobileEventActions>
                      </S.MobileEventBody>
                    </MobileCard>
                  </S.MobileTimelineItem>
                );
              })}
            </S.MobileTimelineRoot>
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

        <MobileEntitySheet
          description={
            openEvent
              ? isGM
                ? 'Timeline details and GM controls for this campaign event.'
                : 'Timeline details for this campaign event.'
              : undefined
          }
          footer={
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
          onClose={closeEventPanels}
          subtitle={openEvent ? formatDate(openEvent.date) : undefined}
          title={openEvent?.title ?? 'Timeline event'}
          visible={Boolean(openEvent)}
        >
          {openEvent && isGM ? (
            <MobileTabs
              activeKey={mobileSheetTab}
              items={[
                { key: 'overview', title: 'Overview', children: mobileOverview },
                { key: 'gm', title: 'GM', children: mobileGM },
              ]}
              onChange={(key) => setMobileSheetTab(key as TimelineSheetTab)}
            />
          ) : (
            mobileOverview
          )}
        </MobileEntitySheet>

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
