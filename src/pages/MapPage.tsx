import React from 'react';
import {
  Button,
  message,
  Spin,
  Typography,
  Space,
  Divider,
  Tooltip,
  Drawer,
  Tabs,
  Input,
  Tag,
  Select,
  Badge,
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

export default function MapPage() {
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

  // Filtros
  const [filterKind, setFilterKind] = React.useState<'all' | 'Kol' | 'Kor'>('all');
  const [filterVisible, setFilterVisible] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [filterDiscover, setFilterDiscover] = React.useState<'all' | 'discovered' | 'undiscovered'>('all');
  const [search, setSearch] = React.useState('');

  // Régua
  const [measureMode, setMeasureMode] = React.useState(false);
  const [measureA, setMeasureA] = React.useState<{ u: number; v: number } | null>(null);
  const [measureB, setMeasureB] = React.useState<{ u: number; v: number } | null>(null);

  // Lores/Quests (cache para listar e controle local de vínculos)
  const [allLores, setAllLores] = React.useState<Lore[]>([]);
  const [allQuests, setAllQuests] = React.useState<Quest[]>([]);
  const [linkedLoreIdsByCity, setLinkedLoreIdsByCity] = React.useState<Record<number, Set<number>>>({});
  const [linkedQuestIdsByCity, setLinkedQuestIdsByCity] = React.useState<Record<number, Set<number>>>({});

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

  // Markers derivam das cidades (evita duplicar estado)
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

    if (filterKind !== 'all') {
      filtered = filtered.filter((m) => cityKind(m.label) === filterKind);
    }
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

  const onMapClick = async (ev: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = ev.currentTarget.getBoundingClientRect();
    const u = (ev.clientX - wrapper.left) / wrapper.width;
    const v = (ev.clientY - wrapper.top) / wrapper.height;

    // Régua primeiro
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

    // Posicionamento GM
    if (!isGM || !pickingCity) return;

    try {
      await updateCityCoords((pickingCity as any).id, u, v);
      // reflete localmente
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

  // Medida de distância — simples, baseado em percent (se quiser km, plugamos tua calibração)
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

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Mapa — {world.name}
        </Typography.Title>

        {/* Filtros */}
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

          {/* Botões GM */}
          {isGM && (
            <>
              <Divider type="vertical" />
              <Space wrap>
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

        {/* MAPA */}
        <div
          onClick={onMapClick}
          style={{
            position: 'relative',
            width: '100%',
            margin: '0 auto',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: measureMode || (isGM && pickingCity) ? 'crosshair' : 'default',
          }}
        >
          <img
            src={resolveApiUrl(worldImg)}
            alt={world.name}
            style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }}
            draggable={false}
          />

          {/* Markers filtrados */}
          {markers.map((m) => {
            const kind = cityKind(m.label);
            const bg =
              kind === 'Kol'
                ? 'rgba(0, 102, 255, 0.95)'
                : kind === 'Kor'
                ? 'rgba(0, 170, 85, 0.95)'
                : 'rgba(255,255,255,0.95)';
            const border = '2px solid rgba(0,0,0,0.85)';
            return (
              <Tooltip key={m.id} title={`${m.label} · ${kind}`} mouseEnterDelay={0.05}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCityId(m.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${m.u * 100}%`,
                    top: `${m.v * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: bg,
                    border,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    cursor: 'pointer',
                    outline: openCityId === m.id ? '3px solid rgba(255,255,0,0.8)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              </Tooltip>
            );
          })}

          {/* HUD de pick */}
          {isGM && pickingCity && (
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

          {/* Régua visual */}
          {measureA && measureB && (
            <svg
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              <line
                x1={measureA.u * 1000}
                y1={measureA.v * 1000}
                x2={measureB.u * 1000}
                y2={measureB.v * 1000}
                stroke="black"
                strokeWidth={4}
                opacity={0.85}
              />
              <circle cx={measureA.u * 1000} cy={measureA.v * 1000} r={6} fill="black" opacity={0.95} />
              <circle cx={measureB.u * 1000} cy={measureB.v * 1000} r={6} fill="black" opacity={0.95} />
              <rect
                x={Math.min(measureA.u, measureB.u) * 1000 + (Math.abs(measureA.u - measureB.u) * 1000) / 2 - 80}
                y={Math.min(measureA.v, measureB.v) * 1000 + (Math.abs(measureA.v - measureB.v) * 1000) / 2 - 26}
                width={160}
                height={28}
                fill="rgba(255,255,255,0.85)"
                rx={6}
              />
              <text
                x={(measureA.u + measureB.u) * 500}
                y={(measureA.v + measureB.v) * 500 - 6}
                fontSize="18"
                textAnchor="middle"
                fill="black"
              >
                {distanceText(measureA, measureB)}
              </text>
            </svg>
          )}
        </div>

        {/* Drawer da cidade */}
        <Drawer
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
                        {/* Ganchos futuros: toggle visible/discovered/world */}
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
