// src/pages/SessionsPage.tsx
import React from 'react';
import { Badge, Divider, Drawer, Empty, Popconfirm, Space, Switch, Tabs, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';

import { createSession, deleteSession, listSessions, setSessionVisibility, updateSession } from '@app/api/sessions.api';
import type { Session } from '@app/api/sessions.api';

const GM_KEY_STORAGE = 'gm_api_key';

const SESSION_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #200122 0%, #6f0000 50%, #200122 100%)',
  'linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #1b4332 100%)',
  'linear-gradient(135deg, #4a0a77 0%, #8e0e00 50%, #4a0a77 100%)',
  'linear-gradient(135deg, #0a3d62 0%, #1e3799 50%, #0a3d62 100%)',
  'linear-gradient(135deg, #2c003e 0%, #6a0572 50%, #2c003e 100%)',
  'linear-gradient(135deg, #1b1b2f 0%, #162447 50%, #1f4068 100%)',
];
const STAR_SYMBOLS = ['✦', '✧', '⋆', '★', '☆', '✶', '✸', '✹'];

function sessionGradient(id: number) {
  return SESSION_GRADIENTS[id % SESSION_GRADIENTS.length];
}
function sessionStar(id: number) {
  return STAR_SYMBOLS[id % STAR_SYMBOLS.length];
}
function isVisible(s: Session) {
  return (s.visible ?? false) === true;
}
function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatDateTime(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString('pt-BR');
}

// ── Cover ─────────────────────────────────────────────────────────────────────
const SessionCover: React.FC<{ session: Session; height?: number }> = ({ session, height = 180 }) => {
  if (session.imageUrl) {
    return (
      <div style={{ position: 'relative', height, overflow: 'hidden' }}>
        <img
          src={session.imageUrl}
          alt={session.imageAlt ?? session.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)',
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        height,
        background: sessionGradient(session.id),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 64, color: 'rgba(255,255,255,0.12)', userSelect: 'none' }}>
        {sessionStar(session.id)}
      </span>
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Phantasy Star RPG
        </span>
      </div>
    </div>
  );
};

