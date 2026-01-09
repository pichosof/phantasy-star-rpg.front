import React from 'react';
import { Badge, Divider, Drawer, Empty, Space, Tag, Tabs, Typography, message } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';

import type { City } from '../types/rpg';
import { CitiesApi } from '../api/rpg.api';

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
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export const CitiesPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [desc, setDesc] = React.useState<string>('');

  const [search, setSearch] = React.useState('');
  const [openCityId, setOpenCityId] = React.useState<number | null>(null);

  const [isGM, setIsGM] = React.useState<boolean>(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));
  const [viewMode, setViewMode] = React.useState<ViewMode>(() =>
    Boolean(localStorage.getItem(GM_KEY_STORAGE)) ? 'gm' : 'players',
  );

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

  const q = search.trim().toLowerCase();

  // ✅ Players: vê todas as VISÍVEIS.
  // Mas conteúdo “rico” (descrição etc) só aparece se discovered === true.
  const playerItems = React.useMemo(() => {
    return items
      .filter((c) => isCityVisible(c))
      .filter((c) => (q ? c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, q]);

  // GM: vê tudo
  const gmItems = React.useMemo(() => {
    return items
      .filter((c) => (q ? c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q) : true))
      .sort((a, b) => a.id - b.id);
  }, [items, q]);

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

    if (!n) {
      message.warning('Informe um nome');
      return;
    }

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
    const next = !(c.visible ?? true);

    // otimista
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, visible: next } : x)));

    try {
      await CitiesApi.setVisible(c.id, next);
      message.success(next ? 'Cidade visível para jogadores' : 'Cidade ocultada dos jogadores');
    } catch {
      message.error('Falha ao mudar visibilidade (GM key?)');
      await load();
    }
  }

  async function toggleDiscovered(c: City) {
    const next = !c.discovered;

    // otimista
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, discovered: next } : x)));

    try {
      await CitiesApi.setDiscovered(c.id, next);
      message.success(next ? 'Cidade marcada como descoberta' : 'Cidade marcada como não descoberta');
    } catch {
      message.error('Falha ao mudar descoberta (GM key?)');
      await load();
    }
  }

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

          // Players: descrição só se descoberta
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
                      {!isCityVisible(c) ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>}
                      {c.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
                      {isCityMapped(c) ? <Tag color="cyan">Mapped</Tag> : <Tag>Unmapped</Tag>}
                    </>
                  )}
                </Space>
              }
              extra={
                <Button size="small" onClick={() => setOpenCityId(c.id)}>
                  Ver
                </Button>
              }
            >
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
                      <span style={{ color: '#666' }}>Visível:</span>
                      <Switch checked={isCityVisible(c)} onChange={() => void toggleVisible(c)} />
                    </Space>
                    <Space size={8}>
                      <span style={{ color: '#666' }}>Descoberta:</span>
                      <Switch checked={c.discovered} onChange={() => void toggleDiscovered(c)} />
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

  const DesktopAdminTable: React.FC = () => (
    <Card density="dense" title="Admin — Cidades">
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={gmItems}
          loading={loading}
          style={{ minWidth: 900 }}
          scroll={{ x: 900 }}
          onRow={(c: City) => ({
            onClick: () => setOpenCityId(c.id),
          })}
          columns={[
            { title: '#', dataIndex: 'id', key: 'id', width: 70 },
            {
              title: 'Cidade',
              key: 'name',
              render: (_, c) => {
                const kind = cityKind(c.name);
                return (
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space size={8} wrap>
                      <span style={{ fontWeight: 700 }}>{c.name}</span>
                      <Tag color={kind === 'Kol' ? 'blue' : kind === 'Kor' ? 'green' : 'default'}>{kind}</Tag>
                      {!isCityVisible(c) ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>}
                      {c.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
                      {isCityMapped(c) ? <Tag color="cyan">Mapped</Tag> : <Tag>Unmapped</Tag>}
                    </Space>
                    <Typography.Text type="secondary" ellipsis>
                      {c.description?.trim() ? c.description : '—'}
                    </Typography.Text>
                  </Space>
                );
              },
            },
            {
              title: 'Visível',
              key: 'visible',
              width: 110,
              render: (_, c) => <Switch checked={isCityVisible(c)} onChange={() => void toggleVisible(c)} />,
            },
            {
              title: 'Descoberta',
              key: 'discovered',
              width: 130,
              render: (_, c) => <Switch checked={c.discovered} onChange={() => void toggleDiscovered(c)} />,
            },
            {
              title: 'Criado',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 180,
              render: (v: string) => formatDate(v),
            },
          ]}
        />
      </div>
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
        Clique numa linha para abrir a ficha.
      </Typography.Text>
    </Card>
  );

  const PlayersHeader: React.FC = () => (
    <Card density="comfy">
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Cidades
        </Typography.Title>
        <Typography.Text type="secondary">
          Aqui aparecem as cidades <b>visíveis</b>. Detalhes aparecem quando o mestre marcar como “descoberta”.
        </Typography.Text>

        <Divider style={{ margin: '8px 0' }} />

        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space wrap>
            <Badge count={playerItems.length} showZero />
            <Typography.Text>visíveis</Typography.Text>
          </Space>

          <Input
            allowClear
            placeholder="Buscar cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 340 }}
          />
        </Space>
      </Space>
    </Card>
  );

  const GmHeader: React.FC = () => (
    <Card density="dense">
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Painel do Mestre
        </Typography.Title>
        <Typography.Text type="secondary">
          Controle total: visibilidade, descoberta e checagem rápida do que está mapeado.
        </Typography.Text>

        <Divider style={{ margin: '8px 0' }} />

        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space wrap size={10}>
            <Tag>All: {stats.total}</Tag>
            <Tag color="green">Visible: {stats.visible}</Tag>
            <Tag color="red">Hidden: {stats.hidden}</Tag>
            <Tag color="gold">Discovered: {stats.discovered}</Tag>
            <Tag>Undiscovered: {stats.undiscovered}</Tag>
            <Tag color="cyan">Mapped: {stats.mapped}</Tag>
          </Space>

          <Input
            allowClear
            placeholder="Buscar (nome/descrição)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </Space>
      </Space>
    </Card>
  );

  const CreateCityCard: React.FC = () => {
    if (!isGM) return null;

    return (
      <Card
        density="dense"
        title="Admin — Nova cidade"
        extra={<Button onClick={() => setCreating((v) => !v)}>{creating ? 'Fechar' : 'Criar'}</Button>}
      >
        {!creating ? (
          <Typography.Text type="secondary">
            Crie uma cidade rapidamente. Depois ajuste visibilidade/descoberta no admin.
          </Typography.Text>
        ) : (
          <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
            <Input placeholder="Nome (ex: Kol-Aiedo)" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextArea placeholder="Descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" htmlType="submit">
                Criar
              </Button>
              <Button onClick={() => setCreating(false)}>Cancelar</Button>
            </div>
          </form>
        )}
      </Card>
    );
  };

  const CityDrawer: React.FC = () => {
    if (!openCity) return null;

    const kind = cityKind(openCity.name);
    const region = ((openCity as any).region as string | null | undefined) ?? null;

    const isPlayersView = viewMode === 'players';
    const playerCanRead = openCity.discovered === true; // players só lêem se descoberta

    return (
      <Drawer
        open={!!openCity}
        onClose={() => setOpenCityId(null)}
        width={mobileOnly ? '100%' : 560}
        title={
          <Space wrap size={8}>
            <span style={{ fontWeight: 800 }}>{openCity.name}</span>
            <Tag color={kind === 'Kol' ? 'blue' : kind === 'Kor' ? 'green' : 'default'}>{kind}</Tag>
            {region ? <Tag>{region}</Tag> : null}

            {isGM && viewMode === 'gm' && (
              <>
                {!isCityVisible(openCity) ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>}
                {openCity.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
                {isCityMapped(openCity) ? <Tag color="cyan">Mapped</Tag> : <Tag>Unmapped</Tag>}
              </>
            )}
          </Space>
        }
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Card density="comfy" title="Descrição">
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {isPlayersView
                ? playerCanRead
                  ? openCity.description?.trim() || 'Sem descrição ainda.'
                  : 'Informações indisponíveis.'
                : openCity.description?.trim() || 'Sem descrição.'}
            </Typography.Paragraph>
          </Card>

          {isGM && viewMode === 'gm' && (
            <Card density="dense" title="Ações do Mestre">
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Typography.Text>Visível para jogadores</Typography.Text>
                  <Switch checked={isCityVisible(openCity)} onChange={() => void toggleVisible(openCity)} />
                </Space>

                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Typography.Text>Marcada como descoberta</Typography.Text>
                  <Switch checked={openCity.discovered} onChange={() => void toggleDiscovered(openCity)} />
                </Space>

                <Divider style={{ margin: '6px 0' }} />

                <Typography.Text type="secondary">
                  Criado: {formatDate((openCity as any).createdAt)}
                  <br />
                  Atualizado: {formatDate((openCity as any).updatedAt)}
                </Typography.Text>
              </Space>
            </Card>
          )}
        </Space>
      </Drawer>
    );
  };

  return (
    <>
      <PageTitle>Cidades</PageTitle>

      {!isGM ? (
        <>
          <PlayersHeader />
          <CityCards data={playerItems} mode="players" />
          <CityDrawer />
        </>
      ) : (
        <>
          {/* ✅ Tabs compatível com teu antd (sem items) */}
          <Tabs activeKey={viewMode} onChange={(k) => setViewMode(k as ViewMode)}>
            <Tabs.TabPane tab="Visão dos jogadores" key="players">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <PlayersHeader />
                <CityCards data={playerItems} mode="players" />
              </Space>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Admin (GM)" key="gm">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <GmHeader />
                <CreateCityCard />
                {mobileOnly ? <CityCards data={gmItems} mode="gm" /> : <DesktopAdminTable />}
              </Space>
            </Tabs.TabPane>
          </Tabs>

          <CityDrawer />
        </>
      )}

      {loading && <Spinner />}
    </>
  );
};

export default CitiesPage;
