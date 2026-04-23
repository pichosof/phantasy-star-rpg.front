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
import { AddOutline, DeleteOutline, FilterOutline, SetOutline } from 'antd-mobile-icons';

import type { Lore, LoreCategory } from '@app/api/lore.api';
import { createLore, deleteLore, listLores, setLoreVisibility, updateLore } from '@app/api/lore.api';
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
import * as S from './LoresAdminPage.styles';

type ViewMode = 'public' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type CategoryFilter = 'all' | LoreCategory;
type LoreSheetTab = 'overview' | 'gm';
type DrawerTab = 'view' | 'edit';

const CATEGORY_COLOR: Record<LoreCategory, string> = {
  history: 'orange',
  culture: 'purple',
  tech: 'cyan',
  biology: 'green',
  myth: 'gold',
};

const CATEGORY_LABEL: Record<LoreCategory, string> = {
  history: 'History',
  culture: 'Culture',
  tech: 'Technology',
  biology: 'Biology',
  myth: 'Myth',
};

const CATEGORY_STRIP: Record<LoreCategory, string> = {
  history: '#fa8c16',
  culture: '#722ed1',
  tech: '#13c2c2',
  biology: '#52c41a',
  myth: '#faad14',
};

const MOBILE_CATEGORY_COLOR: Record<LoreCategory, 'warning' | 'primary' | 'success'> = {
  history: 'warning',
  culture: 'primary',
  tech: 'primary',
  biology: 'success',
  myth: 'warning',
};

const categoryOptions: { value: LoreCategory | 'null'; label: string }[] = [
  { value: 'history', label: 'History' },
  { value: 'culture', label: 'Culture' },
  { value: 'tech', label: 'Technology' },
  { value: 'biology', label: 'Biology' },
  { value: 'myth', label: 'Myth' },
  { value: 'null', label: '(No category)' },
];

const categoryFilterOptions: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'history', label: 'History' },
  { value: 'culture', label: 'Culture' },
  { value: 'tech', label: 'Technology' },
  { value: 'biology', label: 'Biology' },
  { value: 'myth', label: 'Myth' },
];