// ── Página ────────────────────────────────────────────────────────────────────
export const SessionsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  const [items, setItems] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(false);

  // blog | admin  (admin só para GM)
  const [viewMode, setViewMode] = React.useState<'blog' | 'admin'>('blog');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  // criar
  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDate, setNewDate] = React.useState('');
  const [newSummary, setNewSummary] = React.useState('');
  const [newImageUrl, setNewImageUrl] = React.useState('');

  // drawer
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'view' | 'edit'>('view');
  const openSession = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [editTitle, setEditTitle] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editSummary, setEditSummary] = React.useState('');
  const [editImageUrl, setEditImageUrl] = React.useState('');
  const [editImageAlt, setEditImageAlt] = React.useState('');

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSessions();
      setItems([...data].sort((a, b) => b.id - a.id));
    } catch {
      message.error('Falha ao carregar sessões');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!openSession) return;
    setEditTitle(openSession.title ?? '');
    setEditDate(openSession.date ?? '');
    setEditSummary(openSession.summary ?? '');
    setEditImageUrl(openSession.imageUrl ?? '');
    setEditImageAlt(openSession.imageAlt ?? '');
  }, [openSession?.id]);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(
    () =>
      items.filter((s) => {
        if (filterVis === 'visible' && !isVisible(s)) return false;
        if (filterVis === 'hidden' && isVisible(s)) return false;
        if (!q) return true;
        return (
          (s.title ?? '').toLowerCase().includes(q) ||
          (s.date ?? '').toLowerCase().includes(q) ||
          (s.summary ?? '').toLowerCase().includes(q)
        );
      }),
    [items, q, filterVis],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  // ── Ações ─────────────────────────────────────────────────────────────────
  function openForView(id: number) {
    setDrawerTab('view');
    setOpenId(id);
  }
  function openForEdit(id: number) {
    setDrawerTab('edit');
    setOpenId(id);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    const date = newDate.trim();
    if (!title) return message.warning('Informe um título');
    if (!date) return message.warning('Informe a data');
    try {
      const created = await createSession({
        title,
        date,
        summary: newSummary.trim() || null,
        imageUrl: newImageUrl.trim() || null,
      });
      setCreating(false);
      setNewTitle('');
      setNewDate('');
      setNewSummary('');
      setNewImageUrl('');
      setItems((prev) => [created, ...prev]);
      message.success('Sessão criada');
    } catch {
      message.error('Falha ao criar sessão — verifique a GM key.');
    }
  }

  async function toggleVisible(s: Session) {
    const next = !isVisible(s);
    setItems((prev) => prev.map((x) => (x.id === s.id ? { ...x, visible: next } : x)));
    try {
      await setSessionVisibility(s.id, next);
      message.success(next ? 'Sessão visível para jogadores' : 'Sessão ocultada');
    } catch {
      message.error('Falha ao mudar visibilidade (GM key?)');
      await load();
    }
  }

  async function saveEdit() {
    if (!openSession) return;
    const title = editTitle.trim();
    if (!title) return message.warning('Título não pode ser vazio');
    const date = editDate.trim();
    if (!date) return message.warning('Data não pode ser vazia');
    try {
      await updateSession(openSession.id, {
        title,
        date,
        summary: editSummary.trim() || null,
        imageUrl: editImageUrl.trim() || null,
        imageAlt: editImageAlt.trim() || null,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.id === openSession.id
            ? {
                ...x,
                title,
                date,
                summary: editSummary.trim() || null,
                imageUrl: editImageUrl.trim() || null,
                imageAlt: editImageAlt.trim() || null,
              }
            : x,
        ),
      );
      message.success('Sessão atualizada');
    } catch {
      message.error('Falha ao atualizar sessão (GM key?)');
    }
  }

  async function removeSession(id: number) {
    try {
      await deleteSession(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Sessão removida');
    } catch {
      message.error('Falha ao remover sessão (GM key?)');
    }
  }

  const sessionNumber = React.useCallback(
    (id: number) => {
      const sorted = [...items].sort((a, b) => a.id - b.id);
      const idx = sorted.findIndex((s) => s.id === id);
      return idx === -1 ? id : idx + 1;
    },
    [items],
  );

  const gridCols = mobileOnly ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // ── Header (compartilhado entre os dois modos) ────────────────────────────
  const Header = (
    <Card density="dense" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        {/* Título + toggles de modo */}
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={8}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {viewMode === 'admin' ? '⚙️ Painel GM — Sessões' : 'Diário da Campanha'}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {viewMode === 'admin'
                ? 'Crie, edite, ative ou remova sessões da campanha.'
                : 'Registro de todas as sessões — datas, eventos e momentos épicos.'}
            </Typography.Text>
          </div>

          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'blog' ? 'primary' : 'default'}
                  onClick={() => setViewMode('blog')}
                >
                  📖 Blog
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'admin' ? 'primary' : 'default'}
                  onClick={() => setViewMode('admin')}
                >
                  ⚙️ Painel GM
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'admin' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Fechar' : '+ Nova Sessão'}
              </Button>
            )}
          </Space>
        </Space>

        {/* Stats */}
        <Space wrap size={8}>
          <Tag>{stats.total} sessões</Tag>
          {isGM && <Tag color="green">{stats.visible} visíveis</Tag>}
          {isGM && <Tag color="red">{stats.hidden} ocultas</Tag>}
        </Space>

        {/* Busca + filtros */}
        <Space wrap size={8} style={{ width: '100%' }}>
          <Input
            allowClear
            placeholder="Buscar por título, data ou conteúdo…"
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
                  {v === 'all' ? 'Todas' : v === 'visible' ? 'Visíveis' : 'Ocultas'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {/* Formulário de criação (só no modo admin) */}
        {isGM && viewMode === 'admin' && creating && (
          <>
            <Divider style={{ margin: '4px 0' }} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
              <Typography.Text strong>Nova Sessão</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Título *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ minWidth: 280 }}
                  required
                />
                <Input
                  placeholder="Data (ex: AW 2284, Dia 3 ou 2025-04-13) *"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ minWidth: 280 }}
                  required
                />
              </Space>
              <TextArea
                placeholder={
                  'Resumo — use seções:\n## Milestones\n- ...\n## Pontos Chave\n- ...\n## Ligações\n- Quest: ...'
                }
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                rows={mobileOnly ? 6 : 5}
              />
              <Input
                placeholder="URL da imagem de capa (opcional)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Space>
                <Button type="primary" htmlType="submit">
                  Criar Sessão
                </Button>
                <Button onClick={() => setCreating(false)}>Cancelar</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  // ── Modo Blog ─────────────────────────────────────────────────────────────
  const BlogView = (
    <>
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Card density="comfy">
          <Empty description="Nenhuma sessão encontrada." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
          {filtered.map((session) => {
            const num = sessionNumber(session.id);
            const vis = isVisible(session);
            return (
              <div
                key={session.id}
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  background: 'var(--background-color, #fff)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onClick={() => openForView(session.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <SessionCover session={session} height={mobileOnly ? 140 : 180} />
                <div
                  style={{
                    padding: '14px 16px 12px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <Space size={6} style={{ justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        color: '#8c8c8c',
                      }}
                    >
                      Sessão #{num}
                    </span>
                    {isGM && (
                      <Tag color={vis ? 'green' : 'red'} style={{ margin: 0, fontSize: 10 }}>
                        {vis ? 'Visível' : 'Oculta'}
                      </Tag>
                    )}
                  </Space>
                  <div style={{ fontSize: 12, color: '#595959' }}>📅 {formatDate(session.date)}</div>
                  <Typography.Title
                    level={5}
                    style={{ margin: 0, lineHeight: 1.35, fontSize: mobileOnly ? 15 : 16 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {session.title}
                  </Typography.Title>
                  {session.summary && (
                    <Typography.Paragraph style={{ margin: 0, fontSize: 13, color: '#595959' }} ellipsis={{ rows: 3 }}>
                      {session.summary}
                    </Typography.Paragraph>
                  )}
                  <div style={{ flex: 1 }} />
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={6}>
                    <span style={{ fontSize: 11, color: '#bfbfbf' }}>{formatDateTime(session.createdAt)}</span>
                    <Space size={6} onClick={(e) => e.stopPropagation()}>
                      {isGM && (
                        <Switch
                          size="small"
                          checked={vis}
                          onChange={() => void toggleVisible(session)}
                          title={vis ? 'Ocultar' : 'Publicar'}
                        />
                      )}
                      <Button size="small" type="link" style={{ padding: 0, fontSize: 12 }}>
                        Ver sessão →
                      </Button>
                    </Space>
                  </Space>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ── Modo Admin ────────────────────────────────────────────────────────────
  const AdminMobileCards = (
    <div style={{ display: 'grid', gap: 10 }}>
      {filtered.map((s) => {
        const num = sessionNumber(s.id);
        const vis = isVisible(s);
        return (
          <Card key={s.id} density="dense">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {/* linha 1: número + tags */}
              <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                <Space size={6}>
                  <Tag style={{ margin: 0 }}>#{num}</Tag>
                  <Tag color={vis ? 'green' : 'red'} style={{ margin: 0 }}>
                    {vis ? 'Visível' : 'Oculta'}
                  </Tag>
                </Space>
                <Space size={4}>
                  <Switch size="small" checked={vis} onChange={() => void toggleVisible(s)} />
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(s.id)} />
                  <Popconfirm
                    title="Remover esta sessão permanentemente?"
                    okText="Remover"
                    cancelText="Cancelar"
                    onConfirm={() => void removeSession(s.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </Space>
              {/* título */}
              <Typography.Text strong style={{ cursor: 'pointer', display: 'block' }} onClick={() => openForView(s.id)}>
                {s.title}
              </Typography.Text>
              {/* data */}
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                📅 {s.date}
              </Typography.Text>
              {/* preview resumo */}
              {s.summary && (
                <Typography.Paragraph style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }} ellipsis={{ rows: 2 }}>
                  {s.summary}
                </Typography.Paragraph>
              )}
            </Space>
          </Card>
        );
      })}
    </div>
  );

  const AdminDesktopTable = (
    <Card density="dense" title="Gerenciar Sessões">
      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 860 }}
          style={{ minWidth: 860 }}
          columns={[
            {
              title: '#',
              key: 'num',
              width: 60,
              render: (_: any, s: Session) => <Tag style={{ margin: 0 }}>#{sessionNumber(s.id)}</Tag>,
            },
            {
              title: 'Visível',
              key: 'visible',
              width: 90,
              render: (_: any, s: Session) => (
                <Switch
                  size="small"
                  checked={isVisible(s)}
                  onChange={() => void toggleVisible(s)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Título',
              key: 'title',
              render: (_: any, s: Session) => (
                <Space direction="vertical" size={2}>
                  <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => openForView(s.id)}>
                    {s.title}
                  </Typography.Text>
                  {s.summary && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                      {s.summary
                        .replace(/##[^\n]*/g, '')
                        .replace(/\n+/g, ' ')
                        .trim()
                        .slice(0, 80)}
                      …
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Data',
              dataIndex: 'date',
              key: 'date',
              width: 200,
              render: (v: string) => <Typography.Text style={{ fontSize: 13 }}>{v}</Typography.Text>,
            },
            {
              title: 'Criado em',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (v: string) => (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDateTime(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Ações',
              key: 'actions',
              width: 100,
              render: (_: any, s: Session) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openForEdit(s.id)} />
                  <Popconfirm
                    title="Remover esta sessão permanentemente?"
                    okText="Remover"
                    cancelText="Cancelar"
                    onConfirm={() => void removeSession(s.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!filtered.length && !loading && <Empty description="Nenhuma sessão encontrada." style={{ marginTop: 16 }} />}
    </Card>
  );

  const AdminView = (
    <>
      {loading ? (
        <Spinner />
      ) : mobileOnly ? (
        filtered.length === 0 ? (
          <Card density="comfy">
            <Empty description="Nenhuma sessão encontrada." />
          </Card>
        ) : (
          AdminMobileCards
        )
      ) : (
        AdminDesktopTable
      )}
    </>
  );

  // ── Drawer (compartilhado) ────────────────────────────────────────────────
  const DetailDrawer = openSession ? (
    <Drawer
      visible
      onClose={() => setOpenId(null)}
      width={mobileOnly ? '100%' : 700}
      title={
        <Space wrap size={8}>
          <span style={{ fontWeight: 800 }}>
            Sessão #{sessionNumber(openSession.id)} · {openSession.title}
          </span>
          <Tag color={isVisible(openSession) ? 'green' : 'red'}>{isVisible(openSession) ? 'Visível' : 'Oculta'}</Tag>
          <Badge count={`#${openSession.id}`} style={{ backgroundColor: '#595959' }} />
        </Space>
      }
      extra={
        isGM ? (
          <Space>
            <Popconfirm
              title="Remover esta sessão permanentemente?"
              okText="Remover"
              cancelText="Cancelar"
              onConfirm={() => void removeSession(openSession.id)}
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                Remover
              </Button>
            </Popconfirm>
            {drawerTab === 'edit' && (
              <Button type="primary" size="small" onClick={() => void saveEdit()}>
                Salvar
              </Button>
            )}
          </Space>
        ) : null
      }
    >
      <Tabs activeKey={drawerTab} onChange={(k) => setDrawerTab(k as 'view' | 'edit')}>
        {/* ── Ver ── */}
        <Tabs.TabPane tab="📖 Sessão" key="view">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden' }}>
              <SessionCover session={openSession} height={240} />
            </div>
            <Space wrap size={8}>
              <Tag icon={<span>📅</span>} color="blue">
                {formatDate(openSession.date)}
              </Tag>
              <Tag color="default">Sessão #{sessionNumber(openSession.id)}</Tag>
              {isGM && (
                <Space size={6}>
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>Publicar:</span>
                  <Switch
                    size="small"
                    checked={isVisible(openSession)}
                    onChange={() => void toggleVisible(openSession)}
                  />
                </Space>
              )}
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            {openSession.summary ? (
              <Card density="dense" title="Resumo">
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.75, fontSize: 14 }}>
                  {openSession.summary}
                </Typography.Paragraph>
              </Card>
            ) : (
              <Typography.Text type="secondary">Nenhum resumo registrado.</Typography.Text>
            )}
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Criado em: {formatDateTime(openSession.createdAt)}
              {'  ·  '}
              Atualizado: {formatDateTime(openSession.updatedAt)}
            </Typography.Text>
          </Space>
        </Tabs.TabPane>

        {/* ── Editar (GM) ── */}
        {isGM && (
          <Tabs.TabPane tab="✏️ Editar" key="edit">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Card density="dense" title="Dados da Sessão">
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Título
                    </Typography.Text>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título da sessão"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Data
                    </Typography.Text>
                    <Input
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="Ex: AW 2284, Dia 3 ou Ano 312 do 3º Ciclo"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Resumo — use seções para organizar
                    </Typography.Text>
                    <TextArea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      placeholder={
                        '## Milestones\n- Milestone 1\n\n## Pontos Chave\n- Ponto importante\n\n## Ligações\n- Quest: Nome da quest\n- Cidade: Nome da cidade'
                      }
                      rows={mobileOnly ? 14 : 12}
                    />
                  </div>
                </Space>
              </Card>

              <Card density="dense" title="Imagem de Capa">
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      URL da imagem
                    </Typography.Text>
                    <Input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Alt text (acessibilidade)
                    </Typography.Text>
                    <Input
                      value={editImageAlt}
                      onChange={(e) => setEditImageAlt(e.target.value)}
                      placeholder="Descrição da imagem"
                    />
                  </div>
                  {(editImageUrl || openSession.imageUrl) && (
                    <div style={{ borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
                      <SessionCover
                        session={{ ...openSession, imageUrl: editImageUrl || openSession.imageUrl }}
                        height={120}
                      />
                    </div>
                  )}
                </Space>
              </Card>

              <Card density="dense" title="Visibilidade">
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Typography.Text>Visível para jogadores</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Sessões ocultas só aparecem para o Mestre.
                    </Typography.Text>
                  </div>
                  <Switch
                    checked={isVisible(openSession)}
                    onChange={() => void toggleVisible(openSession)}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Space>
              </Card>

              <Button type="primary" block onClick={() => void saveEdit()}>
                Salvar Alterações
              </Button>
            </Space>
          </Tabs.TabPane>
        )}
      </Tabs>
    </Drawer>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageTitle>Sessions</PageTitle>
      {Header}
      {viewMode === 'admin' && isGM ? AdminView : BlogView}
      {DetailDrawer}
    </>
  );
};

export default SessionsPage;
