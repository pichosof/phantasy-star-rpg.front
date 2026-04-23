/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Badge, Divider, Drawer, Empty, Popconfirm, Select, Space, Switch, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Switch as AdmMobileSwitch,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import { AddOutline, DeleteOutline, FilterOutline, FlagOutline, SetOutline } from 'antd-mobile-icons';

import type { Quest, QuestCity, QuestStatus } from '@app/api/quests.api';
import {
  createQuest,
  deleteQuest,
  listQuestCities,
  listQuestsPublic,
  setQuestVisibility,
  updateQuest,
} from '@app/api/quests.api';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { Card } from '@app/components/common/Card/Card';
import {
  MobileActionBar,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobileFilterSheet,
  MobileForm,
  MobileList,
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
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
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
import * as S from './QuestsPage.styles';

type ViewMode = 'public' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type StatusFilter = 'all' | QuestStatus;
type QuestSheetTab = 'overview' | 'cities' | 'gm';
type DrawerTab = 'view' | 'edit';

const STATUS_COLOR: Record<QuestStatus, string> = {
  active: 'blue',
  completed: 'green',
  failed: 'volcano',
};

const STATUS_LABEL: Record<QuestStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  failed: 'Failed',
};

const STATUS_STRIP: Record<QuestStatus, string> = {
  active: '#1677ff',
  completed: '#52c41a',
  failed: '#fa541c',
};

const MOBILE_STATUS_COLOR: Record<QuestStatus, 'primary' | 'success' | 'danger'> = {
  active: 'primary',
  completed: 'success',
  failed: 'danger',
};

const statusOptions: { value: QuestStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...statusOptions,
];

function getQuestStatus(quest: Quest): QuestStatus {
  return (quest.status ?? 'active') as QuestStatus;
}

function isQuestVisible(quest: Quest) {
  return (quest.visible ?? true) === true;
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

  return parsed.toLocaleString('en-US');
}

function getQuestPreview(quest: Quest) {
  const description = quest.description?.trim();
  if (!description) return 'No quest description recorded yet.';
  return description.length > 170 ? `${description.slice(0, 167)}...` : description;
}

