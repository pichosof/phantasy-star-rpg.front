// src/pages/Map/MapPage.tsx
import React from 'react';
import {
  Badge,
  Button,
  Divider,
  Drawer,
  Empty,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';

import { listWorlds, resolveWorldImage, type World } from '@app/api/worlds.api';
import { type City, listCities, updateCityCoords } from '@app/api/cities.api';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';
import { resolveApiUrl } from '@app/api/http.api';
import { useResponsive } from '@app/hooks/useResponsive';

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

function isCityVisible(c: any) {
  return (c?.visible ?? true) === true;
}

export default function MapPage() {
  const { mobileOnly } = useResponsive();

  // -------- base data --------
  const [loading, setLoading] = React.useState(true);
  const [world, setWorld] = React.useState<World | null>(null);
  const [worldImg, setWorldImg] = React.useState<string | undefined>();
  const [cities, setCities] = React.useState<City[]>([]);

  // GM mode (reage a storage)
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
  const pickingCity = React.useMemo(
    () => cities.find((c: any) => c.id === pickingCityId) ?? null,
    [cities, pickingCityId],
  );

  // -------- open city drawer --------
  const [openCityId, setOpenCityId] = React.useState<number | null>(null);
  const openCity = React.useMemo(() => cities.find((c: any) => c.id === openCityId) ?? null, [cities, openCityId]);

  // -------- city links (read-only here) --------
  const [linksLoading, setLinksLoading] = React.useState(false);
  const [cityLores, setCityLores] = React.useState<Lore[]>([]);
  const [cityQuests, setCityQuests] = React.useState<Quest[]>([]);

  // GM key changes in runtime
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) {
        setIsGM(Boolean(e.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Stage robusto (DOM real)
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
        const [ws, cs] = await Promise.all([listWorlds(), listCities()]);
        if (!mounted) return;

        const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
        const cs2: City[] = (cs as any[]).map(unwrap);

        const w = ws.find((x: World) => x.imageUrl) ?? ws[0] ?? null;
        setWorld(w ?? null);
        setWorldImg(resolveWorldImage(w?.imageUrl ?? undefined));
        setCities(cs2);
      } catch (e) {
        console.error(e);
        message.error('Falha ao carregar mundo/cidades.');
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

  // trava scroll quando overlay
  React.useEffect(() => {
    if (presentMode && !isFullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [presentMode, isFullscreen]);

  // ESC sai do modo apresentação
  React.useEffect(() => {
    if (!presentMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void exitPresentMode();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentMode]);

  // Resize observers
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

  // recalcula quando alterna modos / troca imagem
  React.useEffect(() => {
    recalcStage();
  }, [presentMode, isFullscreen, worldImg, recalcStage]);

  async function enterPresentMode() {
    setPresentMode(true);
    recalcStage();

    const el = mapRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
      }
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

  // Carrega lores/quests quando abre a cidade (read-only)
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
        message.error('Falha ao carregar lores/quests da cidade.');
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

  // -------- regions options --------
  const regionOptions = React.useMemo(() => {
    const regions = Array.from(
      new Set(
        cities.map((c: any) => ((c as any).region as string | null | undefined) ?? null).filter((x) => Boolean(x)),
      ),
    ) as string[];

    regions.sort((a, b) => a.localeCompare(b));

    return [{ value: 'all', label: 'Todas' }, ...regions.map((r) => ({ value: r, label: r }))];
  }, [cities]);

  // -------- derived markers --------
  const markers = React.useMemo<Marker[]>(() => {
    const list = cities
      .map((c: any) => {
        // PCs nunca devem ver cidades hidden
        if (!isGM && !isCityVisible(c)) return null;

        const p = parseCoordinates((c as any).coordinates);
        if (!p) return null;

        return {
          id: (c as any).id,
          label: (c as any).name,
          u: p.u,
          v: p.v,
          visible: (c as any).visible,
          discovered: (c as any).discovered,
          region: ((c as any).region as string | null | undefined) ?? null,
        } as Marker;
      })
      .filter(Boolean) as Marker[];

    let filtered = list;

    if (filterVisible !== 'all') {
      filtered = filtered.filter((m) => (filterVisible === 'visible' ? m.visible !== false : m.visible === false));
    }

    if (filterDiscover !== 'all') {
      filtered = filtered.filter((m) =>
        filterDiscover === 'discovered' ? m.discovered === true : m.discovered !== true,
      );
    }

    if (filterRegion !== 'all') {
      filtered = filtered.filter((m) => (m.region ?? '') === filterRegion);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((m) => m.label.toLowerCase().includes(q));
    }

    return filtered;
  }, [cities, filterVisible, filterDiscover, filterRegion, search, isGM]);

  // ✅ IMPORTANTE: este useMemo PRECISA ficar antes de qualquer return condicional
  const gmCityOptions = React.useMemo(() => {
    return cities
      .slice()
      .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
      .map((c: any) => ({ value: c.id, label: c.name }));
  }, [cities]);

  const drawerZIndex = presentMode ? 10002 : undefined;

  // -------- clicks on map --------
  const onMapClick = async (ev: React.MouseEvent<HTMLDivElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    let u: number;
    let v: number;

    if (stage) {
      u = (x - stage.offsetX) / stage.width;
      v = (y - stage.offsetY) / stage.height;
      if (u < 0 || u > 1 || v < 0 || v > 1) return; // clicou nas faixas pretas
    } else {
      u = x / rect.width;
      v = y / rect.height;
    }

    // régua
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

    // GM positioning (admin do mapa = só isso)
    if (!isGM || !pickingCity) return;

    try {
      await updateCityCoords((pickingCity as any).id, u, v);
      setCities((prev: any[]) =>
        prev.map((c: any) => (c.id === (pickingCity as any).id ? { ...c, coordinates: `${u},${v}` } : c)),
      );
      message.success(`Coords gravadas para "${(pickingCity as any).name}".`);
    } catch (e) {
      console.error(e);
      message.error('Erro ao salvar coordenadas.');
    } finally {
      setPickingCityId(null);
    }
  };

  function distanceText(a: { u: number; v: number }, b: { u: number; v: number }) {
    const du = Math.abs(a.u - b.u);
    const dv = Math.abs(a.v - b.v);
    const pct = Math.sqrt(du * du + dv * dv) * 100;
    return `${pct.toFixed(2)}% do mapa`;
  }

  function confirmClearCoords(city: any) {
    if (!city) return;

    Modal.confirm({
      title: 'Remover coordenadas?',
      content: `A cidade "${city.name}" vai sair do mapa (o marker some). Você pode reposicionar depois.`,
      okText: 'Remover',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await updateCityCoords(city.id, null, null);
          setCities((prev: any[]) => prev.map((c: any) => (c.id === city.id ? { ...c, coordinates: null } : c)));
          setPickingCityId((prev) => (prev === city.id ? null : prev));
          message.success(`Coordenadas removidas de "${city.name}".`);
        } catch (e) {
          console.error(e);
          message.error('Falha ao remover coordenadas.');
        }
      },
    });
  }

  // ✅ agora pode ter returns condicionais, porque nenhum hook vem depois daqui
  if (loading) return <Spin style={{ display: 'block', margin: '64px auto' }} />;

  if (!world || !worldImg) {
    return (
      <div style={{ padding: 24 }}>
        <Typography.Title level={4}>Mapa</Typography.Title>
        <Typography.Text type="secondary">
          Nenhum mundo com imagem definido. Cadastre um mundo/imagem no painel GM e volte aqui.
        </Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {!presentMode && (
          <Typography.Title level={3} style={{ margin: 0 }}>
            Mapa — {world.name}
          </Typography.Title>
        )}

        {!presentMode && (
          <Space wrap>
            <Button onClick={enterPresentMode}>Apresentação (Tela cheia)</Button>
            <Tag color="blue">Dica: F11 é fullscreen do navegador</Tag>
          </Space>
        )}

        {!presentMode && (
          <>
            <Space wrap align="center">
              <Input
                allowClear
                placeholder="Buscar cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220 }}
              />

              <Space size={8}>
                <span>Região:</span>
                <Select
                  size="small"
                  style={{ width: 180 }}
                  value={filterRegion}
                  onChange={(v) => setFilterRegion(v)}
                  options={regionOptions}
                />
              </Space>

              <Space size={8}>
                <span>Descoberta:</span>
                <Select
                  size="small"
                  style={{ width: 160 }}
                  value={filterDiscover}
                  onChange={(v) => setFilterDiscover(v)}
                  options={[
                    { value: 'all', label: 'Todas' },
                    { value: 'discovered', label: 'Descobertas' },
                    { value: 'undiscovered', label: 'Não descobertas' },
                  ]}
                />
              </Space>

              {isGM && (
                <Space size={8}>
                  <span>Visibilidade:</span>
                  <Select
                    size="small"
                    style={{ width: 160 }}
                    value={filterVisible}
                    onChange={(v) => setFilterVisible(v)}
                    options={[
                      { value: 'all', label: 'Todas' },
                      { value: 'visible', label: 'Visíveis' },
                      { value: 'hidden', label: 'Invisíveis' },
                    ]}
                  />
                </Space>
              )}

              <Space size={8}>
                <Badge count={markers.length} showZero />
                <Typography.Text type="secondary">marcadores</Typography.Text>
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
                      placeholder="Selecionar cidade para posicionar..."
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
                      Régua {measureMode ? 'ON' : 'OFF'}
                    </Button>

                    {pickingCity ? (
                      <Tag color="gold" style={{ margin: 0 }}>
                        Clique no mapa para posicionar: <b>{(pickingCity as any).name}</b>
                      </Tag>
                    ) : (
                      <Tag style={{ margin: 0 }}>Selecione uma cidade para marcar no mapa</Tag>
                    )}
                  </Space>
                </>
              )}
            </Space>

            <Divider style={{ margin: '8px 0' }} />
          </>
        )}

        {/* MAPA */}
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
                Sair
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
                Régua {measureMode ? 'ON' : 'OFF'}
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
            const leftPx = stage ? stage.offsetX + m.u * stage.width : null;
            const topPx = stage ? stage.offsetY + m.v * stage.height : null;

            const leftCss = stage ? `${leftPx}px` : `${m.u * 100}%`;
            const topCss = stage ? `${topPx}px` : `${m.v * 100}%`;

            const bg =
              isGM && m.visible === false
                ? 'rgba(255, 70, 70, 0.95)'
                : m.discovered
                ? 'rgba(255,255,255,0.95)'
                : 'rgba(180,180,180,0.95)';

            const outline = openCityId === m.id ? '3px solid rgba(255,255,0,0.8)' : 'none';

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
                    outline,
                    outlineOffset: 2,
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Régua */}
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

        {/* Drawer da cidade */}
        <Drawer
          zIndex={drawerZIndex}
          visible={!!openCity}
          onClose={() => setOpenCityId(null)}
          width={mobileOnly ? '100%' : 560}
          title={
            openCity ? (
              <Space wrap size={8}>
                <span style={{ fontWeight: 800 }}>{(openCity as any).name}</span>
                {(openCity as any).region ? <Tag>{(openCity as any).region}</Tag> : null}
                {(openCity as any).visible === false && isGM ? <Tag color="red">Hidden</Tag> : null}
                {(openCity as any).discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
              </Space>
            ) : (
              'Cidade'
            )
          }
        >
          {!openCity ? null : (
            <Tabs defaultActiveKey="details">
              <Tabs.TabPane tab="Detalhes" key="details">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Typography.Text type="secondary">
                    {(openCity as any).region || 'Região não informada'}
                  </Typography.Text>

                  <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                    {isGM || (openCity as any).discovered
                      ? (openCity as any).description || 'Sem descrição.'
                      : 'Informações indisponíveis.'}
                  </Typography.Paragraph>

                  {isGM && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <Typography.Text strong>Admin do mapa (GM)</Typography.Text>

                      <Space wrap>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            setPickingCityId((openCity as any).id);
                            message.info('Clique no mapa para posicionar.');
                          }}
                        >
                          Reposicionar no mapa
                        </Button>

                        <Button size="small" danger onClick={() => confirmClearCoords(openCity as any)}>
                          Remover do mapa
                        </Button>
                      </Space>

                      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        Criado: {formatDate((openCity as any).createdAt)}
                        <br />
                        Atualizado: {formatDate((openCity as any).updatedAt)}
                      </Typography.Text>
                    </>
                  )}
                </Space>
              </Tabs.TabPane>

              <Tabs.TabPane tab={`Lores (${cityLores.length})`} key="lores">
                {!isGM && !(openCity as any).discovered ? (
                  <Typography.Text type="secondary">Conteúdo indisponível até a cidade ser descoberta.</Typography.Text>
                ) : linksLoading ? (
                  <Spin />
                ) : !cityLores.length ? (
                  <Empty description="Nenhuma lore vinculada a esta cidade." />
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {cityLores.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          border: '1px solid #f0f0f0',
                          borderRadius: 10,
                          padding: 12,
                          background: '#fff',
                        }}
                      >
                        <Space wrap size={8}>
                          <Typography.Text strong>{l.title}</Typography.Text>
                          {l.category ? <Tag>{l.category}</Tag> : <Tag>(sem categoria)</Tag>}
                        </Space>
                        <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {l.content?.trim() || '—'}
                        </Typography.Paragraph>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.TabPane>

              <Tabs.TabPane tab={`Quests (${cityQuests.length})`} key="quests">
                {!isGM && !(openCity as any).discovered ? (
                  <Typography.Text type="secondary">Conteúdo indisponível até a cidade ser descoberta.</Typography.Text>
                ) : linksLoading ? (
                  <Spin />
                ) : !cityQuests.length ? (
                  <Empty description="Nenhuma quest vinculada a esta cidade." />
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {cityQuests.map((q) => (
                      <div
                        key={q.id}
                        style={{
                          border: '1px solid #f0f0f0',
                          borderRadius: 10,
                          padding: 12,
                          background: '#fff',
                        }}
                      >
                        <Space wrap size={8}>
                          <Typography.Text strong>{q.title}</Typography.Text>
                          {q.status ? (
                            <Tag color={q.status === 'active' ? 'blue' : q.status === 'completed' ? 'green' : 'red'}>
                              {q.status}
                            </Tag>
                          ) : null}
                          {q.reward ? <Tag color="gold">Reward</Tag> : null}
                        </Space>

                        <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {q.description?.trim() || '—'}
                        </Typography.Paragraph>

                        {q.reward ? (
                          <Typography.Text type="secondary" style={{ display: 'block' }}>
                            Recompensa: {q.reward}
                          </Typography.Text>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.TabPane>
            </Tabs>
          )}
        </Drawer>
      </Space>
    </div>
  );
}
