/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Empty, Modal, Popconfirm, Space, Spin, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, TagOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Input } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';
import { listTags, createTag, updateTag, deleteTag, getTagEntities } from '@app/api/tags.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Tag as TagType, TagEntities } from '@app/types/rpg';
import { m0, w100, textSm, textMd, spaceBetween } from '@app/styles/styleUtils';

const GM_KEY = 'gm_api_key';

const ENTITY_LABELS: Record<string, string> = {
  beasts: '🦎 Beasts',
  npcs: '🧑 NPCs',
  cities: '🏙️ Cities',
  dungeons: '⚔️ Dungeons',
  worlds: '🌍 Worlds',
  players: '👤 Players',
  lores: '📖 Lores',
  quests: '🏴 Quests',
};

// ── Entity detail fields by type ─────────────────────────────────────────────
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

// ── Entity detail modal ───────────────────────────────────────────────────────
const EntityDetailModal: React.FC<{
  entityType: string | null;
  item: any | null;
  onClose: () => void;
}> = ({ entityType, item, onClose }) => {
  if (!item || !entityType) return null;
  const title = item.name ?? item.title ?? '—';
  const fields = ENTITY_DETAIL_FIELDS[entityType] ?? [];
  const label = ENTITY_LABELS[entityType] ?? entityType;

  return (
    <Modal
      visible
      onCancel={onClose}
      footer={null}
      title={
        <Space size={8}>
          <Typography.Text type="secondary" style={textSm}>
            {label}
          </Typography.Text>
          <Typography.Text strong>{title}</Typography.Text>
        </Space>
      }
      width={480}
    >
      <Space orientation="vertical" size={12} style={w100}>
        {item.imageUrl && (
          <img
            src={resolveApiUrl(item.imageUrl)}
            alt={item.imageAlt ?? title}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        {fields.map(({ label: fl, key }) => {
          const val = item[key];
          if (val == null || val === '') return null;
          return (
            <div key={key}>
              <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 2 }}>
                {fl}
              </Typography.Text>
              <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{String(val)}</Typography.Text>
            </div>
          );
        })}
      </Space>
    </Modal>
  );
};

// ── Entity list inside the tag panel ─────────────────────────────────────────
const EntityGroup: React.FC<{
  label: string;
  entityType: string;
  items: any[];
  onSelect: (type: string, item: any) => void;
}> = ({ label, entityType, items, onSelect }) => {
  if (items.length === 0) return null;
  return (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </Typography.Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {items.map((item: any) => (
          <Tag key={item.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(entityType, item)}>
            {item.imageUrl && (
              <img
                src={resolveApiUrl(item.imageUrl)}
                alt={item.imageAlt ?? item.name ?? ''}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: 4,
                  verticalAlign: 'middle',
                }}
              />
            )}
            {item.name ?? item.title}
          </Tag>
        ))}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const TagsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY));

  const [tags, setTags] = React.useState<TagType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Create form
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#1677ff');
  const [creating, setCreating] = React.useState(false);

  // Edit inline
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('#1677ff');

  // Tag detail panel
  const [selectedTag, setSelectedTag] = React.useState<TagType | null>(null);
  const [tagEntities, setTagEntities] = React.useState<TagEntities | null>(null);
  const [entitiesLoading, setEntitiesLoading] = React.useState(false);

  // Entity detail modal
  const [detailType, setDetailType] = React.useState<string | null>(null);
  const [detailItem, setDetailItem] = React.useState<any | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setTags(await listTags());
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load tags'));
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
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create tag'));
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
          .map((t) => (t.id === tag.id ? { ...t, name: editName.trim(), color: editColor } : t))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      if (selectedTag?.id === tag.id)
        setSelectedTag((prev) => (prev ? { ...prev, name: editName.trim(), color: editColor } : prev));
      setEditingId(null);
      message.success('Tag updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update tag'));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      if (selectedTag?.id === id) {
        setSelectedTag(null);
        setTagEntities(null);
      }
      message.success('Tag deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete tag'));
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = tags.filter((t) => !q || t.name.toLowerCase().includes(q));

  const totalEntities = tagEntities
    ? Object.values(tagEntities)
        .filter(Array.isArray)
        .reduce((s: number, arr: any[]) => s + arr.length, 0)
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileOnly ? '1fr' : 'minmax(280px,360px) 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* ── Left: tag list ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card density="dense">
            <Space orientation="vertical" size={10} style={w100}>
              <Typography.Title level={4} style={m0}>
                🏷️ Tags
              </Typography.Title>
              <Typography.Text type="secondary" style={textMd}>
                Click a tag to see all entities with that label.
              </Typography.Text>
              <Input allowClear placeholder="Search tags…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Space>
          </Card>

          {isGM && (
            <Card density="dense" title="➕ New Tag">
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
                      style={{
                        width: 36,
                        height: 28,
                        padding: 2,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: selectedTag?.id === tag.id ? 'rgba(22,119,255,0.08)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => void loadTagEntities(tag)}
                  >
                    {editingId === tag.id ? (
                      <>
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          style={{
                            width: 28,
                            height: 22,
                            padding: 1,
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        />
                        <input
                          style={{
                            flex: 1,
                            padding: '2px 6px',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            background: 'transparent',
                            color: 'inherit',
                            fontSize: 13,
                          }}
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
                          ✓
                        </Button>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                        >
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <Tag color={tag.color} icon={<TagOutlined />} style={{ margin: 0, flex: 1 }}>
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

        {/* ── Right: entities with selected tag ──────────────────────────── */}
        <Card density="dense" style={{ minHeight: 200 }}>
          {!selectedTag ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <TagOutlined style={{ fontSize: 48, opacity: 0.2 }} />
              <div style={{ marginTop: 12, color: '#8c8c8c' }}>Select a tag to see its entities</div>
            </div>
          ) : (
            <Space orientation="vertical" size={16} style={w100}>
              <Space size={8} style={spaceBetween} wrap>
                <Space size={8}>
                  <Tag color={selectedTag.color} style={{ fontSize: 14, padding: '4px 12px' }}>
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
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                </div>
              ) : !tagEntities ? (
                <Empty description="Failed to load entities." />
              ) : totalEntities === 0 ? (
                <Empty description="No entities have this tag yet." />
              ) : (
                <Space orientation="vertical" size={16} style={w100}>
                  {Object.entries(ENTITY_LABELS).map(([key, label]) => {
                    const items = (tagEntities as any)[key] as any[];
                    return (
                      <EntityGroup
                        key={key}
                        label={label}
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
