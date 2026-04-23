import React from 'react';
import { Button, Modal, Tag, Typography, Input, Space, message } from 'antd';
import { DeleteOutlined, PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import { AddOutline, DeleteOutline, EditSOutline, FilterOutline, StarFill, StarOutline } from 'antd-mobile-icons';

import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
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
} from '@app/components/common/mobile';
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
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<GmNote | null>(null);

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
    setActiveId(note.id);
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
      setDeleteTarget(null);
      await load();
      message.success('Note removed');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to delete'));
    }
  }

  function confirmDelete(note: GmNote) {
    if (mobileOnly) {
      setDeleteTarget(note);
      return;
    }

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

  const mobileTagOptions = [{ label: 'All tags', value: 'all' }, ...allTags.map((tag) => ({ label: tag, value: tag }))];

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {notes.length} notes
      </AdmMobileTag>
      <AdmMobileTag color="warning" fill="outline" round>
        {notes.filter((note) => note.pinned).length} pinned
      </AdmMobileTag>
      {tagFilter ? (
        <AdmMobileTag color="primary" fill="outline" round>
          {tagFilter}
        </AdmMobileTag>
      ) : null}
    </S.MobileMetaTags>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearchQ} placeholder="Search GM notes..." value={searchQ} />
      <S.MobileFilterRow>
        <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
          <FilterOutline fontSize={16} /> Tags
        </AdmMobileButton>
        <AdmMobileButton color="primary" onClick={startNew} size="small">
          <AddOutline fontSize={16} /> New note
        </AdmMobileButton>
      </S.MobileFilterRow>
    </>
  );

  const mobileEditorTitle = activeId ? 'Edit note' : 'New note';

  if (mobileOnly) {
    return (
      <>
        <PageTitle>GM - Notes</PageTitle>

        <MobilePageScaffold
          filters={mobileFilters}
          meta={mobileMeta}
          subtitle="Fast private notes, clues and pinned reminders for the GM table."
          title={<IconLabel icon="notes">GM Notes</IconLabel>}
        >
          {filteredNotes.length === 0 ? (
            <MobileCard compact>
              <S.MobileEmptyState>No notes found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileNotesList>
              {filteredNotes.map((note) => {
                const tags = parseTags(note.tags);

                return (
                  <MobileCard compact key={note.id} onClick={() => setActiveId(note.id)}>
                    <S.MobileNoteBody>
                      <S.MobileNoteHeader>
                        <S.MobileNoteIdentity>
                          <S.MobileMetaTags>
                            <AdmMobileTag fill="outline" round>
                              #{note.id}
                            </AdmMobileTag>
                            {note.pinned ? (
                              <AdmMobileTag color="warning" fill="outline" round>
                                <StarFill fontSize={13} /> Pinned
                              </AdmMobileTag>
                            ) : null}
                          </S.MobileMetaTags>
                          <S.MobileNoteTitle>{note.title}</S.MobileNoteTitle>
                        </S.MobileNoteIdentity>
                      </S.MobileNoteHeader>

                      {tags.length > 0 ? (
                        <S.MobileMetaTags>
                          {tags.slice(0, 4).map((tag) => (
                            <AdmMobileTag fill="outline" key={tag} round>
                              {tag}
                            </AdmMobileTag>
                          ))}
                        </S.MobileMetaTags>
                      ) : null}

                      <S.MobileNotePreview>{note.content?.trim() || 'No content yet.'}</S.MobileNotePreview>
                    </S.MobileNoteBody>
                  </MobileCard>
                );
              })}
            </S.MobileNotesList>
          )}
        </MobilePageScaffold>

        <MobileFilterSheet
          description="Filter notes by one campaign tag."
          onClose={() => setFilterSheetOpen(false)}
          title="Note filters"
          visible={filterSheetOpen}
        >
          {allTags.length === 0 ? (
            <MobileCard compact>
              <S.MobileEmptyState>No tags found in the current notes.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <MobileSelector<string>
              columns={1}
              inset={false}
              onChange={(values) => {
                const value = values[0] ?? 'all';
                setTagFilter(value === 'all' ? null : value);
              }}
              options={mobileTagOptions}
              value={[tagFilter ?? 'all']}
            />
          )}
        </MobileFilterSheet>

        <MobileEntitySheet
          description={activeNote ? `${parseTags(activeNote.tags).length} tags linked to this note.` : undefined}
          footer={
            activeNote ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton block color="primary" onClick={() => startEdit(activeNote)}>
                    <EditSOutline fontSize={17} /> Edit
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block fill="outline" onClick={() => void togglePin(activeNote)}>
                    {activeNote.pinned ? <StarFill fontSize={17} /> : <StarOutline fontSize={17} />}
                    {activeNote.pinned ? ' Unpin' : ' Pin'}
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={() => setActiveId(null)}
          subtitle={activeNote?.pinned ? 'Pinned note' : 'GM note'}
          title={activeNote?.title ?? 'Note'}
          visible={Boolean(activeNote) && !editing}
        >
          {activeNote ? (
            <S.MobileSectionStack>
              {parseTags(activeNote.tags).length > 0 ? (
                <MobileCard compact title="Tags">
                  <S.MobileTagsPanel>
                    {parseTags(activeNote.tags).map((tag) => (
                      <AdmMobileTag fill="outline" key={tag} round>
                        {tag}
                      </AdmMobileTag>
                    ))}
                  </S.MobileTagsPanel>
                </MobileCard>
              ) : null}

              <MobileCard compact title="Content">
                <S.MobileBodyText>{activeNote.content?.trim() || 'No content yet.'}</S.MobileBodyText>
              </MobileCard>

              <MobileCard compact title="Danger Zone">
                <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteTarget(activeNote)}>
                  <DeleteOutline fontSize={17} /> Delete note
                </AdmMobileButton>
              </MobileCard>
            </S.MobileSectionStack>
          ) : null}
        </MobileEntitySheet>

        <MobileEntitySheet
          description={activeId ? 'Update this private GM note.' : 'Create a new private GM note.'}
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={saving} onClick={() => void save()}>
                  Save note
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton block fill="outline" onClick={() => setEditing(false)}>
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => setEditing(false)}
          subtitle="GM only"
          title={mobileEditorTitle}
          visible={editing}
        >
          <MobileCard compact title="Note details">
            <MobileForm>
              <MobileForm.Item label="Title">
                <AdmMobileInput clearable onChange={setEditTitle} placeholder="Title *" value={editTitle} />
              </MobileForm.Item>
              <MobileForm.Item label="Tags">
                <AdmMobileInput
                  clearable
                  onChange={setEditTags}
                  placeholder="comma, separated, tags"
                  value={editTags}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Content">
                <AdmMobileTextArea
                  autoSize={{ minRows: 8, maxRows: 14 }}
                  onChange={setEditContent}
                  placeholder="Note content..."
                  value={editContent}
                />
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
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
              text: 'Delete note',
              bold: true,
              danger: true,
              onClick: () => {
                if (deleteTarget) {
                  return doDelete(deleteTarget.id);
                }
              },
            },
          ]}
          content={deleteTarget ? `Delete "${deleteTarget.title}" permanently?` : ''}
          onClose={() => setDeleteTarget(null)}
          title="Delete note?"
          visible={Boolean(deleteTarget)}
        />
      </>
    );
  }

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
      <PageTitle>GM - Notes</PageTitle>
      <S.PageGrid $mobile={mobileOnly}>
        <Card density="dense">{sidebar}</Card>
        <Card density="comfy">{mainArea}</Card>
      </S.PageGrid>
    </>
  );
};

export default GmNotesPage;
