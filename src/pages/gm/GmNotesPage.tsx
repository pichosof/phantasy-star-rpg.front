import React from 'react';
import { Button, Divider, Empty, Input, Modal, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, PushpinFilled, PushpinOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { type GmNote, createGmNote, deleteGmNote, listGmNotes, updateGmNote } from '@app/api/gm-notes.api';

const { TextArea } = Input;

// ── Tag helpers ───────────────────────────────────────────────────────────────

function parseTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
}

function buildTags(arr: string[]): string {
  return arr.join(', ');
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

function NoteCard({ note, active, onClick }: { note: GmNote; active: boolean; onClick: () => void }) {
  const isDark = useAppSelector((s) => s.theme.theme) === 'dark';
  const tags = parseTags(note.tags);
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--primary-color)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
        background: active ? 'rgba(var(--primary-rgb-color),0.08)' : 'transparent',
        transition: 'all 0.12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {note.pinned && <PushpinFilled style={{ fontSize: 11, color: 'var(--primary-color)' }} />}
        <Typography.Text strong style={{ fontSize: 13 }} ellipsis>{note.title}</Typography.Text>
      </div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tags.map((t) => <Tag key={t} style={{ margin: 0, fontSize: 10 }}>{t}</Tag>)}
        </div>
      )}
      {note.content && (
        <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }} ellipsis>
          {note.content.slice(0, 80)}
        </Typography.Text>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const GmNotesPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isDark = useAppSelector((s) => s.theme.theme) === 'dark';

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

  const activeNote = React.useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => parseTags(n.tags).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const filteredNotes = React.useMemo(() => {
    let list = notes;
    if (tagFilter) list = list.filter((n) => parseTags(n.tags).includes(tagFilter));
    if (searchQ.trim()) {
      const q = searchQ.trim().toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || (n.content ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [notes, tagFilter, searchQ]);

  const load = React.useCallback(async () => {
    try { setNotes(await listGmNotes()); }
    catch { message.error('Falha ao carregar anotações'); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

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
    if (!editTitle.trim()) return message.warning('Título é obrigatório');
    setSaving(true);
    try {
      if (activeId) {
        await updateGmNote(activeId, { title: editTitle, content: editContent || null, tags: editTags || null });
        message.success('Anotação atualizada');
      } else {
        const created = await createGmNote({ title: editTitle, content: editContent || null, tags: editTags || null });
        setActiveId(created.id);
        message.success('Anotação criada');
      }
      await load();
      setEditing(false);
    } catch { message.error('Falha ao salvar (GM key?)'); }
    finally { setSaving(false); }
  }

  async function togglePin(note: GmNote) {
    try {
      await updateGmNote(note.id, { pinned: !note.pinned });
      await load();
    } catch { message.error('Falha'); }
  }

  async function doDelete(id: number) {
    try {
      await deleteGmNote(id);
      if (activeId === id) { setActiveId(null); setEditing(false); }
      await load();
      message.success('Anotação removida');
    } catch { message.error('Falha ao deletar'); }
  }

  function confirmDelete(note: GmNote) {
    Modal.confirm({
      title: `Apagar "${note.title}"?`,
      okText: 'Apagar', okType: 'danger', cancelText: 'Cancelar',
      onOk: () => doDelete(note.id),
    });
  }

  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  if (loading) return <Spinner />;

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Button type="primary" size="small" block onClick={startNew}>+ Nova anotação</Button>

      <Input allowClear placeholder="Buscar…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} size="small" />

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {allTags.map((t) => (
            <Tag
              key={t}
              style={{ cursor: 'pointer', margin: 0 }}
              color={tagFilter === t ? 'blue' : undefined}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
            >
              {t}
            </Tag>
          ))}
        </div>
      )}

      <Divider style={{ margin: '4px 0', borderColor: dividerColor }} />

      {filteredNotes.length === 0
        ? <Typography.Text type="secondary" style={{ fontSize: 12 }}>Nenhuma anotação.</Typography.Text>
        : filteredNotes.map((n) => (
            <NoteCard key={n.id} note={n} active={n.id === activeId}
              onClick={() => { setActiveId(n.id); setEditing(false); }} />
          ))}
    </div>
  );

  const mainArea = editing ? (
    <div style={{ display: 'grid', gap: 12 }}>
      <Input
        placeholder="Título *"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        size="large"
      />
      <Input
        placeholder="Tags (separadas por vírgula)"
        value={editTags}
        onChange={(e) => setEditTags(e.target.value)}
        size="small"
      />
      <TextArea
        placeholder="Conteúdo da anotação..."
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        rows={16}
        style={{ resize: 'vertical', fontFamily: 'monospace' }}
      />
      <Space>
        <Button type="primary" loading={saving} onClick={() => void save()}>Salvar</Button>
        <Button onClick={() => setEditing(false)}>Cancelar</Button>
      </Space>
    </div>
  ) : activeNote ? (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>{activeNote.title}</Typography.Title>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {parseTags(activeNote.tags).map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        </div>
        <Space size={8}>
          <Button size="small" icon={activeNote.pinned ? <PushpinFilled /> : <PushpinOutlined />}
            onClick={() => void togglePin(activeNote)}>
            {activeNote.pinned ? 'Desafixar' : 'Fixar'}
          </Button>
          <Button size="small" onClick={() => startEdit(activeNote)}>Editar</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(activeNote)} />
        </Space>
      </div>
      <Divider style={{ margin: '8px 0', borderColor: dividerColor }} />
      <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        {activeNote.content || <Typography.Text type="secondary">Sem conteúdo.</Typography.Text>}
      </Typography.Paragraph>
    </div>
  ) : (
    <Empty description="Selecione ou crie uma anotação." style={{ marginTop: 60 }} />
  );

  return (
    <>
      <PageTitle>GM — Anotações</PageTitle>
      <div style={{ display: mobileOnly ? 'block' : 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <Card density="dense">{sidebar}</Card>
        <Card density="comfy">{mainArea}</Card>
      </div>
    </>
  );
};

export default GmNotesPage;
