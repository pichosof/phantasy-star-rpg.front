/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Empty, message, Modal, Popconfirm, Space, Spin, Switch, Tag, Typography } from 'antd';
import type { UploadProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Stepper as AdmMobileStepper,
  Switch as AdmMobileSwitch,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import {
  AddOutline,
  DeleteOutline as MobileDeleteOutline,
  FileOutline,
  FilterOutline,
  MoreOutline,
  PicturesOutline,
  SetOutline,
  UnorderedListOutline,
  UserAddOutline,
  UserOutline,
} from 'antd-mobile-icons';

import { fetchBlobUrl, resolveApiUrl } from '@app/api/http.api';
import {
  createPlayerNote,
  deletePlayerNote,
  listPlayerNotes,
  type PlayerNote,
  updatePlayerNote,
} from '@app/api/playerNotes.api';
import { PlayersApi } from '@app/api/rpg.api';
import { Card } from '@app/components/common/Card/Card';
import { Collapse } from '@app/components/common/Collapse/Collapse';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import {
  MobileActionBar,
  MobileActionSheet,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobileFilterSheet,
  MobileForm,
  MobileList,
  MobilePageScaffold,
  MobileSearchBar,
  MobileSectionHeader,
  MobileSelector,
  MobileTabs,
} from '@app/components/common/mobile';
import { Button } from '@app/components/common/buttons/Button/Button';
import { PdfDocumentViewer } from '@app/components/common/pdf/PdfDocumentViewer/PdfDocumentViewer';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Table } from '@app/components/common/Table/Table';
import { Upload } from '@app/components/common/Upload/Upload';
import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import { PlayerCard } from '@app/components/rpg/PlayerCard/PlayerCard';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { dividerMd, dividerSm, m0, spaceBetween, tableWrap, textMd, textSm, w100 } from '@app/styles/styleUtils';
import type { Player } from '@app/types/rpg';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './PlayersPage.styles';

type AltMap = Record<number, string>;
type EditMap = Record<number, { name: string; level: number; background: string }>;
type EditingSet = Record<number, boolean>;
type ViewMode = 'public' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type PlayerSheetTab = 'overview' | 'notes' | 'gm';

function isPlayerVisible(player: Player) {
  return (player.visible ?? true) === true;
}

function getPlayerSummary(player: Player) {
  const background = player.background?.trim();
  if (!background) return 'Profile, sheet and campaign notes stay together here.';
  if (background.length <= 160) return background;
  return `${background.slice(0, 157)}...`;
}

function formatDateLabel(value?: string | null) {
  if (!value) return 'Unknown';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString();
}

interface PlayerNotesSectionProps {
  playerId: number;
  playerName: string;
  isGM: boolean;
  mobile?: boolean;
}

