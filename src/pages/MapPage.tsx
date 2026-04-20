// src/pages/Map/MapPage.tsx
import React from 'react';
import {
  Badge,
  Button,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { EyeInvisibleOutlined, EyeOutlined, PictureOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';

import {
  listWorlds,
  createWorld,
  updateWorld,
  uploadWorldImage,
  resolveWorldImage,
  type World,
} from '@app/api/worlds.api';
import {
  listCities,
  createCity,
  updateCity,
  updateCityCoords,
  setCityVisible,
  setCityDiscovered,
  addCityImage,
  deleteCity,
  type City,
} from '@app/api/cities.api';
import { listDungeons, updateDungeon } from '@app/api/dungeons.api';
import type { Dungeon } from '@app/types/rpg';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';
import { resolveApiUrl } from '@app/api/http.api';
import { useResponsive } from '@app/hooks/useResponsive';
import { apiErrorMessage } from '../utils/api-error';

const GM_KEY_STORAGE = 'gm_api_key';

type Marker = {
  id: number;
  label: string;
  u: number;
  v: number;
  visible?: boolean;
  discovered?: boolean;
  region?: string | null;
};

type Stage = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
};

function parseCoordinates(s?: string | null): { u: number; v: number } | null {
  if (!s) return null;
  const parts = s.split(',').map((x) => Number(x.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const [u, v] = parts;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return { u, v };
}

function formatDate(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function isCityVisible(c: City) {
  return (c?.visible ?? true) === true;
}

// ── World Admin Drawer ────────────────────────────────────────────────────────

type WorldAdminProps = {
  open: boolean;
  worlds: World[];
  activeWorldId: number | null;
  onClose: () => void;
  onWorldsChanged: (worlds: World[]) => void;
  onActivate: (world: World) => void;
};

const WorldAdminDrawer: React.FC<WorldAdminProps> = ({
  open,
  worlds,
  activeWorldId,
  onClose,
  onWorldsChanged,
  onActivate,
}) => {
  const { mobileOnly } = useResponsive();
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // Create form
  const [newName, setNewName] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  function startEdit(w: World) {
    setEditId(w.id);
    setEditName(w.name);
    setEditDesc(w.description ?? '');
  }
  function cancelEdit() {
    setEditId(null);
  }

  async function saveEdit() {
    if (!editId || !editName.trim()) return;
    setSaving(true);
    try {
      await updateWorld(editId, { name: editName.trim(), description: editDesc.trim() || null });
      onWorldsChanged(
        worlds.map((w) =>
          w.id === editId ? { ...w, name: editName.trim(), description: editDesc.trim() || null } : w,
        ),
      );
      setEditId(null);
      message.success('World updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return message.warning('Name is required');
    setCreating(true);
    try {
      const w = await createWorld({ name: newName.trim(), description: newDesc.trim() || null });
      onWorldsChanged([...worlds, w]);
      setNewName('');
      setNewDesc('');
      message.success('World created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create'));
    } finally {
      setCreating(false);
    }
  }

  function imageUploadProps(worldId: number): UploadProps {
    return {
      showUploadList: false,
      accept: 'image/*',
      customRequest: async (opts: RcCustomRequestOptions) => {
        try {
          await uploadWorldImage(worldId, opts.file as File);
          // Reload worlds to get new image URL
          const { data } = await import('@app/api/worlds.api').then((m) => ({ data: m.listWorlds() }));
          const fresh = await data;
          onWorldsChanged(fresh);
          message.success('Map image uploaded');
          opts.onSuccess?.({});
        } catch (e) {
          message.error(apiErrorMessage(e, 'Upload failed'));
          opts.onError?.(new Error('Upload failed'));
        }
      },
    };
  }

  return (
    <Drawer
      visible={open}
      onClose={onClose}
      width={mobileOnly ? '100%' : 480}
      title={
        <Space>
          <SettingOutlined /> Manage Worlds
        </Space>
      }
    >
      <Tabs defaultActiveKey="worlds">
        {/* ── World list ── */}
        <Tabs.TabPane tab={`Worlds (${worlds.length})`} key="worlds">
          {worlds.length === 0 ? (
            <Empty description="No worlds created yet." />
          ) : (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {worlds.map((w) => (
                <div
                  key={w.id}
                  style={{
                    border: `1px solid ${activeWorldId === w.id ? '#1677ff' : '#f0f0f0'}`,
                    borderRadius: 8,
                    padding: 12,
                    background: activeWorldId === w.id ? '#e6f4ff' : undefined,
                  }}
                >
                  {editId === w.id ? (
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Input
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="World name"
                      />
                      <Input.TextArea
                        size="small"
                        rows={2}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                      />
                      <Space>
                        <Button size="small" type="primary" loading={saving} onClick={() => void saveEdit()}>
                          Save
                        </Button>
                        <Button size="small" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </Space>
                    </Space>
                  ) : (
                    <>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Space size={6}>
                          <Typography.Text strong>{w.name}</Typography.Text>
                          {activeWorldId === w.id && <Tag color="blue">Active</Tag>}
                        </Space>
                        <Space size={4}>
                          {activeWorldId !== w.id && (
                            <Button size="small" onClick={() => onActivate(w)}>
                              Use
                            </Button>
                          )}
                          <Button size="small" onClick={() => startEdit(w)}>
                            Edit
                          </Button>
                          <Upload {...imageUploadProps(w.id)}>
                            <Button size="small" icon={<PictureOutlined />}>
                              Map
                            </Button>
                          </Upload>
                        </Space>
                      </Space>
                      {w.description && (
                        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                          {w.description}
                        </Typography.Text>
                      )}
                      {w.imageUrl && (
                        <div style={{ marginTop: 8, borderRadius: 6, overflow: 'hidden', maxHeight: 80 }}>
                          <img
                            src={resolveApiUrl(w.imageUrl)}
                            alt={w.name}
                            style={{ width: '100%', maxHeight: 80, objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </Space>
          )}
        </Tabs.TabPane>

        {/* ── Create world ── */}
        <Tabs.TabPane
          tab={
            <>
              <PlusOutlined /> New World
            </>
          }
          key="create"
        >
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Form layout="vertical">
              <Form.Item label="Name" required>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Motavia, Palma, Dezo…"
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="World description (optional)"
                />
              </Form.Item>
            </Form>
            <Button type="primary" loading={creating} onClick={() => void handleCreate()}>
              Create World
            </Button>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              After creating, go to &quot;Worlds&quot;, click &quot;Map&quot; to upload the map image.
            </Typography.Text>
          </Space>
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MapPage() {
  const { mobileOnly } = useResponsive();

  // -------- base data --------
  const [loading, setLoading] = React.useState(true);
  const [worlds, setWorlds] = React.useState<World[]>([]);
  const [world, setWorld] = React.useState<World | null>(null);
  const [worldImg, setWorldImg] = React.useState<string | undefined>();
  const [cities, setCities] = React.useState<City[]>([]);
  const [dungeons, setDungeons] = React.useState<Dungeon[]>([]);

  // GM mode
  const [isGM, setIsGM] = React.useState<boolean>(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));

  // -------- UI / hover --------
  const [hoverMarkerId, setHoverMarkerId] = React.useState<number | null>(null);

  // -------- filters --------
  const [filterVisible, setFilterVisible] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [filterDiscover, setFilterDiscover] = React.useState<'all' | 'discovered' | 'undiscovered'>('all');
  const [filterRegion, setFilterRegion] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');

  // -------- ruler --------
  const [measureMode, setMeasureMode] = React.useState(false);
  const [measureA, setMeasureA] = React.useState<{ u: number; v: number } | null>(null);
  const [measureB, setMeasureB] = React.useState<{ u: number; v: number } | null>(null);

  // -------- map refs / fullscreen / stage --------
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [presentMode, setPresentMode] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [stage, setStage] = React.useState<Stage | null>(null);

  // -------- GM positioning --------
  const [pickingCityId, setPickingCityId] = React.useState<number | null>(null);
  const pickingCity = React.useMemo(() => cities.find((c) => c.id === pickingCityId) ?? null, [cities, pickingCityId]);
  const [pickingDungeonId, setPickingDungeonId] = React.useState<number | null>(null);
  const pickingDungeon = React.useMemo(() => dungeons.find((d) => d.id === pickingDungeonId) ?? null, [dungeons, pickingDungeonId]);

  // -------- open city drawer --------
  const [openCityId, setOpenCityId] = React.useState<number | null>(null);
  const openCity = React.useMemo(() => cities.find((c) => c.id === openCityId) ?? null, [cities, openCityId]);

  // -------- open dungeon drawer --------
  const [openDungeonId, setOpenDungeonId] = React.useState<number | null>(null);
  const openDungeon = React.useMemo(() => dungeons.find((d) => d.id === openDungeonId) ?? null, [dungeons, openDungeonId]);

  // -------- city drawer edit state (GM) --------
  const [editCityName, setEditCityName] = React.useState('');
  const [editCityDesc, setEditCityDesc] = React.useState('');
  const [editCityRegion, setEditCityRegion] = React.useState('');
  const [editCityImgAlt, setEditCityImgAlt] = React.useState('');
  const [savingCity, setSavingCity] = React.useState(false);

  React.useEffect(() => {
    if (!openCity) return;
    setEditCityName(openCity.name ?? '');
    setEditCityDesc(openCity.description ?? '');
    setEditCityRegion((openCity as any).region ?? '');
    setEditCityImgAlt(openCity.imageAlt ?? '');
  }, [openCity?.id]);

  // -------- world admin drawer --------
  const [worldAdminOpen, setWorldAdminOpen] = React.useState(false);

  // -------- city links (read-only here) --------
  const [linksLoading, setLinksLoading] = React.useState(false);
  const [cityLores, setCityLores] = React.useState<Lore[]>([]);
  const [cityQuests, setCityQuests] = React.useState<Quest[]>([]);

  // GM key changes in runtime
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) setIsGM(Boolean(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Recalculate stage from real DOM
  const recalcStage = React.useCallback(() => {
    const wrap = mapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    requestAnimationFrame(() => {
      const wrapRect = wrap.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      if (!wrapRect.width || !wrapRect.height || !imgRect.width || !imgRect.height) {
        setStage(null);
        return;
      }

      setStage({
        offsetX: imgRect.left - wrapRect.left,
        offsetY: imgRect.top - wrapRect.top,
        width: imgRect.width,
        height: imgRect.height,
        containerWidth: wrapRect.width,
        containerHeight: wrapRect.height,
      });
    });
  }, []);

  // Load base data
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const [ws, cs, ds] = await Promise.all([listWorlds(), listCities(), listDungeons()]);
        if (!mounted) return;

        const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
        const cs2: City[] = (cs as any[]).map(unwrap);

        const w = ws.find((x: World) => x.imageUrl) ?? ws[0] ?? null;
        setWorlds(ws);
        setWorld(w ?? null);
        setWorldImg(resolveWorldImage(w?.imageUrl ?? undefined));
        setCities(cs2);
        setDungeons(ds);
      } catch (e) {
        console.error(e);
        message.error(apiErrorMessage(e, 'Failed to load world/cities.'));
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Fullscreen events
  React.useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      recalcStage();
    };
    const onFsError = () => {
      setIsFullscreen(false);
      setPresentMode(true);
      recalcStage();
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('fullscreenerror', onFsError);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('fullscreenerror', onFsError);
    };
  }, [recalcStage]);

  React.useEffect(() => {
    if (presentMode && !isFullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [presentMode, isFullscreen]);

  React.useEffect(() => {
    if (!presentMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void exitPresentMode();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentMode]);

  React.useEffect(() => {
    const wrap = mapRef.current;
    const img = imgRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => recalcStage());
    ro.observe(wrap);
    if (img) ro.observe(img);
    window.addEventListener('resize', recalcStage);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalcStage);
    };
  }, [recalcStage]);

  React.useEffect(() => {
    recalcStage();
  }, [presentMode, isFullscreen, worldImg, recalcStage]);

  // Load city links when drawer opens
  React.useEffect(() => {
    if (!openCity) {
      setCityLores([]);
      setCityQuests([]);
      return;
    }

    const playerCanRead = isGM || (openCity as any).discovered === true;
    if (!playerCanRead) {
      setCityLores([]);
      setCityQuests([]);
      return;
    }

    let alive = true;
    setLinksLoading(true);

    Promise.all([listLoresByCityId((openCity as any).id), listQuestsByCityId((openCity as any).id)])
      .then(([lores, quests]) => {
        if (!alive) return;
        setCityLores(lores);
        setCityQuests(quests);
      })
      .catch((e) => {
        console.error(e);
        if (!alive) return;
        message.error('Failed to load lores/quests for this city.');
        setCityLores([]);
        setCityQuests([]);
      })
      .finally(() => {
        if (!alive) return;
        setLinksLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [openCity?.id, (openCity as any)?.discovered, isGM]);

  // -------- region options --------
  const regionOptions = React.useMemo(() => {
    const regions = Array.from(new Set(cities.map((c) => c.region ?? null).filter(Boolean))) as string[];
    regions.sort((a, b) => a.localeCompare(b));
    return [{ value: 'all', label: 'All' }, ...regions.map((r) => ({ value: r, label: r }))];
  }, [cities]);

  // -------- derived markers --------
  const markers = React.useMemo<Marker[]>(() => {
    const list = cities
      .map((c) => {
        if (!isGM && !isCityVisible(c)) return null;
        const p = parseCoordinates(c.coordinates);
        if (!p) return null;
        return {
          id: c.id,
          label: c.name,
          u: p.u,
          v: p.v,
          visible: c.visible,
          discovered: c.discovered,
          region: c.region ?? null,
        } as Marker;
      })
      .filter(Boolean) as Marker[];

    let filtered = list;
    if (filterVisible !== 'all')
      filtered = filtered.filter((m) => (filterVisible === 'visible' ? m.visible !== false : m.visible === false));
    if (filterDiscover !== 'all')
      filtered = filtered.filter((m) =>
        filterDiscover === 'discovered' ? m.discovered === true : m.discovered !== true,
      );
    if (filterRegion !== 'all') filtered = filtered.filter((m) => (m.region ?? '') === filterRegion);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((m) => m.label.toLowerCase().includes(q));
    }
    return filtered;
  }, [cities, filterVisible, filterDiscover, filterRegion, search, isGM]);

  const gmCityOptions = React.useMemo(() => {
    return cities
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .map((c) => ({ value: c.id, label: c.name }));
  }, [cities]);

  const drawerZIndex = presentMode ? 10002 : undefined;

  // -------- map click --------
  const onMapClick = async (ev: React.MouseEvent<HTMLDivElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    let u: number;
    let v: number;

    if (stage) {
      u = (x - stage.offsetX) / stage.width;
      v = (y - stage.offsetY) / stage.height;
      if (u < 0 || u > 1 || v < 0 || v > 1) return;
    } else {
      u = x / rect.width;
      v = y / rect.height;
    }

    if (measureMode) {
      if (!measureA) {
        setMeasureA({ u, v });
        setMeasureB(null);
        return;
      }
      if (!measureB) {
        setMeasureB({ u, v });
        return;
      }
      setMeasureA({ u, v });
      setMeasureB(null);
      return;
    }

    if (!isGM) return;

    if (pickingDungeon) {
      try {
        await updateDungeon(pickingDungeon.id, { coordinates: `${u},${v}` });
        setDungeons((prev) => prev.map((d) => (d.id === pickingDungeon.id ? { ...d, coordinates: `${u},${v}` } : d)));
        message.success(`Coordinates saved for "${pickingDungeon.name}".`);
      } catch (e) {
        message.error(apiErrorMessage(e, 'Failed to save coordinates.'));
      } finally {
        setPickingDungeonId(null);
      }
      return;
    }

    if (!pickingCity) return;

    try {
      await updateCityCoords(pickingCity.id, u, v);
      setCities((prev) => prev.map((c) => (c.id === pickingCity.id ? { ...c, coordinates: `${u},${v}` } : c)));
      message.success(`Coordinates saved for "${pickingCity.name}".`);
    } catch (e) {
      console.error(e);
      message.error(apiErrorMessage(e, 'Failed to save coordinates.'));
    } finally {
      setPickingCityId(null);
    }
  };

  function distanceText(a: { u: number; v: number }, b: { u: number; v: number }) {
    const du = Math.abs(a.u - b.u);
    const dv = Math.abs(a.v - b.v);
    const pct = Math.sqrt(du * du + dv * dv) * 100;
    return `${pct.toFixed(2)}% of map`;
  }

  function confirmClearCoords(city: City) {
    if (!city) return;
    Modal.confirm({
      title: 'Remove coordinates?',
      content: `"${city.name}" will be removed from the map. You can reposition it later.`,
      okText: 'Remove',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await updateCityCoords(city.id, null, null);
          setCities((prev) => prev.map((c) => (c.id === city.id ? { ...c, coordinates: null } : c)));
          setPickingCityId((prev) => (prev === city.id ? null : prev));
          message.success(`Coordinates removed from "${city.name}".`);
        } catch (e) {
          console.error(e);
          message.error(apiErrorMessage(e, 'Failed to remove coordinates.'));
        }
      },
    });
  }

  function confirmDeleteCity(city: City) {
    Modal.confirm({
      title: `Delete city "${city.name}"?`,
      content: 'This action is irreversible.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCity(city.id);
          setCities((prev) => prev.filter((c) => c.id !== city.id));
          setOpenCityId(null);
          message.success(`"${city.name}" deleted.`);
        } catch (e) {
          message.error(apiErrorMessage(e, 'Failed to delete city.'));
        }
      },
    });
  }

  async function saveCityEdit() {
    if (!openCity || !editCityName.trim()) return message.warning('Name is required');
    setSavingCity(true);
    try {
      await updateCity(openCity.id, {
        name: editCityName.trim(),
        description: editCityDesc.trim() || null,
        region: editCityRegion.trim() || null,
      });
      setCities((prev) =>
        prev.map((c) =>
          c.id === openCity.id
            ? {
                ...c,
                name: editCityName.trim(),
                description: editCityDesc.trim() || null,
                region: editCityRegion.trim() || null,
              }
            : c,
        ),
      );
      message.success('City updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    } finally {
      setSavingCity(false);
    }
  }

  const cityImageUploadProps: UploadProps = {
    showUploadList: false,
    accept: 'image/*',
    customRequest: async (opts: RcCustomRequestOptions) => {
      if (!openCity) return;
      try {
        await addCityImage(openCity.id, opts.file as File, editCityImgAlt || undefined);
        const fresh = await listCities();
        setCities((fresh as any[]).map((x) => (x && typeof x === 'object' && 'props' in x ? x.props : x)));
        message.success('Image uploaded');
        opts.onSuccess?.({});
      } catch (e) {
        message.error(apiErrorMessage(e, 'Upload failed'));
        opts.onError?.(new Error('Upload failed'));
      }
    },
  };

  // -------- conditional renders --------
  if (loading) return <Spin style={{ display: 'block', margin: '64px auto' }} />;

  if (!world || !worldImg) {
    return (
      <div style={{ padding: 24 }}>
        <Space direction="vertical" size={12}>
          <Typography.Title level={4}>Map</Typography.Title>
          <Typography.Text type="secondary">No world with image defined.</Typography.Text>
          {isGM && (
            <Button icon={<SettingOutlined />} onClick={() => setWorldAdminOpen(true)}>
              Manage Worlds
            </Button>
          )}
        </Space>
        <WorldAdminDrawer
          open={worldAdminOpen}
          worlds={worlds}
          activeWorldId={world?.id ?? null}
          onClose={() => setWorldAdminOpen(false)}
          onWorldsChanged={(ws) => {
            setWorlds(ws);
            const w = ws.find((x) => x.imageUrl) ?? ws[0] ?? null;
            setWorld(w ?? null);
            setWorldImg(resolveWorldImage(w?.imageUrl ?? undefined));
          }}
          onActivate={(w) => {
            setWorld(w);
            setWorldImg(resolveWorldImage(w.imageUrl ?? undefined));
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {!presentMode && (
          <Typography.Title level={3} style={{ margin: 0 }}>
            Map — {world.name}
          </Typography.Title>
        )}

        {!presentMode && (
          <Space wrap>
            <Button onClick={enterPresentMode}>Presentation (Fullscreen)</Button>
            {isGM && (
              <Button icon={<SettingOutlined />} onClick={() => setWorldAdminOpen(true)}>
                GM Worlds
              </Button>
            )}
            <Tag color="blue">Tip: F11 is the browser fullscreen</Tag>
          </Space>
        )}

        {!presentMode && (
          <>
            <Space wrap align="center">
              <Input
                allowClear
                placeholder="Search city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220 }}
              />

              <Space size={8}>
                <span>Region:</span>
                <Select
                  size="small"
                  style={{ width: 180 }}
                  value={filterRegion}
                  onChange={(v) => setFilterRegion(v)}
                  options={regionOptions}
                />
              </Space>

              <Space size={8}>
                <span>Discovery:</span>
                <Select
                  size="small"
                  style={{ width: 160 }}
                  value={filterDiscover}
                  onChange={(v) => setFilterDiscover(v)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'discovered', label: 'Discovered' },
                    { value: 'undiscovered', label: 'Undiscovered' },
                  ]}
                />
              </Space>

              {isGM && (
                <Space size={8}>
                  <span>Visibility:</span>
                  <Select
                    size="small"
                    style={{ width: 160 }}
                    value={filterVisible}
                    onChange={(v) => setFilterVisible(v)}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'visible', label: 'Visible' },
                      { value: 'hidden', label: 'Hidden' },
                    ]}
                  />
                </Space>
              )}

              <Space size={8}>
                <Badge count={markers.length} showZero />
                <Typography.Text type="secondary">markers</Typography.Text>
              </Space>

              {isGM && (
                <>
                  <Divider type="vertical" />
                  <Space wrap align="center" size={8}>
                    <Select
                      showSearch
                      allowClear
                      size="small"
                      style={{ width: 260 }}
                      placeholder="Select city to position..."
                      value={pickingCityId ?? undefined}
                      onChange={(v) => setPickingCityId(v ?? null)}
                      options={gmCityOptions}
                      filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    />

                    <Button
                      size="small"
                      type={measureMode ? 'primary' : 'default'}
                      onClick={() => {
                        setMeasureMode((v) => !v);
                        setMeasureA(null);
                        setMeasureB(null);
                      }}
                    >
                      Ruler {measureMode ? 'ON' : 'OFF'}
                    </Button>

                    <Select
                      showSearch
                      allowClear
                      size="small"
                      style={{ width: 260 }}
                      placeholder="Select dungeon to position..."
                      value={pickingDungeonId ?? undefined}
                      onChange={(v) => { setPickingDungeonId(v ?? null); if (v) setPickingCityId(null); }}
                      options={dungeons.map((d) => ({ value: d.id, label: `⚔️ ${d.name}` }))}
                      filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    />

                    {pickingCity ? (
                      <Tag color="gold" style={{ margin: 0 }}>
                        Click on the map to position: <b>{pickingCity.name}</b>
                      </Tag>
                    ) : pickingDungeon ? (
                      <Tag color="purple" style={{ margin: 0 }}>
                        Click on the map to position: <b>{pickingDungeon.name}</b>
                      </Tag>
                    ) : (
                      <Tag style={{ margin: 0 }}>Select a city or dungeon to mark on the map</Tag>
                    )}
                  </Space>
                </>
              )}
            </Space>

            <Divider style={{ margin: '8px 0' }} />
          </>
        )}

        {/* MAP */}
        <div
          ref={mapRef}
          onClick={onMapClick}
          style={{
            position: presentMode && !isFullscreen ? 'fixed' : 'relative',
            inset: presentMode && !isFullscreen ? 0 : undefined,
            zIndex: presentMode && !isFullscreen ? 9999 : undefined,
            width: '100%',
            height: presentMode ? '100vh' : undefined,
            margin: presentMode && !isFullscreen ? 0 : '0 auto',
            borderRadius: presentMode ? 0 : 8,
            overflow: 'hidden',
            background: 'black',
            boxShadow: presentMode ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
            cursor: measureMode || (isGM && pickingCity) ? 'crosshair' : 'default',
          }}
        >
          {presentMode && (
            <div
              style={{
                position: 'absolute',
                left: 12,
                top: 12,
                zIndex: 10000,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: 'rgba(0,0,0,0.55)',
                padding: '8px 10px',
                borderRadius: 10,
                color: '#fff',
                backdropFilter: 'blur(2px)',
              }}
            >
              <Button size="small" onClick={exitPresentMode}>
                Exit
              </Button>
              <Button
                size="small"
                type={measureMode ? 'primary' : 'default'}
                onClick={() => {
                  setMeasureMode((v) => !v);
                  setMeasureA(null);
                  setMeasureB(null);
                }}
              >
                Ruler {measureMode ? 'ON' : 'OFF'}
              </Button>
              {isFullscreen ? (
                <Tag color="green" style={{ margin: 0 }}>
                  Fullscreen
                </Tag>
              ) : (
                <Tag color="gold" style={{ margin: 0 }}>
                  Overlay
                </Tag>
              )}
            </div>
          )}

          <img
            ref={imgRef}
            onLoad={() => recalcStage()}
            src={resolveApiUrl(worldImg)}
            alt={world.name}
            style={{
              display: 'block',
              width: '100%',
              height: presentMode ? '100%' : 'auto',
              objectFit: presentMode ? 'contain' : undefined,
              userSelect: 'none',
              background: 'black',
            }}
            draggable={false}
          />

          {/* Markers */}
          {markers.map((m) => {
            const leftCss = stage ? `${stage.offsetX + m.u * stage.width}px` : `${m.u * 100}%`;
            const topCss = stage ? `${stage.offsetY + m.v * stage.height}px` : `${m.v * 100}%`;

            const bg =
              isGM && m.visible === false
                ? 'rgba(255, 70, 70, 0.95)'
                : m.discovered
                ? 'rgba(255,255,255,0.95)'
                : 'rgba(180,180,180,0.95)';

            return (
              <React.Fragment key={m.id}>
                {hoverMarkerId === m.id && (
                  <div
                    style={{
                      position: 'absolute',
                      left: leftCss,
                      top: topCss,
                      transform: 'translate(-50%, calc(-100% - 10px))',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 20,
                    }}
                  >
                    {m.label}
                    {m.region ? ` · ${m.region}` : ''}
                  </div>
                )}
                <div
                  onMouseEnter={() => setHoverMarkerId(m.id)}
                  onMouseLeave={() => setHoverMarkerId((prev) => (prev === m.id ? null : prev))}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCityId(m.id);
                  }}
                  title={m.label}
                  style={{
                    position: 'absolute',
                    left: leftCss,
                    top: topCss,
                    transform: 'translate(-50%, -50%)',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: bg,
                    border: '2px solid rgba(0,0,0,0.85)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    cursor: 'pointer',
                    zIndex: 10,
                    outline: openCityId === m.id ? '3px solid rgba(255,255,0,0.8)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Dungeon markers */}
          {dungeons
            .filter((d) => isGM || d.visible)
            .map((d) => {
              const p = parseCoordinates(d.coordinates);
              if (!p) return null;
              const leftCss = stage ? `${stage.offsetX + p.u * stage.width}px` : `${p.u * 100}%`;
              const topCss = stage ? `${stage.offsetY + p.v * stage.height}px` : `${p.v * 100}%`;
              return (
                <React.Fragment key={`dungeon-${d.id}`}>
                  {hoverMarkerId === -d.id && (
                    <div style={{ position: 'absolute', left: leftCss, top: topCss, transform: 'translate(-50%, calc(-100% - 10px))', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20 }}>
                      ⚔️ {d.name}{d.type ? ` · ${d.type}` : ''}
                    </div>
                  )}
                  <div
                    onMouseEnter={() => setHoverMarkerId(-d.id)}
                    onMouseLeave={() => setHoverMarkerId((prev) => (prev === -d.id ? null : prev))}
                    onClick={(e) => { e.stopPropagation(); setOpenDungeonId(d.id); }}
                    title={d.name}
                    style={{
                      position: 'absolute',
                      left: leftCss,
                      top: topCss,
                      transform: 'translate(-50%, -50%) rotate(45deg)',
                      width: 14,
                      height: 14,
                      background: isGM && !d.visible ? 'rgba(255,70,70,0.95)' : d.discovered ? 'rgba(180,100,255,0.95)' : 'rgba(120,60,180,0.8)',
                      border: '2px solid rgba(0,0,0,0.85)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                      cursor: 'pointer',
                      zIndex: 10,
                      outline: openDungeonId === d.id ? '3px solid rgba(255,255,0,0.8)' : 'none',
                      outlineOffset: 2,
                    }}
                  />
                </React.Fragment>
              );
            })}

          {/* Ruler */}
          {measureA && measureB && stage && (
            <svg
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              viewBox={`0 0 ${stage.containerWidth} ${stage.containerHeight}`}
              preserveAspectRatio="none"
            >
              {(() => {
                const ax = stage.offsetX + measureA.u * stage.width;
                const ay = stage.offsetY + measureA.v * stage.height;
                const bx = stage.offsetX + measureB.u * stage.width;
                const by = stage.offsetY + measureB.v * stage.height;
                const mx = (ax + bx) / 2;
                const my = (ay + by) / 2;
                return (
                  <>
                    <line x1={ax} y1={ay} x2={bx} y2={by} stroke="white" strokeWidth={4} opacity={0.85} />
                    <circle cx={ax} cy={ay} r={6} fill="white" opacity={0.95} />
                    <circle cx={bx} cy={by} r={6} fill="white" opacity={0.95} />
                    <rect x={mx - 90} y={my - 22} width={180} height={28} fill="rgba(0,0,0,0.6)" rx={6} />
                    <text x={mx} y={my - 2} fontSize="16" textAnchor="middle" fill="white">
                      {distanceText(measureA, measureB)}
                    </text>
                  </>
                );
              })()}
            </svg>
          )}
        </div>

        {/* ── City Drawer ── */}
        <Drawer
          zIndex={drawerZIndex}
          visible={!!openCity}
          onClose={() => setOpenCityId(null)}
          width={mobileOnly ? '100%' : 580}
          title={
            openCity ? (
              <Space wrap size={8}>
                <span style={{ fontWeight: 800 }}>{openCity.name}</span>
                {openCity.region ? <Tag>{openCity.region}</Tag> : null}
                {openCity.visible === false && isGM ? <Tag color="red">Hidden</Tag> : null}
                {openCity.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Not discovered</Tag>}
              </Space>
            ) : (
              'City'
            )
          }
        >
          {openCity && (
            <Tabs defaultActiveKey="details">
              {/* ── Details ── */}
              <Tabs.TabPane tab="Details" key="details">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Typography.Text type="secondary">{openCity.region || 'Region not specified'}</Typography.Text>
                  {openCity.imageUrl && (isGM || openCity.discovered) && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 180, marginBottom: 8 }}>
                      <img
                        src={resolveApiUrl(openCity.imageUrl)}
                        alt={openCity.imageAlt ?? openCity.name}
                        style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                    {isGM || openCity.discovered
                      ? openCity.description || 'No description.'
                      : 'Information unavailable.'}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    Created: {formatDate(openCity.createdAt)}
                    {openCity.updatedAt ? ` · Updated: ${formatDate(openCity.updatedAt)}` : ''}
                  </Typography.Text>
                </Space>
              </Tabs.TabPane>

              {/* ── Admin (GM only) ── */}
              {isGM && (
                <Tabs.TabPane tab="✏️ Admin" key="admin">
                  <Form layout="vertical">
                    <Form.Item label="Name" required>
                      <Input value={editCityName} onChange={(e) => setEditCityName(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Region">
                      <Input
                        value={editCityRegion}
                        onChange={(e) => setEditCityRegion(e.target.value)}
                        placeholder="Ex: Northern Dunes, East Coast…"
                      />
                    </Form.Item>
                    <Form.Item label="Description">
                      <Input.TextArea
                        rows={5}
                        value={editCityDesc}
                        onChange={(e) => setEditCityDesc(e.target.value)}
                        placeholder="Descriptive text for the city…"
                      />
                    </Form.Item>
                    <Space>
                      <Button type="primary" loading={savingCity} onClick={() => void saveCityEdit()}>
                        Save
                      </Button>
                      <Button danger onClick={() => confirmDeleteCity(openCity)}>
                        Delete city
                      </Button>
                    </Space>
                  </Form>
                </Tabs.TabPane>
              )}

              {/* ── Image (GM only) ── */}
              {isGM && (
                <Tabs.TabPane tab="🖼️ Image" key="image">
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    {openCity.imageUrl ? (
                      <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 220 }}>
                        <img
                          src={resolveApiUrl(openCity.imageUrl)}
                          alt={openCity.imageAlt ?? openCity.name}
                          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ) : (
                      <Typography.Text type="secondary">No image.</Typography.Text>
                    )}
                    <Form.Item label="Alt text" style={{ marginBottom: 8 }}>
                      <Input
                        value={editCityImgAlt}
                        onChange={(e) => setEditCityImgAlt(e.target.value)}
                        placeholder={openCity.name}
                      />
                    </Form.Item>
                    <Upload {...cityImageUploadProps}>
                      <Button icon={<PictureOutlined />}>{openCity.imageUrl ? 'Change image' : 'Upload image'}</Button>
                    </Upload>
                  </Space>
                </Tabs.TabPane>
              )}

              {/* ── Controls (GM only) ── */}
              {isGM && (
                <Tabs.TabPane tab="⚙️ Controls" key="controls">
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {/* Visible */}
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <Typography.Text>Visible to players</Typography.Text>
                        <br />
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          Hidden cities do not appear on the players&apos; map.
                        </Typography.Text>
                      </div>
                      <Switch
                        checked={isCityVisible(openCity)}
                        checkedChildren={<EyeOutlined />}
                        unCheckedChildren={<EyeInvisibleOutlined />}
                        onChange={async (v) => {
                          await setCityVisible(openCity.id, v);
                          setCities((prev) => prev.map((c) => (c.id === openCity.id ? { ...c, visible: v } : c)));
                        }}
                      />
                    </Space>
                    {/* Discovered */}
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <Typography.Text>Discovered</Typography.Text>
                        <br />
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          Unlocks description, image and lores for the players.
                        </Typography.Text>
                      </div>
                      <Switch
                        checked={openCity.discovered === true}
                        onChange={async (v) => {
                          await setCityDiscovered(openCity.id, v);
                          setCities((prev) => prev.map((c) => (c.id === openCity.id ? { ...c, discovered: v } : c)));
                        }}
                      />
                    </Space>
                    <Divider style={{ margin: '4px 0' }} />
                    {/* Map position */}
                    <Typography.Text strong>Map position</Typography.Text>
                    <Space wrap>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          setPickingCityId(openCity.id);
                          message.info('Click on the map to position.');
                        }}
                      >
                        Reposition
                      </Button>
                      {openCity.coordinates && (
                        <Button size="small" danger onClick={() => confirmClearCoords(openCity)}>
                          Remove from map
                        </Button>
                      )}
                    </Space>
                    {openCity.coordinates && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Coords: {openCity.coordinates}
                      </Typography.Text>
                    )}
                  </Space>
                </Tabs.TabPane>
              )}

              {/* ── Lores ── */}
              <Tabs.TabPane tab={`Lores (${cityLores.length})`} key="lores">
                {!isGM && !openCity.discovered ? (
                  <Typography.Text type="secondary">Content unavailable until the city is discovered.</Typography.Text>
                ) : linksLoading ? (
                  <Spin />
                ) : !cityLores.length ? (
                  <Empty description="No lores linked." />
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {cityLores.map((l) => (
                      <div key={l.id} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 12 }}>
                        <Space wrap size={8}>
                          <Typography.Text strong>{l.title}</Typography.Text>
                          {l.category ? <Tag>{l.category}</Tag> : <Tag>(no category)</Tag>}
                        </Space>
                        <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {l.content?.trim() || '—'}
                        </Typography.Paragraph>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.TabPane>

              {/* ── Quests ── */}
              <Tabs.TabPane tab={`Quests (${cityQuests.length})`} key="quests">
                {!isGM && !openCity.discovered ? (
                  <Typography.Text type="secondary">Content unavailable until the city is discovered.</Typography.Text>
                ) : linksLoading ? (
                  <Spin />
                ) : !cityQuests.length ? (
                  <Empty description="No quests linked." />
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {cityQuests.map((q) => (
                      <div key={q.id} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 12 }}>
                        <Space wrap size={8}>
                          <Typography.Text strong>{q.title}</Typography.Text>
                          {q.status && (
                            <Tag color={q.status === 'active' ? 'blue' : q.status === 'completed' ? 'green' : 'red'}>
                              {q.status}
                            </Tag>
                          )}
                          {q.reward && <Tag color="gold">Reward</Tag>}
                        </Space>
                        <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {q.description?.trim() || '—'}
                        </Typography.Paragraph>
                        {q.reward && <Typography.Text type="secondary">Reward: {q.reward}</Typography.Text>}
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.TabPane>
            </Tabs>
          )}
        </Drawer>

        {/* ── Dungeon Drawer ── */}
        <Drawer
          zIndex={drawerZIndex}
          visible={!!openDungeon}
          onClose={() => setOpenDungeonId(null)}
          width={mobileOnly ? '100%' : 480}
          title={openDungeon ? (
            <Space wrap size={8}>
              <span style={{ fontWeight: 800 }}>⚔️ {openDungeon.name}</span>
              {openDungeon.type && <Tag color="purple">{openDungeon.type}</Tag>}
              {openDungeon.discovered && <Tag color="green">Discovered</Tag>}
              {isGM && !openDungeon.visible && <Tag color="red">Hidden</Tag>}
            </Space>
          ) : 'Dungeon'}
        >
          {openDungeon && (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {openDungeon.region && <Tag>{openDungeon.region}</Tag>}
              {openDungeon.description ? (
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{openDungeon.description}</Typography.Paragraph>
              ) : (
                <Typography.Text type="secondary">No description.</Typography.Text>
              )}
              {isGM && (
                <Space wrap size={8}>
                  <Button size="small" type="primary" onClick={() => { setPickingDungeonId(openDungeon.id); setOpenDungeonId(null); message.info('Click on the map to position.'); }}>
                    Reposition
                  </Button>
                  {openDungeon.coordinates && (
                    <Button size="small" danger onClick={async () => {
                      await updateDungeon(openDungeon.id, { coordinates: null });
                      setDungeons((prev) => prev.map((d) => d.id === openDungeon.id ? { ...d, coordinates: null } : d));
                      setOpenDungeonId(null);
                      message.success('Removed from map.');
                    }}>
                      Remove from map
                    </Button>
                  )}
                </Space>
              )}
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {openDungeon.coordinates ? `Coords: ${openDungeon.coordinates}` : 'Not positioned on map'}
              </Typography.Text>
            </Space>
          )}
        </Drawer>

        {/* ── World Admin Drawer ── */}
        <WorldAdminDrawer
          open={worldAdminOpen}
          worlds={worlds}
          activeWorldId={world?.id ?? null}
          onClose={() => setWorldAdminOpen(false)}
          onWorldsChanged={(ws) => {
            setWorlds(ws);
            const w = ws.find((x) => x.imageUrl) ?? ws[0] ?? null;
            setWorld(w ?? null);
            setWorldImg(resolveWorldImage(w?.imageUrl ?? undefined));
          }}
          onActivate={(w) => {
            setWorld(w);
            setWorldImg(resolveWorldImage(w.imageUrl ?? undefined));
          }}
        />
      </Space>
    </div>
  );

  async function enterPresentMode() {
    setPresentMode(true);
    recalcStage();
    const el = mapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement && el.requestFullscreen) await el.requestFullscreen();
    } catch (e) {
      console.warn('Fullscreen failed, staying in overlay.', e);
    } finally {
      recalcStage();
    }
  }

  async function exitPresentMode() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch (e) {
      console.warn('Exit fullscreen failed.', e);
    } finally {
      setPresentMode(false);
      setMeasureMode(false);
      setMeasureA(null);
      setMeasureB(null);
      recalcStage();
    }
  }
}
