/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  message,
  Collapse as AntdCollapse,
  Empty,
  Space,
  Tag,
  Typography,
  Switch,
  Divider,
  Modal,
  Popconfirm,
  Spin,
} from 'antd';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Upload } from '@app/components/common/Upload/Upload';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Collapse } from '@app/components/common/Collapse/Collapse';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { useResponsive } from '@app/hooks/useResponsive';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';

import type { Player } from '@app/types/rpg';
import { PlayersApi } from '@app/api/rpg.api';
import { PlayerCard } from '@app/components/rpg/PlayerCard/PlayerCard';
import { resolveApiUrl } from '@app/api/http.api';
import { apiErrorMessage } from '../utils/api-error';
import { m0, w100, textSm, textMd, spaceBetween, dividerSm, dividerMd, tableWrap } from '@app/styles/styleUtils';
import {
  type PlayerNote,
  listPlayerNotes,
  createPlayerNote,
  updatePlayerNote,
  deletePlayerNote,
} from '@app/api/playerNotes.api';

// ── Player Notes ─────────────────────────────────────────────────────────────

interface PlayerNotesSectionProps {
  playerId: number;
  isGM: boolean;
}

const PlayerNotesSection: React.FC<PlayerNotesSectionProps> = ({ playerId, isGM }) => {
  const [notes, setNotes] = React.useState<PlayerNote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PlayerNote | null>(null);
  const [form, setForm] = React.useState({ title: '', date: '', content: '' });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    listPlayerNotes(playerId)
      .then((data) => {
        if (alive) setNotes(data);
      })
      .catch(() => {
        if (alive) message.error('Failed to load notes.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [playerId]);

  function openCreate() {
    setEditing(null);
    setForm({ title: '', date: '', content: '' });
    setModalOpen(true);
  }

  function openEdit(note: PlayerNote) {
    setEditing(note);
    setForm({ title: note.title, date: note.date, content: note.content ?? '' });
    setModalOpen(true);
  }

  async function handleSave() {
    const title = form.title.trim();
    const date = form.date.trim();
    if (!title) return message.warning('Title is required.');
    if (!date) return message.warning('Date is required.');
    setSaving(true);
    try {
      if (editing) {
        await updatePlayerNote(playerId, editing.id, { title, date, content: form.content.trim() || null });
        setNotes((prev) =>
          prev.map((n) => (n.id === editing.id ? { ...n, title, date, content: form.content.trim() || null } : n)),
        );
        message.success('Note updated.');
      } else {
        const created = await createPlayerNote(playerId, { title, date, content: form.content.trim() || null });
        setNotes((prev) => [...prev, created]);
        message.success('Note added.');
      }
      setModalOpen(false);
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
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      message.success('Note removed.');
    } catch {
      message.error('Failed to delete note.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Space size={6}>
          <FileTextOutlined style={{ color: '#8c8c8c' }} />
          <Typography.Text strong style={textMd}>
            Notes
          </Typography.Text>
          {notes.length > 0 && <Tag style={m0}>{notes.length}</Tag>}
        </Space>
        {isGM && (
          <Tag color="blue" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={openCreate}>
            <PlusOutlined /> Add note
          </Tag>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Spin size="small" />
        </div>
      ) : notes.length === 0 ? (
        <Typography.Text type="secondary" style={textSm}>
          No notes yet.
        </Typography.Text>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 6,
                padding: '8px 10px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <Typography.Text strong style={{ fontSize: 13, display: 'block' }}>
                    {note.title}
                  </Typography.Text>
                  <Tag style={{ marginTop: 2, fontSize: 11 }}>{note.date}</Tag>
                </div>
                {isGM && (
                  <Space size={4} style={{ flexShrink: 0 }}>
                    <EditOutlined
                      style={{ cursor: 'pointer', color: '#8c8c8c', fontSize: 13 }}
                      onClick={() => openEdit(note)}
                    />
                    <Popconfirm
                      title="Remove this note?"
                      okText="Remove"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      onConfirm={() => void handleDelete(note.id)}
                    >
                      {deletingId === note.id ? (
                        <Spin size="small" />
                      ) : (
                        <DeleteOutlined style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: 13 }} />
                      )}
                    </Popconfirm>
                  </Space>
                )}
              </div>
              {note.content && (
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, display: 'block', marginTop: 6, whiteSpace: 'pre-wrap' }}
                >
                  {note.content}
                </Typography.Text>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
        okText={editing ? 'Save' : 'Add'}
        confirmLoading={saving}
        title={editing ? 'Edit note' : 'New note'}
        centered
        destroyOnClose
      >
        <Space orientation="vertical" size={12} style={w100}>
          <div>
            <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
              Title *
            </Typography.Text>
            <Input
              placeholder="e.g. Found the artifact"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
              Date *
            </Typography.Text>
            <Input
              placeholder="e.g. Day 12, Year 1285"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
              Content (optional)
            </Typography.Text>
            <TextArea
              rows={3}
              placeholder="Additional details…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

type AltMap = Record<number, string>;
type EditMap = Record<number, { name: string; level: number; background: string }>;
type EditingSet = Record<number, boolean>;

function isPlayerVisible(p: Player) {
  return (p.visible ?? true) === true;
}

export const PlayersPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [isGM, setIsGM] = React.useState<boolean>(!!localStorage.getItem('gm_api_key'));
  React.useEffect(() => {
    const onStorage = () => setIsGM(!!localStorage.getItem('gm_api_key'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [level, setLevel] = React.useState<number>(1);
  const [background, setBackground] = React.useState<string>('');

  const [viewMode, setViewMode] = React.useState<'public' | 'admin'>('public');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  const [altById, setAltById] = React.useState<AltMap>({});
  const setAlt = (id: number, v: string) => setAltById((prev) => ({ ...prev, [id]: v }));

  const [editById, setEditById] = React.useState<EditMap>({});
  const [editingSet, setEditingSet] = React.useState<EditingSet>({});

  function startEdit(p: Player) {
    setEditById((prev) => ({
      ...prev,
      [p.id]: { name: p.name, level: p.level, background: p.background ?? '' },
    }));
    setEditingSet((prev) => ({ ...prev, [p.id]: true }));
  }

  function cancelEdit(id: number) {
    setEditingSet((prev) => ({ ...prev, [id]: false }));
  }

  async function saveEdit(id: number) {
    const e = editById[id];
    if (!e) return;
    if (!e.name.trim()) return message.warning('Name required');
    try {
      await PlayersApi.update(id, {
        name: e.name.trim(),
        level: e.level,
        background: e.background.trim() || null,
      });
      setEditingSet((prev) => ({ ...prev, [id]: false }));
      await load();
      message.success('Player updated');
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to update (GM key?)'));
    }
  }

  const toFile = (f: RcCustomRequestOptions['file']): File => f as File;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await PlayersApi.list();
      setItems(data);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load players'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await PlayersApi.create({
        name: name.trim(),
        level,
        background: background.trim() || null,
      });
      setCreating(false);
      setName('');
      setLevel(1);
      setBackground('');
      await load();
      message.success('Player created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create player (GM key required)'));
    }
  }

  async function toggleVisible(p: Player) {
    try {
      await PlayersApi.setVisible(p.id, !isPlayerVisible(p));
      await load();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
    }
  }

  async function deletePlayer(p: Player) {
    try {
      await PlayersApi.delete(p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      message.success(`${p.name} deleted.`);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete player (GM key?)'));
    }
  }

  const imageProps = (player: Player): UploadProps => ({
    name: 'image',
    accept: 'image/png,image/jpeg,image/webp,image/gif',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const { onError, onSuccess } = options;
      const file = toFile(options.file);
      PlayersApi.uploadImage(player.id, file, altById[player.id])
        .then(async () => {
          onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Image updated');
          await load();
        })
        .catch((err) => {
          onError?.(err as Error);
          message.error('Failed to upload image (GM key?)');
        });
    },
  });

  const sheetProps = (player: Player): UploadProps => ({
    name: 'sheet',
    accept: 'application/pdf',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const { onError, onSuccess } = options;
      const file = toFile(options.file);
      PlayersApi.uploadSheet(player.id, file)
        .then(async () => {
          onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Sheet uploaded');
          await load();
        })
        .catch((err) => {
          onError?.(err as Error);
          message.error('Failed to upload sheet (PDF) — (GM key?)');
        });
    },
  });

  const normalizedItems = React.useMemo(
    () =>
      items.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ? resolveApiUrl(p.imageUrl) : p.imageUrl,
        sheetUrl: p.sheetUrl ? resolveApiUrl(p.sheetUrl) : p.sheetUrl,
      })),
    [items],
  );

  const q = search.trim().toLowerCase();
  const displayItems = React.useMemo(
    () =>
      normalizedItems.filter((p) => {
        if (!isGM && !isPlayerVisible(p)) return false;
        if (isGM && filterVis === 'visible' && !isPlayerVisible(p)) return false;
        if (isGM && filterVis === 'hidden' && isPlayerVisible(p)) return false;
        if (!q) return true;
        return (p.name ?? '').toLowerCase().includes(q) || (p.background ?? '').toLowerCase().includes(q);
      }),
    [normalizedItems, q, filterVis, isGM],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isPlayerVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  // ── Admin Table ───────────────────────────────────────────────────────────
  const AdminTable = (
    <Card density="dense" title="Manage Players">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={displayItems}
          loading={loading}
          scroll={{ x: 700 }}
          style={{ minWidth: 700 }}
          columns={[
            { title: '#', dataIndex: 'id', width: 60, render: (v: number) => <Tag style={m0}>#{v}</Tag> },
            {
              title: 'Visible',
              width: 80,
              render: (_: any, p: Player) => (
                <Switch
                  size="small"
                  checked={isPlayerVisible(p)}
                  onChange={() => void toggleVisible(p)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Player',
              render: (_: any, p: Player) => (
                <Space size={6} wrap>
                  {p.imageUrl && (
                    <img
                      src={resolveApiUrl(p.imageUrl)}
                      alt={p.name}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <Typography.Text strong>{p.name}</Typography.Text>
                  <Tag color="geekblue">Lv {p.level}</Tag>
                  {p.background && (
                    <Typography.Text type="secondary" style={textSm} ellipsis>
                      {p.background.slice(0, 60)}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Actions',
              width: 90,
              render: (_: any, p: Player) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(p)} />
                  <Popconfirm
                    title={`Delete "${p.name}" permanently?`}
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => void deletePlayer(p)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!displayItems.length && !loading && <Empty description="No players found." style={{ marginTop: 16 }} />}
    </Card>
  );

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space orientation="vertical" size={10} style={w100}>
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              Characters
            </Typography.Title>
            <Typography.Text type="secondary" style={textMd}>
              {isGM
                ? 'Manage characters — image, sheet and visibility.'
                : 'The adventurers facing the fate of the Algol system.'}
            </Typography.Text>
          </div>
          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'public' ? 'primary' : 'default'}
                  onClick={() => setViewMode('public')}
                >
                  📖 View
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                  onClick={() => setViewMode('admin')}
                >
                  ⚙️ GM Panel
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'admin' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New Player'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} characters</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
        </Space>

        <Space wrap size={8} style={w100}>
          <Input
            allowClear
            placeholder="Search by name or background…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          {isGM && (
            <Space size={4}>
              {(['all', 'visible', 'hidden'] as const).map((v) => (
                <Button
                  key={v}
                  size="small"
                  type={filterVis === v ? 'primary' : 'default'}
                  onClick={() => setFilterVis(v)}
                >
                  {v === 'all' ? 'All' : v === 'visible' ? 'Visible' : 'Hidden'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {isGM && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
              <Typography.Text strong>New Character</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ minWidth: 240 }}
                  required
                />
                <Space size={6}>
                  <Typography.Text type="secondary" style={textSm}>
                    Level:
                  </Typography.Text>
                  <InputNumber min={1} value={level} onChange={(n) => setLevel(Number(n) || 1)} />
                </Space>
              </Space>
              <TextArea
                placeholder="Background (optional)"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={mobileOnly ? 4 : 3}
              />
              <Space>
                <Button htmlType="submit" type="primary">
                  Create
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  return (
    <>
      <PageTitle>Players</PageTitle>

      {Header}

      {viewMode === 'admin' && isGM ? (
        loading ? (
          <Spinner />
        ) : (
          AdminTable
        )
      ) : loading ? (
        <Spinner />
      ) : displayItems.length === 0 ? (
        <Card density="comfy">
          <Space orientation="vertical" size={8} style={{ width: '100%', alignItems: 'center' }}>
            <Typography.Text type="secondary">No characters found.</Typography.Text>
          </Space>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {displayItems.map((p) => (
            <div key={p.id} style={{ display: 'grid', gap: 8 }}>
              <PlayerCard player={p} gm={isGM} onToggleVisible={toggleVisible} />

              {/* Notes — visible to everyone */}
              <Card density="dense">
                <PlayerNotesSection playerId={p.id} isGM={isGM} />
              </Card>

              {isGM && (
                <Collapse>
                  <AntdCollapse.Panel
                    header={
                      <Space size={8}>
                        <span>Manage</span>
                        <Tag color={isPlayerVisible(p) ? 'green' : 'red'} style={m0}>
                          {isPlayerVisible(p) ? 'Visible' : 'Hidden'}
                        </Tag>
                      </Space>
                    }
                    key={`gm-${p.id}`}
                  >
                    <Space orientation="vertical" size={10} style={w100}>
                      <Space style={spaceBetween}>
                        <Typography.Text style={textMd}>Visible to players</Typography.Text>
                        <Switch
                          size="small"
                          checked={isPlayerVisible(p)}
                          onChange={() => void toggleVisible(p)}
                          checkedChildren={<EyeOutlined />}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>
                      <Divider style={dividerSm} />

                      {/* ── Edição de dados ── */}
                      {editingSet[p.id] ? (
                        <Space orientation="vertical" size={8} style={w100}>
                          <Space wrap size={8}>
                            <Input
                              placeholder="Name *"
                              value={editById[p.id]?.name ?? ''}
                              onChange={(e) =>
                                setEditById((prev) => ({
                                  ...prev,
                                  [p.id]: { ...prev[p.id], name: e.target.value },
                                }))
                              }
                              style={{ minWidth: 180 }}
                            />
                            <Space size={4}>
                              <Typography.Text type="secondary" style={textSm}>
                                Level:
                              </Typography.Text>
                              <InputNumber
                                min={1}
                                value={editById[p.id]?.level ?? 1}
                                onChange={(n) =>
                                  setEditById((prev) => ({
                                    ...prev,
                                    [p.id]: { ...prev[p.id], level: Number(n) || 1 },
                                  }))
                                }
                                style={{ width: 70 }}
                              />
                            </Space>
                          </Space>
                          <TextArea
                            placeholder="Background"
                            rows={3}
                            value={editById[p.id]?.background ?? ''}
                            onChange={(e) =>
                              setEditById((prev) => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], background: e.target.value },
                              }))
                            }
                          />
                          <TagSelect entityType="player" entityId={p.id} />
                          <Space size={6}>
                            <Button size="small" type="primary" onClick={() => void saveEdit(p.id)}>
                              Save
                            </Button>
                            <Button size="small" onClick={() => cancelEdit(p.id)}>
                              Cancel
                            </Button>
                          </Space>
                        </Space>
                      ) : (
                        <Button size="small" onClick={() => startEdit(p)}>
                          Edit name / level / background
                        </Button>
                      )}

                      <Divider style={dividerSm} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Input
                          placeholder="Image alt text"
                          value={altById[p.id] ?? ''}
                          onChange={(e) => setAlt(p.id, e.target.value)}
                          style={{ maxWidth: 200 }}
                        />
                        <Upload {...imageProps(p)}>
                          <Button size="small">Upload image</Button>
                        </Upload>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Upload {...sheetProps(p)}>
                          <Button size="small">Upload PDF</Button>
                        </Upload>
                      </div>
                      <Divider style={dividerMd} />
                      <Popconfirm
                        title={`Delete "${p.name}"? This will permanently remove their image, sheet, notes and quest links.`}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                        onConfirm={() => void deletePlayer(p)}
                      >
                        <Button size="small" danger block icon={<DeleteOutlined />}>
                          Delete player
                        </Button>
                      </Popconfirm>
                    </Space>
                  </AntdCollapse.Panel>
                </Collapse>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PlayersPage;
