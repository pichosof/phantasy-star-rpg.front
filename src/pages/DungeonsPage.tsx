/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Modal, Popconfirm, Select, Space, Switch, Tag, Typography, message } from 'antd';
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
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
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
import {
  m0,
  w100,
  textSm,
  textXs,
  textMd,
  mutedSm,
  bold800,
  spaceBetween,
  dividerSm,
  hiddenInput,
  blackBg,
  dungeon404,
  carouselLeft,
  carouselRight,
  carouselLeftLg,
  carouselRightLg,
  carouselCounter,
  carouselTopRight,
  tableWrap,
  imgCoverH,
  imgContainH,
  lineHeight175,
} from '@app/styles/styleUtils';
import * as S from './DungeonsPage.styles';

type CityOption = { id: number; name: string };

const GM_KEY = 'gm_api_key';

const DUNGEON_TYPES = ['cave', 'tower', 'ruin', 'lair', 'temple', 'facility', 'other'];
const TYPE_COLOR: Record<string, string> = {
  cave: 'purple',
  tower: 'geekblue',
  ruin: 'volcano',
  lair: 'red',
  temple: 'gold',
  facility: 'cyan',
  other: 'default',
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

  React.useEffect(() => {
    if (idx >= images.length && images.length > 0) setIdx(images.length - 1);
  }, [images.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (images.length === 0) {
    return gm ? (
      <div style={S.emptyUploadState}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={hiddenInput}
          onChange={(e) => void handleUpload(e.target.files?.[0])}
        />
        <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()} loading={uploading}>
          Upload first image
        </Button>
      </div>
    ) : (
      <Empty description="No images" style={S.emptyImages} />
    );
  }

  const cur = images[idx];
  const imgUrl = resolveApiUrl(cur.url);

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      await addDungeonImage(dungeonId, file, cur?.alt ?? undefined);
      message.success('Image uploaded');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <S.carouselWrap>
      <div style={blackBg}>
        <img src={imgUrl} alt={cur.alt ?? ''} style={imgContainH(340)} />
        <div style={carouselTopRight}>
          <Button size="small" icon={<FullscreenOutlined />} onClick={() => setLightbox(true)} />
          {gm && (
            <Popconfirm
              title="Delete this image?"
              okText="Delete"
              cancelText="Cancel"
              onConfirm={() => {
                onDeleted?.(cur.id);
              }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </div>
        {images.length > 1 && (
          <>
            <Button
              size="small"
              icon={<LeftOutlined />}
              style={carouselLeft}
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            />
            <Button
              size="small"
              icon={<RightOutlined />}
              style={carouselRight}
              onClick={() => setIdx((i) => (i + 1) % images.length)}
            />
          </>
        )}
        <div style={carouselCounter}>
          {idx + 1}/{images.length}
        </div>
      </div>

      {images.length > 1 && (
        <S.thumbsRow>
          {images.map((img, i) => (
            <img
              key={img.id}
              src={resolveApiUrl(img.url)}
              alt={img.alt ?? ''}
              onClick={() => setIdx(i)}
              style={S.thumb(i === idx)}
            />
          ))}
        </S.thumbsRow>
      )}

      {gm && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={hiddenInput}
            onChange={(e) => void handleUpload(e.target.files?.[0])}
          />
          <Button size="small" icon={<UploadOutlined />} onClick={() => fileRef.current?.click()} loading={uploading}>
            Add image
          </Button>
        </div>
      )}

      <Modal
        open={lightbox}
        onCancel={() => setLightbox(false)}
        footer={null}
        width="90vw"
        styles={{ body: S.lightboxBody }}
        centered
        destroyOnHidden
      >
        <div style={S.lightboxFrame}>
          <img src={imgUrl} alt={cur.alt ?? ''} style={S.lightboxImage} />
          {images.length > 1 && (
            <>
              <Button
                size="large"
                icon={<LeftOutlined />}
                style={carouselLeftLg}
                onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              />
              <Button
                size="large"
                icon={<RightOutlined />}
                style={carouselRightLg}
                onClick={() => setIdx((i) => (i + 1) % images.length)}
              />
            </>
          )}
        </div>
      </Modal>
    </S.carouselWrap>
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

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!openDungeon) return;
    setEditName(openDungeon.name ?? '');
    setEditType(openDungeon.type ?? null);
    setEditDesc(openDungeon.description ?? '');
    setEditRegion(openDungeon.region ?? '');
    setEditCityId(openDungeon.cityId ?? null);
  }, [openDungeon?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(
    () =>
      items.filter((x) => {
        if (filterVis === 'visible' && !x.visible) return false;
        if (filterVis === 'hidden' && x.visible) return false;
        if (!q) return true;
        return (x.name + (x.description ?? '') + (x.region ?? '')).toLowerCase().includes(q);
      }),
    [items, q, filterVis],
  );

  const publicFiltered = React.useMemo(
    () =>
      items.filter((x) => {
        if (!x.visible) return false;
        if (!q) return true;
        return (x.name + (x.description ?? '') + (x.region ?? '')).toLowerCase().includes(q);
      }),
    [items, q],
  );

  function cityName(id?: number | null) {
    if (!id) return null;
    return cities.find((c) => c.id === id)?.name ?? null;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return message.warning('Name is required');
    try {
      const d = await createDungeon({
        name,
        type: newType,
        description: newDesc.trim() || null,
        region: newRegion.trim() || null,
        cityId: newCityId,
      });
      setItems((prev) => [...prev, d]);
      setCreating(false);
      setNewName('');
      setNewType(null);
      setNewDesc('');
      setNewRegion('');
      setNewCityId(null);
      message.success('Dungeon created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create'));
    }
  }

  async function saveEdit() {
    if (!openDungeon) return;
    try {
      await updateDungeon(openDungeon.id, {
        name: editName,
        type: editType,
        description: editDesc.trim() || null,
        region: editRegion.trim() || null,
        cityId: editCityId,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.id === openDungeon.id
            ? {
                ...x,
                name: editName,
                type: editType,
                description: editDesc.trim() || null,
                region: editRegion.trim() || null,
                cityId: editCityId,
              }
            : x,
        ),
      );
      message.success('Saved');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    }
  }

  async function toggleVisible(d: Dungeon) {
    const next = !d.visible;
    setItems((prev) => prev.map((x) => (x.id === d.id ? { ...x, visible: next } : x)));
    try {
      await setDungeonVisible(d.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed'));
      await load();
    }
  }

  async function toggleDiscovered(d: Dungeon) {
    const next = !d.discovered;
    setItems((prev) => prev.map((x) => (x.id === d.id ? { ...x, discovered: next } : x)));
    try {
      await setDungeonDiscovered(d.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed'));
      await load();
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteDungeon(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete'));
    }
  }

  function handleImageDeleted(dungeonId: number, imgId: number) {
    setItems((prev) =>
      prev.map((d) => (d.id === dungeonId ? { ...d, images: (d.images ?? []).filter((i) => i.id !== imgId) } : d)),
    );
    deleteDungeonImage(dungeonId, imgId).catch(() => undefined);
  }

  const displayItems = viewMode === 'admin' ? filtered : publicFiltered;

  // ── Cards ─────────────────────────────────────────────────────────────────
  const PublicView = loading ? (
    <Spinner />
  ) : displayItems.length === 0 ? (
    <Card density="comfy">
      <Empty description="No dungeons found." />
    </Card>
  ) : (
    <S.PublicGrid $mobileOnly={mobileOnly}>
      {displayItems.map((d) => {
        const thumb = d.images?.[0];
        const cname = cityName(d.cityId);
        return (
          <S.PublicCard
            key={d.id}
            onClick={() => {
              setDrawerTab('view');
              setOpenId(d.id);
            }}
          >
            {thumb ? (
              <img src={resolveApiUrl(thumb.url)} alt={thumb.alt ?? d.name} style={imgCoverH(140)} />
            ) : (
              <div style={dungeon404}>
                <AppIcon name="dungeon" size={42} />
              </div>
            )}
            <div style={S.publicCardBody}>
              <Space size={6} wrap>
                {d.type && (
                  <Tag color={TYPE_COLOR[d.type] ?? 'default'} style={m0}>
                    {d.type}
                  </Tag>
                )}
                {d.discovered && (
                  <Tag color="green" style={m0}>
                    Discovered
                  </Tag>
                )}
                {isGM && (
                  <Tag color={d.visible ? 'green' : 'red'} style={S.visibleTag}>
                    {d.visible ? 'Visible' : 'Hidden'}
                  </Tag>
                )}
              </Space>
              <Typography.Title level={5} style={m0} ellipsis={{ rows: 1 }}>
                {d.name}
              </Typography.Title>
              {d.region && (
                <Typography.Text type="secondary" style={textSm}>
                  {d.region}
                </Typography.Text>
              )}
              {cname && (
                <Typography.Text type="secondary" style={textXs}>
                  <IconLabel icon="location" gap={6}>
                    {cname}
                  </IconLabel>
                </Typography.Text>
              )}
              {d.description && (
                <Typography.Paragraph style={S.publicDescription} ellipsis={{ rows: 2 }}>
                  {d.description}
                </Typography.Paragraph>
              )}
            </div>
          </S.PublicCard>
        );
      })}
    </S.PublicGrid>
  );

  // ── Admin table ────────────────────────────────────────────────────────────
  const AdminTable = (
    <Card density="dense" title="Manage Dungeons">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 800 }}
          style={S.tableMinWidth}
          columns={[
            { title: '#', dataIndex: 'id', width: 60, render: (v: number) => <Tag style={m0}>#{v}</Tag> },
            {
              title: 'Visible',
              width: 80,
              render: (_: any, d: Dungeon) => (
                <Switch
                  size="small"
                  checked={!!d.visible}
                  onChange={() => void toggleVisible(d)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Discovered',
              width: 100,
              render: (_: any, d: Dungeon) => (
                <Switch size="small" checked={!!d.discovered} onChange={() => void toggleDiscovered(d)} />
              ),
            },
            {
              title: 'Dungeon',
              render: (_: any, d: Dungeon) => (
                <Space orientation="vertical" size={2}>
                  <Space size={6} wrap>
                    <Typography.Text
                      strong
                      style={S.clickableText}
                      onClick={() => {
                        setDrawerTab('view');
                        setOpenId(d.id);
                      }}
                    >
                      {d.name}
                    </Typography.Text>
                    {d.type && (
                      <Tag color={TYPE_COLOR[d.type] ?? 'default'} style={m0}>
                        {d.type}
                      </Tag>
                    )}
                  </Space>
                  {d.region && (
                    <Typography.Text type="secondary" style={textSm}>
                      {d.region}
                    </Typography.Text>
                  )}
                  {cityName(d.cityId) && (
                    <Typography.Text type="secondary" style={textXs}>
                      <IconLabel icon="location" gap={6}>
                        {cityName(d.cityId)}
                      </IconLabel>
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Actions',
              width: 90,
              render: (_: any, d: Dungeon) => (
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setDrawerTab('edit');
                      setOpenId(d.id);
                    }}
                  />
                  <Popconfirm
                    title="Delete dungeon permanently?"
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => void handleDelete(d.id)}
                  >
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
    <Drawer
      open
      onClose={() => setOpenId(null)}
      size={mobileOnly ? '100%' : 680}
      title={
        <Space wrap size={8}>
          <span style={bold800}>{openDungeon.name}</span>
          {openDungeon.type && <Tag color={TYPE_COLOR[openDungeon.type] ?? 'default'}>{openDungeon.type}</Tag>}
        </Space>
      }
      extra={
        isGM ? (
          <Space>
            <Popconfirm
              title="Delete dungeon permanently?"
              okText="Delete"
              cancelText="Cancel"
              onConfirm={() => void handleDelete(openDungeon.id)}
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
            {drawerTab === 'edit' && (
              <Button type="primary" size="small" onClick={() => void saveEdit()}>
                Save
              </Button>
            )}
          </Space>
        ) : null
      }
    >
      <Tabs activeKey={drawerTab} onChange={(k) => setDrawerTab(k as 'view' | 'edit')}>
        <Tabs.TabPane tab={<IconLabel icon="dungeon">Dungeon</IconLabel>} key="view">
          <Space orientation="vertical" size={16} style={w100}>
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
              {cityName(openDungeon.cityId) && (
                <Tag color="geekblue" icon={<AppIcon name="location" />}>
                  {cityName(openDungeon.cityId)}
                </Tag>
              )}
            </Space>

            {openDungeon.description && (
              <Card density="dense" title="Description">
                <Typography.Paragraph style={lineHeight175}>{openDungeon.description}</Typography.Paragraph>
              </Card>
            )}

            <div>
              <Typography.Text type="secondary" style={S.tagsLabel}>
                Tags
              </Typography.Text>
              <TagSelect entityType="dungeon" entityId={openDungeon.id} readonly={!isGM} />
            </div>

            {isGM && (
              <Space size={6} wrap>
                <span style={mutedSm}>Visible:</span>
                <Switch size="small" checked={!!openDungeon.visible} onChange={() => void toggleVisible(openDungeon)} />
                <span style={S.discoveredMeta}>Discovered:</span>
                <Switch
                  size="small"
                  checked={!!openDungeon.discovered}
                  onChange={() => void toggleDiscovered(openDungeon)}
                />
              </Space>
            )}
          </Space>
        </Tabs.TabPane>

        {isGM && (
          <Tabs.TabPane tab={<IconLabel icon="edit">Edit</IconLabel>} key="edit">
            <Space orientation="vertical" size={12} style={w100}>
              <Card density="dense" title="Details">
                <Space orientation="vertical" size={10} style={w100}>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Name *
                    </Typography.Text>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Type
                    </Typography.Text>
                    <Select
                      allowClear
                      style={w100}
                      value={editType}
                      onChange={(v) => setEditType(v ?? null)}
                      options={DUNGEON_TYPES.map((t) => ({ value: t, label: t }))}
                      placeholder="Select type"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Region
                    </Typography.Text>
                    <Input
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      placeholder="Region or area"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Linked city
                    </Typography.Text>
                    <Select
                      allowClear
                      style={w100}
                      value={editCityId ?? undefined}
                      onChange={(v) => setEditCityId(v ?? null)}
                      options={cities.map((c) => ({ value: c.id, label: c.name }))}
                      placeholder="Select city"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={textSm}>
                      Description
                    </Typography.Text>
                    <TextArea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={6} />
                  </div>
                </Space>
              </Card>

              <Card density="dense" title={<IconLabel icon="tags">Tags</IconLabel>}>
                <TagSelect entityType="dungeon" entityId={openDungeon.id} />
              </Card>

              <Card density="dense" title={<IconLabel icon="image">Images</IconLabel>}>
                <DungeonImageCarousel
                  images={openDungeon.images ?? []}
                  dungeonId={openDungeon.id}
                  gm
                  onDeleted={(imgId) => handleImageDeleted(openDungeon.id, imgId)}
                />
              </Card>

              <Button type="primary" block onClick={() => void saveEdit()}>
                Save Changes
              </Button>
            </Space>
          </Tabs.TabPane>
        )}
      </Tabs>
    </Drawer>
  ) : null;

  return (
    <>
      <PageTitle>Dungeons</PageTitle>

      <Card density="dense" className="rpg-page-header-card">
        <Space orientation="vertical" size={10} style={w100}>
          <Space style={spaceBetween} size={8}>
            <div>
              <Typography.Title level={4} style={m0}>
                {viewMode === 'admin' ? (
                  <IconLabel icon="gm">GM Panel - Dungeons</IconLabel>
                ) : (
                  <IconLabel icon="dungeon">Dungeons</IconLabel>
                )}
              </Typography.Title>
              <Typography.Text type="secondary" style={textMd}>
                Caves, towers, ruins and lairs of the campaign world.
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
                    <IconLabel icon="read">View</IconLabel>
                  </Button>
                  <Button
                    size="small"
                    type={viewMode === 'admin' ? 'primary' : 'default'}
                    onClick={() => setViewMode('admin')}
                  >
                    <IconLabel icon="gm">GM Panel</IconLabel>
                  </Button>
                </Space>
              )}
              {isGM && viewMode === 'admin' && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setCreating((v) => !v)}>
                  {creating ? 'Close' : 'New Dungeon'}
                </Button>
              )}
            </Space>
          </Space>

          <Space wrap size={8}>
            <Input
              allowClear
              placeholder="Search dungeons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.headerSearch}
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

          {isGM && viewMode === 'admin' && creating && (
            <>
              <Divider style={dividerSm} />
              <S.createForm onSubmit={(e) => void onCreate(e)}>
                <Typography.Text strong>New Dungeon</Typography.Text>
                <Space wrap size={8}>
                  <Input
                    placeholder="Name *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={S.createNameInput}
                    required
                  />
                  <Select
                    allowClear
                    style={S.createTypeInput}
                    value={newType ?? undefined}
                    onChange={(v) => setNewType(v ?? null)}
                    options={DUNGEON_TYPES.map((t) => ({ value: t, label: t }))}
                    placeholder="Type"
                  />
                  <Input
                    placeholder="Region"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    style={S.createRegionInput}
                  />
                  <Select
                    allowClear
                    style={S.createCityInput}
                    value={newCityId ?? undefined}
                    onChange={(v) => setNewCityId(v ?? null)}
                    options={cities.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Linked city"
                  />
                </Space>
                <TextArea
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                />
                <Space>
                  <Button type="primary" htmlType="submit">
                    Create Dungeon
                  </Button>
                  <Button onClick={() => setCreating(false)}>Cancel</Button>
                </Space>
              </S.createForm>
            </>
          )}
        </Space>
      </Card>

      {viewMode === 'admin' && isGM ? loading ? <Spinner /> : AdminTable : PublicView}
      {DetailDrawer}
    </>
  );
};

export default DungeonsPage;
