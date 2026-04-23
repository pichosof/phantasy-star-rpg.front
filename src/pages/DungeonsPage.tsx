/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Modal, Popconfirm, Select, Space, Switch, Tag, Typography, message } from 'antd';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Switch as AdmMobileSwitch,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
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
import { AddOutline, DeleteOutline, FilterOutline, PictureOutline, SetOutline } from 'antd-mobile-icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
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
  MobileTabs,
} from '@app/components/common/mobile';
import { useGMMode } from '@app/hooks/useGMMode';
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

type ViewMode = 'public' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type DungeonSheetTab = 'view' | 'edit';

function isDungeonVisible(dungeon: Dungeon) {
  return (dungeon.visible ?? true) === true;
}

function mobileDungeonTypeColor(type?: string | null): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  const color = type ? TYPE_COLOR[type] : 'default';
  if (color === 'red' || color === 'volcano') return 'danger';
  if (color === 'gold' || color === 'orange') return 'warning';
  if (color === 'cyan' || color === 'geekblue' || color === 'purple') return 'primary';
  return 'default';
}

const CITY_PICKER_EMPTY_LIMIT = 12;
const CITY_PICKER_SEARCH_LIMIT = 30;

const MobileCityPicker: React.FC<{
  cities: CityOption[];
  onChange: (cityId: number | null) => void;
  value: number | null;
}> = ({ cities, onChange, value }) => {
  const [query, setQuery] = React.useState('');
  const selectedCity = React.useMemo(() => cities.find((city) => city.id === value) ?? null, [cities, value]);
  const normalizedQuery = query.trim().toLowerCase();
  const sortedCities = React.useMemo(() => [...cities].sort((a, b) => a.name.localeCompare(b.name)), [cities]);
  const visibleCities = React.useMemo(() => {
    const matches = normalizedQuery
      ? sortedCities.filter((city) => `${city.name} ${city.id}`.toLowerCase().includes(normalizedQuery))
      : sortedCities;

    return matches.slice(0, normalizedQuery ? CITY_PICKER_SEARCH_LIMIT : CITY_PICKER_EMPTY_LIMIT);
  }, [normalizedQuery, sortedCities]);

  return (
    <S.MobileCityPicker>
      <S.MobileCityCurrent>
        <S.MobileCityCurrentLabel>Current city</S.MobileCityCurrentLabel>
        <S.MobileCityCurrentValue>{selectedCity ? selectedCity.name : 'No linked city'}</S.MobileCityCurrentValue>
      </S.MobileCityCurrent>

      <MobileSearchBar inset={false} onChange={setQuery} placeholder="Search city by name..." value={query} />

      <AdmMobileButton block fill="outline" onClick={() => onChange(null)}>
        No linked city
      </AdmMobileButton>

      <S.MobileCityList>
        {visibleCities.map((city) => (
          <S.MobileCityOption $active={city.id === value} key={city.id} onClick={() => onChange(city.id)} type="button">
            <S.MobileCityOptionName>{city.name}</S.MobileCityOptionName>
            <S.MobileCityOptionMeta>#{city.id}</S.MobileCityOptionMeta>
          </S.MobileCityOption>
        ))}
      </S.MobileCityList>

      {cities.length > visibleCities.length ? (
        <S.MobileCityHint>
          {normalizedQuery
            ? `Showing ${visibleCities.length} matches. Refine the search if needed.`
            : `Showing the first ${visibleCities.length} cities. Search to find others.`}
        </S.MobileCityHint>
      ) : null}
    </S.MobileCityPicker>
  );
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
  const isGM = useGMMode();
  const initialViewModeSyncedRef = React.useRef(false);
  const mobileImageInputRef = React.useRef<HTMLInputElement | null>(null);

  const [items, setItems] = React.useState<Dungeon[]>([]);
  const [cities, setCities] = React.useState<CityOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('public');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<DungeonSheetTab>('view');
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
  const [creatingDungeon, setCreatingDungeon] = React.useState(false);
  const [mobileSaving, setMobileSaving] = React.useState(false);
  const [mobileUploadingImage, setMobileUploadingImage] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!initialViewModeSyncedRef.current) {
      initialViewModeSyncedRef.current = true;
      if (isGM) setViewMode('admin');
    }

    if (!isGM) {
      setViewMode('public');
      setFilterVis('all');
      setDrawerTab('view');
    }
  }, [isGM]);

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
        if (filterVis === 'visible' && !isDungeonVisible(x)) return false;
        if (filterVis === 'hidden' && isDungeonVisible(x)) return false;
        if (!q) return true;
        return (x.name + (x.description ?? '') + (x.region ?? '')).toLowerCase().includes(q);
      }),
    [items, q, filterVis],
  );

  const publicFiltered = React.useMemo(
    () =>
      items.filter((x) => {
        if (!isDungeonVisible(x)) return false;
        if (!q) return true;
        return (x.name + (x.description ?? '') + (x.region ?? '')).toLowerCase().includes(q);
      }),
    [items, q],
  );

  function cityName(id?: number | null) {
    if (!id) return null;
    return cities.find((c) => c.id === id)?.name ?? null;
  }

  function resetCreateForm() {
    setNewName('');
    setNewType(null);
    setNewDesc('');
    setNewRegion('');
    setNewCityId(null);
  }

  async function createDungeonFromDraft() {
    const name = newName.trim();
    if (!name) return message.warning('Name is required');
    setCreatingDungeon(true);
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
      resetCreateForm();
      message.success('Dungeon created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create'));
    } finally {
      setCreatingDungeon(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createDungeonFromDraft();
  }

  async function saveEdit() {
    if (!openDungeon) return;
    if (!editName.trim()) {
      message.warning('Name is required');
      return;
    }
    setMobileSaving(true);
    try {
      await updateDungeon(openDungeon.id, {
        name: editName.trim(),
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
                name: editName.trim(),
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
    } finally {
      setMobileSaving(false);
    }
  }

  async function toggleVisible(d: Dungeon) {
    const next = !isDungeonVisible(d);
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
      setDeleteDialogOpen(false);
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

  async function uploadMobileImage(file: File) {
    if (!openDungeon) return;
    setMobileUploadingImage(true);
    try {
      const image = await addDungeonImage(openDungeon.id, file);
      setItems((prev) =>
        prev.map((d) => (d.id === openDungeon.id ? { ...d, images: [...(d.images ?? []), image] } : d)),
      );
      message.success('Image uploaded');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Upload failed'));
    } finally {
      setMobileUploadingImage(false);
    }
  }

  const displayItems = viewMode === 'admin' ? filtered : publicFiltered;

  const stats = React.useMemo(
    () => ({
      total: items.length,
      visible: items.filter(isDungeonVisible).length,
      hidden: items.filter((d) => !isDungeonVisible(d)).length,
      discovered: items.filter((d) => d.discovered).length,
    }),
    [items],
  );

  const mobileItems = viewMode === 'admin' && isGM ? filtered : publicFiltered;
  const openCityName = openDungeon ? cityName(openDungeon.cityId) : null;
  const openThumb = openDungeon?.images?.[0] ?? null;

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} dungeons
      </AdmMobileTag>
      {isGM ? (
        <>
          <AdmMobileTag color="success" fill="outline" round>
            {stats.visible} visible
          </AdmMobileTag>
          <AdmMobileTag color="warning" fill="outline" round>
            {stats.discovered} discovered
          </AdmMobileTag>
        </>
      ) : null}
    </S.MobileMetaTags>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search dungeons..." value={search} />
      {isGM ? (
        <S.MobileFilterRow>
          <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
            <FilterOutline fontSize={16} /> Filters
          </AdmMobileButton>
          <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
            <AddOutline fontSize={16} /> New dungeon
          </AdmMobileButton>
        </S.MobileFilterRow>
      ) : null}
    </>
  );

  const mobileDungeonOverview = openDungeon ? (
    <S.MobileSectionStack>
      <MobileCard compact>
        <S.MobileDungeonHero>
          {openThumb ? (
            <S.MobileDungeonHeroImage alt={openThumb.alt ?? openDungeon.name} src={resolveApiUrl(openThumb.url)} />
          ) : (
            <S.MobileDungeonFallback>
              <AppIcon name="dungeon" size={46} />
            </S.MobileDungeonFallback>
          )}
        </S.MobileDungeonHero>

        <S.MobileDungeonInfo>
          <S.MobileDungeonTitle>{openDungeon.name}</S.MobileDungeonTitle>
          <S.MobileMetaTags>
            {openDungeon.type ? (
              <AdmMobileTag color={mobileDungeonTypeColor(openDungeon.type)} fill="outline" round>
                {openDungeon.type}
              </AdmMobileTag>
            ) : null}
            {openDungeon.discovered ? (
              <AdmMobileTag color="success" fill="outline" round>
                Discovered
              </AdmMobileTag>
            ) : null}
            {isGM ? (
              <AdmMobileTag color={isDungeonVisible(openDungeon) ? 'success' : 'danger'} fill="outline" round>
                {isDungeonVisible(openDungeon) ? 'Visible' : 'Hidden'}
              </AdmMobileTag>
            ) : null}
          </S.MobileMetaTags>
        </S.MobileDungeonInfo>
      </MobileCard>

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Region</S.MobileDetailLabel>
            <S.MobileDetailValue>{openDungeon.region || 'Unknown'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Linked city</S.MobileDetailLabel>
            <S.MobileDetailValue>{openCityName || 'Not linked'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Images</S.MobileDetailLabel>
            <S.MobileDetailValue>{openDungeon.images?.length ?? 0}</S.MobileDetailValue>
          </S.MobileDetailItem>
        </S.MobileDetailGrid>
      </MobileCard>

      <MobileCard compact title="Description">
        <S.MobileBodyText>{openDungeon.description?.trim() || 'No description yet.'}</S.MobileBodyText>
      </MobileCard>

      {(openDungeon.images?.length ?? 0) > 1 ? (
        <MobileCard compact title="Gallery">
          <S.MobileImageStrip>
            {(openDungeon.images ?? []).map((image) => (
              <S.MobileGalleryThumb key={image.id} alt={image.alt ?? openDungeon.name} src={resolveApiUrl(image.url)} />
            ))}
          </S.MobileImageStrip>
        </MobileCard>
      ) : null}

      <MobileCard compact title="Tags">
        <TagSelect entityId={openDungeon.id} entityType="dungeon" readonly={!isGM} />
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  const mobileDungeonGM = openDungeon ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Dungeon details">
        <MobileForm>
          <MobileForm.Item label="Name">
            <AdmMobileInput clearable onChange={setEditName} placeholder="Dungeon name" value={editName} />
          </MobileForm.Item>
          <MobileForm.Item label="Type">
            <MobileSelector<string>
              columns={2}
              inset={false}
              onChange={(values) => {
                const value = (values[0] as string | undefined) ?? 'none';
                setEditType(value === 'none' ? null : value);
              }}
              options={[
                { label: 'None', value: 'none' },
                ...DUNGEON_TYPES.map((type) => ({ label: type, value: type })),
              ]}
              value={[editType ?? 'none']}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Region">
            <AdmMobileInput clearable onChange={setEditRegion} placeholder="Region or area" value={editRegion} />
          </MobileForm.Item>
          <MobileForm.Item label="Linked city">
            <MobileCityPicker cities={cities} onChange={setEditCityId} value={editCityId} />
          </MobileForm.Item>
          <MobileForm.Item label="Description">
            <AdmMobileTextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              onChange={setEditDesc}
              placeholder="Dungeon description"
              value={editDesc}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isDungeonVisible(openDungeon)} onChange={() => void toggleVisible(openDungeon)} />
        </S.MobileVisibilityRow>
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Marked as discovered</S.MobileInlineLabel>
          <AdmMobileSwitch checked={openDungeon.discovered} onChange={() => void toggleDiscovered(openDungeon)} />
        </S.MobileVisibilityRow>
      </MobileCard>

      <MobileCard compact title="Images">
        <S.MobileUploadStack>
          <AdmMobileButton
            block
            fill="outline"
            loading={mobileUploadingImage}
            onClick={() => mobileImageInputRef.current?.click()}
          >
            <PictureOutline fontSize={17} /> Upload image
          </AdmMobileButton>
          {(openDungeon.images?.length ?? 0) > 0 ? (
            <S.MobileImageManageGrid>
              {(openDungeon.images ?? []).map((image) => (
                <S.MobileImageManageItem key={image.id}>
                  <S.MobileGalleryThumb alt={image.alt ?? openDungeon.name} src={resolveApiUrl(image.url)} />
                  <AdmMobileButton
                    block
                    color="danger"
                    fill="outline"
                    onClick={() => handleImageDeleted(openDungeon.id, image.id)}
                  >
                    <DeleteOutline fontSize={16} /> Remove
                  </AdmMobileButton>
                </S.MobileImageManageItem>
              ))}
            </S.MobileImageManageGrid>
          ) : (
            <S.MobileEmptyState>No images uploaded yet.</S.MobileEmptyState>
          )}
        </S.MobileUploadStack>
      </MobileCard>

      <MobileCard compact title="Tags">
        <TagSelect entityId={openDungeon.id} entityType="dungeon" />
      </MobileCard>

      <MobileCard compact title="Danger Zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>
            Deleting this dungeon also removes its visual entry from the campaign codex.
          </S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete dungeon
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  // ── Cards ─────────────────────────────────────────────────────────────────
  if (mobileOnly) {
    return (
      <>
        <PageTitle>Dungeons</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'public' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('public')}
                  size="small"
                >
                  <IconLabel icon="read" iconSize={16}>
                    View
                  </IconLabel>
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
              ? 'Manage discovered locations, linked cities, gallery images and player visibility.'
              : 'Caves, towers, ruins and lairs of the campaign world.'
          }
          title={<IconLabel icon="dungeon">Dungeons</IconLabel>}
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !mobileItems.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No dungeons found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileDungeonsGrid>
              {mobileItems.map((dungeon) => {
                const thumb = dungeon.images?.[0] ?? null;
                const cname = cityName(dungeon.cityId);
                const gmPanel = isGM && viewMode === 'admin';

                return (
                  <MobileCard compact key={dungeon.id}>
                    <S.MobileDungeonCardBody>
                      <S.MobileDungeonCardMedia>
                        {thumb ? (
                          <S.MobileDungeonCardImage alt={thumb.alt ?? dungeon.name} src={resolveApiUrl(thumb.url)} />
                        ) : (
                          <S.MobileDungeonFallback>
                            <AppIcon name="dungeon" size={40} />
                          </S.MobileDungeonFallback>
                        )}
                      </S.MobileDungeonCardMedia>

                      <S.MobileDungeonTitle>{dungeon.name}</S.MobileDungeonTitle>
                      <S.MobileMetaTags>
                        {dungeon.type ? (
                          <AdmMobileTag color={mobileDungeonTypeColor(dungeon.type)} fill="outline" round>
                            {dungeon.type}
                          </AdmMobileTag>
                        ) : null}
                        {dungeon.discovered ? (
                          <AdmMobileTag color="success" fill="outline" round>
                            Discovered
                          </AdmMobileTag>
                        ) : null}
                        {gmPanel ? (
                          <AdmMobileTag color={isDungeonVisible(dungeon) ? 'success' : 'danger'} fill="outline" round>
                            {isDungeonVisible(dungeon) ? 'Visible' : 'Hidden'}
                          </AdmMobileTag>
                        ) : null}
                        {cname ? (
                          <AdmMobileTag fill="outline" round>
                            {cname}
                          </AdmMobileTag>
                        ) : null}
                      </S.MobileMetaTags>

                      <S.MobileDungeonPreview>
                        {dungeon.description?.trim() || dungeon.region || 'No description yet.'}
                      </S.MobileDungeonPreview>

                      <S.MobileActionGrid>
                        <AdmMobileButton
                          block
                          color="primary"
                          onClick={() => {
                            setDrawerTab('view');
                            setOpenId(dungeon.id);
                          }}
                        >
                          Open dungeon
                        </AdmMobileButton>
                        {gmPanel ? (
                          <AdmMobileButton
                            block
                            fill="outline"
                            onClick={() => {
                              setDrawerTab('edit');
                              setOpenId(dungeon.id);
                            }}
                          >
                            <SetOutline fontSize={17} /> GM controls
                          </AdmMobileButton>
                        ) : null}
                      </S.MobileActionGrid>
                    </S.MobileDungeonCardBody>
                  </MobileCard>
                );
              })}
            </S.MobileDungeonsGrid>
          )}
        </MobilePageScaffold>

        {isGM ? (
          <MobileFilterSheet
            description="Switch between public navigation and GM controls."
            footer={
              <MobileActionBar sticky={false}>
                <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                  Done
                </AdmMobileButton>
              </MobileActionBar>
            }
            onClose={() => setFilterSheetOpen(false)}
            title="Dungeon filters"
            visible={filterSheetOpen}
          >
            <S.MobileSectionStack>
              <S.MobileCreateField>
                <S.MobileFieldLabel>Panel</S.MobileFieldLabel>
                <MobileSelector<ViewMode>
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'public')}
                  options={[
                    { label: 'Public view', value: 'public' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileCreateField>

              <S.MobileCreateField>
                <S.MobileFieldLabel>Visibility</S.MobileFieldLabel>
                <MobileSelector<VisibilityFilter>
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
              </S.MobileCreateField>
            </S.MobileSectionStack>
          </MobileFilterSheet>
        ) : null}

        <MobileEntitySheet
          description={openDungeon ? 'Dungeon overview, linked context and GM controls.' : undefined}
          footer={
            openDungeon && isGM && drawerTab === 'edit' ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton block color="primary" loading={mobileSaving} onClick={() => void saveEdit()}>
                    Save changes
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block fill="outline" onClick={() => setDrawerTab('view')}>
                    Back to overview
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={() => {
            setOpenId(null);
            setDrawerTab('view');
          }}
          subtitle={openDungeon?.type ?? openDungeon?.region ?? undefined}
          title={openDungeon?.name ?? 'Dungeon'}
          visible={Boolean(openDungeon)}
        >
          {openDungeon && isGM ? (
            <MobileTabs
              activeKey={drawerTab}
              items={[
                { key: 'view', title: 'Overview', children: mobileDungeonOverview },
                { key: 'edit', title: 'GM', children: mobileDungeonGM },
              ]}
              onChange={(key) => setDrawerTab(key as DungeonSheetTab)}
            />
          ) : (
            mobileDungeonOverview
          )}

          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadMobileImage(file);
                event.currentTarget.value = '';
              }
            }}
            ref={mobileImageInputRef}
            type="file"
          />
        </MobileEntitySheet>

        <MobileEntitySheet
          description="Create the dungeon now, then add tags and images from GM controls."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton
                  block
                  color="primary"
                  loading={creatingDungeon}
                  onClick={() => void createDungeonFromDraft()}
                >
                  Create dungeon
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton
                  block
                  fill="outline"
                  onClick={() => {
                    setCreating(false);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => {
            setCreating(false);
            resetCreateForm();
          }}
          subtitle="GM only"
          title="New dungeon"
          visible={creating && isGM}
        >
          <MobileCard compact title="Dungeon details">
            <MobileForm>
              <MobileForm.Item label="Name">
                <AdmMobileInput clearable onChange={setNewName} placeholder="Dungeon name" value={newName} />
              </MobileForm.Item>
              <MobileForm.Item label="Type">
                <MobileSelector<string>
                  columns={2}
                  inset={false}
                  onChange={(values) => {
                    const value = (values[0] as string | undefined) ?? 'none';
                    setNewType(value === 'none' ? null : value);
                  }}
                  options={[
                    { label: 'None', value: 'none' },
                    ...DUNGEON_TYPES.map((type) => ({ label: type, value: type })),
                  ]}
                  value={[newType ?? 'none']}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Region">
                <AdmMobileInput clearable onChange={setNewRegion} placeholder="Region or area" value={newRegion} />
              </MobileForm.Item>
              <MobileForm.Item label="Linked city">
                <MobileCityPicker cities={cities} onChange={setNewCityId} value={newCityId} />
              </MobileForm.Item>
              <MobileForm.Item label="Description">
                <AdmMobileTextArea
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  onChange={setNewDesc}
                  placeholder="Description"
                  value={newDesc}
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
              onClick: () => setDeleteDialogOpen(false),
            },
            {
              key: 'delete',
              text: 'Delete dungeon',
              danger: true,
              bold: true,
              onClick: () => {
                if (openDungeon) {
                  return handleDelete(openDungeon.id);
                }
              },
            },
          ]}
          content={openDungeon ? `Delete "${openDungeon.name}" permanently?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete dungeon?"
          visible={deleteDialogOpen}
        />
      </>
    );
  }

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
