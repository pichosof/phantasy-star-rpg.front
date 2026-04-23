/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Badge, Divider, Drawer, Empty, Popconfirm, Space, Switch, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Switch as AdmMobileSwitch,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import { AddOutline, CalendarOutline, DeleteOutline, FilterOutline, SetOutline } from 'antd-mobile-icons';

import type { Session } from '@app/api/sessions.api';
import { createSession, deleteSession, listSessions, setSessionVisibility, updateSession } from '@app/api/sessions.api';
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
import {
  dividerMd,
  dividerSm,
  m0,
  mutedSm,
  spaceBetween,
  tableWrap,
  textMd,
  textSm,
  w100,
} from '@app/styles/styleUtils';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './SessionsPage.styles';

type ViewMode = 'blog' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type SessionSheetTab = 'overview' | 'gm';
type DrawerTab = 'view' | 'edit';

const SESSION_GRADIENTS = [
  'linear-gradient(135deg, #040A18 0%, #0A1C3A 50%, #0E2A58 100%)',
  'linear-gradient(135deg, #08041C 0%, #1E0A50 50%, #2E0E72 100%)',
  'linear-gradient(135deg, #1C0A04 0%, #4A1E08 50%, #7A2E06 100%)',
  'linear-gradient(135deg, #0C0808 0%, #2A0C0C 50%, #180808 100%)',
  'linear-gradient(135deg, #050C1E 0%, #082240 50%, #0A2A58 100%)',
  'linear-gradient(135deg, #0A041C 0%, #1E0840 50%, #0C0428 100%)',
  'linear-gradient(135deg, #04100C 0%, #082820 50%, #0A1E18 100%)',
  'linear-gradient(135deg, #0C0A10 0%, #1A1428 50%, #22183A 100%)',
];

function sessionGradient(id: number) {
  return SESSION_GRADIENTS[id % SESSION_GRADIENTS.length];
}

