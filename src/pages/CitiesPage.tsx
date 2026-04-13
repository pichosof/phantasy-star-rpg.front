import React from 'react';
import { Divider, Drawer, Empty, Space, Switch, Tabs, Tag, Typography, message } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';

import type { City } from '@app/types/rpg';
import { CitiesApi } from '@app/api/rpg.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import { CityAdminDrawer } from '@app/components/rpg/City/CityAdminDrawer';
import { resolveApiUrl } from '@app/api/http.api';

const GM_KEY_STORAGE = 'gm_api_key';

type ViewMode = 'players' | 'gm';

function cityKind(name: string) {
  if (name?.startsWith('Kol-')) return 'Kol';
  if (name?.startsWith('Kor-')) return 'Kor';
  return 'Outro';
}

function isCityVisible(c: City) {
  return (c.visible ?? true) === true;
}

function parseCoordinates(s?: string | null): { u: number; v: number } | null {
  if (!s) return null;
  const parts = s.split(',').map((x) => Number(x.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const [u, v] = parts;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return { u, v };
}

function isCityMapped(c: City) {
  const coords = (c as any).coordinates as string | null | undefined;
  return Boolean(parseCoordinates(coords));
}

function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString('pt-BR');
}

export const CitiesPage: React.FC = () => {
  const [cityLores, setCityLores] = React.useState<Lore[]>([]);
  const [cityQuests, setCityQuests] = React.useState<Quest[]>([]);
  const [linksLoading, setLinksLoading] = React.useState(false);

  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [desc, setDesc] = React.useState<string>('');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [openCityId, setOpenCityId] = React.useState<number | null>(null);

  const [isGM, setIsGM] = React.useState<boolean>(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));
  const [viewMode, setViewMode] = React.useState<ViewMode>(() =>
    Boolean(localStorage.getItem(GM_KEY_STORAGE)) ? 'gm' : 'players',
  );

  const [adminOpen, setAdminOpen] = React.useState(false);
  const [adminCityId, setAdminCityId] = React.useState<number | null>(null);
  const adminCity = React.useMemo(() => items.find((x) => x.id === adminCityId) ?? null, [items, adminCityId]);

  function openAdmin(c: City) {
    setAdminCityId(c.id);
    setAdminOpen(true);
  }

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) {
        const gm = Boolean(e.newValue);
        setIsGM(gm);
        setViewMode(gm ? 'gm' : 'players');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await CitiesApi.list();
      setItems(data);
    } catch {
      message.error('Falha ao carregar cidades');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCity = React.useMemo(() => items.find((x) => x.id === openCityId) ?? null, [items, openCityId]);

  React.useEffect(() => {
    if (!openCity) return;
    if (!openCity.discovered) {
      setCityLores([]);
      setCityQuests([]);
      return;
    }
    let alive = true;
    setLinksLoading(true);
    Promise.all([listLoresByCityId(openCity.id), listQuestsByCityId(openCity.id)])
      .then(([lores, quests]) => {
        if (!alive) return;
        setCityLores(lores);
        setCityQuests(quests);
      })
      .catch(() => {
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
  }, [openCity?.id, openCity?.discovered]);

  const q = search.trim().toLowerCase();

  const playerItems = React.useMemo(
    () =>
      items
        .filter((c) => isCityVisible(c))
        .filter((c) => (q ? c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q) : true))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, q],
  );

  const gmItems = React.useMemo(
    () =>
      items
        .filter((c) => {
          if (filterVis === 'visible' && !isCityVisible(c)) return false;
          if (filterVis === 'hidden' && isCityVisible(c)) return false;
          return q ? c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q) : true;
        })
        .sort((a, b) => a.id - b.id),
    [items, q, filterVis],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter((c) => isCityVisible(c)).length;
    const hidden = total - visible;
    const discovered = items.filter((c) => c.discovered).length;
    const undiscovered = total - discovered;
    const mapped = items.filter((c) => isCityMapped(c)).length;
    return { total, visible, hidden, discovered, undiscovered, mapped };
  }, [items]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const d = desc.trim();
    if (!n) return message.warning('Informe um nome');
    try {
      await CitiesApi.create({ name: n, description: d || null });
      setCreating(false);
      setName('');
      setDesc('');
      await load();
      message.success('Cidade criada');
    } catch {
      message.error('Falha ao criar cidade (GM key?)');
    }
  }

  async function toggleVisible(c: City) {
    const next = !isCityVisible(c);
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, visible: next } : x)));
    try {
      await CitiesApi.setVisible(c.id, next);
      message.success(next ? 'Cidade visível para jogadores' : 'Cidade ocultada');
    } catch {
      message.error('Falha ao mudar visibilidade (GM key?)');
      await load();
    }
  }

  async function toggleDiscovered(c: City) {
    const next = !c.discovered;
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, discovered: next } : x)));
    try {
      await CitiesApi.setDiscovered(c.id, next);
      message.success(next ? 'Cidade marcada como descoberta' : 'Cidade marcada como não descoberta');
    } catch {
      message.error('Falha ao mudar descoberta (GM key?)');
      await load();
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={8}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {viewMode === 'gm' ? '⚙️ Painel GM — Cidades' : 'Cidades'}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {viewMode === 'gm'
                ? 'Controle visibilidade, descoberta e conteúdo das cidades.'
                : 'Cidades visíveis — detalhes aparecem quando o mestre marcar como descoberta.'}
            </Typography.Text>
          </div>
          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'players' ? 'primary' : 'default'}
                  onClick={() => setViewMode('players')}
                >
                  📖 Cidades
                </Button>
                <Button size="small" type={viewMode === 'gm' ? 'primary' : 'default'} onClick={() => setViewMode('gm')}>
                  ⚙️ Painel GM
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'gm' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Fechar' : '+ Nova Cidade'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} cidades</Tag>
          {isGM && <Tag color="green">{stats.visible} visíveis</Tag>}
          {isGM && <Tag color="red">{stats.hidden} ocultas</Tag>}
          {isGM && <Tag color="gold">{stats.discovered} descobertas</Tag>}
          {isGM && <Tag>{stats.undiscovered} não descobertas</Tag>}
          {isGM && <Tag color="cyan">{stats.mapped} mapeadas</Tag>}
        </Space>

        <Space wrap size={8} style={{ width: '100%' }}>
          <Input
            allowClear
            placeholder="Buscar cidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          {isGM && viewMode === 'gm' && (
            <Space size={4}>
              {(['all', 'visible', 'hidden'] as const).map((v) => (
                <Button
                  key={v}
                  size="small"
                  type={filterVis === v ? 'primary' : 'default'}
                  onClick={() => setFilterVis(v)}
                >
                  {v === 'all' ? 'Todas' : v === 'visible' ? 'Visíveis' : 'Ocultas'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {isGM && viewMode === 'gm' && creating && (
          <>
            <Divider style={{ margin: '4px 0' }} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
              <Typography.Text strong>Nova Cidade</Typography.Text>
              <Input
                placeholder="Nome (ex: Kol-Aiedo) *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextArea
                placeholder="Descrição (opcional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
              />
              <Space>
                <Button type="primary" htmlType="submit">
                  Criar Cidade
                </Button>
                <Button onClick={() => setCreating(false)}>Cancelar</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  // ── Cards (players + GM mobile) ───────────────────────────────────────────
  function CityCards({ data, mode }: { data: City[]; mode: ViewMode }) {
    if (loading) return <Spinner />;
    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty
            description={
              mode === 'players' ? 'Nenhuma cidade visível para os jogadores ainda.' : 'Nenhuma cidade encontrada.'
            }
          />
        </Card>
      );
    }
    return (
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: mobileOnly ? '1fr' : 'repeat(2, minmax(0, 1fr))',
        }}
      >
        {data.map((c) => {
          const kind = cityKind(c.name);
          const region = ((c as any).region as string | null | undefined) ?? null;
          const vis = isCityVisible(c);
          const playerCanRead = c.discovered === true;

          return (
            <Card
              key={c.id}
              density={mode === 'players' ? 'comfy' : 'dense'}
              title={
                <Space size={8} wrap>
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  <Tag color={kind === 'Kol' ? 'blue' : kind === 'Kor' ? 'green' : 'default'}>{kind}</Tag>
                  {region ? <Tag>{region}</Tag> : null}
                  {mode === 'gm' && (
                    <>
                      <Tag color={vis ? 'green' : 'red'}>{vis ? 'Visível' : 'Oculta'}</Tag>
                      <Tag color={c.discovered ? 'gold' : 'default'}>
                        {c.discovered ? 'Descoberta' : 'Não descoberta'}
                      </Tag>
                      {isCityMapped(c) ? <Tag color="cyan">Mapeada</Tag> : <Tag>Não mapeada</Tag>}
                    </>
                  )}
                </Space>
              }
              extra={
                mode === 'gm' ? (
                  <Button size="small" onClick={() => openAdmin(c)}>
                    Admin
                  </Button>
                ) : (
                  <Button size="small" onClick={() => setOpenCityId(c.id)}>
                    Ver
                  </Button>
                )
              }
            >
              {mode === 'players' && playerCanRead && (c as any).imageUrl && (
                <div
                  style={{ margin: '-12px -12px 12px', borderRadius: '8px 8px 0 0', overflow: 'hidden', height: 140 }}
                >
                  <img
                    src={resolveApiUrl((c as any).imageUrl)}
                    alt={(c as any).imageAlt ?? c.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
              <Typography.Paragraph style={{ margin: 0 }} ellipsis={{ rows: 3 }}>
                {mode === 'players'
                  ? playerCanRead
                    ? c.description?.trim() || 'Sem descrição ainda.'
                    : 'Informações indisponíveis.'
                  : c.description?.trim() || '—'}
              </Typography.Paragraph>

              {mode === 'gm' && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space wrap size={16}>
                    <Space size={8}>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>Visível:</span>
                      <Switch
                        size="small"
                        checked={vis}
                        onChange={() => void toggleVisible(c)}
                        checkedChildren={<EyeOutlined />}
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                    </Space>
                    <Space size={8}>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>Descoberta:</span>
                      <Switch size="small" checked={c.discovered} onChange={() => void toggleDiscovered(c)} />
                    </Space>
                  </Space>
                </>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // ── Desktop GM Table ──────────────────────────────────────────────────────
  const DesktopAdminTable = (
    <Card density="dense" title="Gerenciar Cidades">
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={gmItems}
          loading={loading}
          style={{ minWidth: 960 }}
          scroll={{ x: 960 }}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (v: number) => <Tag style={{ margin: 0 }}>#{v}</Tag>,
            },
            {
              title: 'Visível',
              key: 'visible',
              width: 90,
              render: (_: any, c: City) => (
                <Switch
                  size="small"
                  checked={isCityVisible(c)}
                  onChange={() => void toggleVisible(c)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Descoberta',
              key: 'discovered',
              width: 110,
              render: (_: any, c: City) => (
                <Switch size="small" checked={c.discovered} onChange={() => void toggleDiscovered(c)} />
              ),
            },
            {
              title: 'Cidade',
              key: 'name',
              render: (_: any, c: City) => {
                const kind = cityKind(c.name);
                return (
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space size={8} wrap>
                      <Typography.Text strong>{c.name}</Typography.Text>
                      <Tag color={kind === 'Kol' ? 'blue' : kind === 'Kor' ? 'green' : 'default'}>{kind}</Tag>
                      {!isCityVisible(c) ? <Tag color="red">Oculta</Tag> : <Tag color="green">Visível</Tag>}
                      {c.discovered ? <Tag color="gold">Descoberta</Tag> : <Tag>Não descoberta</Tag>}
                      {isCityMapped(c) ? <Tag color="cyan">Mapeada</Tag> : null}
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                      {c.description?.trim() ? c.description : '—'}
                    </Typography.Text>
                  </Space>
                );
              },
            },
            {
              title: 'Criado em',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (v: string) => (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Ações',
              key: 'actions',
              width: 90,
              render: (_: any, c: City) => (
                <Button size="small" onClick={() => openAdmin(c)}>
                  Admin
                </Button>
              ),
            },
          ]}
        />
      </div>
      {!gmItems.length && !loading && <Empty description="Nenhuma cidade encontrada." style={{ marginTop: 16 }} />}
    </Card>
  );

  // ── CityDrawer (players view) ─────────────────────────────────────────────
  const CityDrawer = openCity ? (
    <Drawer
      visible
      onClose={() => setOpenCityId(null)}
      width={mobileOnly ? '100%' : 560}
      title={
        <Space wrap size={8}>
          <span style={{ fontWeight: 800 }}>{openCity.name}</span>
          {(() => {
            const kind = cityKind(openCity.name);
            return <Tag color={kind === 'Kol' ? 'blue' : kind === 'Kor' ? 'green' : 'default'}>{kind}</Tag>;
          })()}
          {isGM && viewMode === 'gm' && (
            <>
              <Tag color={isCityVisible(openCity) ? 'green' : 'red'}>
                {isCityVisible(openCity) ? 'Visível' : 'Oculta'}
              </Tag>
              {openCity.discovered ? <Tag color="gold">Descoberta</Tag> : <Tag>Não descoberta</Tag>}
            </>
          )}
        </Space>
      }
    >
      <Tabs defaultActiveKey="desc">
        <Tabs.TabPane tab="Descrição" key="desc">
          {openCity.discovered && (openCity as any).imageUrl && (
            <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', maxHeight: 220 }}>
              <img
                src={resolveApiUrl((openCity as any).imageUrl)}
                alt={(openCity as any).imageAlt ?? openCity.name}
                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
          <Card density="comfy" title="Descrição">
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {viewMode === 'players'
                ? openCity.discovered === true
                  ? openCity.description?.trim() || 'Sem descrição ainda.'
                  : 'Informações indisponíveis.'
                : openCity.description?.trim() || 'Sem descrição.'}
            </Typography.Paragraph>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={`Lores (${cityLores.length})`} key="lores">
          {!openCity.discovered ? (
            <Card density="comfy">
              <Typography.Text type="secondary">Conteúdo indisponível até a cidade ser descoberta.</Typography.Text>
            </Card>
          ) : linksLoading ? (
            <Spinner />
          ) : !cityLores.length ? (
            <Card density="comfy">
              <Empty description="Nenhuma lore vinculada a esta cidade." />
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {cityLores.map((l) => (
                <Card key={l.id} density="comfy" title={l.title}>
                  {l.category ? <Tag>{l.category}</Tag> : null}
                  <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                    {l.content?.trim() || '—'}
                  </Typography.Paragraph>
                </Card>
              ))}
            </div>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab={`Quests (${cityQuests.length})`} key="quests">
          {!openCity.discovered ? (
            <Card density="comfy">
              <Typography.Text type="secondary">Conteúdo indisponível até a cidade ser descoberta.</Typography.Text>
            </Card>
          ) : linksLoading ? (
            <Spinner />
          ) : !cityQuests.length ? (
            <Card density="comfy">
              <Empty description="Nenhuma quest vinculada a esta cidade." />
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {cityQuests.map((qst) => (
                <Card key={qst.id} density="comfy" title={qst.title}>
                  {qst.status ? <Tag>{qst.status}</Tag> : null}
                  {qst.reward ? <Tag color="gold">Recompensa</Tag> : null}
                  <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                    {qst.description?.trim() || '—'}
                  </Typography.Paragraph>
                  {qst.reward ? (
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      Recompensa: {qst.reward}
                    </Typography.Text>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </Tabs.TabPane>

        {isGM && viewMode === 'gm' && (
          <Tabs.TabPane tab="Ações do Mestre" key="gm">
            <Card density="dense" title="Controles">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Typography.Text>Visível para jogadores</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Cidades ocultas não aparecem na lista.
                    </Typography.Text>
                  </div>
                  <Switch
                    checked={isCityVisible(openCity)}
                    onChange={() => void toggleVisible(openCity)}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Space>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Typography.Text>Marcada como descoberta</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Libera descrição, lores e quests para jogadores.
                    </Typography.Text>
                  </div>
                  <Switch checked={openCity.discovered} onChange={() => void toggleDiscovered(openCity)} />
                </Space>
                <Divider style={{ margin: '4px 0' }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Criado: {formatDate((openCity as any).createdAt)}
                  {'  ·  '}
                  Atualizado: {formatDate((openCity as any).updatedAt)}
                </Typography.Text>
              </Space>
            </Card>
          </Tabs.TabPane>
        )}
      </Tabs>
    </Drawer>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageTitle>Cidades</PageTitle>

      {Header}

      {viewMode === 'gm' && isGM ? (
        <>
          {loading ? <Spinner /> : mobileOnly ? <CityCards data={gmItems} mode="gm" /> : DesktopAdminTable}
          <CityAdminDrawer
            open={adminOpen}
            city={adminCity}
            isGM={isGM}
            onClose={() => {
              setAdminOpen(false);
              setAdminCityId(null);
            }}
            onChanged={load}
          />
        </>
      ) : (
        <>
          {loading ? <Spinner /> : <CityCards data={playerItems} mode="players" />}
          {CityDrawer}
        </>
      )}
    </>
  );
};

export default CitiesPage;
