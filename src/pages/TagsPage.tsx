/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Empty, Modal, Popconfirm, Space, Spin, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, TagOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Input } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { AppIconName, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';
import { listTags, createTag, updateTag, deleteTag, getTagEntities } from '@app/api/tags.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Tag as TagType, TagEntities } from '@app/types/rpg';
import { m0, w100, textSm, textMd, spaceBetween } from '@app/styles/styleUtils';
import * as S from './TagsPage.styles';

const GM_KEY = 'gm_api_key';

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

const EntityDetailModal: React.FC<{
  entityType: string | null;
  item: any | null;
  onClose: () => void;
}> = ({ entityType, item, onClose }) => {
  if (!item || !entityType) return null;

  const title = item.name ?? item.title ?? '-';
  const fields = ENTITY_DETAIL_FIELDS[entityType] ?? [];
  const meta = ENTITY_META[entityType];
  const label = meta ? <IconLabel icon={meta.icon}>{meta.label}</IconLabel> : entityType;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      title={
        <Space size={8}>
          <Typography.Text type="secondary" style={S.detailModalTitleLabel}>
            {label}
          </Typography.Text>
          <Typography.Text strong>{title}</Typography.Text>
        </Space>
      }
      width={480}
    >
      <Space orientation="vertical" size={12} style={w100}>
        {item.imageUrl && (
          <img src={resolveApiUrl(item.imageUrl)} alt={item.imageAlt ?? title} style={S.detailAvatar} />
        )}
        {fields.map(({ label: fieldLabel, key }) => {
          const value = item[key];
          if (value == null || value === '') return null;

          return (
            <div key={key}>
              <Typography.Text type="secondary" style={S.detailFieldLabel}>
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
      <Typography.Text type="secondary" style={S.entityGroupLabel}>
        {label}
      </Typography.Text>
      <div style={S.entityGroupItems}>
        {items.map((item: any) => (
          <Tag key={item.id} style={S.entityTag} onClick={() => onSelect(entityType, item)}>
            {item.imageUrl && (
              <img
                src={resolveApiUrl(item.imageUrl)}
                alt={item.imageAlt ?? item.name ?? ''}
                style={S.entityTagAvatar}
              />
            )}
            {item.name ?? item.title}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export const TagsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY));

  const [tags, setTags] = React.useState<TagType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#1677ff');
  const [creating, setCreating] = React.useState(false);

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('#1677ff');

  const [selectedTag, setSelectedTag] = React.useState<TagType | null>(null);
  const [tagEntities, setTagEntities] = React.useState<TagEntities | null>(null);
  const [entitiesLoading, setEntitiesLoading] = React.useState(false);

  const [detailType, setDetailType] = React.useState<string | null>(null);
  const [detailItem, setDetailItem] = React.useState<any | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setTags(await listTags());
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load tags'));
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return message.warning('Name required');

    setCreating(true);
    try {
      const created = await createTag({ name, color: newColor });
      setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewColor('#1677ff');
      message.success('Tag created');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create tag'));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(tag: TagType) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  async function saveEdit(tag: TagType) {
    try {
      await updateTag(tag.id, { name: editName.trim(), color: editColor });
      setTags((prev) =>
        prev
          .map((item) => (item.id === tag.id ? { ...item, name: editName.trim(), color: editColor } : item))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      if (selectedTag?.id === tag.id) {
        setSelectedTag((prev) => (prev ? { ...prev, name: editName.trim(), color: editColor } : prev));
      }

      setEditingId(null);
      message.success('Tag updated');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update tag'));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((tag) => tag.id !== id));
      if (selectedTag?.id === id) {
        setSelectedTag(null);
        setTagEntities(null);
      }
      message.success('Tag deleted');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to delete tag'));
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = tags.filter((tag) => !query || tag.name.toLowerCase().includes(query));

  const totalEntities = tagEntities
    ? Object.values(tagEntities)
        .filter(Array.isArray)
        .reduce((sum: number, items: any[]) => sum + items.length, 0)
    : 0;

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
              <Typography.Text type="secondary" style={textMd}>
                Click a tag to see all entities with that label.
              </Typography.Text>
              <Input
                allowClear
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Space>
          </Card>

          {isGM && (
            <Card density="dense" title={<IconLabel icon="add">New Tag</IconLabel>}>
              <form onSubmit={(e) => void handleCreate(e)}>
                <Space orientation="vertical" size={8} style={w100}>
                  <Input
                    placeholder="Tag name *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                  <Space size={8}>
                    <Typography.Text style={textSm}>Color:</Typography.Text>
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      style={S.colorInput}
                    />
                    <Tag color={newColor}>{newName || 'preview'}</Tag>
                  </Space>
                  <Button type="primary" htmlType="submit" loading={creating} block>
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
                    style={S.selectedTagRow(selectedTag?.id === tag.id)}
                    onClick={() => void loadTagEntities(tag)}
                  >
                    {editingId === tag.id ? (
                      <>
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          style={S.editColorInput}
                        />
                        <input
                          style={S.editNameInput}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void saveEdit(tag);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="small"
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            void saveEdit(tag);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
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
                          <Space size={4} onClick={(e) => e.stopPropagation()}>
                            <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(tag)} />
                            <Popconfirm
                              title={`Delete tag "${tag.name}"? It will be removed from all entities.`}
                              okText="Delete"
                              cancelText="Cancel"
                              onConfirm={() => void handleDelete(tag.id)}
                            >
                              <Button size="small" danger icon={<DeleteOutlined />} />
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
                    <Typography.Text type="secondary" style={textSm}>
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
                        key={key}
                        label={<IconLabel icon={meta.icon}>{meta.label}</IconLabel>}
                        entityType={key}
                        items={items ?? []}
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
