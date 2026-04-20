import React from 'react';
import { Select, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { listTags, createTag, getEntityTags, setEntityTags } from '@app/api/tags.api';
import type { Tag as TagType, EntityTagType } from '@app/types/rpg';

type Props = {
  entityType: EntityTagType;
  entityId: number;
  readonly?: boolean;
};

export const TagSelect: React.FC<Props> = ({ entityType, entityId, readonly = false }) => {
  const [allTags, setAllTags] = React.useState<TagType[]>([]);
  const [entityTagIds, setEntityTagIds] = React.useState<number[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState('');

  React.useEffect(() => {
    Promise.all([listTags(), getEntityTags(entityType, entityId)])
      .then(([all, entity]) => {
        setAllTags(all);
        setEntityTagIds(entity.map((t) => t.id));
      })
      .catch(() => {});
  }, [entityType, entityId]);

  async function handleChange(ids: number[]) {
    setEntityTagIds(ids);
    setSaving(true);
    try {
      await setEntityTags(entityType, entityId, ids);
    } catch {
      message.error('Failed to save tags');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const created = await createTag({ name: trimmed });
      setAllTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      await handleChange([...entityTagIds, created.id]);
      setNewTagName('');
    } catch {
      message.error('Failed to create tag');
    }
  }

  const currentTags = allTags.filter((t) => entityTagIds.includes(t.id));

  if (readonly) {
    if (currentTags.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {currentTags.map((t) => (
          <Tag key={t.id} color={t.color} style={{ margin: 0 }}>
            {t.name}
          </Tag>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Select
        mode="multiple"
        allowClear
        style={{ width: '100%' }}
        placeholder="Add tags…"
        value={entityTagIds}
        onChange={(ids: number[]) => void handleChange(ids)}
        loading={saving}
        optionFilterProp="children"
        tagRender={({ label, value, closable, onClose }) => {
          const tag = allTags.find((t) => t.id === (value as number));
          return (
            <Tag color={tag?.color ?? '#1677ff'} closable={closable} onClose={onClose} style={{ marginRight: 4 }}>
              {label}
            </Tag>
          );
        }}
      >
        {allTags.map((t) => (
          <Select.Option key={t.id} value={t.id}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block', flexShrink: 0 }} />
              {t.name}
            </span>
          </Select.Option>
        ))}
      </Select>

      <div style={{ display: 'flex', gap: 4 }}>
        <input
          style={{ flex: 1, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, background: 'transparent', color: 'inherit', fontSize: 13 }}
          placeholder="New tag name…"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleCreateTag(newTagName); } }}
        />
        <button
          style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', background: 'transparent', color: 'inherit' }}
          onClick={() => void handleCreateTag(newTagName)}
          type="button"
        >
          <PlusOutlined /> Add
        </button>
      </div>
    </div>
  );
};
