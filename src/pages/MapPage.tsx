import React from 'react';
import {
  Button,
  message,
  Spin,
  Typography,
  Space,
  Divider,
  Drawer,
  Tabs,
  Input,
  Tag,
  Select,
  Badge,
  Modal,
} from 'antd';
import { listWorlds, resolveWorldImage, World } from '@app/api/worlds.api';
import { City, listCities, updateCityCoords } from '@app/api/cities.api';
import { listLores, linkLoreToCity, unlinkLoreFromCity, Lore } from '@app/api/lore.api';
import { listQuests, linkQuestToCity, unlinkQuestFromCity, Quest } from '@app/api/quests.api';
import { resolveApiUrl } from '@app/api/http.api';

const GM_KEY_STORAGE = 'gm_api_key';

type Marker = { id: number; label: string; u: number; v: number; visible?: boolean; discovered?: boolean };

function parseCoordinates(s?: string | null): { u: number; v: number } | null {
  if (!s) return null;
  const parts = s.split(',').map((x) => Number(x.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const [u, v] = parts;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return { u, v };
}

function cityKind(name: string) {
  if (name?.startsWith('Kol-')) return 'Kol';
  if (name?.startsWith('Kor-')) return 'Kor';
  return 'Outro';
}

type Stage = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
};

export default function MapPage() {
  // -------- base data --------
  const [loading, setLoading] = React.useState(true);
  const [world, setWorld] = React.useState<World | null>(null);
  const [worldImg, setWorldImg] = React.useState<string | undefined>();
  const [cities, setCities] = React.useState<City[]>([]);
  const [pickingCity, setPickingCity] = React.useState<City | null>(null);

  const [openCityId, setOpenCityId] = React.useState<number | null>(null);
  const openCity = React.useMemo(
    () => cities.find((c: any) => ('props' in (c as any) ? (c as any).props.id : c.id) === openCityId) ?? null,
    [cities, openCityId],
  );

  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  // -------- UI / hover --------
  const [hoverMarkerId, setHoverMarkerId] = React.useState<number | null>(null);

  // -------- filters --------
  const [filterKind, setFilterKind] = React.useState<'all' | 'Kol' | 'Kor'>('all');
  const [filterVisible, setFilterVisible] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [filterDiscover, setFilterDiscover] = React.useState<'all' | 'discovered' | 'undiscovered'>('all');
  const [search, setSearch] = React.useState('');

  // -------- ruler --------
  const [measureMode, setMeasureMode] = React.useState(false);
  const [measureA, setMeasureA] = React.useState<{ u: number; v: number } | null>(null);
  const [measureB, setMeasureB] = React.useState<{ u: number; v: number } | null>(null);

  // -------- lores / quests --------
  const [allLores, setAllLores] = React.useState<Lore[]>([]);
  const [allQuests, setAllQuests] = React.useState<Quest[]>([]);
  const [linkedLoreIdsByCity, setLinkedLoreIdsByCity] = React.useState<Record<number, Set<number>>>({});
  const [linkedQuestIdsByCity, setLinkedQuestIdsByCity] = React.useState<Record<number, Set<number>>>({});

  // -------- map refs / fullscreen / stage --------
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [presentMode, setPresentMode] = React.useState(false); // modo “mesa”
  const [isFullscreen, setIsFullscreen] = React.useState(false); // fullscreen real (Fullscreen API)
  const [stage, setStage] = React.useState<Stage | null>(null);

  // Stage ROBUSTO: baseado no DOM real renderizado (não em matemática de aspect ratio)
  const recalcStage = React.useCallback(() => {
    const wrap = mapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    // força leitura depois do layout estabilizar
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

  // Load everything
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [ws, cs, ls, qs] = await Promise.all([listWorlds(), listCities(), listLores(), listQuests()]);
        if (!mounted) return;

        const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
        const cs2: City[] = (cs as any[]).map(unwrap);

        const w = ws.find((x: World) => x.imageUrl) ?? ws[0] ?? null;
        setWorld(w ?? null);
        setWorldImg(resolveWorldImage(w?.imageUrl ?? undefined));
        setCities(cs2);

        setAllLores(ls);
        setAllQuests(qs);
      } catch (e) {
        console.error(e);
        message.error('Falha ao carregar mundo/cidades/lores/quests.');
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
      // Se fullscreen falhar/cancelar, fica no overlay mesmo
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

  // trava scroll quando overlay (presentMode sem fullscreen real)
  React.useEffect(() => {
    if (presentMode && !isFullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [presentMode, isFullscreen]);

  // ESC sai do modo apresentação (mesmo no fallback overlay)
  React.useEffect(() => {
    if (!presentMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // No fullscreen real o browser já sai, mas a gente garante o presentMode também
        void exitPresentMode();
      }
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
    setPresentMode(true); // garante overlay primeiro (sem piscada)
    recalcStage();

    const el = mapRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen failed, staying in present mode overlay.', e);
    } finally {
      recalcStage();
    }
  }

  async function exitPresentMode() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
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

  // -------- derived markers --------
  const markers = React.useMemo<Marker[]>(() => {
    const list = cities
      .map((c) => {
        const p = parseCoordinates((c as any).coordinates);
        if (!p) return null;
        return {
          id: (c as any).id,
          label: (c as any).name,
          u: p.u,
          v: p.v,
          visible: (c as any).visible,
          discovered: (c as any).discovered,
        } as Marker;
      })
      .filter(Boolean) as Marker[];

    let filtered = list;

    if (filterKind !== 'all') filtered = filtered.filter((m) => cityKind(m.label) === filterKind);

    if (filterVisible !== 'all') {
      filtered = filtered.filter((m) => (filterVisible === 'visible' ? m.visible !== false : m.visible === false));
    }

    if (filterDiscover !== 'all') {
      filtered = filtered.filter((m) =>
        filterDiscover === 'discovered' ? m.discovered === true : m.discovered !== true,
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((m) => m.label.toLowerCase().includes(q));
    }

    return filtered;
  }, [cities, filterKind, filterVisible, filterDiscover, search]);

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

    // GM positioning
    if (!isGM || !pickingCity) return;

    try {
      await updateCityCoords((pickingCity as any).id, u, v);
      setCities((prev) =>
        prev.map((c: any) => (c.id === (pickingCity as any).id ? { ...c, coordinates: `${u},${v}` } : c)),
      );
      message.success(`Coords gravadas para "${(pickingCity as any).name}".`);
    } catch (e) {
      console.error(e);
      message.error('Erro ao salvar coordenadas.');
    } finally {
      setPickingCity(null);
    }
  };

  function distanceText(a: { u: number; v: number }, b: { u: number; v: number }) {
    const du = Math.abs(a.u - b.u);
    const dv = Math.abs(a.v - b.v);
    const pct = Math.sqrt(du * du + dv * dv) * 100;
    return `${pct.toFixed(2)}% do mapa`;
  }

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

  const drawerZIndex = presentMode ? 10002 : undefined;

  function confirmClearCoords(city: any) {
    console.log('confirmClearCoords', city);
    Modal.confirm({
      title: 'Remover coordenadas?',
      content: `A cidade "${city.name}" vai sair do mapa (o marker some). Você pode reposicionar depois.`,
      okText: 'Remover',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await updateCityCoords(city.id, null, null);
          setCities((prev) => prev.map((c: any) => (c.id === city.id ? { ...c, coordinates: null } : c)));

          setCities((prev) => prev.map((c: any) => (c.id === city.id ? { ...c, coordinates: null } : c)));

          // se estava selecionada pra pick, limpa
          setPickingCity((prev) => ((prev as any)?.id === city.id ? null : prev));

          message.success(`Coordenadas removidas de "${city.name}".`);
        } catch (e) {
          console.error(e);
          message.error('Falha ao remover coordenadas.');
        }
      },
    });
  }

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {!presentMode && (
          <Typography.Title level={3} style={{ margin: 0 }}>
            Mapa — {world.name}
          </Typography.Title>
        )}

        {/* Controles (fora do overlay) */}
        {!presentMode && (
          <Space wrap>
            <Button onClick={enterPresentMode}>Apresentação (Tela cheia)</Button>
            <Tag color="blue">Dica: F11 é fullscreen do navegador</Tag>
          </Space>
        )}

        {/* Filtros */}
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
                <span>Tipo:</span>
                <Select
                  size="small"
                  style={{ width: 120 }}
                  value={filterKind}
                  onChange={(v) => setFilterKind(v)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'Kol', label: 'Kol (sagrado)' },
                    { value: 'Kor', label: 'Kor (funcional)' },
                  ]}
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

              {isGM && (
                <>
                  <Divider type="vertical" />
                  <Space wrap>
                    <Button size="small" danger onClick={() => confirmClearCoords(pickingCity as any)}>
                      Remover do mapa
                    </Button>
                    {cities.map((c: any) => (
                      <Button
                        key={c.id}
                        size="small"
                        type={pickingCity && (pickingCity as any).id === c.id ? 'primary' : 'default'}
                        onClick={() => setPickingCity((prev) => ((prev as any)?.id === c.id ? null : c))}
                      >
                        Selecionar: {c.name}
                      </Button>
                    ))}
                    <Button size="small" onClick={() => setPickingCity(null)}>
                      Cancelar seleção
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
          {/* Barra flutuante DENTRO do mapa (sempre clicável) */}
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

              {isFullscreen && (
                <Tag color="green" style={{ margin: 0 }}>
                  Fullscreen
                </Tag>
              )}
              {!isFullscreen && (
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
            const kind = cityKind(m.label);

            const bg =
              kind === 'Kol'
                ? 'rgba(0, 102, 255, 0.95)'
                : kind === 'Kor'
                ? 'rgba(0, 170, 85, 0.95)'
                : 'rgba(255,255,255,0.95)';

            const border = '2px solid rgba(0,0,0,0.85)';

            const leftPx = stage ? stage.offsetX + m.u * stage.width : null;
            const topPx = stage ? stage.offsetY + m.v * stage.height : null;

            const leftCss = stage ? `${leftPx}px` : `${m.u * 100}%`;
            const topCss = stage ? `${topPx}px` : `${m.v * 100}%`;

            return (
              <React.Fragment key={m.id}>
                {/* hover label */}
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
                    {m.label} · {kind}
                  </div>
                )}

                <div
                  onMouseEnter={() => setHoverMarkerId(m.id)}
                  onMouseLeave={() => setHoverMarkerId((prev) => (prev === m.id ? null : prev))}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCityId(m.id);
                  }}
                  title={`${m.label} · ${kind}`}
                  style={{
                    position: 'absolute',
                    left: leftCss,
                    top: topCss,
                    transform: 'translate(-50%, -50%)',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: bg,
                    border,
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

          {/* HUD pick (só fora do modo apresentação) */}
          {isGM && pickingCity && !presentMode && (
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: 8,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Clique no mapa para posicionar: <b>{(pickingCity as any).name}</b>
            </div>
          )}

          {/* Régua (stage robusto) */}
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

          {/* fallback régua (se stage não existir ainda) */}
          {measureA && measureB && !stage && (
            <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 1000 1000">
              <line
                x1={measureA.u * 1000}
                y1={measureA.v * 1000}
                x2={measureB.u * 1000}
                y2={measureB.v * 1000}
                stroke="white"
                strokeWidth={4}
                opacity={0.85}
              />
              <circle cx={measureA.u * 1000} cy={measureA.v * 1000} r={6} fill="white" opacity={0.95} />
              <circle cx={measureB.u * 1000} cy={measureB.v * 1000} r={6} fill="white" opacity={0.95} />
              <rect
                x={(measureA.u + measureB.u) * 500 - 90}
                y={(measureA.v + measureB.v) * 500 - 22}
                width={180}
                height={28}
                fill="rgba(0,0,0,0.6)"
                rx={6}
              />
              <text
                x={(measureA.u + measureB.u) * 500}
                y={(measureA.v + measureB.v) * 500 - 2}
                fontSize="16"
                textAnchor="middle"
                fill="white"
              >
                {distanceText(measureA, measureB)}
              </text>
            </svg>
          )}
        </div>

        {/* Drawer da cidade */}
        <Drawer
          zIndex={drawerZIndex}
          title={
            openCity ? (
              <Space>
                <span>{(openCity as any).name}</span>
                <Badge
                  color={cityKind((openCity as any).name) === 'Kol' ? 'blue' : 'green'}
                  text={cityKind((openCity as any).name)}
                />
                {(openCity as any).visible === false && <Tag color="red">Invisível</Tag>}
                {(openCity as any).discovered ? <Tag color="gold">Descoberta</Tag> : <Tag>Não descoberta</Tag>}
              </Space>
            ) : (
              'Cidade'
            )
          }
          open={!!openCity}
          onClose={() => setOpenCityId(null)}
          width={560}
        >
          {!openCity ? null : (
            <Tabs defaultActiveKey="details">
              <Tabs.TabPane tab="Detalhes" key="details">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Typography.Text type="secondary">
                    {(openCity as any).region || 'Região não informada'}
                  </Typography.Text>
                  <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                    {(openCity as any).description || 'Sem descrição.'}
                  </Typography.Paragraph>

                  {isGM && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <Typography.Text strong>Ações GM</Typography.Text>
                      <Space wrap>
                        <Button
                          size="small"
                          onClick={() => {
                            setPickingCity(openCity as any);
                            message.info('Clique no mapa para reposicionar.');
                          }}
                        >
                          Reposicionar
                        </Button>
                      </Space>
                    </>
                  )}
                </Space>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Lores" key="lores">
                <LoresTab
                  isGM={isGM}
                  cityId={(openCity as any).id}
                  allLores={allLores}
                  linkedMap={linkedLoreIdsByCity}
                  setLinkedMap={setLinkedLoreIdsByCity}
                />
              </Tabs.TabPane>

              <Tabs.TabPane tab="Quests" key="quests">
                <QuestsTab
                  isGM={isGM}
                  cityId={(openCity as any).id}
                  allQuests={allQuests}
                  linkedMap={linkedQuestIdsByCity}
                  setLinkedMap={setLinkedQuestIdsByCity}
                />
              </Tabs.TabPane>
            </Tabs>
          )}
        </Drawer>
      </Space>
    </div>
  );
}

/** ---------- Aba LORES ---------- */
function LoresTab({
  isGM,
  cityId,
  allLores,
  linkedMap,
  setLinkedMap,
}: {
  isGM: boolean;
  cityId: number;
  allLores: Lore[];
  linkedMap: Record<number, Set<number>>;
  setLinkedMap: React.Dispatch<React.SetStateAction<Record<number, Set<number>>>>;
}) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return !s ? allLores : allLores.filter((l) => l.title.toLowerCase().includes(s));
  }, [q, allLores]);

  const linked = linkedMap[cityId] ?? new Set<number>();

  async function doLink(loreId: number) {
    try {
      await linkLoreToCity(loreId, cityId);
      setLinkedMap((prev) => {
        const next = { ...prev };
        const set = new Set(next[cityId] ?? []);
        set.add(loreId);
        next[cityId] = set;
        return next;
      });
      message.success('Lore vinculada.');
    } catch (e) {
      console.error(e);
      message.error('Falha ao vincular lore.');
    }
  }

  async function doUnlink(loreId: number) {
    try {
      await unlinkLoreFromCity(loreId, cityId);
      setLinkedMap((prev) => {
        const next = { ...prev };
        const set = new Set(next[cityId] ?? []);
        set.delete(loreId);
        next[cityId] = set;
        return next;
      });
      message.success('Lore desvinculada.');
    } catch (e) {
      console.error(e);
      message.error('Falha ao desvincular lore.');
    }
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        allowClear
        placeholder="Buscar lore..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: 260 }}
      />
      <div style={{ maxHeight: 320, overflow: 'auto', paddingRight: 6 }}>
        {filtered.map((l) => {
          const isLinked = linked.has(l.id);
          return (
            <div
              key={l.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px dashed #eee',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Typography.Text ellipsis>{l.title}</Typography.Text>
                {l.category && <Tag style={{ marginLeft: 8 }}>{l.category}</Tag>}
              </div>
              {isGM && (
                <Space>
                  {isLinked ? (
                    <Button size="small" onClick={() => doUnlink(l.id)}>
                      Desvincular
                    </Button>
                  ) : (
                    <Button size="small" type="primary" onClick={() => doLink(l.id)}>
                      Vincular
                    </Button>
                  )}
                </Space>
              )}
            </div>
          );
        })}
        {!filtered.length && <Typography.Text type="secondary">Nenhuma lore.</Typography.Text>}
      </div>
    </Space>
  );
}

