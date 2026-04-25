/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Empty, Modal, Popconfirm, Space, Spin, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, TagOutlined } from '@ant-design/icons';
import { Button as AdmMobileButton, Input as AdmMobileInput, SpinLoading, Tag as AdmMobileTag } from 'antd-mobile';
import { AddOutline, DeleteOutline, EditSOutline } from 'antd-mobile-icons';

import { resolveApiUrl } from '@app/api/http.api';
import { createTag, deleteTag, getTagEntities, listTags, updateTag } from '@app/api/tags.api';
import { AppIconName, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { Card } from '@app/components/common/Card/Card';
import {
  MobileActionBar,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobileForm,
  MobileList,
  MobilePageScaffold,
  MobileSearchBar,
} from '@app/components/common/mobile';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Input } from '@app/components/common/inputs/Input/Input';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import { m0, spaceBetween, textMd, textSm, w100 } from '@app/styles/styleUtils';
import type { Tag as TagType, TagEntities } from '@app/types/rpg';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './TagsPage.styles';

const ENTITY_META: Record<string, { icon: AppIconName; label: string }> = {
  beasts: { icon: 'beast', label: 'Beasts' },
  npcs: { icon: 'npc', label: 'NPCs' },
  cities: { icon: 'location', label: 'Cities' },
  dungeons: { icon: 'dungeon', label: 'Dungeons' },
  worlds: { icon: 'world', label: 'Worlds' },
  players: { icon: 'player', label: 'Players' },
  lores: { icon: 'lore', label: 'Lores' },
  quests: { icon: 'quest', label: 'Quests' },
};

const ENTITY_DETAIL_FIELDS: Record<string, Array<{ label: string; key: string }>> = {
  beasts: [
    { label: 'Type', key: 'type' },
    { label: 'Habitat', key: 'habitat' },
    { label: 'Description', key: 'description' },
  ],
  npcs: [
    { label: 'Role', key: 'role' },
    { label: 'Location', key: 'location' },
    { label: 'Description', key: 'description' },
  ],
  cities: [{ label: 'Description', key: 'description' }],
  dungeons: [
    { label: 'Type', key: 'type' },
    { label: 'Region', key: 'region' },
    { label: 'Description', key: 'description' },
  ],
  worlds: [{ label: 'Description', key: 'description' }],
  players: [
    { label: 'Level', key: 'level' },
    { label: 'Background', key: 'background' },
  ],
  lores: [
    { label: 'Category', key: 'category' },
    { label: 'Content', key: 'content' },
  ],
  quests: [
    { label: 'Status', key: 'status' },
    { label: 'Description', key: 'description' },
    { label: 'Reward', key: 'reward' },
  ],
};

function entityTitle(item: any) {
  return item?.name ?? item?.title ?? '-';
}

function entityPreview(item: any) {
  const preview = item?.description ?? item?.content ?? item?.background ?? item?.status;
  return preview == null || preview === '' ? undefined : String(preview);
}

const EntityDetailModal: React.FC<{
  entityType: string | null;
  item: any | null;
  onClose: () => void;
}> = ({ entityType, item, onClose }) => {
  if (!item || !entityType) return null;

  const title = entityTitle(item);
  const fields = ENTITY_DETAIL_FIELDS[entityType] ?? [];
  const meta = ENTITY_META[entityType];
  const label = meta ? <IconLabel icon={meta.icon}>{meta.label}</IconLabel> : entityType;

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open
      title={
        <Space size={8}>
          <Typography.Text style={S.detailModalTitleLabel} type="secondary">
            {label}
          </Typography.Text>
          <Typography.Text strong>{title}</Typography.Text>
        </Space>
      }
      width={480}
    >
      <Space orientation="vertical" size={12} style={w100}>
        {item.imageUrl ? (
          <img alt={item.imageAlt ?? title} src={resolveApiUrl(item.imageUrl)} style={S.detailAvatar} />
        ) : null}
        {fields.map(({ label: fieldLabel, key }) => {
          const value = item[key];
          if (value == null || value === '') return null;

          return (
            <div key={key}>
              <Typography.Text style={S.detailFieldLabel} type="secondary">
                {fieldLabel}
              </Typography.Text>
              <Typography.Text style={S.detailFieldValue}>{String(value)}</Typography.Text>
            </div>
          );
        })}
      </Space>
    </Modal>
  );
};