function isLoreVisible(lore: Lore) {
  return (lore.visible ?? true) === true;
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

function getLorePreview(lore: Lore) {
  const content = lore.content?.trim();
  if (!content) return 'No lore content recorded yet.';
  return content.length > 170 ? `${content.slice(0, 167)}...` : content;
}

function categoryLabel(category?: LoreCategory | null) {
  return category ? (CATEGORY_LABEL[category] ?? category) : 'No category';
}

export const LoresAdminPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const isGM = useGMMode();

  const [items, setItems] = React.useState<Lore[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('public');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterCategory, setFilterCategory] = React.useState<CategoryFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [creatingLore, setCreatingLore] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<LoreCategory | null>(null);
  const [newContent, setNewContent] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<DrawerTab>('view');
  const [mobileSheetTab, setMobileSheetTab] = React.useState<LoreSheetTab>('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [editTitle, setEditTitle] = React.useState('');
  const [editCategory, setEditCategory] = React.useState<LoreCategory | null>(null);
  const [editContent, setEditContent] = React.useState('');
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

  const sortLores = React.useCallback((data: Lore[]) => [...data].sort((a, b) => a.id - b.id), []);

  const load = React.useCallback(async () => {
    setLoading(true);

    try {
      setItems(sortLores(await listLores()));
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load lores.'));
    } finally {
      setLoading(false);
    }
  }, [sortLores]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openLore = React.useMemo(() => items.find((entry) => entry.id === openId) ?? null, [items, openId]);

  const resetCreateForm = React.useCallback(() => {
    setNewTitle('');
    setNewCategory(null);
    setNewContent('');
  }, []);

  const resetEditForm = React.useCallback(() => {
    if (!openLore) return;
    setEditTitle(openLore.title ?? '');
    setEditCategory((openLore.category ?? null) as LoreCategory | null);
    setEditContent(openLore.content ?? '');
  }, [openLore]);

  React.useEffect(() => {
    resetEditForm();
  }, [resetEditForm]);

  const q = search.trim().toLowerCase();

  const publicItems = React.useMemo(
    () =>
      items.filter(isLoreVisible).filter((lore) => {
        if (filterCategory !== 'all' && lore.category !== filterCategory) return false;
        if (!q) return true;
        return (lore.title ?? '').toLowerCase().includes(q) || (lore.content ?? '').toLowerCase().includes(q);
      }),
    [filterCategory, items, q],
  );

  const adminItems = React.useMemo(
    () =>
      items.filter((lore) => {
        if (filterVis === 'visible' && !isLoreVisible(lore)) return false;
        if (filterVis === 'hidden' && isLoreVisible(lore)) return false;
        if (filterCategory !== 'all' && lore.category !== filterCategory) return false;
        if (!q) return true;
        return (lore.title ?? '').toLowerCase().includes(q) || (lore.content ?? '').toLowerCase().includes(q);
      }),
    [filterCategory, filterVis, items, q],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isLoreVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  function closeLorePanels() {
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

  function openLoreSheet(lore: Lore, tab: LoreSheetTab = 'overview') {
    setOpenId(lore.id);
    setMobileSheetTab(isGM ? tab : 'overview');
  }

  async function handleCreateLore() {
    const title = newTitle.trim();

    if (!title) {
      message.warning('Title is required.');
      return;
    }

    setCreatingLore(true);
    try {
      const created = await createLore({
        title,
        category: newCategory,
        content: newContent.trim() || null,
      });

      setItems((prev) => sortLores([...prev.filter((entry) => entry.id !== created.id), created]));
      setCreating(false);
      resetCreateForm();
      message.success('Lore created.');

      if (mobileOnly) {
        setOpenId(created.id);
        setMobileSheetTab(isGM ? 'gm' : 'overview');
      }
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create lore.'));
    } finally {
      setCreatingLore(false);
    }
  }

  async function toggleVisible(lore: Lore) {
    const nextVisible = !isLoreVisible(lore);
    setItems((prev) => prev.map((entry) => (entry.id === lore.id ? { ...entry, visible: nextVisible } : entry)));

    try {
      await setLoreVisibility(lore.id, nextVisible);
      message.success(nextVisible ? 'Lore visible to players.' : 'Lore hidden.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change visibility.'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openLore) return;

    const title = editTitle.trim();

    if (!title) {
      message.warning('Title cannot be empty.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateLore(openLore.id, {
        title,
        category: editCategory,
        content: editContent.trim() || null,
      });

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === openLore.id
            ? {
                ...entry,
                title,
                category: editCategory,
                content: editContent.trim() || null,
              }
            : entry,
        ),
      );
      message.success('Lore updated.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update lore.'));
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeCurrentLore() {
    if (!openLore) return;

    try {
      await deleteLore(openLore.id);
      setItems((prev) => prev.filter((entry) => entry.id !== openLore.id));
      closeLorePanels();
      message.success('Lore removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove lore.'));
    }
  }

  async function removeLoreById(id: number) {
    try {
      await deleteLore(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      if (openId === id) {
        closeLorePanels();
      }
      message.success('Lore removed.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove lore.'));
    }
  }

  const desktopHeader = (
    <Card className="rpg-page-header-card" density="dense">
      <Space direction="vertical" size={10} style={w100}>
        <Space size={8} style={spaceBetween}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'admin' ? (
                <IconLabel icon="gm">GM Panel - Lores</IconLabel>
              ) : (
                <IconLabel icon="lore">Lore Archive</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text style={textMd} type="secondary">
              {viewMode === 'admin'
                ? 'Create, edit, publish and manage lore entries.'
                : 'Historical, cultural and scientific records of the Algol system.'}
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
                  <IconLabel icon="read">Lores</IconLabel>
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
                {creating ? 'Close' : '+ New Lore'}
              </Button>
            )}
          </Space>
        </Space>

        <Space size={8} wrap>
          <Tag>{stats.total} lores</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        <Space size={8} style={w100} wrap>
          <Input
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or content..."
            style={S.searchField}
            value={search}
          />

          <Space size={4}>
            {categoryFilterOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setFilterCategory(option.value)}
                size="small"
                type={filterCategory === option.value ? 'primary' : 'default'}
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
                void handleCreateLore();
              }}
            >
              <Typography.Text strong>New Lore</Typography.Text>
              <S.createInputRow>
                <Input
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Title *"
                  required
                  style={S.createTitleField}
                  value={newTitle}
                />
                <Select
                  onChange={(value) => setNewCategory(value === 'null' ? null : (value as LoreCategory))}
                  options={categoryOptions}
                  style={S.createCategoryField}
                  value={(newCategory ?? 'null') as any}
                />
              </S.createInputRow>
              <TextArea
                onChange={(event) => setNewContent(event.target.value)}
                placeholder="Content (free text or markdown)"
                rows={4}
                value={newContent}
              />
              <Space>
                <Button htmlType="submit" loading={creatingLore} type="primary">
                  Create Lore
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
      <Empty description="No lores found." />
    </Card>
  ) : (
    <S.PublicGrid $tablet={isTablet}>
      {desktopDisplayItems.map((lore) => {
        const visible = isLoreVisible(lore);
        const category = lore.category ?? null;

        return (
          <S.PublicCard key={lore.id} onClick={() => openForView(lore.id)}>
            <S.CategoryStrip $color={category ? CATEGORY_STRIP[category] : '#d9d9d9'} />
            <S.PublicCardBody>
              <Space size={6} style={spaceBetween}>
                <Tag color={category ? CATEGORY_COLOR[category] : 'default'} style={m0}>
                  {categoryLabel(category)}
                </Tag>
                {isGM && viewMode === 'admin' ? (
                  <Tag color={visible ? 'green' : 'red'} style={m0}>
                    {visible ? 'Visible' : 'Hidden'}
                  </Tag>
                ) : null}
              </Space>

              <S.PublicCardTitle>{lore.title}</S.PublicCardTitle>
              <S.PublicCardExcerpt>{getLorePreview(lore)}</S.PublicCardExcerpt>
              <S.PublicCardSpacer />
              <Divider style={dividerMd} />

              <S.PublicCardFooter>
                <S.PublicCardDate>{formatDate(lore.createdAt)}</S.PublicCardDate>
                <Space onClick={(event) => event.stopPropagation()} size={6}>
                  {isGM && viewMode === 'admin' ? (
                    <Switch checked={visible} onChange={() => void toggleVisible(lore)} size="small" />
                  ) : null}
                  <S.PublicCardOpenText>Open lore</S.PublicCardOpenText>
                </Space>
              </S.PublicCardFooter>
            </S.PublicCardBody>
          </S.PublicCard>
        );
      })}
    </S.PublicGrid>
  );

  const adminDesktopTable = (
    <Card density="dense" title="Manage Lores">
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
              render: (_: any, lore: Lore) => (
                <Switch
                  checked={isLoreVisible(lore)}
                  checkedChildren={<EyeOutlined />}
                  onChange={() => void toggleVisible(lore)}
                  size="small"
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Lore',
              key: 'title',
              render: (_: any, lore: Lore) => {
                const category = lore.category ?? null;

                return (
                  <S.AdminTitleStack>
                    <Space size={6} wrap>
                      <Typography.Text strong onClick={() => openForView(lore.id)} style={S.tableClickableText}>
                        {lore.title}
                      </Typography.Text>
                      <Tag color={category ? CATEGORY_COLOR[category] : 'default'} style={m0}>
                        {categoryLabel(category)}
                      </Tag>
                    </Space>
                    <Typography.Text style={S.tableExcerpt} type="secondary">
                      {getLorePreview(lore)}
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
              render: (_: any, lore: Lore) => (
                <Space size={4}>
                  <Button icon={<EditOutlined />} onClick={() => openForEdit(lore.id)} size="small" />
                  <Popconfirm
                    cancelText="Cancel"
                    okText="Remove"
                    onConfirm={() => void removeLoreById(lore.id)}
                    title="Remove this lore permanently?"
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
          style={S.adminTable}
        />
      </div>

      {!adminItems.length && !loading && <Empty description="No lores found." style={S.emptyWithTopSpacing} />}
    </Card>
  );

  const desktopDrawerItems = openLore
    ? [
        {
          key: 'view',
          label: <IconLabel icon="lore">Lore</IconLabel>,
          children: (
            <S.DrawerSectionStack>
              <Space size={8} wrap>
                {openLore.category ? (
                  <Tag color={CATEGORY_COLOR[openLore.category]}>{categoryLabel(openLore.category)}</Tag>
                ) : null}
                {isGM ? (
                  <Space size={6}>
                    <span style={mutedSm}>Publish:</span>
                    <Switch
                      checked={isLoreVisible(openLore)}
                      onChange={() => void toggleVisible(openLore)}
                      size="small"
                    />
                  </Space>
                ) : null}
              </Space>

              <Divider style={dividerSm} />

              <Card density="dense" title="Content">
                <Typography.Paragraph style={S.drawerContentParagraph}>
                  {openLore.content?.trim() || 'No content recorded.'}
                </Typography.Paragraph>
              </Card>

              <Typography.Text style={S.drawerTimestamp} type="secondary">
                Created: {formatDateTime(openLore.createdAt)}
                {'  ·  '}
                Updated: {formatDateTime(openLore.updatedAt)}
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
                    <Card density="dense" title="Lore Data">
                      <Space direction="vertical" size={10} style={w100}>
                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Title
                          </Typography.Text>
                          <Input
                            onChange={(event) => setEditTitle(event.target.value)}
                            placeholder="Lore title"
                            value={editTitle}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Category
                          </Typography.Text>
                          <Select
                            onChange={(value) => setEditCategory(value === 'null' ? null : (value as LoreCategory))}
                            options={categoryOptions}
                            style={w100}
                            value={(editCategory ?? 'null') as any}
                          />
                        </div>

                        <div>
                          <Typography.Text style={S.fieldLabelTextSm} type="secondary">
                            Content
                          </Typography.Text>
                          <TextArea
                            onChange={(event) => setEditContent(event.target.value)}
                            placeholder="Lore content (free text or markdown)"
                            rows={12}
                            value={editContent}
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
                            Hidden lores only appear to the GM.
                          </Typography.Text>
                        </div>
                        <Switch
                          checked={isLoreVisible(openLore)}
                          checkedChildren={<EyeOutlined />}
                          onChange={() => void toggleVisible(openLore)}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>
                    </Card>

                    <TagSelect entityId={openLore.id} entityType="lore" />

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
    openLore && !mobileOnly ? (
      <Drawer
        extra={
          isGM ? (
            <Space>
              <Popconfirm
                cancelText="Cancel"
                okText="Remove"
                onConfirm={() => void removeCurrentLore()}
                title="Remove this lore permanently?"
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
        onClose={closeLorePanels}
        open
        size={640}
        title={
          <Space size={8} wrap>
            <span style={S.drawerTitleText}>{openLore.title}</span>
            {openLore.category ? (
              <Tag color={CATEGORY_COLOR[openLore.category]}>{categoryLabel(openLore.category)}</Tag>
            ) : null}
            <Tag color={isLoreVisible(openLore) ? 'green' : 'red'}>
              {isLoreVisible(openLore) ? 'Visible' : 'Hidden'}
            </Tag>
            <Badge count={`#${openLore.id}`} style={S.drawerBadge} />
          </Space>
        }
      >
        <Tabs activeKey={drawerTab} items={desktopDrawerItems} onChange={(key) => setDrawerTab(key as DrawerTab)} />
      </Drawer>
    ) : null;

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} lores
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
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search lores..." value={search} />
      <S.MobileFilterRow>
        <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
          <FilterOutline fontSize={17} /> Filters
        </AdmMobileButton>
        {isGM && viewMode === 'admin' ? (
          <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
            <AddOutline fontSize={17} /> New lore
          </AdmMobileButton>
        ) : null}
      </S.MobileFilterRow>
    </>
  );

  const mobileOverview = openLore ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Content">
        <S.MobileBodyText>{openLore.content?.trim() || 'No content recorded yet.'}</S.MobileBodyText>
      </MobileCard>

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Category</S.MobileDetailLabel>
            <S.MobileDetailValue>{categoryLabel(openLore.category)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Visibility</S.MobileDetailLabel>
            <S.MobileDetailValue>{isLoreVisible(openLore) ? 'Visible' : 'Hidden'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Lore ID</S.MobileDetailLabel>
            <S.MobileDetailValue>#{openLore.id}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Created</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateTime(openLore.createdAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Updated</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateTime(openLore.updatedAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
        </S.MobileDetailGrid>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const mobileGM = openLore ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isLoreVisible(openLore)} onChange={() => void toggleVisible(openLore)} />
        </S.MobileVisibilityRow>
      </MobileCard>

      <MobileCard compact title="Lore data">
        <MobileForm>
          <MobileForm.Item label="Title">
            <AdmMobileInput clearable onChange={setEditTitle} placeholder="Lore title" value={editTitle} />
          </MobileForm.Item>
          <MobileForm.Item label="Category">
            <MobileSelector
              columns={2}
              inset={false}
              onChange={(values) => {
                const value = values[0] as LoreCategory | 'null' | undefined;
                setEditCategory(!value || value === 'null' ? null : value);
              }}
              options={categoryOptions}
              value={[editCategory ?? 'null']}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Content">
            <AdmMobileTextArea
              autoSize={{ minRows: 7, maxRows: 12 }}
              onChange={setEditContent}
              placeholder="Lore content"
              value={editContent}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Tags">
        <TagSelect entityId={openLore.id} entityType="lore" />
      </MobileCard>

      <MobileCard compact title="Danger zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>Deleting a lore entry removes it permanently from the archive.</S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete lore
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  if (mobileOnly) {
    const displayItems = viewMode === 'admin' && isGM ? adminItems : publicItems;

    return (
      <>
        <PageTitle>Lores</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'public' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('public')}
                  size="small"
                >
                  Lores
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
              ? 'Create, publish and edit lore records from the mobile GM panel.'
              : 'Historical, cultural and scientific records of the Algol system.'
          }
          title={
            viewMode === 'admin' ? (
              <IconLabel icon="gm">GM Lores</IconLabel>
            ) : (
              <IconLabel icon="lore">Lore Archive</IconLabel>
            )
          }
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !displayItems.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No lores found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileLoresGrid>
              {displayItems.map((lore) => {
                const category = lore.category ?? null;

                return (
                  <MobileCard compact key={lore.id}>
                    <S.MobileLoreBody>
                      <S.MobileLoreHeader>
                        <S.MobileLoreIdentity>
                          <S.MobileLoreTitle>{lore.title}</S.MobileLoreTitle>
                          <S.MobileMetaTags>
                            <AdmMobileTag
                              color={category ? MOBILE_CATEGORY_COLOR[category] : 'primary'}
                              fill="outline"
                              round
                            >
                              {categoryLabel(category)}
                            </AdmMobileTag>
                            {isGM && viewMode === 'admin' ? (
                              <AdmMobileTag color={isLoreVisible(lore) ? 'success' : 'warning'} fill="outline" round>
                                {isLoreVisible(lore) ? 'Visible' : 'Hidden'}
                              </AdmMobileTag>
                            ) : null}
                          </S.MobileMetaTags>
                        </S.MobileLoreIdentity>
                      </S.MobileLoreHeader>

                      <S.MobileLorePreview>{getLorePreview(lore)}</S.MobileLorePreview>

                      <S.MobileLoreActions>
                        <AdmMobileButton block color="primary" onClick={() => openLoreSheet(lore, 'overview')}>
                          Open lore
                        </AdmMobileButton>
                        {isGM && viewMode === 'admin' ? (
                          <AdmMobileButton block fill="outline" onClick={() => openLoreSheet(lore, 'gm')}>
                            <SetOutline fontSize={17} /> GM controls
                          </AdmMobileButton>
                        ) : (
                          <AdmMobileButton block fill="outline" onClick={() => openLoreSheet(lore, 'overview')}>
                            Read
                          </AdmMobileButton>
                        )}
                      </S.MobileLoreActions>
                    </S.MobileLoreBody>
                  </MobileCard>
                );
              })}
            </S.MobileLoresGrid>
          )}
        </MobilePageScaffold>

        <MobileFilterSheet
          description="Filter the lore archive by category. GM mode can also filter visibility."
          footer={
            <MobileActionBar sticky={false}>
              <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                Done
              </AdmMobileButton>
            </MobileActionBar>
          }
          onClose={() => setFilterSheetOpen(false)}
          title="Lore filters"
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
                    { label: 'Lores', value: 'public' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileCreateField>
            ) : null}

            <S.MobileCreateField>
              <S.MobileFieldLabel>Category</S.MobileFieldLabel>
              <MobileSelector
                columns={2}
                inset={false}
                onChange={(values) => setFilterCategory((values[0] as CategoryFilter | undefined) ?? 'all')}
                options={categoryFilterOptions}
                value={[filterCategory]}
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
            openLore
              ? isGM
                ? 'Lore content and GM controls for this archive entry.'
                : 'Lore content from the campaign archive.'
              : undefined
          }
          footer={
            openLore && isGM && mobileSheetTab === 'gm' ? (
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
          onClose={closeLorePanels}
          subtitle={openLore ? categoryLabel(openLore.category) : undefined}
          title={openLore?.title ?? 'Lore'}
          visible={Boolean(openLore)}
        >
          {openLore && isGM ? (
            <MobileTabs
              activeKey={mobileSheetTab}
              items={[
                { key: 'overview', title: 'Overview', children: mobileOverview },
                { key: 'gm', title: 'GM', children: mobileGM },
              ]}
              onChange={(key) => setMobileSheetTab(key as LoreSheetTab)}
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
              text: 'Delete lore',
              bold: true,
              danger: true,
              onClick: () => removeCurrentLore(),
            },
          ]}
          content={openLore ? `Delete "${openLore.title}" permanently from the lore archive?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete lore?"
          visible={deleteDialogOpen}
        />

        <MobileEntitySheet
          description="Create a lore archive entry from mobile."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingLore} onClick={() => void handleCreateLore()}>
                  Create lore
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
          title="New lore"
          visible={creating && isGM && viewMode === 'admin'}
        >
          <MobileCard compact title="Lore details">
            <MobileForm>
              <MobileForm.Item label="Title">
                <AdmMobileInput clearable onChange={setNewTitle} placeholder="Lore title" value={newTitle} />
              </MobileForm.Item>
              <MobileForm.Item label="Category">
                <MobileSelector
                  columns={2}
                  inset={false}
                  onChange={(values) => {
                    const value = values[0] as LoreCategory | 'null' | undefined;
                    setNewCategory(!value || value === 'null' ? null : value);
                  }}
                  options={categoryOptions}
                  value={[newCategory ?? 'null']}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Content">
                <AdmMobileTextArea
                  autoSize={{ minRows: 6, maxRows: 10 }}
                  onChange={setNewContent}
                  placeholder="Lore content"
                  value={newContent}
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
      <PageTitle>Lores</PageTitle>

      {desktopHeader}
      {viewMode === 'admin' && isGM ? loading ? <Spinner /> : adminDesktopTable : publicView}
      {detailDrawer}
    </>
  );
};

export default LoresAdminPage;
