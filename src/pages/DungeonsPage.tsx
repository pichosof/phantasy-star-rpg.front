import React from 'react';
import {
  Collapse,
  Divider,
  Drawer,
  Empty,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FullscreenOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { resolveApiUrl } from '@app/api/http.api';
import {
  listDungeons,
  createDungeon,
  updateDungeon,
  deleteDungeon,
  setDungeonVisible,
  setDungeonDiscovered,
  addDungeonImage,
  deleteDungeonImage,
} from '@app/api/dungeons.api';
import { listCities } from '@app/api/cities.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Dungeon, DungeonImage } from '@app/types/rpg';

type CityOption = { id: number; name: string };

const GM_KEY = 'gm_api_key';

const DUNGEON_TYPES = ['cave', 'tower', 'ruin', 'lair', 'temple', 'facility', 'other'];
const TYPE_COLOR: Record<string, string> = {
  cave: 'purple', tower: 'geekblue', ruin: 'volcano', lair: 'red',
  temple: 'gold', facility: 'cyan', other: 'default',
};

// ── Image carousel ────────────────────────────────────────────────────────────
const DungeonImageCarousel: React.FC<{
  images: DungeonImage[];
  dungeonId: number;
  gm?: boolean;
  onDeleted?: (imgId: number) => void;
}> = ({ images, dungeonId, gm, onDeleted }) => {
  const [idx, setIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { if (idx >= images.length && images.length > 0) setIdx(images.length - 1); }, [images.length]);

  if (images.length === 0) {
    return gm ? (
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void handleUpload(e.target.files?.[0])} />
        <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()} loading={uploading}>Upload first image</Button>
      </div>
    ) : <Empty description="No images" style={{ padding: 16 }} />;
  }

  const cur = images[idx];
  const imgUrl = resolveApiUrl(cur.url);

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      await addDungeonImage(dungeonId, file, cur?.alt ?? undefined);
      message.success('Image uploaded');
    } catch (e) { message.error(apiErrorMessage(e, 'Upload failed')); }
    finally { setUploading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Main image */}
      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: '#000' }}>
        <img src={imgUrl} alt={cur.alt ?? ''} style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block' }} />
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          <Button size="small" icon={<FullscreenOutlined />} onClick={() => setLightbox(true)} />
          {gm && (
            <Popconfirm title="Delete this image?" okText="Delete" cancelText="Cancel" onConfirm={() => { onDeleted?.(cur.id); }}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </div>
        {images.length > 1 && (
          <>
            <Button size="small" icon={<LeftOutlined />} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)} />
            <Button size="small" icon={<RightOutlined />} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setIdx((i) => (i + 1) % images.length)} />
          </>
        )}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 10 }}>
          {idx + 1}/{images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {images.map((img, i) => (
            <img key={img.id} src={resolveApiUrl(img.url)} alt={img.alt ?? ''} onClick={() => setIdx(i)}
              style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: i === idx ? '2px solid #1677ff' : '2px solid transparent', opacity: i === idx ? 1 : 0.65, flexShrink: 0 }} />
          ))}
        </div>
      )}

      {gm && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void handleUpload(e.target.files?.[0])} />
          <Button size="small" icon={<UploadOutlined />} onClick={() => fileRef.current?.click()} loading={uploading}>Add image</Button>
        </div>
      )}

      {/* Lightbox */}
      <Modal visible={lightbox} onCancel={() => setLightbox(false)} footer={null} width="90vw" bodyStyle={{ padding: 0 }} centered destroyOnClose>
        <div style={{ position: 'relative', background: '#000', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={imgUrl} alt={cur.alt ?? ''} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
          {images.length > 1 && (
            <>
              <Button size="large" icon={<LeftOutlined />} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)} />
              <Button size="large" icon={<RightOutlined />} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setIdx((i) => (i + 1) % images.length)} />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const DungeonsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY));

  const [items, setItems] = React.useState<Dungeon[]>([]);
  const [cities, setCities] = React.useState<CityOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [viewMode, setViewMode] = React.useState<'public' | 'admin'>('public');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'view' | 'edit'>('view');
  const openDungeon = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  // Form state
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState<string | null>(null);
  const [newDesc, setNewDesc] = React.useState('');
  const [newRegion, setNewRegion] = React.useState('');
  const [newCityId, setNewCityId] = React.useState<number | null>(null);

  const [editName, setEditName] = React.useState('');
  const [editType, setEditType] = React.useState<string | null>(null);
  const [editDesc, setEditDesc] = React.useState('');
  const [editRegion, setEditRegion] = React.useState('');
  const [editCityId, setEditCityId] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([listDungeons(), listCities()]);
      setItems(d);
      setCities(c as CityOption[]);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  // Sync edit form when opening a dungeon
  React.useEffect(() => {
    if (!openDungeon) return;
    setEditName(openDungeon.name ?? '');
    setEditType(openDungeon.type ?? null);
    setEditDesc(openDungeon.description ?? '');
    setEditRegion(openDungeon.region ?? '');
    setEditCityId(openDungeon.cityId ?? null);
  }, [openDungeon?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(() => items.filter((x) => {
    if (filterVis === 'visible' && !x.visible) return false;
    if (filterVis === 'hidden' && x.visible) return false;
    if (!q) return true;
    return (x.name + (x.description ?? '') + (x.region ?? '')).toLowerCase().includes(q);
  }), [items, q, filterVis]);

  const publicFiltered = React.useMemo(() => items.filter((x) => {
    if (!x.visible) return false;
    if (!q) return true;
    return (x.name + (x.description ?? '') + (x.region ?? '')).toLowerCase().includes(q);
  }), [items, q]);

  function cityName(id?: number | null) {
    if (!id) return null;
    return cities.find((c) => c.id === id)?.name ?? null;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return message.warning('Name is required');
    try {
      const d = await createDungeon({ name, type: newType, description: newDesc.trim() || null, region: newRegion.trim() || null, cityId: newCityId });
      setItems((prev) => [...prev, d]);
      setCreating(false);
      setNewName(''); setNewType(null); setNewDesc(''); setNewRegion(''); setNewCityId(null);
      message.success('Dungeon created');
    } catch (e) { message.error(apiErrorMessage(e, 'Failed to create')); }
  }

  async function saveEdit() {
    if (!openDungeon) return;
    try {
      await updateDungeon(openDungeon.id, { name: editName, type: editType, description: editDesc.trim() || null, region: editRegion.trim() || null, cityId: editCityId });
      setItems((prev) => prev.map((x) => x.id === openDungeon.id ? { ...x, name: editName, type: editType, description: editDesc.trim() || null, region: editRegion.trim() || null, cityId: editCityId } : x));
      message.success('Saved');
    } catch (e) { message.error(apiErrorMessage(e, 'Failed to save')); }
  }

  async function toggleVisible(d: Dungeon) {
    const next = !d.visible;
    setItems((prev) => prev.map((x) => x.id === d.id ? { ...x, visible: next } : x));
    try { await setDungeonVisible(d.id, next); }
    catch (e) { message.error(apiErrorMessage(e, 'Failed')); await load(); }
  }

  async function toggleDiscovered(d: Dungeon) {
    const next = !d.discovered;
    setItems((prev) => prev.map((x) => x.id === d.id ? { ...x, discovered: next } : x));
    try { await setDungeonDiscovered(d.id, next); }
    catch (e) { message.error(apiErrorMessage(e, 'Failed')); await load(); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteDungeon(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Deleted');
    } catch (e) { message.error(apiErrorMessage(e, 'Failed to delete')); }
  }

  function handleImageDeleted(dungeonId: number, imgId: number) {
    setItems((prev) => prev.map((d) => d.id === dungeonId ? { ...d, images: (d.images ?? []).filter((i) => i.id !== imgId) } : d));
    deleteDungeonImage(dungeonId, imgId).catch(() => {});
  }

  function handleImageUploaded(dungeonId: number, img: DungeonImage) {
    setItems((prev) => prev.map((d) => d.id === dungeonId ? { ...d, images: [...(d.images ?? []), img] } : d));
  }

  const displayItems = viewMode === 'admin' ? filtered : publicFiltered;

  // ── Cards ─────────────────────────────────────────────────────────────────
  const gridCols = mobileOnly ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))';

  const PublicView = loading ? <Spinner /> : displayItems.length === 0 ? (
    <Card density="comfy"><Empty description="No dungeons found." /></Card>
  ) : (
    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
      {displayItems.map((d) => {
        const thumb = d.images?.[0];
        const cname = cityName(d.cityId);
        return (
          <div key={d.id} style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', background: 'var(--background-color,#fff)', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onClick={() => { setDrawerTab('view'); setOpenId(d.id); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
            {thumb ? (
              <img src={resolveApiUrl(thumb.url)} alt={thumb.alt ?? d.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ height: 80, background: 'linear-gradient(135deg,#1a1a2e,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>⚔️</div>
            )}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Space size={6} wrap>
                {d.type && <Tag color={TYPE_COLOR[d.type] ?? 'default'} style={{ margin: 0 }}>{d.type}</Tag>}
                {d.discovered && <Tag color="green" style={{ margin: 0 }}>Discovered</Tag>}
                {isGM && <Tag color={d.visible ? 'green' : 'red'} style={{ margin: 0, fontSize: 10 }}>{d.visible ? 'Visible' : 'Hidden'}</Tag>}
              </Space>
              <Typography.Title level={5} style={{ margin: 0 }} ellipsis={{ rows: 1 }}>{d.name}</Typography.Title>
              {d.region && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{d.region}</Typography.Text>}
              {cname && <Typography.Text type="secondary" style={{ fontSize: 11 }}>📍 {cname}</Typography.Text>}
              {d.description && <Typography.Paragraph style={{ margin: 0, fontSize: 12, color: '#595959' }} ellipsis={{ rows: 2 }}>{d.description}</Typography.Paragraph>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Admin table ────────────────────────────────────────────────────────────
  const AdminTable = (
    <Card density="dense" title="Manage Dungeons">
      <div style={{ overflowX: 'auto' }}>
        <Table rowKey="id" dataSource={filtered} loading={loading} scroll={{ x: 800 }} style={{ minWidth: 800 }}
          columns={[
            { title: '#', dataIndex: 'id', width: 60, render: (v: number) => <Tag style={{ margin: 0 }}>#{v}</Tag> },
            { title: 'Visible', width: 80, render: (_: any, d: Dungeon) => <Switch size="small" checked={!!d.visible} onChange={() => void toggleVisible(d)} checkedChildren={<EyeOutlined />} unCheckedChildren={<EyeInvisibleOutlined />} /> },
            { title: 'Discovered', width: 100, render: (_: any, d: Dungeon) => <Switch size="small" checked={!!d.discovered} onChange={() => void toggleDiscovered(d)} /> },
            {
              title: 'Dungeon', render: (_: any, d: Dungeon) => (
                <Space direction="vertical" size={2}>
                  <Space size={6} wrap>
                    <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => { setDrawerTab('view'); setOpenId(d.id); }}>{d.name}</Typography.Text>
                    {d.type && <Tag color={TYPE_COLOR[d.type] ?? 'default'} style={{ margin: 0 }}>{d.type}</Tag>}
                  </Space>
                  {d.region && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{d.region}</Typography.Text>}
                  {cityName(d.cityId) && <Typography.Text type="secondary" style={{ fontSize: 11 }}>📍 {cityName(d.cityId)}</Typography.Text>}
                </Space>
              ),
            },
            {
              title: 'Actions', width: 90, render: (_: any, d: Dungeon) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => { setDrawerTab('edit'); setOpenId(d.id); }} />
                  <Popconfirm title="Delete dungeon permanently?" okText="Delete" cancelText="Cancel" onConfirm={() => void handleDelete(d.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
    </Card>
  );

  // ── Drawer ─────────────────────────────────────────────────────────────────
  const DetailDrawer = openDungeon ? (
    <Drawer visible onClose={() => setOpenId(null)} width={mobileOnly ? '100%' : 680}
      title={<Space wrap size={8}><span style={{ fontWeight: 800 }}>{openDungeon.name}</span>{openDungeon.type && <Tag color={TYPE_COLOR[openDungeon.type] ?? 'default'}>{openDungeon.type}</Tag>}</Space>}
      extra={isGM ? (
        <Space>
          <Popconfirm title="Delete dungeon permanently?" okText="Delete" cancelText="Cancel" onConfirm={() => void handleDelete(openDungeon.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
          {drawerTab === 'edit' && <Button type="primary" size="small" onClick={() => void saveEdit()}>Save</Button>}
        </Space>
      ) : null}
    >
      <Tabs activeKey={drawerTab} onChange={(k) => setDrawerTab(k as 'view' | 'edit')}>
        <Tabs.TabPane tab="⚔️ Dungeon" key="view">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Images */}
            <DungeonImageCarousel
              images={openDungeon.images ?? []}
              dungeonId={openDungeon.id}
              gm={isGM}
              onDeleted={(imgId) => handleImageDeleted(openDungeon.id, imgId)}
            />

            <Space wrap size={6}>
              {openDungeon.type && <Tag color={TYPE_COLOR[openDungeon.type] ?? 'default'}>{openDungeon.type}</Tag>}
              {openDungeon.discovered && <Tag color="green">Discovered</Tag>}
              {openDungeon.region && <Tag>{openDungeon.region}</Tag>}
              {cityName(openDungeon.cityId) && <Tag color="geekblue">📍 {cityName(openDungeon.cityId)}</Tag>}
            </Space>

            {openDungeon.description && (
              <Card density="dense" title="Description">
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.75 }}>{openDungeon.description}</Typography.Paragraph>
              </Card>
            )}

            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Tags</Typography.Text>
              <TagSelect entityType="dungeon" entityId={openDungeon.id} readonly={!isGM} />
            </div>

            {isGM && (
              <Space size={6} wrap>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>Visible:</span>
                <Switch size="small" checked={!!openDungeon.visible} onChange={() => void toggleVisible(openDungeon)} />
                <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>Discovered:</span>
                <Switch size="small" checked={!!openDungeon.discovered} onChange={() => void toggleDiscovered(openDungeon)} />
              </Space>
            )}
          </Space>
        </Tabs.TabPane>

        {isGM && (
          <Tabs.TabPane tab="✏️ Edit" key="edit">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Card density="dense" title="Details">
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>Name *</Typography.Text>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>Type</Typography.Text>
                    <Select allowClear style={{ width: '100%' }} value={editType} onChange={(v) => setEditType(v ?? null)} options={DUNGEON_TYPES.map((t) => ({ value: t, label: t }))} placeholder="Select type" />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>Region</Typography.Text>
                    <Input value={editRegion} onChange={(e) => setEditRegion(e.target.value)} placeholder="Region or area" />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>Linked city</Typography.Text>
                    <Select allowClear style={{ width: '100%' }} value={editCityId ?? undefined} onChange={(v) => setEditCityId(v ?? null)} options={cities.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select city" />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>Description</Typography.Text>
                    <TextArea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={6} />
                  </div>
                </Space>
              </Card>

              <Card density="dense" title="🏷️ Tags">
                <TagSelect entityType="dungeon" entityId={openDungeon.id} />
              </Card>

              <Card density="dense" title="🖼️ Images">
                <DungeonImageCarousel
                  images={openDungeon.images ?? []}
                  dungeonId={openDungeon.id}
                  gm
                  onDeleted={(imgId) => handleImageDeleted(openDungeon.id, imgId)}
                />
              </Card>

              <Button type="primary" block onClick={() => void saveEdit()}>Save Changes</Button>
            </Space>
          </Tabs.TabPane>
        )}
      </Tabs>
    </Drawer>
  ) : null;

  return (
    <>
      <PageTitle>Dungeons</PageTitle>

      {/* Header */}
      <Card density="dense" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={8}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>{viewMode === 'admin' ? '⚙️ GM Panel — Dungeons' : '⚔️ Dungeons'}</Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>Caves, towers, ruins and lairs of the campaign world.</Typography.Text>
            </div>
            <Space size={8} wrap>
              {isGM && (
                <Space size={4}>
                  <Button size="small" type={viewMode === 'public' ? 'primary' : 'default'} onClick={() => setViewMode('public')}>📖 View</Button>
                  <Button size="small" type={viewMode === 'admin' ? 'primary' : 'default'} onClick={() => setViewMode('admin')}>⚙️ GM Panel</Button>
                </Space>
              )}
              {isGM && viewMode === 'admin' && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setCreating((v) => !v)}>{creating ? 'Close' : 'New Dungeon'}</Button>
              )}
            </Space>
          </Space>

          <Space wrap size={8}>
            <Input allowClear placeholder="Search dungeons…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
            {isGM && (
              <Space size={4}>
                {(['all', 'visible', 'hidden'] as const).map((v) => (
                  <Button key={v} size="small" type={filterVis === v ? 'primary' : 'default'} onClick={() => setFilterVis(v)}>
                    {v === 'all' ? 'All' : v === 'visible' ? 'Visible' : 'Hidden'}
                  </Button>
                ))}
              </Space>
            )}
          </Space>

          {/* Create form */}
          {isGM && viewMode === 'admin' && creating && (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
                <Typography.Text strong>New Dungeon</Typography.Text>
                <Space wrap size={8}>
                  <Input placeholder="Name *" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ minWidth: 240 }} required />
                  <Select allowClear style={{ minWidth: 160 }} value={newType ?? undefined} onChange={(v) => setNewType(v ?? null)} options={DUNGEON_TYPES.map((t) => ({ value: t, label: t }))} placeholder="Type" />
                  <Input placeholder="Region" value={newRegion} onChange={(e) => setNewRegion(e.target.value)} style={{ minWidth: 160 }} />
                  <Select allowClear style={{ minWidth: 200 }} value={newCityId ?? undefined} onChange={(v) => setNewCityId(v ?? null)} options={cities.map((c) => ({ value: c.id, label: c.name }))} placeholder="Linked city" />
                </Space>
                <TextArea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
                <Space>
                  <Button type="primary" htmlType="submit">Create Dungeon</Button>
                  <Button onClick={() => setCreating(false)}>Cancel</Button>
                </Space>
              </form>
            </>
          )}
        </Space>
      </Card>

      {viewMode === 'admin' && isGM ? (loading ? <Spinner /> : AdminTable) : PublicView}
      {DetailDrawer}
    </>
  );
};

export default DungeonsPage;
