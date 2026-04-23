import React from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { listTags, createTag, getEntityTags, setEntityTags } from '@app/api/tags.api';
import type { Tag as TagType, EntityTagType } from '@app/types/rpg';
import * as S from './TagSelect.styles';

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
        setEntityTagIds(entity.map((tag) => tag.id));
      })
      .catch(() => undefined);
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

  const currentTags = allTags.filter((tag) => entityTagIds.includes(tag.id));
  const options = allTags.map((tag) => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }));

  if (readonly) {
    if (currentTags.length === 0) return null;

    return (
      <S.ReadonlyTags>
        {currentTags.map((tag) => (
          <S.ReadonlyTag key={tag.id} color={tag.color}>
            {tag.name}
          </S.ReadonlyTag>
        ))}
      </S.ReadonlyTags>
    );
  }

  return (
    <S.Root>
      <S.FullWidthSelect
        mode="multiple"
        allowClear
        placeholder="Add tags"
        value={entityTagIds}
        onChange={(ids) => void handleChange(ids as number[])}
        loading={saving}
        optionFilterProp="label"
        options={options}
        optionRender={(option) => (
          <S.OptionLabel>
            <S.OptionDot $color={(option.data as { color?: string }).color} />
            {option.data.label}
          </S.OptionLabel>
        )}
        tagRender={({ label, value, closable, onClose }) => {
          const tag = allTags.find((entry) => entry.id === (value as number));
          return (
            <S.SelectedTag color={tag?.color ?? '#1677ff'} closable={closable} onClose={onClose}>
              {label}
            </S.SelectedTag>
          );
        }}
      />

      <S.CreateRow>
        <S.CreateInput
          placeholder="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleCreateTag(newTagName);
            }
          }}
        />
        <S.CreateButton onClick={() => void handleCreateTag(newTagName)} type="button">
          <PlusOutlined /> Add
        </S.CreateButton>
      </S.CreateRow>
    </S.Root>
  );
};