function isSessionVisible(session: Session) {
  return (session.visible ?? false) === true;
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

function formatDateTime(value?: string | null) {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

function getSummaryPreview(session: Session) {
  const source = (session.summary ?? '').trim();
  if (!source) return 'No summary recorded yet.';

  const normalized = source
    .replace(/##[^\n]*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return 'No summary recorded yet.';
  return normalized.length > 170 ? `${normalized.slice(0, 167)}...` : normalized;
}

const SessionCover: React.FC<{ session: Session; height?: number }> = ({ session, height = 180 }) => {
  if (session.imageUrl) {
    return (
      <S.CoverFrame $height={height}>
        <S.CoverImage alt={session.imageAlt ?? session.title} src={session.imageUrl} />
        <S.CoverOverlay />
      </S.CoverFrame>
    );
  }

  return (
    <S.CoverFallback $gradient={sessionGradient(session.id)} $height={height}>
      <S.CoverWatermark>
        <AppIcon name="star" size={64} />
      </S.CoverWatermark>
      <S.CoverBrand>Phantasy Star RPG</S.CoverBrand>
    </S.CoverFallback>
  );
};

export const SessionsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const isGM = useGMMode();

  const [items, setItems] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [viewMode, setViewMode] = React.useState<ViewMode>('blog');
  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [creatingSession, setCreatingSession] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDate, setNewDate] = React.useState('');
  const [newSummary, setNewSummary] = React.useState('');
  const [newImageUrl, setNewImageUrl] = React.useState('');
  const [newImageAlt, setNewImageAlt] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<DrawerTab>('view');
  const [mobileSheetTab, setMobileSheetTab] = React.useState<SessionSheetTab>('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [editTitle, setEditTitle] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editSummary, setEditSummary] = React.useState('');
  const [editImageUrl, setEditImageUrl] = React.useState('');
  const [editImageAlt, setEditImageAlt] = React.useState('');
  const [savingEdit, setSavingEdit] = React.useState(false);

  React.useEffect(() => {
    if (!isGM) {
      setViewMode('blog');
      setFilterVis('all');
      setCreating(false);
      if (mobileSheetTab === 'gm') {
        setMobileSheetTab('overview');
      }
    }
  }, [isGM, mobileSheetTab]);

  const sortLatestFirst = React.useCallback((data: Session[]) => [...data].sort((a, b) => b.id - a.id), []);

  const load = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = await listSessions();
      setItems(sortLatestFirst(data));
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load sessions.'));
    } finally {
      setLoading(false);
    }
  }, [sortLatestFirst]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openSession = React.useMemo(() => items.find((entry) => entry.id === openId) ?? null, [items, openId]);

  const resetCreateForm = React.useCallback(() => {
    setNewTitle('');
    setNewDate('');
    setNewSummary('');
    setNewImageUrl('');
    setNewImageAlt('');
  }, []);

  const resetEditForm = React.useCallback(() => {
    if (!openSession) return;
    setEditTitle(openSession.title ?? '');
    setEditDate(openSession.date ?? '');
    setEditSummary(openSession.summary ?? '');
    setEditImageUrl(openSession.imageUrl ?? '');
    setEditImageAlt(openSession.imageAlt ?? '');
  }, [openSession]);

  React.useEffect(() => {
    resetEditForm();
  }, [resetEditForm]);

  const q = search.trim().toLowerCase();

  const publicItems = React.useMemo(
    () =>
      items.filter(isSessionVisible).filter((session) => {
        if (!q) return true;
        return (
          (session.title ?? '').toLowerCase().includes(q) ||
          (session.date ?? '').toLowerCase().includes(q) ||
          (session.summary ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q],
  );

  const adminItems = React.useMemo(
    () =>
      items.filter((session) => {
        if (filterVis === 'visible' && !isSessionVisible(session)) return false;
        if (filterVis === 'hidden' && isSessionVisible(session)) return false;
        if (!q) return true;
        return (
          (session.title ?? '').toLowerCase().includes(q) ||
          (session.date ?? '').toLowerCase().includes(q) ||
          (session.summary ?? '').toLowerCase().includes(q)
        );
      }),
    [filterVis, items, q],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isSessionVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  const sessionNumber = React.useCallback(
    (id: number) => {
      const sorted = [...items].sort((a, b) => a.id - b.id);
      const index = sorted.findIndex((session) => session.id === id);
      return index === -1 ? id : index + 1;
    },
    [items],
  );

  function closeSessionPanels() {
    setOpenId(null);
    setDrawerTab('view');
    setMobileSheetTab('overview');
    setDeleteDialogOpen(false);
  }

  function openForView(id: number) {
    setDrawerTab('view');
    setOpenId(id);
  }

  function openForEdit(id: number) {
    setDrawerTab('edit');
    setOpenId(id);
  }

  function openSessionSheet(session: Session, tab: SessionSheetTab = 'overview') {
    setOpenId(session.id);
    setMobileSheetTab(isGM ? tab : 'overview');
  }

  async function handleCreateSession() {
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

    setCreatingSession(true);
    try {
      const created = await createSession({
        title,
        date,
        summary: newSummary.trim() || null,
        imageUrl: newImageUrl.trim() || null,
        imageAlt: newImageAlt.trim() || null,
      });

      resetCreateForm();
      setCreating(false);
      setItems((prev) => sortLatestFirst([created, ...prev.filter((entry) => entry.id !== created.id)]));
      message.success('Session created.');

      if (mobileOnly) {
        setOpenId(created.id);
        setMobileSheetTab(isGM ? 'gm' : 'overview');
      }
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create session. Check the GM key.'));
    } finally {
      setCreatingSession(false);
    }
  }

  async function toggleVisible(session: Session) {
    const nextVisible = !isSessionVisible(session);
    setItems((prev) => prev.map((entry) => (entry.id === session.id ? { ...entry, visible: nextVisible } : entry)));

    try {
      await setSessionVisibility(session.id, nextVisible);
      message.success(nextVisible ? 'Session visible to players.' : 'Session hidden.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change visibility.'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openSession) return;

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
      await updateSession(openSession.id, {
        title,
        date,
        summary: editSummary.trim() || null,
        imageUrl: editImageUrl.trim() || null,
        imageAlt: editImageAlt.trim() || null,
      });

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === openSession.id
            ? {
                ...entry,
                title,
                date,
                summary: editSummary.trim() || null,
                imageUrl: editImageUrl.trim() || null,
                imageAlt: editImageAlt.trim() || null,
              }
            : entry,
        ),
      );
      message.success('Session updated.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update session.'));
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeCurrentSession() {
    if (!openSession) return;

    try {
      await deleteSession(openSession.id);
      setItems((prev) => prev.filter((entry) => entry.id !== openSession.id));
      closeSessionPanels();
      message.success('Session removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove session.'));
    }
  }

  const desktopHeader = (
    <Card className="rpg-page-header-card" density="dense">
      <Space direction="vertical" size={10} style={w100}>
        <Space size={8} style={spaceBetween}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'admin' ? (
                <IconLabel icon="gm">GM Panel - Sessions</IconLabel>
              ) : (
                <IconLabel icon="notes">Campaign Diary</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text style={textMd} type="secondary">
              {viewMode === 'admin'
                ? 'Create, edit, publish and manage every session from the GM panel.'
                : 'A chronological diary of the campaign, its milestones and turning points.'}
            </Typography.Text>
          </div>

          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  onClick={() => setViewMode('blog')}
                  size="small"
                  type={viewMode === 'blog' ? 'primary' : 'default'}
                >
                  <IconLabel icon="read">Diary</IconLabel>
                </Button>
                <Button
                  onClick={() => setViewMode('admin')}
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                >
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
              </Space>
            )}

            {isGM && viewMode === 'admin' && (
              <Button onClick={() => setCreating((current) => !current)} size="small" type="primary">
                {creating ? 'Close' : '+ New Session'}
              </Button>
            )}
          </Space>
        </Space>

        <Space size={8} wrap>
          <Tag>{stats.total} sessions</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        <Space size={8} style={w100} wrap>
          <Input
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, date or content..."
            style={S.searchField}
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

        {isGM && viewMode === 'admin' && creating && (
          <>
            <Divider style={dividerSm} />
            <S.createForm
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateSession();
              }}
            >
              <Typography.Text strong>New Session</Typography.Text>
              <S.createInputsRow>
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
              </S.createInputsRow>
              <TextArea
                onChange={(event) => setNewSummary(event.target.value)}
                placeholder="Summary, milestones and important beats for this session."
                rows={5}
                value={newSummary}
              />
              <Input
                onChange={(event) => setNewImageUrl(event.target.value)}
                placeholder="Cover image URL (optional)"
                value={newImageUrl}
              />
              <Input
                onChange={(event) => setNewImageAlt(event.target.value)}
                placeholder="Cover image alt text (optional)"
                value={newImageAlt}
              />
              <Space>
                <Button htmlType="submit" loading={creatingSession} type="primary">
                  Create Session
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

  const blogView = loading ? (
    <Spinner />
  ) : publicItems.length === 0 ? (
    <Card density="comfy">
      <Empty description="No sessions found." />
    </Card>
  ) : (
    <S.PublicGrid $tablet={isTablet}>
      {publicItems.map((session) => {
        const number = sessionNumber(session.id);

        return (
          <S.PublicCard key={session.id} onClick={() => openForView(session.id)}>
            <SessionCover height={isTablet ? 170 : 190} session={session} />

            <S.PublicCardBody>
              <S.PublicCardTop>
                <S.PublicCardLabel>Session #{number}</S.PublicCardLabel>
                {isGM && (
                  <Tag color={isSessionVisible(session) ? 'green' : 'red'} style={m0}>
                    {isSessionVisible(session) ? 'Visible' : 'Hidden'}
                  </Tag>
                )}
              </S.PublicCardTop>

              <S.PublicCardMeta>
                <IconLabel gap={6} icon="calendar">
                  {formatDate(session.date)}
                </IconLabel>
              </S.PublicCardMeta>

              <S.PublicCardTitle>{session.title}</S.PublicCardTitle>
              <S.PublicCardSummary>{getSummaryPreview(session)}</S.PublicCardSummary>
              <S.PublicCardSpacer />

              <Divider style={dividerMd} />

              <S.PublicCardFooter>
                <S.PublicCardCreated>{formatDateTime(session.createdAt)}</S.PublicCardCreated>
                <Space onClick={(event) => event.stopPropagation()} size={6}>
                  {isGM && (
                    <Switch
                      checked={isSessionVisible(session)}
                      onChange={() => void toggleVisible(session)}
                      size="small"
                      title={isSessionVisible(session) ? 'Hide' : 'Publish'}
                    />
                  )}
                  <S.PublicCardOpenText>Open session</S.PublicCardOpenText>
                </Space>
              </S.PublicCardFooter>
            </S.PublicCardBody>
          </S.PublicCard>
        );
      })}
    </S.PublicGrid>
  );

  const adminDesktopTable = (
    <Card density="dense" title="Manage Sessions">
      <div style={tableWrap}>
        <Table
          columns={[
            {
              title: '#',
              key: 'num',
              width: 60,
              render: (_: any, session: Session) => <Tag style={m0}>#{sessionNumber(session.id)}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, session: Session) => (
                <Switch
                  checked={isSessionVisible(session)}
                  checkedChildren={<EyeOutlined />}
                  onChange={() => void toggleVisible(session)}
                  size="small"
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Title',
              key: 'title',
              render: (_: any, session: Session) => (
                <S.AdminTitleStack>
                  <Typography.Text strong onClick={() => openForView(session.id)} style={S.clickableTitle}>
                    {session.title}
                  </Typography.Text>
                  <Typography.Text style={S.summaryPreviewText} type="secondary">
                    {getSummaryPreview(session)}
                  </Typography.Text>
                </S.AdminTitleStack>
              ),
            },
            {
              title: 'Date',
              dataIndex: 'date',
              key: 'date',
              width: 220,
              render: (value: string) => <Typography.Text style={textMd}>{value}</Typography.Text>,
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 170,
              render: (value: string) => (
                <Typography.Text style={textSm} type="secondary">
                  {formatDateTime(value)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 100,
              render: (_: any, session: Session) => (
                <Space size={4}>
                  <Button icon={<EditOutlined />} onClick={() => openForEdit(session.id)} size="small" />
                  <Popconfirm
                    cancelText="Cancel"
                    okText="Remove"
                    onConfirm={() => {
                      setOpenId(session.id);
                      void removeCurrentSession();
                    }}
                    title="Remove this session permanently?"
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={adminItems}
          loading={loading}
          rowKey="id"
          scroll={{ x: 860 }}
          style={S.tableMinWidth}
        />
      </div>

      {!adminItems.length && !loading && <Empty description="No sessions found." style={S.emptyTopSpacing} />}
    </Card>
  );

  const desktopDrawerItems = openSession
    ? [
        {
          key: 'view',
          label: <IconLabel icon="notes">Session</IconLabel>,
          children: (
            <S.DrawerSectionStack>
              <div style={S.previewFrame}>
                <SessionCover height={240} session={openSession} />
              </div>

              <Space size={8} wrap>
                <Tag color="blue" icon={<AppIcon name="calendar" />}>
                  {formatDate(openSession.date)}
                </Tag>
                <Tag color="default">Session #{sessionNumber(openSession.id)}</Tag>
                {isGM && (
                  <Space size={6}>
                    <span style={mutedSm}>Publish:</span>
                    <Switch
                      checked={isSessionVisible(openSession)}
                      onChange={() => void toggleVisible(openSession)}
                      size="small"
                    />
                  </Space>
                )}
              </Space>

              <Divider style={dividerSm} />

              {openSession.summary ? (
                <Card density="dense" title="Summary">
                  <Typography.Paragraph style={S.detailSummaryText}>{openSession.summary}</Typography.Paragraph>
                </Card>
              ) : (
                <Typography.Text type="secondary">No summary recorded.</Typography.Text>
              )}

              <Typography.Text style={S.detailTimestamp} type="secondary">
                Created at: {formatDateTime(openSession.createdAt)}
                {'  ·  '}
                Updated: {formatDateTime(openSession.updatedAt)}
              </Typography.Text>
            </S.DrawerSectionStack>
          ),
        },
        ...(isGM
          ? [
              {
                key: 'edit',
                label: <IconLabel icon="edit">Edit</IconLabel>,
                children: (
                  <S.DrawerSectionStack>
                    <Card density="dense" title="Session Data">
                      <Space direction="vertical" size={10} style={w100}>
                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Title
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditTitle(event.target.value)}
                            placeholder="Session title"
                            value={editTitle}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Date
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditDate(event.target.value)}
                            placeholder="AW 2284, Day 3 or 2025-04-13"
                            value={editDate}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Summary
                          </Typography.Text>
                          <TextArea
                            onChange={(event) => setEditSummary(event.target.value)}
                            placeholder="Milestones, key points and campaign fallout."
                            rows={12}
                            value={editSummary}
                          />
                        </div>
                      </Space>
                    </Card>

                    <Card density="dense" title="Cover Image">
                      <Space direction="vertical" size={8} style={w100}>
                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Image URL
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditImageUrl(event.target.value)}
                            placeholder="https://example.com/image.jpg"
                            value={editImageUrl}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Alt text
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditImageAlt(event.target.value)}
                            placeholder="Image description"
                            value={editImageAlt}
                          />
                        </div>

                        {(editImageUrl || openSession.imageUrl) && (
                          <div style={S.previewFrame}>
                            <SessionCover
                              height={120}
                              session={{
                                ...openSession,
                                imageAlt: editImageAlt || openSession.imageAlt,
                                imageUrl: editImageUrl || openSession.imageUrl,
                              }}
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
                          <Typography.Text style={textSm} type="secondary">
                            Hidden sessions remain visible only to the GM.
                          </Typography.Text>
                        </div>
                        <Switch
                          checked={isSessionVisible(openSession)}
                          checkedChildren={<EyeOutlined />}
                          onChange={() => void toggleVisible(openSession)}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>
                    </Card>

                    <Button block loading={savingEdit} onClick={() => void saveEdit()} type="primary">
                      Save Changes
                    </Button>
                  </S.DrawerSectionStack>
                ),
              },
            ]
          : []),
      ]
    : [];

  const detailDrawer =
    openSession && !mobileOnly ? (
      <Drawer
        extra={
          isGM ? (
            <Space>
              <Popconfirm
                cancelText="Cancel"
                okText="Remove"
                onConfirm={() => void removeCurrentSession()}
                title="Remove this session permanently?"
              >
                <Button danger icon={<DeleteOutlined />} size="small">
                  Remove
                </Button>
              </Popconfirm>
              {drawerTab === 'edit' && (
                <Button loading={savingEdit} onClick={() => void saveEdit()} size="small" type="primary">
                  Save
                </Button>
              )}
            </Space>
          ) : null
        }
        onClose={closeSessionPanels}
        open
        size={700}
        title={
          <Space size={8} wrap>
            <span style={S.drawerTitleText}>
              Session #{sessionNumber(openSession.id)} · {openSession.title}
            </span>
            <Tag color={isSessionVisible(openSession) ? 'green' : 'red'}>
              {isSessionVisible(openSession) ? 'Visible' : 'Hidden'}
            </Tag>
            <Badge count={`#${openSession.id}`} style={S.drawerIdBadge} />
          </Space>
        }
      >
        <Tabs activeKey={drawerTab} items={desktopDrawerItems} onChange={(key) => setDrawerTab(key as DrawerTab)} />
      </Drawer>
    ) : null;

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} sessions
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
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search sessions..." value={search} />
      {isGM && (
        <S.MobileFilterRow>
          <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
            <FilterOutline fontSize={17} /> Filters
          </AdmMobileButton>
          {viewMode === 'admin' && (
            <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
              <AddOutline fontSize={17} /> New session
            </AdmMobileButton>
          )}
        </S.MobileFilterRow>
      )}
    </>
  );

  const mobileOverview = openSession ? (
    <S.MobileSectionStack>
      <MobileCard compact>
        <SessionCover height={220} session={openSession} />
      </MobileCard>

      <MobileCard compact title="Summary">
        <S.MobileBodyText>{openSession.summary?.trim() || 'No summary recorded yet.'}</S.MobileBodyText>
      </MobileCard>

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Session number</S.MobileDetailLabel>
            <S.MobileDetailValue>#{sessionNumber(openSession.id)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Date</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDate(openSession.date)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Visibility</S.MobileDetailLabel>
            <S.MobileDetailValue>{isSessionVisible(openSession) ? 'Visible' : 'Hidden'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Session ID</S.MobileDetailLabel>
            <S.MobileDetailValue>#{openSession.id}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Created</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateTime(openSession.createdAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Updated</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateTime(openSession.updatedAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
        </S.MobileDetailGrid>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const mobileGM = openSession ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isSessionVisible(openSession)} onChange={() => void toggleVisible(openSession)} />
        </S.MobileVisibilityRow>
      </MobileCard>

      <MobileCard compact title="Session data">
        <MobileForm>
          <MobileForm.Item label="Title">
            <AdmMobileInput clearable onChange={setEditTitle} placeholder="Session title" value={editTitle} />
          </MobileForm.Item>
          <MobileForm.Item label="Date">
            <AdmMobileInput
              clearable
              onChange={setEditDate}
              placeholder="AW 2284, Day 3 or 2025-04-13"
              value={editDate}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Summary">
            <AdmMobileTextArea
              autoSize={{ minRows: 6, maxRows: 10 }}
              onChange={setEditSummary}
              placeholder="Milestones, key points and fallout."
              value={editSummary}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Cover image">
        <S.MobileCreateFields>
          <S.MobileCreateField>
            <S.MobileFieldLabel htmlFor="session-image-url-mobile">Image URL</S.MobileFieldLabel>
            <AdmMobileInput
              clearable
              id="session-image-url-mobile"
              onChange={setEditImageUrl}
              placeholder="https://example.com/image.jpg"
              value={editImageUrl}
            />
          </S.MobileCreateField>

          <S.MobileCreateField>
            <S.MobileFieldLabel htmlFor="session-image-alt-mobile">Alt text</S.MobileFieldLabel>
            <AdmMobileInput
              clearable
              id="session-image-alt-mobile"
              onChange={setEditImageAlt}
              placeholder="Image description"
              value={editImageAlt}
            />
          </S.MobileCreateField>

          {(editImageUrl || openSession.imageUrl) && (
            <MobileCard compact>
              <SessionCover
                height={160}
                session={{
                  ...openSession,
                  imageAlt: editImageAlt || openSession.imageAlt,
                  imageUrl: editImageUrl || openSession.imageUrl,
                }}
              />
            </MobileCard>
          )}
        </S.MobileCreateFields>
      </MobileCard>

      <MobileCard compact title="Danger zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>
            Deleting a session removes the diary entry permanently for players and GM alike.
          </S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete session
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  if (mobileOnly) {
    const displayItems = viewMode === 'admin' && isGM ? adminItems : publicItems;

    return (
      <>
        <PageTitle>Sessions</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'blog' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('blog')}
                  size="small"
                >
                  <CalendarOutline fontSize={16} /> Diary
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
              ? 'Create, publish and edit campaign diary entries from the GM panel.'
              : 'Campaign sessions, major beats and aftermath in a mobile-first diary.'
          }
          title={
            viewMode === 'admin' ? (
              <IconLabel icon="gm">GM Panel - Sessions</IconLabel>
            ) : (
              <IconLabel icon="notes">Campaign Diary</IconLabel>
            )
          }
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : displayItems.length === 0 ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                {viewMode === 'admin' ? 'No sessions found.' : 'No visible sessions yet.'}
              </S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileSessionsGrid>
              {displayItems.map((session) => (
                <MobileCard compact key={session.id}>
                  <S.MobileSessionBody>
                    <SessionCover height={180} session={session} />

                    <S.MobileSessionHeader>
                      <S.MobileSessionIdentity>
                        <S.MobileSessionTitle>{session.title}</S.MobileSessionTitle>
                        <S.MobileMetaTags>
                          <AdmMobileTag fill="outline" round>
                            Session #{sessionNumber(session.id)}
                          </AdmMobileTag>
                          <AdmMobileTag color="primary" fill="outline" round>
                            {formatDate(session.date)}
                          </AdmMobileTag>
                          {isGM && viewMode === 'admin' && (
                            <AdmMobileTag
                              color={isSessionVisible(session) ? 'success' : 'warning'}
                              fill="outline"
                              round
                            >
                              {isSessionVisible(session) ? 'Visible' : 'Hidden'}
                            </AdmMobileTag>
                          )}
                        </S.MobileMetaTags>
                      </S.MobileSessionIdentity>
                    </S.MobileSessionHeader>

                    <S.MobileSessionPreview>{getSummaryPreview(session)}</S.MobileSessionPreview>

                    <S.MobileSessionActions>
                      <AdmMobileButton block color="primary" onClick={() => openSessionSheet(session, 'overview')}>
                        Open session
                      </AdmMobileButton>
                      {isGM && viewMode === 'admin' && (
                        <AdmMobileButton block fill="outline" onClick={() => openSessionSheet(session, 'gm')}>
                          <SetOutline fontSize={17} /> GM controls
                        </AdmMobileButton>
                      )}
                    </S.MobileSessionActions>
                  </S.MobileSessionBody>
                </MobileCard>
              ))}
            </S.MobileSessionsGrid>
          )}
        </MobilePageScaffold>

        {isGM && (
          <MobileFilterSheet
            description="Switch between the public diary and GM controls, and filter visibility."
            footer={
              <MobileActionBar sticky={false}>
                <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                  Done
                </AdmMobileButton>
              </MobileActionBar>
            }
            onClose={() => setFilterSheetOpen(false)}
            title="Session filters"
            visible={filterSheetOpen}
          >
            <S.MobileCreateFields>
              <S.MobileCreateField>
                <S.MobileFieldLabel>Panel</S.MobileFieldLabel>
                <MobileSelector
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'blog')}
                  options={[
                    { label: 'Diary', value: 'blog' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileCreateField>

              <S.MobileCreateField>
                <S.MobileFieldLabel>Visibility</S.MobileFieldLabel>
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
              </S.MobileCreateField>
            </S.MobileCreateFields>
          </MobileFilterSheet>
        )}

        <MobileEntitySheet
          description={
            openSession
              ? isGM
                ? 'Overview and GM controls for this campaign session.'
                : 'Overview of this campaign session and its recorded aftermath.'
              : undefined
          }
          footer={
            openSession && isGM && mobileSheetTab === 'gm' ? (
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
          onClose={closeSessionPanels}
          subtitle={openSession ? formatDate(openSession.date) : undefined}
          title={openSession?.title ?? 'Session'}
          visible={Boolean(openSession)}
        >
          {openSession && isGM ? (
            <MobileTabs
              activeKey={mobileSheetTab}
              items={[
                { key: 'overview', title: 'Overview', children: mobileOverview },
                { key: 'gm', title: 'GM', children: mobileGM },
              ]}
              onChange={(key) => setMobileSheetTab(key as SessionSheetTab)}
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
              text: 'Delete session',
              bold: true,
              danger: true,
              onClick: () => removeCurrentSession(),
            },
          ]}
          content={openSession ? `Delete "${openSession.title}" permanently from the campaign diary?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete session?"
          visible={deleteDialogOpen}
        />

        <MobileEntitySheet
          description="Create a new campaign diary entry with the same shared mobile primitives we will reuse across PR5."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton
                  block
                  color="primary"
                  loading={creatingSession}
                  onClick={() => void handleCreateSession()}
                >
                  Create session
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
          title="New session"
          visible={creating && isGM && viewMode === 'admin'}
        >
          <MobileCard compact title="Session details">
            <MobileForm>
              <MobileForm.Item label="Title">
                <AdmMobileInput clearable onChange={setNewTitle} placeholder="Session title" value={newTitle} />
              </MobileForm.Item>
              <MobileForm.Item label="Date">
                <AdmMobileInput
                  clearable
                  onChange={setNewDate}
                  placeholder="AW 2284, Day 3 or 2025-04-13"
                  value={newDate}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Summary">
                <AdmMobileTextArea
                  autoSize={{ minRows: 5, maxRows: 8 }}
                  onChange={setNewSummary}
                  placeholder="Milestones, key points and fallout."
                  value={newSummary}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Cover image URL">
                <AdmMobileInput
                  clearable
                  onChange={setNewImageUrl}
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Cover image alt text">
                <AdmMobileInput
                  clearable
                  onChange={setNewImageAlt}
                  placeholder="Image description"
                  value={newImageAlt}
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
      <PageTitle>Sessions</PageTitle>

      {desktopHeader}
      {viewMode === 'admin' && isGM ? loading ? <Spinner /> : adminDesktopTable : blogView}
      {detailDrawer}
    </>
  );
};

export default SessionsPage;