const EntityGroup: React.FC<{
  label: React.ReactNode;
  entityType: string;
  items: any[];
  onSelect: (type: string, item: any) => void;
}> = ({ label, entityType, items, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <Typography.Text style={S.entityGroupLabel} type="secondary">
        {label}
      </Typography.Text>
      <div style={S.entityGroupItems}>
        {items.map((item: any) => (
          <Tag key={item.id} onClick={() => onSelect(entityType, item)} style={S.entityTag}>
            {item.imageUrl ? (
              <img
                alt={item.imageAlt ?? item.name ?? ''}
                src={resolveApiUrl(item.imageUrl)}
                style={S.entityTagAvatar}
              />
            ) : null}
            {entityTitle(item)}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export const TagsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = useGMMode();

  const [tags, setTags] = React.useState<TagType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#1677ff');
  const [creating, setCreating] = React.useState(false);
  const [creatingTag, setCreatingTag] = React.useState(false);

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('#1677ff');

  const [selectedTag, setSelectedTag] = React.useState<TagType | null>(null);
  const [tagEntities, setTagEntities] = React.useState<TagEntities | null>(null);
  const [entitiesLoading, setEntitiesLoading] = React.useState(false);

  const [detailType, setDetailType] = React.useState<string | null>(null);
  const [detailItem, setDetailItem] = React.useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TagType | null>(null);

  const editingTag = React.useMemo(() => tags.find((tag) => tag.id === editingId) ?? null, [editingId, tags]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setTags((await listTags()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load tags.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function loadTagEntities(tag: TagType) {
    setSelectedTag(tag);
    setTagEntities(null);
    setEntitiesLoading(true);

    try {
      setTagEntities(await getTagEntities(tag.id));
    } catch {
      setTagEntities(null);
    } finally {
      setEntitiesLoading(false);
    }
  }

  function resetCreateForm() {
    setNewName('');
    setNewColor('#1677ff');
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      message.warning('Name required.');
      return;
    }

    setCreatingTag(true);
    try {
      const created = await createTag({ name, color: newColor });
      setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      resetCreateForm();
      setCreating(false);
      message.success('Tag created.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create tag.'));
    } finally {
      setCreatingTag(false);
    }
  }

  function startEdit(tag: TagType) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditColor('#1677ff');
  }

  async function saveEdit(tag: TagType) {
    const name = editName.trim();
    if (!name) {
      message.warning('Name required.');
      return;
    }

    try {
      await updateTag(tag.id, { name, color: editColor });
      setTags((prev) =>
        prev
          .map((item) => (item.id === tag.id ? { ...item, name, color: editColor } : item))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      if (selectedTag?.id === tag.id) {
        setSelectedTag((prev) => (prev ? { ...prev, name, color: editColor } : prev));
      }

      cancelEdit();
      message.success('Tag updated.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update tag.'));
    }
  }

  async function handleDelete(tag: TagType) {
    try {
      await deleteTag(tag.id);
      setTags((prev) => prev.filter((item) => item.id !== tag.id));
      if (selectedTag?.id === tag.id) {
        setSelectedTag(null);
        setTagEntities(null);
      }
      if (editingId === tag.id) {
        cancelEdit();
      }
      setDeleteTarget(null);
      message.success('Tag deleted.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to delete tag.'));
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = tags.filter((tag) => !query || tag.name.toLowerCase().includes(query));

  const totalEntities = tagEntities
    ? Object.values(tagEntities)
        .filter(Array.isArray)
        .reduce((sum: number, items: any[]) => sum + items.length, 0)
    : 0;

  const mobileEntityDetail =
    detailItem && detailType ? (
      <S.MobileSectionStack>
        {detailItem.imageUrl ? (
          <MobileCard compact>
            <S.MobileAvatar
              alt={detailItem.imageAlt ?? entityTitle(detailItem)}
              src={resolveApiUrl(detailItem.imageUrl)}
            />
          </MobileCard>
        ) : null}

        <MobileCard compact title="Details">
          <S.MobileDetailGrid>
            {(ENTITY_DETAIL_FIELDS[detailType] ?? []).map(({ label, key }) => {
              const value = detailItem[key];
              if (value == null || value === '') return null;

              return (
                <S.MobileDetailItem key={key}>
                  <S.MobileDetailLabel>{label}</S.MobileDetailLabel>
                  <S.MobileDetailValue>{String(value)}</S.MobileDetailValue>
                </S.MobileDetailItem>
              );
            })}
          </S.MobileDetailGrid>
        </MobileCard>
      </S.MobileSectionStack>
    ) : null;

  const mobileTagEntities = selectedTag ? (
    entitiesLoading ? (
      <MobileCard compact>
        <S.MobileEmptyState>
          <SpinLoading color="primary" />
        </S.MobileEmptyState>
      </MobileCard>
    ) : !tagEntities ? (
      <MobileCard compact>
        <S.MobileEmptyState>Failed to load entities.</S.MobileEmptyState>
      </MobileCard>
    ) : totalEntities === 0 ? (
      <MobileCard compact>
        <S.MobileEmptyState>No entities have this tag yet.</S.MobileEmptyState>
      </MobileCard>
    ) : (
      <S.MobileSectionStack>
        {Object.entries(ENTITY_META).map(([key, meta]) => {
          const items = ((tagEntities as any)[key] as any[]) ?? [];
          if (!items.length) return null;

          return (
            <MobileCard compact key={key} title={<IconLabel icon={meta.icon}>{meta.label}</IconLabel>}>
              <MobileList inset={false}>
                {items.map((item) => {
                  const preview = entityPreview(item);

                  return (
                    <MobileList.Item
                      description={preview ? <S.MobileEntityPreview>{preview}</S.MobileEntityPreview> : undefined}
                      key={item.id}
                      onClick={() => {
                        setDetailType(key);
                        setDetailItem(item);
                      }}
                    >
                      {entityTitle(item)}
                    </MobileList.Item>
                  );
                })}
              </MobileList>
            </MobileCard>
          );
        })}
      </S.MobileSectionStack>
    )
  ) : null;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Tags</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
                <AddOutline fontSize={17} /> New tag
              </AdmMobileButton>
            ) : null
          }
          filters={<MobileSearchBar inset={false} onChange={setSearch} placeholder="Search tags..." value={search} />}
          meta={
            <S.MobileMetaTags>
              <AdmMobileTag fill="outline" round>
                {tags.length} tags
              </AdmMobileTag>
              {selectedTag ? (
                <AdmMobileTag color="primary" fill="outline" round>
                  {selectedTag.name}
                </AdmMobileTag>
              ) : null}
            </S.MobileMetaTags>
          }
          subtitle="Browse campaign labels and inspect every linked entity from mobile."
          title={<IconLabel icon="tags">Tags</IconLabel>}
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !filtered.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No tags found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileTagsGrid>
              {filtered.map((tag) => (
                <MobileCard compact key={tag.id}>
                  <S.MobileTagBody>
                    <S.MobileTagHeader>
                      <S.MobileTagIdentity>
                        <S.MobileMetaTags>
                          <S.MobileColorDot $color={tag.color} />
                          <AdmMobileTag fill="outline" round>
                            #{tag.id}
                          </AdmMobileTag>
                        </S.MobileMetaTags>
                        <S.MobileTagName>{tag.name}</S.MobileTagName>
                      </S.MobileTagIdentity>
                    </S.MobileTagHeader>

                    <S.MobileTagActions>
                      <AdmMobileButton block color="primary" onClick={() => void loadTagEntities(tag)}>
                        Open tag
                      </AdmMobileButton>
                      {isGM ? (
                        <AdmMobileButton block fill="outline" onClick={() => startEdit(tag)}>
                          <EditSOutline fontSize={17} /> Edit
                        </AdmMobileButton>
                      ) : (
                        <AdmMobileButton block fill="outline" onClick={() => void loadTagEntities(tag)}>
                          Entities
                        </AdmMobileButton>
                      )}
                    </S.MobileTagActions>
                  </S.MobileTagBody>
                </MobileCard>
              ))}
            </S.MobileTagsGrid>
          )}
        </MobilePageScaffold>

        <MobileEntitySheet
          description={selectedTag ? `Linked entities for ${selectedTag.name}.` : undefined}
          onClose={() => {
            setSelectedTag(null);
            setTagEntities(null);
          }}
          subtitle={selectedTag ? `${totalEntities} linked entities` : undefined}
          title={selectedTag?.name ?? 'Tag'}
          visible={Boolean(selectedTag)}
        >
          {mobileTagEntities}
        </MobileEntitySheet>

        <MobileEntitySheet
          description="Create a reusable campaign label."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingTag} onClick={() => void handleCreate()}>
                  Create tag
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
          title="New tag"
          visible={creating && isGM}
        >
          <MobileCard compact title="Tag details">
            <MobileForm>
              <MobileForm.Item label="Name">
                <AdmMobileInput
                  clearable
                  onChange={setNewName}
                  placeholder="Faction, planet, mystery..."
                  value={newName}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Color">
                <S.MobileColorField>
                  <S.MobileColorInput
                    onChange={(event) => setNewColor(event.target.value)}
                    type="color"
                    value={newColor}
                  />
                  <AdmMobileTag fill="outline" round>
                    {newName || 'preview'}
                  </AdmMobileTag>
                </S.MobileColorField>
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
        </MobileEntitySheet>

        <MobileEntitySheet
          description={editingTag ? `Update ${editingTag.name}.` : undefined}
          footer={
            editingTag ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton block color="primary" onClick={() => void saveEdit(editingTag)}>
                    Save changes
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block fill="outline" onClick={cancelEdit}>
                    Cancel
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={cancelEdit}
          subtitle="GM only"
          title="Edit tag"
          visible={Boolean(editingTag) && isGM}
        >
          <MobileCard compact title="Tag details">
            <MobileForm>
              <MobileForm.Item label="Name">
                <AdmMobileInput clearable onChange={setEditName} placeholder="Tag name" value={editName} />
              </MobileForm.Item>
              <MobileForm.Item label="Color">
                <S.MobileColorField>
                  <S.MobileColorInput
                    onChange={(event) => setEditColor(event.target.value)}
                    type="color"
                    value={editColor}
                  />
                  <AdmMobileTag fill="outline" round>
                    {editName || 'preview'}
                  </AdmMobileTag>
                </S.MobileColorField>
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>

          {editingTag ? (
            <MobileCard compact title="Danger zone">
              <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteTarget(editingTag)}>
                <DeleteOutline fontSize={17} /> Delete tag
              </AdmMobileButton>
            </MobileCard>
          ) : null}
        </MobileEntitySheet>

        <MobileEntitySheet
          description={detailType ? ENTITY_META[detailType]?.label : undefined}
          onClose={() => {
            setDetailType(null);
            setDetailItem(null);
          }}
          title={detailItem ? entityTitle(detailItem) : 'Entity'}
          visible={Boolean(detailItem)}
        >
          {mobileEntityDetail}
        </MobileEntitySheet>

        <MobileDialog
          actions={[
            {
              key: 'cancel',
              text: 'Cancel',
              onClick: () => setDeleteTarget(null),
            },
            {
              key: 'delete',
              text: 'Delete tag',
              bold: true,
              danger: true,
              onClick: () => {
                if (deleteTarget) {
                  return handleDelete(deleteTarget);
                }
              },
            },
          ]}
          content={deleteTarget ? `Delete "${deleteTarget.name}"? It will be removed from all entities.` : ''}
          onClose={() => setDeleteTarget(null)}
          title="Delete tag?"
          visible={Boolean(deleteTarget)}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle>Tags</PageTitle>

      <EntityDetailModal
        entityType={detailType}
        item={detailItem}
        onClose={() => {
          setDetailType(null);
          setDetailItem(null);
        }}
      />

      <div style={S.layoutGrid(mobileOnly)}>
        <div style={S.sidebarColumn}>
          <Card density="dense">
            <Space orientation="vertical" size={10} style={w100}>
              <Typography.Title level={4} style={m0}>
                <IconLabel icon="tags">Tags</IconLabel>
              </Typography.Title>
              <Typography.Text style={textMd} type="secondary">
                Click a tag to see all entities with that label.
              </Typography.Text>
              <Input
                allowClear
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tags..."
                value={search}
              />
            </Space>
          </Card>

          {isGM && (
            <Card density="dense" title={<IconLabel icon="add">New Tag</IconLabel>}>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleCreate();
                }}
              >
                <Space orientation="vertical" size={8} style={w100}>
                  <Input
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Tag name *"
                    required
                    value={newName}
                  />
                  <Space size={8}>
                    <Typography.Text style={textSm}>Color:</Typography.Text>
                    <input
                      onChange={(event) => setNewColor(event.target.value)}
                      style={S.colorInput}
                      type="color"
                      value={newColor}
                    />
                    <Tag color={newColor}>{newName || 'preview'}</Tag>
                  </Space>
                  <Button block htmlType="submit" loading={creatingTag} type="primary">
                    Create Tag
                  </Button>
                </Space>
              </form>
            </Card>
          )}

          <Card density="dense" title={`Tags (${filtered.length})`}>
            {loading ? (
              <Spinner />
            ) : filtered.length === 0 ? (
              <Empty description="No tags yet." />
            ) : (
              <Space orientation="vertical" size={4} style={w100}>
                {filtered.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => void loadTagEntities(tag)}
                    style={S.selectedTagRow(selectedTag?.id === tag.id)}
                  >
                    {editingId === tag.id ? (
                      <>
                        <input
                          onChange={(event) => setEditColor(event.target.value)}
                          style={S.editColorInput}
                          type="color"
                          value={editColor}
                        />
                        <input
                          autoFocus
                          onChange={(event) => setEditName(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void saveEdit(tag);
                            if (event.key === 'Escape') cancelEdit();
                          }}
                          style={S.editNameInput}
                          value={editName}
                        />
                        <Button
                          onClick={(event) => {
                            event.stopPropagation();
                            void saveEdit(tag);
                          }}
                          size="small"
                          type="primary"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={(event) => {
                            event.stopPropagation();
                            cancelEdit();
                          }}
                          size="small"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Tag color={tag.color} icon={<TagOutlined />} style={S.selectedTagChip}>
                          {tag.name}
                        </Tag>
                        {isGM && (
                          <Space onClick={(event) => event.stopPropagation()} size={4}>
                            <Button icon={<EditOutlined />} onClick={() => startEdit(tag)} size="small" />
                            <Popconfirm
                              cancelText="Cancel"
                              okText="Delete"
                              onConfirm={() => void handleDelete(tag)}
                              title={`Delete tag "${tag.name}"? It will be removed from all entities.`}
                            >
                              <Button danger icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                          </Space>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </div>

        <Card density="dense" style={S.detailCard}>
          {!selectedTag ? (
            <div style={S.emptySelection}>
              <TagOutlined style={S.emptySelectionIcon} />
              <div style={S.emptySelectionText}>Select a tag to see its entities</div>
            </div>
          ) : (
            <Space orientation="vertical" size={16} style={w100}>
              <Space size={8} style={spaceBetween} wrap>
                <Space size={8}>
                  <Tag color={selectedTag.color} style={S.selectedTagPill}>
                    <TagOutlined /> {selectedTag.name}
                  </Tag>
                  {!entitiesLoading && tagEntities && (
                    <Typography.Text style={textSm} type="secondary">
                      {totalEntities} {totalEntities === 1 ? 'entity' : 'entities'}
                    </Typography.Text>
                  )}
                </Space>
              </Space>

              <Divider style={m0} />

              {entitiesLoading ? (
                <div style={S.loadingState}>
                  <Spin size="large" />
                </div>
              ) : !tagEntities ? (
                <Empty description="Failed to load entities." />
              ) : totalEntities === 0 ? (
                <Empty description="No entities have this tag yet." />
              ) : (
                <Space orientation="vertical" size={16} style={w100}>
                  {Object.entries(ENTITY_META).map(([key, meta]) => {
                    const items = (tagEntities as any)[key] as any[];
                    return (
                      <EntityGroup
                        entityType={key}
                        items={items ?? []}
                        key={key}
                        label={<IconLabel icon={meta.icon}>{meta.label}</IconLabel>}
                        onSelect={(type, item) => {
                          setDetailType(type);
                          setDetailItem(item);
                        }}
                      />
                    );
                  })}
                </Space>
              )}
            </Space>
          )}
        </Card>
      </div>
    </>
  );
};

export default TagsPage;