/** ---------- Aba QUESTS ---------- */
function QuestsTab({
  isGM,
  cityId,
  allQuests,
  linkedMap,
  setLinkedMap,
}: {
  isGM: boolean;
  cityId: number;
  allQuests: Quest[];
  linkedMap: Record<number, Set<number>>;
  setLinkedMap: React.Dispatch<React.SetStateAction<Record<number, Set<number>>>>;
}) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return !s ? allQuests : allQuests.filter((x) => x.title.toLowerCase().includes(s));
  }, [q, allQuests]);

  const linked = linkedMap[cityId] ?? new Set<number>();

  async function doLink(questId: number) {
    try {
      await linkQuestToCity(questId, cityId);
      setLinkedMap((prev) => {
        const next = { ...prev };
        const set = new Set(next[cityId] ?? []);
        set.add(questId);
        next[cityId] = set;
        return next;
      });
      message.success('Quest vinculada.');
    } catch (e) {
      console.error(e);
      message.error('Falha ao vincular quest.');
    }
  }

  async function doUnlink(questId: number) {
    try {
      await unlinkQuestFromCity(questId, cityId);
      setLinkedMap((prev) => {
        const next = { ...prev };
        const set = new Set(next[cityId] ?? []);
        set.delete(questId);
        next[cityId] = set;
        return next;
      });
      message.success('Quest desvinculada.');
    } catch (e) {
      console.error(e);
      message.error('Falha ao desvincular quest.');
    }
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        allowClear
        placeholder="Buscar quest..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: 260 }}
      />
      <div style={{ maxHeight: 320, overflow: 'auto', paddingRight: 6 }}>
        {filtered.map((x) => {
          const isLinked = linked.has(x.id);
          return (
            <div
              key={x.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px dashed #eee',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Typography.Text ellipsis>{x.title}</Typography.Text>
                {x.status && (
                  <Tag
                    color={x.status === 'active' ? 'blue' : x.status === 'completed' ? 'green' : 'red'}
                    style={{ marginLeft: 8 }}
                  >
                    {x.status}
                  </Tag>
                )}
              </div>
              {isGM && (
                <Space>
                  {isLinked ? (
                    <Button size="small" onClick={() => doUnlink(x.id)}>
                      Desvincular
                    </Button>
                  ) : (
                    <Button size="small" type="primary" onClick={() => doLink(x.id)}>
                      Vincular
                    </Button>
                  )}
                </Space>
              )}
            </div>
          );
        })}
        {!filtered.length && <Typography.Text type="secondary">Nenhuma quest.</Typography.Text>}
      </div>
    </Space>
  );
}