const PlayerNotesSection: React.FC<PlayerNotesSectionProps> = ({ playerId, playerName, isGM, mobile = false }) => {
  const [notes, setNotes] = React.useState<PlayerNote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PlayerNote | null>(null);
  const [form, setForm] = React.useState({ title: '', date: '', content: '' });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [actionTarget, setActionTarget] = React.useState<PlayerNote | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<PlayerNote | null>(null);

  React.useEffect(() => {
    let alive = true;

    setLoading(true);
    listPlayerNotes(playerId)
      .then((data) => {
        if (alive) {
          setNotes(data);
        }
      })
      .catch(() => {
        if (alive) {
          message.error('Failed to load notes.');
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [playerId]);

  function closeEditor() {
    setModalOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', date: '', content: '' });
    setModalOpen(true);
  }

  function openEdit(note: PlayerNote) {
    setActionTarget(null);
    setEditing(note);
    setForm({ title: note.title, date: note.date, content: note.content ?? '' });
    setModalOpen(true);
  }

  async function handleSave() {
    const title = form.title.trim();
    const date = form.date.trim();
    const content = form.content.trim() || null;

    if (!title) {
      message.warning('Title is required.');
      return;
    }

    if (!date) {
      message.warning('Date is required.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updatePlayerNote(playerId, editing.id, { title, date, content });
        setNotes((prev) => prev.map((note) => (note.id === editing.id ? { ...note, title, date, content } : note)));
        message.success('Note updated.');
      } else {
        const created = await createPlayerNote(playerId, { title, date, content });
        setNotes((prev) => [...prev, created]);
        message.success('Note added.');
      }

      closeEditor();
    } catch {
      message.error('Failed to save note.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: number) {
    setDeletingId(noteId);
    try {
      await deletePlayerNote(playerId, noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      setDeleteTarget(null);
      setActionTarget(null);
      message.success('Note removed.');
    } catch {
      message.error('Failed to delete note.');
    } finally {
      setDeletingId(null);
    }
  }

  const noteActions = React.useMemo(
    () =>
      actionTarget && isGM
        ? [
            {
              key: 'edit',
              text: 'Edit note',
              onClick: () => openEdit(actionTarget),
            },
            {
              key: 'delete',
              text: 'Delete note',
              danger: true,
              onClick: () => {
                setDeleteTarget(actionTarget);
                setActionTarget(null);
              },
            },
          ]
        : [],
    [actionTarget, isGM],
  );

  if (mobile) {
    return (
      <>
        <S.MobileSectionStack>
          <MobileSectionHeader
            title="Notes"
            description={`Shared notes and discoveries for ${playerName}.`}
            aside={
              isGM ? (
                <AdmMobileButton size="small" color="primary" fill="outline" onClick={openCreate}>
                  <AddOutline fontSize={16} /> Add
                </AdmMobileButton>
              ) : notes.length > 0 ? (
                <AdmMobileTag round fill="outline">
                  {notes.length}
                </AdmMobileTag>
              ) : null
            }
          />

          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : notes.length === 0 ? (
            <MobileCard compact>
              <S.MobileEmptyState>No notes yet.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <MobileList>
              {notes.map((note) => (
                <MobileList.Item
                  key={note.id}
                  description={note.content || 'No extra details yet.'}
                  extra={
                    <S.MobileNoteExtra>
                      <S.MobileNoteDate>{note.date}</S.MobileNoteDate>
                      {isGM && (
                        <S.MobileIconButton
                          aria-label={`Open actions for ${note.title}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActionTarget(note);
                          }}
                          type="button"
                        >
                          <MoreOutline fontSize={18} />
                        </S.MobileIconButton>
                      )}
                    </S.MobileNoteExtra>
                  }
                >
                  {note.title}
                </MobileList.Item>
              ))}
            </MobileList>
          )}
        </S.MobileSectionStack>

        <MobileActionSheet
          actions={noteActions}
          cancelText="Cancel"
          onClose={() => setActionTarget(null)}
          visible={Boolean(actionTarget)}
        />

        <MobileDialog
          actions={[
            {
              key: 'cancel',
              text: 'Cancel',
              onClick: () => setDeleteTarget(null),
            },
            {
              key: 'delete',
              text: deletingId === deleteTarget?.id ? 'Removing...' : 'Delete note',
              danger: true,
              bold: true,
              onClick: () => {
                if (deleteTarget) {
                  return handleDelete(deleteTarget.id);
                }
              },
            },
          ]}
          content={deleteTarget ? `Remove "${deleteTarget.title}" from ${playerName}?` : ''}
          onClose={() => setDeleteTarget(null)}
          title="Delete note?"
          visible={Boolean(deleteTarget)}
        />

        <MobileFilterSheet
          description={`Shared notes for ${playerName}.`}
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={saving} onClick={() => void handleSave()}>
                  {editing ? 'Save note' : 'Add note'}
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton block fill="outline" onClick={closeEditor}>
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={closeEditor}
          title={editing ? 'Edit note' : 'New note'}
          visible={modalOpen}
        >
          <S.MobileNoteEditorFields>
            <S.MobileNoteField>
              <S.MobileFieldLabel htmlFor={`player-note-title-${playerId}`}>Title *</S.MobileFieldLabel>
              <AdmMobileInput
                clearable
                id={`player-note-title-${playerId}`}
                onChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
                placeholder="Found the artifact"
                value={form.title}
              />
            </S.MobileNoteField>

            <S.MobileNoteField>
              <S.MobileFieldLabel htmlFor={`player-note-date-${playerId}`}>Date *</S.MobileFieldLabel>
              <AdmMobileInput
                clearable
                id={`player-note-date-${playerId}`}
                onChange={(value) => setForm((prev) => ({ ...prev, date: value }))}
                placeholder="Day 12, Year 1285"
                value={form.date}
              />
            </S.MobileNoteField>

            <S.MobileNoteField>
              <S.MobileFieldLabel htmlFor={`player-note-content-${playerId}`}>Content</S.MobileFieldLabel>
              <AdmMobileTextArea
                autoSize={{ minRows: 4, maxRows: 7 }}
                id={`player-note-content-${playerId}`}
                onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                placeholder="Additional details"
                value={form.content}
              />
            </S.MobileNoteField>
          </S.MobileNoteEditorFields>
        </MobileFilterSheet>
      </>
    );
  }

  return (
    <div>
      <S.NotesHeader>
        <Space size={6}>
          <FileTextOutlined style={S.noteEditIcon} />
          <Typography.Text strong style={textMd}>
            Notes
          </Typography.Text>
          {notes.length > 0 && <Tag style={m0}>{notes.length}</Tag>}
        </Space>
        {isGM && (
          <Tag color="blue" onClick={openCreate} style={S.addNoteTag}>
            <PlusOutlined /> Add note
          </Tag>
        )}
      </S.NotesHeader>

      {loading ? (
        <div style={S.NotesLoading}>
          <Spin size="small" />
        </div>
      ) : notes.length === 0 ? (
        <Typography.Text style={textSm} type="secondary">
          No notes yet.
        </Typography.Text>
      ) : (
        <S.NotesGrid>
          {notes.map((note) => (
            <S.NoteCard key={note.id}>
              <S.NoteCardHeader>
                <div style={S.NoteMain}>
                  <Typography.Text strong style={S.noteTitle}>
                    {note.title}
                  </Typography.Text>
                  <Tag style={S.noteDateTag}>{note.date}</Tag>
                </div>
                {isGM && (
                  <Space size={4} style={S.noteActions}>
                    <EditOutlined onClick={() => openEdit(note)} style={S.noteEditIcon} />
                    <Popconfirm
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                      okText="Remove"
                      onConfirm={() => void handleDelete(note.id)}
                      title="Remove this note?"
                    >
                      {deletingId === note.id ? <Spin size="small" /> : <DeleteOutlined style={S.noteDeleteIcon} />}
                    </Popconfirm>
                  </Space>
                )}
              </S.NoteCardHeader>

              {note.content && (
                <Typography.Text style={S.noteContent} type="secondary">
                  {note.content}
                </Typography.Text>
              )}
            </S.NoteCard>
          ))}
        </S.NotesGrid>
      )}

      <Modal
        centered
        confirmLoading={saving}
        destroyOnHidden
        okText={editing ? 'Save' : 'Add'}
        onCancel={closeEditor}
        onOk={() => void handleSave()}
        open={modalOpen}
        title={editing ? 'Edit note' : 'New note'}
      >
        <Space direction="vertical" size={12} style={w100}>
          <div>
            <Typography.Text style={S.fieldLabelTextSm} type="secondary">
              Title *
            </Typography.Text>
            <Input
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Found the artifact"
              value={form.title}
            />
          </div>

          <div>
            <Typography.Text style={S.fieldLabelTextSm} type="secondary">
              Date *
            </Typography.Text>
            <Input
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              placeholder="Day 12, Year 1285"
              value={form.date}
            />
          </div>

          <div>
            <Typography.Text style={S.fieldLabelTextSm} type="secondary">
              Content (optional)
            </Typography.Text>
            <TextArea
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Additional details"
              rows={3}
              value={form.content}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export const PlayersPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = useGMMode();

  const [items, setItems] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [creatingPlayer, setCreatingPlayer] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [level, setLevel] = React.useState<number>(1);
  const [background, setBackground] = React.useState<string>('');

  const [viewMode, setViewMode] = React.useState<ViewMode>('public');
  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const [altById, setAltById] = React.useState<AltMap>({});
  const [editById, setEditById] = React.useState<EditMap>({});
  const [editingSet, setEditingSet] = React.useState<EditingSet>({});

  const [selectedPlayerId, setSelectedPlayerId] = React.useState<number | null>(null);
  const [selectedTab, setSelectedTab] = React.useState<PlayerSheetTab>('overview');
  const [mobileDraft, setMobileDraft] = React.useState({
    name: '',
    level: 1,
    background: '',
    alt: '',
    visible: true,
  });
  const [mobileSaving, setMobileSaving] = React.useState(false);
  const [mobileUploadingImage, setMobileUploadingImage] = React.useState(false);
  const [mobileUploadingSheet, setMobileUploadingSheet] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [pdfPreviewPlayer, setPdfPreviewPlayer] = React.useState<Player | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = React.useState<string | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = React.useState(false);

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const sheetInputRef = React.useRef<HTMLInputElement | null>(null);

  const setAlt = React.useCallback((id: number, value: string) => {
    setAltById((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetCreateForm = React.useCallback(() => {
    setName('');
    setLevel(1);
    setBackground('');
  }, []);

  const releasePdfPreview = React.useCallback(() => {
    setPdfPreviewPlayer(null);
    setPdfPreviewLoading(false);
    setPdfPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return null;
    });
  }, []);

  React.useEffect(
    () => () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    },
    [pdfPreviewUrl],
  );

  React.useEffect(() => {
    if (!isGM) {
      setViewMode('public');
      setFilterVis('all');
      setCreating(false);
      if (selectedTab === 'gm') {
        setSelectedTab('overview');
      }
    }
  }, [isGM, selectedTab]);

  function startEdit(player: Player) {
    setEditById((prev) => ({
      ...prev,
      [player.id]: { name: player.name, level: player.level, background: player.background ?? '' },
    }));
    setEditingSet((prev) => ({ ...prev, [player.id]: true }));
  }

  function cancelEdit(id: number) {
    setEditingSet((prev) => ({ ...prev, [id]: false }));
  }

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await PlayersApi.list();
      setItems(data);
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load players.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const normalizedItems = React.useMemo(
    () =>
      items.map((player) => ({
        ...player,
        imageUrl: player.imageUrl ? resolveApiUrl(player.imageUrl) : player.imageUrl,
        sheetUrl: player.sheetUrl ? resolveApiUrl(player.sheetUrl) : player.sheetUrl,
      })),
    [items],
  );

  const selectedPlayer = React.useMemo(
    () => normalizedItems.find((player) => player.id === selectedPlayerId) ?? null,
    [normalizedItems, selectedPlayerId],
  );

  React.useEffect(() => {
    if (selectedPlayerId !== null && !normalizedItems.some((player) => player.id === selectedPlayerId)) {
      setSelectedPlayerId(null);
    }
  }, [normalizedItems, selectedPlayerId]);

  React.useEffect(() => {
    if (!selectedPlayer) {
      return;
    }

    const nextAlt = selectedPlayer.imageAlt ?? '';
    setAltById((prev) => ({ ...prev, [selectedPlayer.id]: prev[selectedPlayer.id] ?? nextAlt }));
    setMobileDraft({
      name: selectedPlayer.name,
      level: selectedPlayer.level,
      background: selectedPlayer.background ?? '',
      alt: nextAlt,
      visible: isPlayerVisible(selectedPlayer),
    });
  }, [selectedPlayer]);

  async function saveEdit(id: number) {
    const currentEdit = editById[id];
    if (!currentEdit) return;

    if (!currentEdit.name.trim()) {
      message.warning('Name is required.');
      return;
    }

    try {
      await PlayersApi.update(id, {
        name: currentEdit.name.trim(),
        level: currentEdit.level,
        background: currentEdit.background.trim() || null,
      });
      setEditingSet((prev) => ({ ...prev, [id]: false }));
      await load();
      message.success('Player updated.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update player.'));
    }
  }

  async function handleCreatePlayer() {
    if (!name.trim()) {
      message.warning('Name is required.');
      return;
    }

    setCreatingPlayer(true);
    try {
      const created = await PlayersApi.create({
        name: name.trim(),
        level,
        background: background.trim() || null,
      });

      message.success('Player created.');
      resetCreateForm();
      setCreating(false);
      await load();

      if (mobileOnly) {
        setSelectedPlayerId(created.id);
        setSelectedTab(isGM ? 'gm' : 'overview');
      }
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create player.'));
    } finally {
      setCreatingPlayer(false);
    }
  }

  async function toggleVisible(player: Player) {
    try {
      await PlayersApi.setVisible(player.id, !isPlayerVisible(player));
      await load();
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change visibility.'));
    }
  }

  function closePlayerSheet() {
    setSelectedPlayerId(null);
    setSelectedTab('overview');
    setDeleteDialogOpen(false);
  }

  async function deletePlayer(player: Player) {
    try {
      await PlayersApi.delete(player.id);
      setItems((prev) => prev.filter((current) => current.id !== player.id));
      if (selectedPlayerId === player.id) {
        closePlayerSheet();
      }
      if (pdfPreviewPlayer?.id === player.id) {
        releasePdfPreview();
      }
      message.success(`${player.name} deleted.`);
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to delete player.'));
    }
  }

  const toFile = (file: RcCustomRequestOptions['file']): File => file as File;

  const imageProps = (player: Player): UploadProps => ({
    name: 'image',
    accept: 'image/png,image/jpeg,image/webp,image/gif',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const file = toFile(options.file);

      PlayersApi.uploadImage(player.id, file, altById[player.id])
        .then(async () => {
          options.onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Image updated.');
          await load();
        })
        .catch((error) => {
          options.onError?.(error as Error);
          message.error(apiErrorMessage(error, 'Failed to upload image.'));
        });
    },
  });

  const sheetProps = (player: Player): UploadProps => ({
    name: 'sheet',
    accept: 'application/pdf',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const file = toFile(options.file);

      PlayersApi.uploadSheet(player.id, file)
        .then(async () => {
          options.onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Sheet uploaded.');
          await load();
        })
        .catch((error) => {
          options.onError?.(error as Error);
          message.error(apiErrorMessage(error, 'Failed to upload PDF sheet.'));
        });
    },
  });

  const q = search.trim().toLowerCase();
  const displayItems = React.useMemo(
    () =>
      normalizedItems.filter((player) => {
        if (!isGM && !isPlayerVisible(player)) return false;
        if (isGM && filterVis === 'visible' && !isPlayerVisible(player)) return false;
        if (isGM && filterVis === 'hidden' && isPlayerVisible(player)) return false;
        if (!q) return true;
        return (player.name ?? '').toLowerCase().includes(q) || (player.background ?? '').toLowerCase().includes(q);
      }),
    [filterVis, isGM, normalizedItems, q],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isPlayerVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  function openPlayerSheet(player: Player, tab: PlayerSheetTab = 'overview') {
    setSelectedPlayerId(player.id);
    setSelectedTab(isGM ? tab : 'overview');
  }

  async function openPdfPreview(player: Player) {
    if (!player.sheetUrl) {
      message.warning('No PDF sheet available yet.');
      return;
    }

    releasePdfPreview();
    setPdfPreviewPlayer(player);
    setPdfPreviewLoading(true);

    try {
      const blobUrl = await fetchBlobUrl(player.sheetUrl);
      setPdfPreviewUrl(blobUrl);
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load the PDF preview.'));
      setPdfPreviewPlayer(null);
    } finally {
      setPdfPreviewLoading(false);
    }
  }

  function syncMobileField<K extends keyof typeof mobileDraft>(key: K, value: (typeof mobileDraft)[K]) {
    setMobileDraft((prev) => ({ ...prev, [key]: value }));

    if (key === 'alt' && selectedPlayer) {
      setAlt(selectedPlayer.id, value as string);
    }
  }

  async function saveMobilePlayer() {
    if (!selectedPlayer) return;

    const trimmedName = mobileDraft.name.trim();
    if (!trimmedName) {
      message.warning('Name is required.');
      return;
    }

    setMobileSaving(true);
    try {
      await PlayersApi.update(selectedPlayer.id, {
        name: trimmedName,
        level: mobileDraft.level,
        background: mobileDraft.background.trim() || null,
      });

      if (mobileDraft.visible !== isPlayerVisible(selectedPlayer)) {
        await PlayersApi.setVisible(selectedPlayer.id, mobileDraft.visible);
      }

      message.success('Player updated.');
      await load();
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to update player.'));
    } finally {
      setMobileSaving(false);
    }
  }

  function resetMobileDraft() {
    if (!selectedPlayer) return;

    const nextAlt = selectedPlayer.imageAlt ?? '';
    setMobileDraft({
      name: selectedPlayer.name,
      level: selectedPlayer.level,
      background: selectedPlayer.background ?? '',
      alt: nextAlt,
      visible: isPlayerVisible(selectedPlayer),
    });
    setAlt(selectedPlayer.id, nextAlt);
  }

  async function handleMobileImageUpload(file: File) {
    if (!selectedPlayer) return;

    setMobileUploadingImage(true);
    try {
      await PlayersApi.uploadImage(selectedPlayer.id, file, mobileDraft.alt.trim() || undefined);
      message.success('Image updated.');
      await load();
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to upload image.'));
    } finally {
      setMobileUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }

  async function handleMobileSheetUpload(file: File) {
    if (!selectedPlayer) return;

    setMobileUploadingSheet(true);
    try {
      await PlayersApi.uploadSheet(selectedPlayer.id, file);
      message.success('Sheet uploaded.');
      await load();
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to upload PDF sheet.'));
    } finally {
      setMobileUploadingSheet(false);
      if (sheetInputRef.current) {
        sheetInputRef.current.value = '';
      }
    }
  }

  const adminTable = (
    <Card density="dense" title="Manage Players">
      <div style={tableWrap}>
        <Table
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              width: 60,
              render: (value: number) => <Tag style={m0}>#{value}</Tag>,
            },
            {
              title: 'Visible',
              width: 80,
              render: (_: any, player: Player) => (
                <Switch
                  checked={isPlayerVisible(player)}
                  checkedChildren={<EyeOutlined />}
                  onChange={() => void toggleVisible(player)}
                  size="small"
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Player',
              render: (_: any, player: Player) => (
                <Space size={6} wrap>
                  {player.imageUrl && (
                    <img alt={player.name} src={resolveApiUrl(player.imageUrl)} style={S.playerAvatar} />
                  )}
                  <Typography.Text strong>{player.name}</Typography.Text>
                  <Tag color="geekblue">Lv {player.level}</Tag>
                  {player.background && (
                    <Typography.Text ellipsis style={textSm} type="secondary">
                      {player.background.slice(0, 60)}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Actions',
              width: 90,
              render: (_: any, player: Player) => (
                <Space size={4}>
                  <Button icon={<EditOutlined />} onClick={() => startEdit(player)} size="small" />
                  <Popconfirm
                    cancelText="Cancel"
                    okText="Delete"
                    onConfirm={() => void deletePlayer(player)}
                    title={`Delete "${player.name}" permanently?`}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={displayItems}
          loading={loading}
          rowKey="id"
          scroll={{ x: 700 }}
          style={S.tableMinWidth}
        />
      </div>

      {!displayItems.length && !loading && <Empty description="No players found." style={S.emptyList} />}
    </Card>
  );

  const desktopHeader = (
    <Card className="rpg-page-header-card" density="dense">
      <Space direction="vertical" size={10} style={w100}>
        <Space size={8} style={spaceBetween}>
          <div>
            <Typography.Title level={4} style={m0}>
              <IconLabel icon="player">Characters</IconLabel>
            </Typography.Title>
            <Typography.Text style={textMd} type="secondary">
              {isGM
                ? 'Manage characters, sheets, notes and visibility.'
                : 'The adventurers facing the fate of the Algol system.'}
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
                  <IconLabel icon="read">View</IconLabel>
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
                {creating ? 'Close' : '+ New Player'}
              </Button>
            )}
          </Space>
        </Space>

        <Space size={8} wrap>
          <Tag>{stats.total} characters</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        <Space size={8} style={w100} wrap>
          <Input
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or background"
            style={S.headerSearch}
            value={search}
          />
          {isGM && (
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

        {isGM && creating && (
          <>
            <Divider style={dividerSm} />
            <S.createForm
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreatePlayer();
              }}
            >
              <Typography.Text strong>New Character</Typography.Text>
              <Space size={8} wrap>
                <Input
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name *"
                  required
                  style={S.createNameInput}
                  value={name}
                />
                <Space size={6}>
                  <Typography.Text style={textSm} type="secondary">
                    Level:
                  </Typography.Text>
                  <InputNumber min={1} onChange={(value) => setLevel(Number(value) || 1)} value={level} />
                </Space>
              </Space>
              <TextArea
                onChange={(event) => setBackground(event.target.value)}
                placeholder="Background (optional)"
                rows={mobileOnly ? 4 : 3}
                value={background}
              />
              <Space>
                <Button htmlType="submit" loading={creatingPlayer} type="primary">
                  Create
                </Button>
                <Button
                  onClick={() => {
                    resetCreateForm();
                    setCreating(false);
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

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search by name or background" value={search} />
      {isGM && (
        <S.MobileFilterRow>
          <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
            <FilterOutline fontSize={17} /> Filters
          </AdmMobileButton>
          {viewMode === 'admin' && (
            <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
              <UserAddOutline fontSize={17} /> New player
            </AdmMobileButton>
          )}
        </S.MobileFilterRow>
      )}
    </>
  );

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag round fill="outline">
        {stats.total} characters
      </AdmMobileTag>
      {isGM && (
        <AdmMobileTag color="success" round fill="outline">
          {stats.visible} visible
        </AdmMobileTag>
      )}
      {isGM && (
        <AdmMobileTag color="warning" round fill="outline">
          {stats.hidden} hidden
        </AdmMobileTag>
      )}
    </S.MobileMetaTags>
  );

  const mobileCreateFooter = (
    <MobileActionBar
      primary={
        <AdmMobileButton block color="primary" loading={creatingPlayer} onClick={() => void handleCreatePlayer()}>
          Create player
        </AdmMobileButton>
      }
      secondary={
        <AdmMobileButton
          block
          fill="outline"
          onClick={() => {
            resetCreateForm();
            setCreating(false);
          }}
        >
          Cancel
        </AdmMobileButton>
      }
      sticky={false}
    />
  );

  const mobilePlayerOverview = selectedPlayer ? (
    <S.MobileSectionStack>
      <MobileCard compact>
        <S.MobileHeroContent>
          <S.MobileHeroFrame>
            {selectedPlayer.imageUrl ? (
              <S.MobileHeroImage alt={selectedPlayer.imageAlt ?? selectedPlayer.name} src={selectedPlayer.imageUrl} />
            ) : (
              <S.MobileImageFallback>
                <UserOutline fontSize={48} />
              </S.MobileImageFallback>
            )}
          </S.MobileHeroFrame>

          <S.MobileHeroTitleRow>
            <S.MobileHeroName>{selectedPlayer.name}</S.MobileHeroName>
          </S.MobileHeroTitleRow>

          <S.MobileBadgeRow>
            <AdmMobileTag color="primary" round fill="outline">
              Level {selectedPlayer.level}
            </AdmMobileTag>
            {isGM && (
              <AdmMobileTag color={isPlayerVisible(selectedPlayer) ? 'success' : 'warning'} round fill="outline">
                {isPlayerVisible(selectedPlayer) ? 'Visible' : 'Hidden'}
              </AdmMobileTag>
            )}
          </S.MobileBadgeRow>

          <S.MobileStoryText>{selectedPlayer.background || 'No background added yet.'}</S.MobileStoryText>
        </S.MobileHeroContent>
      </MobileCard>

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Character ID</S.MobileDetailLabel>
            <S.MobileDetailValue>#{selectedPlayer.id}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Created</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateLabel(selectedPlayer.createdAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Updated</S.MobileDetailLabel>
            <S.MobileDetailValue>{formatDateLabel(selectedPlayer.updatedAt)}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Sheet</S.MobileDetailLabel>
            <S.MobileDetailValue>{selectedPlayer.sheetUrl ? 'Available' : 'Not uploaded yet'}</S.MobileDetailValue>
          </S.MobileDetailItem>
        </S.MobileDetailGrid>
      </MobileCard>

      <MobileCard compact title="Character Sheet">
        <AdmMobileButton
          block
          color="primary"
          disabled={!selectedPlayer.sheetUrl}
          fill={selectedPlayer.sheetUrl ? 'solid' : 'outline'}
          onClick={() => void openPdfPreview(selectedPlayer)}
        >
          <FileOutline fontSize={17} /> {selectedPlayer.sheetUrl ? 'Open sheet preview' : 'No PDF uploaded yet'}
        </AdmMobileButton>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const mobilePlayerGM = selectedPlayer ? (
    <S.MobileGMStack>
      <MobileCard compact title="Profile">
        <MobileForm>
          <MobileForm.Item label="Name">
            <AdmMobileInput
              clearable
              onChange={(value) => syncMobileField('name', value)}
              placeholder="Character name"
              value={mobileDraft.name}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Level">
            <AdmMobileStepper
              min={1}
              onChange={(value) => syncMobileField('level', Number(value) || 1)}
              value={mobileDraft.level}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Background">
            <AdmMobileTextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              onChange={(value) => syncMobileField('background', value)}
              placeholder="Campaign background or role"
              value={mobileDraft.background}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={mobileDraft.visible} onChange={(value) => syncMobileField('visible', value)} />
        </S.MobileVisibilityRow>
      </MobileCard>

      <MobileCard compact title="Media">
        <S.MobileUploadGrid>
          <S.MobileUploadRow>
            <S.MobileFieldLabel htmlFor={`player-alt-${selectedPlayer.id}`}>Image alt text</S.MobileFieldLabel>
            <AdmMobileInput
              clearable
              id={`player-alt-${selectedPlayer.id}`}
              onChange={(value) => syncMobileField('alt', value)}
              placeholder="Describe the portrait"
              value={mobileDraft.alt}
            />
          </S.MobileUploadRow>

          <S.MobilePlayerActionRow>
            <AdmMobileButton
              block
              fill="outline"
              loading={mobileUploadingImage}
              onClick={() => imageInputRef.current?.click()}
            >
              <PicturesOutline fontSize={17} /> Upload image
            </AdmMobileButton>
            <AdmMobileButton
              block
              fill="outline"
              loading={mobileUploadingSheet}
              onClick={() => sheetInputRef.current?.click()}
            >
              <FileOutline fontSize={17} /> Upload PDF
            </AdmMobileButton>
          </S.MobilePlayerActionRow>
        </S.MobileUploadGrid>
      </MobileCard>

      <MobileCard compact title="Tags">
        <TagSelect entityId={selectedPlayer.id} entityType="player" />
      </MobileCard>

      <MobileCard compact title="Danger Zone">
        <S.MobileDangerZone>
          <S.MobilePlayerPreview>
            Deleting a player also removes their image, PDF sheet, notes and quest links.
          </S.MobilePlayerPreview>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <MobileDeleteOutline fontSize={17} /> Delete player
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileGMStack>
  ) : null;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Players</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'public' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('public')}
                  size="small"
                >
                  <UserOutline fontSize={16} /> View
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
            isGM
              ? 'Mobile-first access to character sheets, notes and GM controls.'
              : 'Browse the adventurers facing the fate of the Algol system.'
          }
          title={<IconLabel icon="player">Characters</IconLabel>}
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : displayItems.length === 0 ? (
            <MobileCard compact>
              <S.MobileEmptyState>No characters found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobilePlayersGrid>
              {displayItems.map((player) => (
                <MobileCard compact key={player.id}>
                  <S.MobilePlayerBody>
                    <S.MobilePlayerMedia>
                      {player.imageUrl ? (
                        <S.MobilePlayerImage alt={player.imageAlt ?? player.name} src={player.imageUrl} />
                      ) : (
                        <S.MobileImageFallback>
                          <UserOutline fontSize={42} />
                        </S.MobileImageFallback>
                      )}
                    </S.MobilePlayerMedia>

                    <S.MobilePlayerHeader>
                      <S.MobilePlayerIdentity>
                        <S.MobilePlayerName>{player.name}</S.MobilePlayerName>
                        <S.MobileMetaTags>
                          <AdmMobileTag color="primary" round fill="outline">
                            Level {player.level}
                          </AdmMobileTag>
                          {isGM && (
                            <AdmMobileTag color={isPlayerVisible(player) ? 'success' : 'warning'} round fill="outline">
                              {isPlayerVisible(player) ? 'Visible' : 'Hidden'}
                            </AdmMobileTag>
                          )}
                        </S.MobileMetaTags>
                      </S.MobilePlayerIdentity>
                    </S.MobilePlayerHeader>

                    <S.MobilePlayerPreview>{getPlayerSummary(player)}</S.MobilePlayerPreview>

                    <S.MobilePlayerActionRow>
                      <AdmMobileButton block color="primary" onClick={() => openPlayerSheet(player, 'overview')}>
                        <UserOutline fontSize={17} /> Open profile
                      </AdmMobileButton>
                      <AdmMobileButton
                        block
                        fill="outline"
                        onClick={() => {
                          if (player.sheetUrl) {
                            void openPdfPreview(player);
                          } else {
                            openPlayerSheet(player, 'notes');
                          }
                        }}
                      >
                        {player.sheetUrl ? (
                          <>
                            <FileOutline fontSize={17} /> Open sheet
                          </>
                        ) : (
                          <>
                            <UnorderedListOutline fontSize={17} /> Notes
                          </>
                        )}
                      </AdmMobileButton>
                    </S.MobilePlayerActionRow>

                    {isGM && viewMode === 'admin' && (
                      <AdmMobileButton block fill="outline" onClick={() => openPlayerSheet(player, 'gm')}>
                        <SetOutline fontSize={17} /> GM controls
                      </AdmMobileButton>
                    )}
                  </S.MobilePlayerBody>
                </MobileCard>
              ))}
            </S.MobilePlayersGrid>
          )}
        </MobilePageScaffold>

        {isGM && (
          <MobileFilterSheet
            description="Switch between the public list and GM controls, and tune visibility filters."
            footer={
              <MobileActionBar sticky={false}>
                <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                  Done
                </AdmMobileButton>
              </MobileActionBar>
            }
            onClose={() => setFilterSheetOpen(false)}
            title="Player filters"
            visible={filterSheetOpen}
          >
            <S.MobileFilterShell>
              <S.MobileNoteField>
                <S.MobileFieldLabel>Panel</S.MobileFieldLabel>
                <MobileSelector
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'public')}
                  options={[
                    { label: 'Public view', value: 'public' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileNoteField>

              <S.MobileNoteField>
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
              </S.MobileNoteField>
            </S.MobileFilterShell>
          </MobileFilterSheet>
        )}

        <MobileEntitySheet
          description={
            selectedPlayer
              ? isGM
                ? 'Overview, notes and GM controls in one mobile sheet.'
                : 'Overview and campaign notes for this character.'
              : undefined
          }
          extra={
            selectedPlayer?.sheetUrl ? (
              <AdmMobileButton fill="none" onClick={() => void openPdfPreview(selectedPlayer)} size="small">
                <FileOutline fontSize={18} />
              </AdmMobileButton>
            ) : null
          }
          footer={
            selectedPlayer && isGM && selectedTab === 'gm' ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton block color="primary" loading={mobileSaving} onClick={() => void saveMobilePlayer()}>
                    Save changes
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block fill="outline" onClick={resetMobileDraft}>
                    Reset
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={closePlayerSheet}
          subtitle={selectedPlayer ? `Level ${selectedPlayer.level}` : undefined}
          title={selectedPlayer?.name ?? 'Character'}
          visible={Boolean(selectedPlayer)}
        >
          {selectedPlayer && isGM ? (
            <MobileTabs
              activeKey={selectedTab}
              items={[
                {
                  key: 'overview',
                  title: 'Overview',
                  children: mobilePlayerOverview,
                },
                {
                  key: 'notes',
                  title: 'Notes',
                  children: (
                    <PlayerNotesSection
                      isGM={isGM}
                      mobile
                      playerId={selectedPlayer.id}
                      playerName={selectedPlayer.name}
                    />
                  ),
                },
                {
                  key: 'gm',
                  title: 'GM',
                  children: mobilePlayerGM,
                },
              ]}
              onChange={(key) => setSelectedTab(key as PlayerSheetTab)}
            />
          ) : selectedPlayer ? (
            <S.MobileSectionStack>
              {mobilePlayerOverview}
              <PlayerNotesSection isGM={isGM} mobile playerId={selectedPlayer.id} playerName={selectedPlayer.name} />
            </S.MobileSectionStack>
          ) : null}

          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleMobileImageUpload(file);
              }
            }}
            ref={imageInputRef}
            type="file"
          />
          <input
            accept="application/pdf"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleMobileSheetUpload(file);
              }
            }}
            ref={sheetInputRef}
            type="file"
          />
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
              text: 'Delete player',
              danger: true,
              bold: true,
              onClick: () => {
                if (selectedPlayer) {
                  return deletePlayer(selectedPlayer);
                }
              },
            },
          ]}
          content={selectedPlayer ? `Delete "${selectedPlayer.name}" and all attached notes, media and links?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete player?"
          visible={deleteDialogOpen}
        />

        <MobileEntitySheet
          description="Create a new character with the same mobile-first flow we will reuse across the rest of PR5."
          footer={mobileCreateFooter}
          onClose={() => {
            resetCreateForm();
            setCreating(false);
          }}
          subtitle="GM only"
          title="New character"
          visible={creating && isGM && viewMode === 'admin'}
        >
          <MobileCard compact title="Character details">
            <MobileForm>
              <MobileForm.Item label="Name">
                <AdmMobileInput clearable onChange={setName} placeholder="Character name" value={name} />
              </MobileForm.Item>
              <MobileForm.Item label="Level">
                <AdmMobileStepper min={1} onChange={(value) => setLevel(Number(value) || 1)} value={level} />
              </MobileForm.Item>
              <MobileForm.Item label="Background">
                <AdmMobileTextArea
                  autoSize={{ minRows: 5, maxRows: 8 }}
                  onChange={setBackground}
                  placeholder="Background, role or campaign hook"
                  value={background}
                />
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
        </MobileEntitySheet>

        <MobileEntitySheet
          description={pdfPreviewPlayer ? `PDF preview for ${pdfPreviewPlayer.name}.` : undefined}
          footer={
            pdfPreviewUrl ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton
                    block
                    color="primary"
                    onClick={() => {
                      window.open(pdfPreviewUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Open in browser
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block fill="outline" onClick={releasePdfPreview}>
                    Close
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={releasePdfPreview}
          subtitle="Character sheet"
          title={pdfPreviewPlayer ? `${pdfPreviewPlayer.name} PDF` : 'Character sheet'}
          visible={Boolean(pdfPreviewPlayer)}
        >
          <S.MobilePdfShell>
            {pdfPreviewLoading ? (
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            ) : pdfPreviewUrl ? (
              <S.MobilePdfViewerFrame>
                <PdfDocumentViewer url={pdfPreviewUrl} />
              </S.MobilePdfViewerFrame>
            ) : (
              <MobileCard compact>
                <S.MobileEmptyState>Unable to load this PDF preview.</S.MobileEmptyState>
              </MobileCard>
            )}
          </S.MobilePdfShell>
        </MobileEntitySheet>
      </>
    );
  }

  return (
    <>
      <PageTitle>Players</PageTitle>

      {desktopHeader}

      {viewMode === 'admin' && isGM ? (
        loading ? (
          <Spinner />
        ) : (
          adminTable
        )
      ) : loading ? (
        <Spinner />
      ) : displayItems.length === 0 ? (
        <Card density="comfy">
          <Space direction="vertical" size={8} style={S.emptyCardState}>
            <Typography.Text type="secondary">No characters found.</Typography.Text>
          </Space>
        </Card>
      ) : (
        <S.PublicGrid>
          {displayItems.map((player) => (
            <S.PlayerStack key={player.id}>
              <PlayerCard player={player} gm={isGM} onToggleVisible={toggleVisible} />

              <Card density="dense">
                <PlayerNotesSection isGM={isGM} playerId={player.id} playerName={player.name} />
              </Card>

              {isGM && (
                <Collapse>
                  <Collapse.Panel
                    header={
                      <Space size={8}>
                        <span>Manage</span>
                        <Tag color={isPlayerVisible(player) ? 'green' : 'red'} style={m0}>
                          {isPlayerVisible(player) ? 'Visible' : 'Hidden'}
                        </Tag>
                      </Space>
                    }
                    key={`gm-${player.id}`}
                  >
                    <Space direction="vertical" size={10} style={w100}>
                      <Space style={spaceBetween}>
                        <Typography.Text style={textMd}>Visible to players</Typography.Text>
                        <Switch
                          checked={isPlayerVisible(player)}
                          checkedChildren={<EyeOutlined />}
                          onChange={() => void toggleVisible(player)}
                          size="small"
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>
                      <Divider style={dividerSm} />

                      {editingSet[player.id] ? (
                        <Space direction="vertical" size={8} style={w100}>
                          <Space size={8} wrap>
                            <Input
                              onChange={(event) =>
                                setEditById((prev) => ({
                                  ...prev,
                                  [player.id]: { ...prev[player.id], name: event.target.value },
                                }))
                              }
                              placeholder="Name *"
                              style={S.editNameInput}
                              value={editById[player.id]?.name ?? ''}
                            />
                            <Space size={4}>
                              <Typography.Text style={textSm} type="secondary">
                                Level:
                              </Typography.Text>
                              <InputNumber
                                min={1}
                                onChange={(value) =>
                                  setEditById((prev) => ({
                                    ...prev,
                                    [player.id]: { ...prev[player.id], level: Number(value) || 1 },
                                  }))
                                }
                                style={S.levelInput}
                                value={editById[player.id]?.level ?? 1}
                              />
                            </Space>
                          </Space>
                          <TextArea
                            onChange={(event) =>
                              setEditById((prev) => ({
                                ...prev,
                                [player.id]: { ...prev[player.id], background: event.target.value },
                              }))
                            }
                            placeholder="Background"
                            rows={3}
                            value={editById[player.id]?.background ?? ''}
                          />
                          <TagSelect entityId={player.id} entityType="player" />
                          <Space size={6}>
                            <Button onClick={() => void saveEdit(player.id)} size="small" type="primary">
                              Save
                            </Button>
                            <Button onClick={() => cancelEdit(player.id)} size="small">
                              Cancel
                            </Button>
                          </Space>
                        </Space>
                      ) : (
                        <Button onClick={() => startEdit(player)} size="small">
                          Edit name / level / background
                        </Button>
                      )}

                      <Divider style={dividerSm} />
                      <S.mediaRow>
                        <Input
                          onChange={(event) => setAlt(player.id, event.target.value)}
                          placeholder="Image alt text"
                          style={S.altInput}
                          value={altById[player.id] ?? ''}
                        />
                        <Upload {...imageProps(player)}>
                          <Button size="small">Upload image</Button>
                        </Upload>
                      </S.mediaRow>
                      <S.mediaRow>
                        <Upload {...sheetProps(player)}>
                          <Button size="small">Upload PDF</Button>
                        </Upload>
                      </S.mediaRow>
                      <Divider style={dividerMd} />
                      <Popconfirm
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        okText="Delete"
                        onConfirm={() => void deletePlayer(player)}
                        title={`Delete "${player.name}"? This permanently removes the image, sheet, notes and quest links.`}
                      >
                        <Button block danger icon={<DeleteOutlined />} size="small">
                          Delete player
                        </Button>
                      </Popconfirm>
                    </Space>
                  </Collapse.Panel>
                </Collapse>
              )}
            </S.PlayerStack>
          ))}
        </S.PublicGrid>
      )}
    </>
  );
};

export default PlayersPage;
