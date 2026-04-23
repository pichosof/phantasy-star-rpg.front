import React from 'react';
import { Button, Modal, Tag, Typography, Input, Space, message } from 'antd';
import { DeleteOutlined, PushpinFilled, PushpinOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { type GmNote, createGmNote, deleteGmNote, listGmNotes, updateGmNote } from '@app/api/gm-notes.api';
import { apiErrorMessage } from '../../utils/api-error';
import { m0, textSm, textMd } from '@app/styles/styleUtils';
import * as S from './GmNotesPage.styles';

function parseTags(tags?: string | null): string[] {
  if (!tags) return [];

  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function NoteCard({ note, active, onClick }: { note: GmNote; active: boolean; onClick: () => void }) {
  const isDark = useAppSelector((state) => state.theme.theme) === 'dark';
  const tags = parseTags(note.tags);

  return (
    <S.NoteCardShell onClick={onClick} $active={active} $isDark={isDark}>
      <S.NoteCardHeader>
        {note.pinned && (
          <S.NotePin>
            <PushpinFilled />
          </S.NotePin>
        )}
        <Typography.Text strong style={textMd} ellipsis>
          {note.title}
        </Typography.Text>
      </S.NoteCardHeader>

      {tags.length > 0 && (
        <S.TagRow>
          {tags.map((tag) => (
            <S.TinyTag key={tag}>{tag}</S.TinyTag>
          ))}
        </S.TagRow>
      )}

      {note.content && (
        <S.NotePreview type="secondary" ellipsis>
          {note.content.slice(0, 80)}
        </S.NotePreview>
      )}
    </S.NoteCardShell>
  );
}

export const GmNotesPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isDark = useAppSelector((state) => state.theme.theme) === 'dark';

  const [notes, setNotes] = React.useState<GmNote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [editing, setEditing] = React.useState(false);

  const [editTitle, setEditTitle] = React.useState('');
  const [editContent, setEditContent] = React.useState('');
  const [editTags, setEditTags] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const [tagFilter, setTagFilter] = React.useState<string | null>(null);
  const [searchQ, setSearchQ] = React.useState('');

  const activeNote = React.useMemo(() => notes.find((note) => note.id === activeId) ?? null, [notes, activeId]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((note) => parseTags(note.tags).forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  const filteredNotes = React.useMemo(() => {
    let list = notes;

    if (tagFilter) {
      list = list.filter((note) => parseTags(note.tags).includes(tagFilter));
    }

    if (searchQ.trim()) {
      const query = searchQ.trim().toLowerCase();
      list = list.filter(
        (note) => note.title.toLowerCase().includes(query) || (note.content ?? '').toLowerCase().includes(query),
      );
    }

    return list;
  }, [notes, tagFilter, searchQ]);

  const load = React.useCallback(async () => {
    try {
      setNotes(await listGmNotes());
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load notes'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  function startNew() {
    setActiveId(null);
    setEditTitle('');
    setEditContent('');
    setEditTags('');
    setEditing(true);
  }

  function startEdit(note: GmNote) {
    setEditTitle(note.title);
    setEditContent(note.content ?? '');
    setEditTags(note.tags ?? '');
    setEditing(true);
  }

  async function save() {
    if (!editTitle.trim()) {
      return message.warning('Title is required');
    }

    setSaving(true);

    try {
      if (activeId) {
        await updateGmNote(activeId, { title: editTitle, content: editContent || null, tags: editTags || null });
        message.success('Note updated');
      } else {
        const created = await createGmNote({ title: editTitle, content: editContent || null, tags: editTags || null });
        setActiveId(created.id);
        message.success('Note created');
      }

      await load();
      setEditing(false);
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to save (GM key?)'));
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: GmNote) {
    try {
      await updateGmNote(note.id, { pinned: !note.pinned });
      await load();
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed'));
    }
  }

  async function doDelete(id: number) {
    try {
      await deleteGmNote(id);
      if (activeId === id) {
        setActiveId(null);
        setEditing(false);
      }
      await load();
      message.success('Note removed');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to delete'));
    }
  }

  function confirmDelete(note: GmNote) {
    Modal.confirm({
      title: `Delete "${note.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => doDelete(note.id),
    });
  }

  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  if (loading) return <Spinner />;

  const sidebar = (
    <S.Sidebar>
      <Button type="primary" size="small" block onClick={startNew}>
        + New note
      </Button>

      <Input
        allowClear
        placeholder="Search"
        value={searchQ}
        onChange={(e) => setSearchQ(e.target.value)}
        size="small"
      />

      {allTags.length > 0 && (
        <S.TagRow>
          {allTags.map((tag) => (
            <S.FilterTag
              key={tag}
              color={tagFilter === tag ? 'blue' : undefined}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            >
              {tag}
            </S.FilterTag>
          ))}
        </S.TagRow>
      )}

      <S.SidebarDivider $color={dividerColor} />

      {filteredNotes.length === 0 ? (
        <Typography.Text type="secondary" style={textSm}>
          No notes.
        </Typography.Text>
      ) : (
        filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            active={note.id === activeId}
            onClick={() => {
              setActiveId(note.id);
              setEditing(false);
            }}
          />
        ))
      )}
    </S.Sidebar>
  );

  const mainArea = editing ? (
    <S.EditorArea>
      <Input placeholder="Title *" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} size="large" />
      <Input
        placeholder="Tags (comma separated)"
        value={editTags}
        onChange={(e) => setEditTags(e.target.value)}
        size="small"
      />
      <S.EditorTextArea
        placeholder="Note content..."
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        rows={16}
      />
      <Space>
        <Button type="primary" loading={saving} onClick={() => void save()}>
          Save
        </Button>
        <Button onClick={() => setEditing(false)}>Cancel</Button>
      </Space>
    </S.EditorArea>
  ) : activeNote ? (
    <div>
      <S.MainHeader>
        <div>
          <Typography.Title level={3} style={m0}>
            {activeNote.title}
          </Typography.Title>
          <S.ActiveTagsRow>
            {parseTags(activeNote.tags).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </S.ActiveTagsRow>
        </div>

        <Space size={8}>
          <Button
            size="small"
            icon={activeNote.pinned ? <PushpinFilled /> : <PushpinOutlined />}
            onClick={() => void togglePin(activeNote)}
          >
            {activeNote.pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button size="small" onClick={() => startEdit(activeNote)}>
            Edit
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(activeNote)} />
        </Space>
      </S.MainHeader>

      <S.ContentDivider $color={dividerColor} />
      <S.ContentParagraph>
        {activeNote.content || <Typography.Text type="secondary">No content.</Typography.Text>}
      </S.ContentParagraph>
    </div>
  ) : (
    <S.EmptyState description="Select or create a note." />
  );

  return (
    <>
      <PageTitle>GM — Notes</PageTitle>
      <S.PageGrid $mobile={mobileOnly}>
        <Card density="dense">{sidebar}</Card>
        <Card density="comfy">{mainArea}</Card>
      </S.PageGrid>
    </>
  );
};

export default GmNotesPage;