export const QuestsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const isGM = useGMMode();

  const [items, setItems] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('public');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [creatingQuest, setCreatingQuest] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newStatus, setNewStatus] = React.useState<QuestStatus>('active');
  const [newDescription, setNewDescription] = React.useState('');
  const [newReward, setNewReward] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<DrawerTab>('view');
  const [mobileSheetTab, setMobileSheetTab] = React.useState<QuestSheetTab>('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [questCities, setQuestCities] = React.useState<Record<number, QuestCity[]>>({});
  const [citiesLoading, setCitiesLoading] = React.useState(false);

  const [editTitle, setEditTitle] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<QuestStatus>('active');
  const [editDescription, setEditDescription] = React.useState('');
  const [editReward, setEditReward] = React.useState('');
  const [savingEdit, setSavingEdit] = React.useState(false);

  React.useEffect(() => {
    if (!isGM) {
      setViewMode('public');
      setFilterVis('all');
      setCreating(false);
      if (mobileSheetTab === 'gm') {
        setMobileSheetTab('overview');
      }
    }
  }, [isGM, mobileSheetTab]);

  const sortQuests = React.useCallback((data: Quest[]) => [...data].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)), []);

  const load = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = sortQuests(await listQuestsPublic());
      setItems(data);

      const cityMaps = await Promise.all(
        data.map(async (quest) => ({
          id: quest.id,
          cities: await listQuestCities(quest.id).catch(() => []),
        })),
      );

      setQuestCities(Object.fromEntries(cityMaps.map((entry) => [entry.id, entry.cities])));
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load quests.'));
    } finally {
      setLoading(false);
    }
  }, [sortQuests]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openQuest = React.useMemo(() => items.find((entry) => entry.id === openId) ?? null, [items, openId]);

  const resetCreateForm = React.useCallback(() => {
    setNewTitle('');
    setNewStatus('active');
    setNewDescription('');
    setNewReward('');
  }, []);

  const resetEditForm = React.useCallback(() => {
    if (!openQuest) return;
    setEditTitle(openQuest.title ?? '');
    setEditStatus(getQuestStatus(openQuest));
    setEditDescription(openQuest.description ?? '');
    setEditReward(openQuest.reward ?? '');
  }, [openQuest]);

  React.useEffect(() => {
    resetEditForm();
  }, [resetEditForm]);

  React.useEffect(() => {
    if (!openId) return;
    if (questCities[openId]) return;

    setCitiesLoading(true);
    listQuestCities(openId)
      .then((cities) => setQuestCities((prev) => ({ ...prev, [openId]: cities })))
      .catch(() => setQuestCities((prev) => ({ ...prev, [openId]: [] })))
      .finally(() => setCitiesLoading(false));
  }, [openId, questCities]);

  const q = search.trim().toLowerCase();

  const publicItems = React.useMemo(
    () =>
      items.filter(isQuestVisible).filter((quest) => {
        if (filterStatus !== 'all' && getQuestStatus(quest) !== filterStatus) return false;
        if (!q) return true;
        return (
          (quest.title ?? '').toLowerCase().includes(q) ||
          (quest.description ?? '').toLowerCase().includes(q) ||
          (quest.reward ?? '').toLowerCase().includes(q)
        );
      }),
    [filterStatus, items, q],
  );

  const adminItems = React.useMemo(
    () =>
      items.filter((quest) => {
        if (filterVis === 'visible' && !isQuestVisible(quest)) return false;
        if (filterVis === 'hidden' && isQuestVisible(quest)) return false;
        if (filterStatus !== 'all' && getQuestStatus(quest) !== filterStatus) return false;
        if (!q) return true;
        return (
          (quest.title ?? '').toLowerCase().includes(q) ||
          (quest.description ?? '').toLowerCase().includes(q) ||
          (quest.reward ?? '').toLowerCase().includes(q)
        );
      }),
    [filterStatus, filterVis, items, q],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isQuestVisible).length;
    const active = items.filter((quest) => getQuestStatus(quest) === 'active').length;
    const completed = items.filter((quest) => getQuestStatus(quest) === 'completed').length;
    const failed = items.filter((quest) => getQuestStatus(quest) === 'failed').length;
    return { total, visible, hidden: total - visible, active, completed, failed };
  }, [items]);

  function closeQuestPanels() {
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

  function openQuestSheet(quest: Quest, tab: QuestSheetTab = 'overview') {
    setOpenId(quest.id);
    setMobileSheetTab(isGM ? tab : 'overview');
  }

  async function handleCreateQuest() {
    const title = newTitle.trim();

    if (!title) {
      message.warning('Please provide a title.');
      return;
    }

    setCreatingQuest(true);
    try {
      const created = await createQuest({
        title,
        status: newStatus,
        description: newDescription.trim() || null,
        reward: newReward.trim() || null,
      });

      setItems((prev) => sortQuests([...prev.filter((entry) => entry.id !== created.id), created]));
      resetCreateForm();
      setCreating(false);
      message.success('Quest created.');

      if (mobileOnly) {
        setOpenId(created.id);
        setMobileSheetTab(isGM ? 'gm' : 'overview');
      }
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create quest.'));
    } finally {
      setCreatingQuest(false);
    }
  }

  async function toggleVisible(quest: Quest) {
    const nextVisible = !isQuestVisible(quest);
    setItems((prev) => prev.map((entry) => (entry.id === quest.id ? { ...entry, visible: nextVisible } : entry)));

    try {
      await setQuestVisibility(quest.id, nextVisible);
      message.success(nextVisible ? 'Quest visible to players.' : 'Quest hidden.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change visibility.'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openQuest) return;

    const title = editTitle.trim();

    if (!title) {
      message.warning('Title cannot be empty.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateQuest(openQuest.id, {
        title,
        status: editStatus,
        description: editDescription.trim() || null,
        reward: editReward.trim() || null,
      });

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === openQuest.id
            ? {
                ...entry,
                title,
                status: editStatus,
                description: editDescription.trim() || null,
                reward: editReward.trim() || null,
              }
            : entry,
        ),
      );
      message.success('Quest updated.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update quest.'));
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeCurrentQuest() {
    if (!openQuest) return;

    try {
      await deleteQuest(openQuest.id);
      setItems((prev) => prev.filter((entry) => entry.id !== openQuest.id));
      closeQuestPanels();
      message.success('Quest removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove quest.'));
    }
  }

  async function removeQuestById(id: number) {
    try {
      await deleteQuest(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      if (openId === id) {
        closeQuestPanels();
      }
      message.success('Quest removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove quest.'));
    }
  }

  const desktopHeader = (
    <Card className="rpg-page-header-card" density="dense">
      <Space direction="vertical" size={10} style={w100}>
        <Space size={8} style={spaceBetween}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'admin' ? (
                <IconLabel icon="gm">GM Panel - Quests</IconLabel>
              ) : (
                <IconLabel icon="quest">Quests Board</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text style={textMd} type="secondary">
              {viewMode === 'admin'
                ? 'Create, edit, publish and manage campaign quests.'
                : 'Active, completed and ongoing quests in the campaign.'}
            </Typography.Text>
          </div>

          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  onClick={() => setViewMode('public')}
                  size="small"
                  type={viewMode === 'public' ? 'primary' : 'default'}
                >
                  <IconLabel icon="read">Quests</IconLabel>
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
                {creating ? 'Close' : '+ New Quest'}
              </Button>
            )}
          </Space>
        </Space>

        <Space size={8} wrap>
          <Tag>{stats.total} quests</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
          <Tag color="blue">{stats.active} active</Tag>
          <Tag color="green">{stats.completed} completed</Tag>
          {stats.failed > 0 && <Tag color="volcano">{stats.failed} failed</Tag>}
        </Space>

        <Space size={8} style={w100} wrap>
          <Input
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, description or reward..."
            style={S.headerSearch}
            value={search}
          />

          <Space size={4}>
            {statusFilterOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                size="small"
                type={filterStatus === option.value ? 'primary' : 'default'}
              >
                {option.label}
              </Button>
            ))}
          </Space>

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
                void handleCreateQuest();
              }}
            >
              <Typography.Text strong>New Quest</Typography.Text>
              <S.createInputsRow>
                <Input
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Title *"
                  required
                  style={S.createTitleInput}
                  value={newTitle}
                />
                <Select
                  onChange={(value) => setNewStatus(value as QuestStatus)}
                  options={statusOptions}
                  style={S.createStatusInput}
                  value={newStatus}
                />
              </S.createInputsRow>
              <TextArea
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Quest description"
                rows={4}
                value={newDescription}
              />
              <Input
                onChange={(event) => setNewReward(event.target.value)}
                placeholder="Reward (optional)"
                value={newReward}
              />
              <Space>
                <Button htmlType="submit" loading={creatingQuest} type="primary">
                  Create Quest
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

  const desktopDisplayItems = viewMode === 'admin' && isGM ? adminItems : publicItems;

  const publicView = loading ? (
    <Spinner />
  ) : desktopDisplayItems.length === 0 ? (
    <Card density="comfy">
      <Empty description="No quests found." />
    </Card>
  ) : (
    <S.PublicGrid $tablet={isTablet}>
      {desktopDisplayItems.map((quest) => {
        const status = getQuestStatus(quest);
        const visible = isQuestVisible(quest);
        const cities = questCities[quest.id] ?? [];

        return (
          <S.PublicCard key={quest.id} onClick={() => openForView(quest.id)}>
            <S.StatusStrip $color={STATUS_STRIP[status]} />
            <S.PublicCardBody>
              <Space size={6} style={spaceBetween}>
                <Tag color={STATUS_COLOR[status]} style={m0}>
                  {STATUS_LABEL[status]}
                </Tag>
                {isGM && viewMode === 'admin' && (
                  <Tag color={visible ? 'green' : 'red'} style={m0}>
                    {visible ? 'Visible' : 'Hidden'}
                  </Tag>
                )}
              </Space>

              <S.PublicCardTitle>{quest.title}</S.PublicCardTitle>
              <S.PublicCardDescription>{getQuestPreview(quest)}</S.PublicCardDescription>

              <S.MetaTags>
                {quest.reward ? (
                  <Tag color="gold" icon={<AppIcon name="reward" />} style={m0}>
                    {quest.reward}
                  </Tag>
                ) : null}
                {cities.map((city) => (
                  <Tag color="geekblue" icon={<AppIcon name="location" />} key={city.id} style={m0}>
                    {city.name}
                  </Tag>
                ))}
              </S.MetaTags>

              <S.PublicCardSpacer />
              <Divider style={dividerMd} />

              <S.PublicCardFooter>
                <S.PublicCardCreated>{formatDate((quest as any).createdAt)}</S.PublicCardCreated>
                <Space onClick={(event) => event.stopPropagation()} size={6}>
                  {isGM && viewMode === 'admin' ? (
                    <Switch checked={visible} onChange={() => void toggleVisible(quest)} size="small" />
                  ) : null}
                  <S.PublicCardOpenText>Open quest</S.PublicCardOpenText>
                </Space>
              </S.PublicCardFooter>
            </S.PublicCardBody>
          </S.PublicCard>
        );
      })}
    </S.PublicGrid>
  );

  const adminDesktopTable = (
    <Card density="dense" title="Manage Quests">
      <div style={tableWrap}>
        <Table
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (value: number) => <Tag style={m0}>#{value}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, quest: Quest) => (
                <Switch
                  checked={isQuestVisible(quest)}
                  checkedChildren={<EyeOutlined />}
                  onChange={() => void toggleVisible(quest)}
                  size="small"
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Quest',
              key: 'title',
              render: (_: any, quest: Quest) => {
                const status = getQuestStatus(quest);

                return (
                  <S.AdminTitleStack>
                    <Space size={6} wrap>
                      <Typography.Text strong onClick={() => openForView(quest.id)} style={S.tableClickableText}>
                        {quest.title}
                      </Typography.Text>
                      <Tag color={STATUS_COLOR[status]} style={m0}>
                        {STATUS_LABEL[status]}
                      </Tag>
                      {quest.reward ? (
                        <Tag color="gold" style={m0}>
                          Reward
                        </Tag>
                      ) : null}
                    </Space>
                    <Typography.Text style={S.tableDescription} type="secondary">
                      {getQuestPreview(quest)}
                    </Typography.Text>
                  </S.AdminTitleStack>
                );
              },
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
              render: (_: any, quest: Quest) => (
                <Space size={4}>
                  <Button icon={<EditOutlined />} onClick={() => openForEdit(quest.id)} size="small" />
                  <Popconfirm
                    cancelText="Cancel"
                    okText="Remove"
                    onConfirm={() => void removeQuestById(quest.id)}
                    title="Remove this quest permanently?"
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
          scroll={{ x: 900 }}
          style={S.tableMinWidth}
        />
      </div>

      {!adminItems.length && !loading && <Empty description="No quests found." style={S.emptyList} />}
    </Card>
  );

  const desktopDrawerItems = openQuest
    ? [
        {
          key: 'view',
          label: <IconLabel icon="quest">Quest</IconLabel>,
          children: (
            <S.DrawerSectionStack>
              <Space size={8} wrap>
                <Tag color={STATUS_COLOR[getQuestStatus(openQuest)]}>{STATUS_LABEL[getQuestStatus(openQuest)]}</Tag>
                {openQuest.reward ? (
                  <Tag color="gold" icon={<AppIcon name="reward" />}>
                    {openQuest.reward}
                  </Tag>
                ) : null}
                {isGM && (
                  <Space size={6}>
                    <span style={mutedSm}>Publish:</span>
                    <Switch
                      checked={isQuestVisible(openQuest)}
                      onChange={() => void toggleVisible(openQuest)}
                      size="small"
                    />
                  </Space>
                )}
              </Space>

              <Divider style={dividerSm} />

              <Card density="dense" title="Description">
                <Typography.Paragraph style={S.drawerDescription}>
                  {openQuest.description?.trim() || 'No description.'}
                </Typography.Paragraph>
              </Card>

              {citiesLoading ? (
                <Spinner />
              ) : questCities[openQuest.id]?.length ? (
                <Card density="dense" title={<IconLabel icon="location">Cities</IconLabel>}>
                  <Space size={6} wrap>
                    {questCities[openQuest.id].map((city) => (
                      <Tag color="geekblue" key={city.id}>
                        {city.name}
                        {city.region ? ` - ${city.region}` : ''}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              ) : null}

              <Typography.Text style={S.drawerTimestamp} type="secondary">
                Created at: {formatDateTime(openQuest.createdAt)}
                {'  ·  '}
                Updated: {formatDateTime(openQuest.updatedAt)}
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
                    <Card density="dense" title="Quest Data">
                      <Space direction="vertical" size={10} style={w100}>
                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Title
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditTitle(event.target.value)}
                            placeholder="Quest title"
                            value={editTitle}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Status
                          </Typography.Text>
                          <Select
                            onChange={(value) => setEditStatus(value as QuestStatus)}
                            options={statusOptions}
                            style={w100}
                            value={editStatus}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Description
                          </Typography.Text>
                          <TextArea
                            onChange={(event) => setEditDescription(event.target.value)}
                            placeholder="Quest description"
                            rows={8}
                            value={editDescription}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Reward
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditReward(event.target.value)}
                            placeholder="Reward (optional)"
                            value={editReward}
                          />
                        </div>
                      </Space>
                    </Card>

                    <Card density="dense" title="Visibility">
                      <Space style={spaceBetween}>
                        <div>
                          <Typography.Text>Visible to players</Typography.Text>
                          <br />
                          <Typography.Text style={textSm} type="secondary">
                            Hidden quests are only visible to the GM.
                          </Typography.Text>
                        </div>
                        <Switch
                          checked={isQuestVisible(openQuest)}
                          checkedChildren={<EyeOutlined />}
                          onChange={() => void toggleVisible(openQuest)}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>
                    </Card>

                    <TagSelect entityId={openQuest.id} entityType="quest" />

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
    openQuest && !mobileOnly ? (
      <Drawer
        extra={
          isGM ? (
            <Space>
              <Popconfirm
                cancelText="Cancel"
                okText="Remove"
                onConfirm={() => void removeCurrentQuest()}
                title="Remove this quest permanently?"
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
        onClose={closeQuestPanels}
        open
        size={640}
        title={
          <Space size={8} wrap>
            <span style={S.drawerTitleText}>{openQuest.title}</span>
            <Tag color={STATUS_COLOR[getQuestStatus(openQuest)]}>{STATUS_LABEL[getQuestStatus(openQuest)]}</Tag>
            <Tag color={isQuestVisible(openQuest) ? 'green' : 'red'}>
              {isQuestVisible(openQuest) ? 'Visible' : 'Hidden'}
            </Tag>
            <Badge count={`#${openQuest.id}`} style={S.drawerBadge} />
          </Space>
        }
      >
        <Tabs activeKey={drawerTab} items={desktopDrawerItems} onChange={(key) => setDrawerTab(key as DrawerTab)} />
      </Drawer>
    ) : null;

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} quests
      </AdmMobileTag>
      <AdmMobileTag color="primary" fill="outline" round>
        {stats.active} active
      </AdmMobileTag>
      <AdmMobileTag color="success" fill="outline" round>
        {stats.completed} completed
      </AdmMobileTag>
      {stats.failed > 0 ? (
        <AdmMobileTag color="danger" fill="outline" round>
          {stats.failed} failed
        </AdmMobileTag>
      ) : null}
      {isGM ? (
        <AdmMobileTag color="warning" fill="outline" round>
          {stats.hidden} hidden
        </AdmMobileTag>
      ) : null}
    </S.MobileMetaTags>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search quests..." value={search} />
      <S.MobileFilterRow>
        <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
          <FilterOutline fontSize={17} /> Filters
        </AdmMobileButton>
        {isGM && viewMode === 'admin' ? (
          <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
            <AddOutline fontSize={17} /> New quest
          </AdmMobileButton>
        ) : null}
      </S.MobileFilterRow>
    </>
  );

  const mobileOverview = openQuest ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Description">
        <S.MobileBodyText>{openQuest.description?.trim() || 'No quest description recorded yet.'}</S.MobileBodyText>
      </MobileCard>

      {openQuest.reward ? (
        <MobileCard compact title="Reward">
          <S.MobileBodyText>{openQuest.reward}</S.MobileBodyText>
        </MobileCard>
      ) : null}

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Status</S.MobileDetailLabel>
            <S.MobileDetailValue>{STATUS_LABEL[getQuestStatus(openQuest)]}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Visibility</S.MobileDetailLabel>
            <S.MobileDetailValue>{isQuestVisible(openQuest) ? 'Visible' : 'Hidden'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Quest ID</S.MobileDetailLabel>
            <S.MobileDetailValue>#{openQuest.id}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Cities</S.MobileDetailLabel>
            <S.MobileDetailValue>{questCities[openQuest.id]?.length ?? 0}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Created</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateTime(openQuest.createdAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Updated</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateTime(openQuest.updatedAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
        </S.MobileDetailGrid>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const mobileCities = openQuest ? (
    citiesLoading ? (
      <MobileCard compact>
        <S.MobileEmptyState>
          <SpinLoading color="primary" />
        </S.MobileEmptyState>
      </MobileCard>
    ) : !questCities[openQuest.id]?.length ? (
      <MobileCard compact>
        <S.MobileEmptyState>No cities linked to this quest yet.</S.MobileEmptyState>
      </MobileCard>
    ) : (
      <MobileList>
        {questCities[openQuest.id].map((city) => (
          <MobileList.Item
            description={city.description?.trim() || city.region || 'No city summary yet.'}
            extra={
              city.region ? (
                <AdmMobileTag fill="outline" round>
                  {city.region}
                </AdmMobileTag>
              ) : null
            }
            key={city.id}
          >
            {city.name}
          </MobileList.Item>
        ))}
      </MobileList>
    )
  ) : null;

  const mobileGM = openQuest ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isQuestVisible(openQuest)} onChange={() => void toggleVisible(openQuest)} />
        </S.MobileVisibilityRow>
      </MobileCard>

      <MobileCard compact title="Quest data">
        <MobileForm>
          <MobileForm.Item label="Title">
            <AdmMobileInput clearable onChange={setEditTitle} placeholder="Quest title" value={editTitle} />
          </MobileForm.Item>
          <MobileForm.Item label="Status">
            <MobileSelector
              columns={3}
              inset={false}
              onChange={(values) => setEditStatus((values[0] as QuestStatus | undefined) ?? 'active')}
              options={statusOptions}
              value={[editStatus]}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Description">
            <AdmMobileTextArea
              autoSize={{ minRows: 6, maxRows: 10 }}
              onChange={setEditDescription}
              placeholder="Quest description"
              value={editDescription}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Reward">
            <AdmMobileInput clearable onChange={setEditReward} placeholder="Reward (optional)" value={editReward} />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Tags">
        <TagSelect entityId={openQuest.id} entityType="quest" />
      </MobileCard>

      <MobileCard compact title="Danger zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>Deleting a quest removes it permanently from the campaign board.</S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete quest
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  if (mobileOnly) {
    const displayItems = viewMode === 'admin' && isGM ? adminItems : publicItems;

    return (
      <>
        <PageTitle>Quests</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'public' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('public')}
                  size="small"
                >
                  <FlagOutline fontSize={16} /> Quests
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
              ? 'Create, publish and edit quest hooks from the mobile GM panel.'
              : 'Track active, completed and failed campaign quests from your phone.'
          }
          title={
            viewMode === 'admin' ? (
              <IconLabel icon="gm">GM Panel - Quests</IconLabel>
            ) : (
              <IconLabel icon="quest">Quests Board</IconLabel>
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
              <S.MobileEmptyState>No quests found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileQuestsGrid>
              {displayItems.map((quest) => {
                const status = getQuestStatus(quest);
                const cities = questCities[quest.id] ?? [];

                return (
                  <MobileCard compact key={quest.id}>
                    <S.MobileQuestBody>
                      <S.MobileQuestHeader>
                        <S.MobileQuestIdentity>
                          <S.MobileQuestTitle>{quest.title}</S.MobileQuestTitle>
                          <S.MobileMetaTags>
                            <AdmMobileTag color={MOBILE_STATUS_COLOR[status]} fill="outline" round>
                              {STATUS_LABEL[status]}
                            </AdmMobileTag>
                            {isGM && viewMode === 'admin' ? (
                              <AdmMobileTag color={isQuestVisible(quest) ? 'success' : 'warning'} fill="outline" round>
                                {isQuestVisible(quest) ? 'Visible' : 'Hidden'}
                              </AdmMobileTag>
                            ) : null}
                            {quest.reward ? (
                              <AdmMobileTag color="warning" fill="outline" round>
                                Reward
                              </AdmMobileTag>
                            ) : null}
                            {cities.length ? (
                              <AdmMobileTag fill="outline" round>
                                {cities.length} cities
                              </AdmMobileTag>
                            ) : null}
                          </S.MobileMetaTags>
                        </S.MobileQuestIdentity>
                      </S.MobileQuestHeader>

                      <S.MobileQuestPreview>{getQuestPreview(quest)}</S.MobileQuestPreview>

                      <S.MobileQuestActions>
                        <AdmMobileButton block color="primary" onClick={() => openQuestSheet(quest, 'overview')}>
                          Open quest
                        </AdmMobileButton>
                        <AdmMobileButton
                          block
                          fill="outline"
                          onClick={() => openQuestSheet(quest, isGM && viewMode === 'admin' ? 'gm' : 'cities')}
                        >
                          {isGM && viewMode === 'admin' ? (
                            <>
                              <SetOutline fontSize={17} /> GM controls
                            </>
                          ) : (
                            'Linked cities'
                          )}
                        </AdmMobileButton>
                      </S.MobileQuestActions>
                    </S.MobileQuestBody>
                  </MobileCard>
                );
              })}
            </S.MobileQuestsGrid>
          )}
        </MobilePageScaffold>

        <MobileFilterSheet
          description="Filter quests by status. GM mode can also filter visibility."
          footer={
            <MobileActionBar sticky={false}>
              <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                Done
              </AdmMobileButton>
            </MobileActionBar>
          }
          onClose={() => setFilterSheetOpen(false)}
          title="Quest filters"
          visible={filterSheetOpen}
        >
          <S.MobileCreateFields>
            {isGM ? (
              <S.MobileCreateField>
                <S.MobileFieldLabel>Panel</S.MobileFieldLabel>
                <MobileSelector
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'public')}
                  options={[
                    { label: 'Quests', value: 'public' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileCreateField>
            ) : null}

            <S.MobileCreateField>
              <S.MobileFieldLabel>Status</S.MobileFieldLabel>
              <MobileSelector
                columns={2}
                inset={false}
                onChange={(values) => setFilterStatus((values[0] as StatusFilter | undefined) ?? 'all')}
                options={statusFilterOptions}
                value={[filterStatus]}
              />
            </S.MobileCreateField>

            {isGM && viewMode === 'admin' ? (
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
            ) : null}
          </S.MobileCreateFields>
        </MobileFilterSheet>

        <MobileEntitySheet
          description={
            openQuest
              ? isGM
                ? 'Overview, linked cities and GM controls for this quest.'
                : 'Overview and linked campaign locations for this quest.'
              : undefined
          }
          footer={
            openQuest && isGM && mobileSheetTab === 'gm' ? (
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
          onClose={closeQuestPanels}
          subtitle={openQuest ? STATUS_LABEL[getQuestStatus(openQuest)] : undefined}
          title={openQuest?.title ?? 'Quest'}
          visible={Boolean(openQuest)}
        >
          {openQuest && isGM ? (
            <MobileTabs
              activeKey={mobileSheetTab}
              items={[
                { key: 'overview', title: 'Overview', children: mobileOverview },
                { key: 'cities', title: `Cities (${questCities[openQuest.id]?.length ?? 0})`, children: mobileCities },
                { key: 'gm', title: 'GM', children: mobileGM },
              ]}
              onChange={(key) => setMobileSheetTab(key as QuestSheetTab)}
            />
          ) : (
            <S.MobileSectionStack>
              {mobileOverview}
              {mobileCities}
            </S.MobileSectionStack>
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
              text: 'Delete quest',
              bold: true,
              danger: true,
              onClick: () => removeCurrentQuest(),
            },
          ]}
          content={openQuest ? `Delete "${openQuest.title}" permanently from the campaign board?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete quest?"
          visible={deleteDialogOpen}
        />

        <MobileEntitySheet
          description="Create a quest from mobile. City links and advanced relations can be refined from related admin flows."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingQuest} onClick={() => void handleCreateQuest()}>
                  Create quest
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
          title="New quest"
          visible={creating && isGM && viewMode === 'admin'}
        >
          <MobileCard compact title="Quest details">
            <MobileForm>
              <MobileForm.Item label="Title">
                <AdmMobileInput clearable onChange={setNewTitle} placeholder="Quest title" value={newTitle} />
              </MobileForm.Item>
              <MobileForm.Item label="Status">
                <MobileSelector
                  columns={3}
                  inset={false}
                  onChange={(values) => setNewStatus((values[0] as QuestStatus | undefined) ?? 'active')}
                  options={statusOptions}
                  value={[newStatus]}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Description">
                <AdmMobileTextArea
                  autoSize={{ minRows: 5, maxRows: 8 }}
                  onChange={setNewDescription}
                  placeholder="Quest description"
                  value={newDescription}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Reward">
                <AdmMobileInput clearable onChange={setNewReward} placeholder="Reward (optional)" value={newReward} />
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
        </MobileEntitySheet>
      </>
    );
  }

  return (
    <>
      <PageTitle>Quests</PageTitle>

      {desktopHeader}
      {viewMode === 'admin' && isGM ? loading ? <Spinner /> : adminDesktopTable : publicView}
      {detailDrawer}
    </>
  );
};

export default QuestsPage;
