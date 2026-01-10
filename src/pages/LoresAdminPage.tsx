// src/pages/rpg/LoresAdminPage.tsx
import React from 'react';
import { Badge, Divider, Drawer, Empty, Space, Tag, Tabs, Typography, message, Select, Popconfirm } from 'antd';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';

import { createLore, deleteLore, listLores, setLoreVisibility, updateLore } from '@app/api/lore.api';
import type { Lore, LoreCategory } from '@app/api/lore.api';

const GM_KEY_STORAGE = 'gm_api_key';

const categoryOptions: { value: LoreCategory | 'null'; label: string }[] = [
  { value: 'history', label: 'História' },
  { value: 'culture', label: 'Cultura' },
  { value: 'tech', label: 'Tecnologia' },
  { value: 'biology', label: 'Biologia' },
  { value: 'myth', label: 'Mito' },
  { value: 'null', label: '(Sem categoria)' },
];

function isLoreVisible(l: Lore) {
  return (l.visible ?? true) === true;
}

function formatDate(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export const LoresAdminPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [isGM, setIsGM] = React.useState<boolean>(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));

  const [items, setItems] = React.useState<Lore[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [newTitle, setNewTitle] = React.useState<string>('');
  const [newCategory, setNewCategory] = React.useState<LoreCategory | null>(null);
  const [newContent, setNewContent] = React.useState<string>('');

  const [search, setSearch] = React.useState<string>('');
  const q = search.trim().toLowerCase();

  const [openLoreId, setOpenLoreId] = React.useState<number | null>(null);
  const openLore = React.useMemo(() => items.find((x) => x.id === openLoreId) ?? null, [items, openLoreId]);

  const [editTitle, setEditTitle] = React.useState<string>('');
  const [editCategory, setEditCategory] = React.useState<LoreCategory | null>(null);
  const [editContent, setEditContent] = React.useState<string>('');

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) {
        setIsGM(Boolean(e.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLores();
      setItems(data);
    } catch (e) {
      console.error(e);
      message.error('Falha ao carregar lores');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!openLore) return;
    setEditTitle(openLore.title ?? '');
    setEditCategory((openLore.category ?? null) as any);
    setEditContent(openLore.content ?? '');
  }, [openLore?.id]); // só quando troca a lore aberta

  const filtered = React.useMemo(() => {
    return items
      .filter((l) => {
        if (!q) return true;
        const t = (l.title ?? '').toLowerCase();
        const c = (l.content ?? '').toLowerCase();
        return t.includes(q) || c.includes(q);
      })
      .sort((a, b) => a.id - b.id);
  }, [items, q]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter((x) => isLoreVisible(x)).length;
    const hidden = total - visible;
    return { total, visible, hidden };
  }, [items]);

  function openEditor(l: Lore) {
    setOpenLoreId(l.id);
  }

  function closeEditor() {
    setOpenLoreId(null);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) {
      message.warning('Informe um título');
      return;
    }

    try {
      const created = await createLore({
        title,
        category: newCategory,
        content: newContent?.trim() ? newContent.trim() : null,
      });

      setCreating(false);
      setNewTitle('');
      setNewCategory(null);
      setNewContent('');
      setItems((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      message.success('Lore criada');
    } catch (e) {
      console.error(e);
      message.error('Falha ao criar lore (GM key?)');
    }
  }

  async function toggleVisible(l: Lore) {
    const next = !isLoreVisible(l);

    // otimista
    setItems((prev) => prev.map((x) => (x.id === l.id ? { ...x, visible: next } : x)));

    try {
      await setLoreVisibility(l.id, next);
      message.success(next ? 'Lore visível para jogadores' : 'Lore ocultada dos jogadores');
    } catch (e) {
      console.error(e);
      message.error('Falha ao mudar visibilidade (GM key?)');
      await load();
    }
  }

  async function saveEdit() {
    if (!openLore) return;

    const title = editTitle.trim();
    if (!title) {
      message.warning('Título não pode ser vazio');
      return;
    }

    try {
      await updateLore(openLore.id, {
        title,
        category: editCategory,
        content: editContent?.trim() ? editContent.trim() : null,
      });

      setItems((prev) =>
        prev.map((x) =>
          x.id === openLore.id
            ? { ...x, title, category: editCategory, content: editContent?.trim() ? editContent.trim() : null }
            : x,
        ),
      );

      message.success('Lore atualizada');
    } catch (e) {
      console.error(e);
      message.error('Falha ao atualizar lore (GM key?)');
    }
  }

  async function removeLore(id: number) {
    try {
      await deleteLore(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openLoreId === id) setOpenLoreId(null);
      message.success('Lore removida');
    } catch (e) {
      console.error(e);
      message.error('Falha ao remover lore (GM key?)');
    }
  }

  if (!isGM) {
    return (
      <>
        <PageTitle>Lores (GM)</PageTitle>
        <Card density="comfy">
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Acesso restrito
          </Typography.Title>
          <Typography.Text type="secondary">
            Esta página só aparece e só funciona com GM mode ligado (GM API key no browser).
          </Typography.Text>
        </Card>
      </>
    );
  }

  const GmHeader: React.FC = () => (
    <Card density="dense">
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Painel do Mestre — Lores
        </Typography.Title>
        <Typography.Text type="secondary">Crie, edite e controle visibilidade das lores.</Typography.Text>

        <Divider style={{ margin: '8px 0' }} />

        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space wrap size={10}>
            <Tag>All: {stats.total}</Tag>
            <Tag color="green">Visible: {stats.visible}</Tag>
            <Tag color="red">Hidden: {stats.hidden}</Tag>
          </Space>

          <Input
            allowClear
            placeholder="Buscar (título/conteúdo)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </Space>
      </Space>
    </Card>
  );

  const CreateLoreCard: React.FC = () => (
    <Card
      density="dense"
      title="Admin — Nova lore"
      extra={<Button onClick={() => setCreating((v) => !v)}>{creating ? 'Fechar' : 'Criar'}</Button>}
    >
      {!creating ? (
        <Typography.Text type="secondary">
          Crie uma lore rapidamente. Depois ajuste os detalhes no editor.
        </Typography.Text>
      ) : (
        <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          <Input placeholder="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />

          <Select
            style={{ maxWidth: 320 }}
            value={(newCategory ?? 'null') as any}
            onChange={(v) => setNewCategory(v === 'null' ? null : (v as LoreCategory))}
            options={categoryOptions}
          />

          <TextArea
            placeholder="Conteúdo (markdown / texto livre)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={mobileOnly ? 10 : 6}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="primary" htmlType="submit">
              Criar
            </Button>
            <Button onClick={() => setCreating(false)}>Cancelar</Button>
          </div>
        </form>
      )}
    </Card>
  );

  function LoreCards({ data }: { data: Lore[] }) {
    if (loading) return <Spinner />;

    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty description="Nenhuma lore encontrada." />
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
        {data.map((l) => (
          <Card
            key={l.id}
            density="dense"
            title={
              <Space size={8} wrap>
                <span style={{ fontWeight: 700 }}>{l.title}</span>
                {l.category ? <Tag>{l.category}</Tag> : <Tag>(sem categoria)</Tag>}
                {isLoreVisible(l) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
              </Space>
            }
            extra={
              <Button size="small" onClick={() => openEditor(l)}>
                Editar
              </Button>
            }
          >
            <Typography.Paragraph style={{ margin: 0 }} ellipsis={{ rows: 3 }}>
              {(l.content ?? '').trim() ? (l.content ?? '').trim() : '—'}
            </Typography.Paragraph>

            <Divider style={{ margin: '8px 0' }} />

            <Space wrap size={16}>
              <Space size={8}>
                <span style={{ color: '#666' }}>Visível:</span>
                <Switch checked={isLoreVisible(l)} onChange={() => void toggleVisible(l)} />
              </Space>
              <Typography.Text type="secondary">Criado: {formatDate((l as any).createdAt)}</Typography.Text>
            </Space>
          </Card>
        ))}
      </div>
    );
  }

  const DesktopAdminTable: React.FC = () => (
    <Card density="dense" title="Admin — Lores">
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          style={{ minWidth: 900 }}
          scroll={{ x: 900 }}
          onRow={(l: Lore) => ({
            onClick: () => openEditor(l),
          })}
          columns={[
            { title: '#', dataIndex: 'id', key: 'id', width: 70 },
            {
              title: 'Lore',
              key: 'title',
              render: (_, l) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                  <Space size={8} wrap>
                    <span style={{ fontWeight: 700 }}>{l.title}</span>
                    {l.category ? <Tag>{l.category}</Tag> : <Tag>(sem categoria)</Tag>}
                    {isLoreVisible(l) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
                  </Space>
                  <Typography.Text type="secondary" ellipsis>
                    {(l.content ?? '').trim() ? (l.content ?? '').trim() : '—'}
                  </Typography.Text>
                </Space>
              ),
            },
            {
              title: 'Visível',
              key: 'visible',
              width: 110,
              render: (_, l) => (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Switch checked={isLoreVisible(l)} onChange={() => void toggleVisible(l)} />
                </span>
              ),
            },
            {
              title: 'Criado',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 180,
              render: (v: string) => formatDate(v),
            },
            {
              title: 'Atualizado',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              width: 180,
              render: (v: string) => formatDate(v),
            },
          ]}
        />
      </div>

      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
        Clique numa linha para abrir o editor.
      </Typography.Text>
    </Card>
  );

  return (
    <>
      <PageTitle>Lores (GM)</PageTitle>

      <GmHeader />
      <CreateLoreCard />

      {mobileOnly ? <LoreCards data={filtered} /> : <DesktopAdminTable />}

      {openLore && (
        <Drawer
          visible={true} // AntD v4
          onClose={closeEditor}
          width={mobileOnly ? '100%' : 560}
          title={
            <Space wrap size={8}>
              <span style={{ fontWeight: 800 }}>{openLore.title}</span>
              {openLore.category ? <Tag>{openLore.category}</Tag> : <Tag>(sem categoria)</Tag>}
              {isLoreVisible(openLore) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
              <Badge count={`#${openLore.id}`} />
            </Space>
          }
        >
          <Tabs defaultActiveKey="edit">
            <Tabs.TabPane tab="Editar" key="edit">
              <Card density="dense" title="Dados">
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título" />

                  <Select
                    style={{ maxWidth: 320 }}
                    value={(editCategory ?? 'null') as any}
                    onChange={(v) => setEditCategory(v === 'null' ? null : (v as any))}
                    options={categoryOptions}
                  />

                  <TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Conteúdo"
                    rows={mobileOnly ? 14 : 10}
                  />

                  <Divider style={{ margin: '6px 0' }} />

                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Typography.Text>Visível para jogadores</Typography.Text>
                    <Switch checked={isLoreVisible(openLore)} onChange={() => void toggleVisible(openLore)} />
                  </Space>

                  <Typography.Text type="secondary">
                    Criado: {formatDate((openLore as any).createdAt)}
                    <br />
                    Atualizado: {formatDate((openLore as any).updatedAt)}
                  </Typography.Text>

                  <Divider style={{ margin: '6px 0' }} />

                  <Space wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Popconfirm
                      title="Remover lore? Isso remove permanentemente."
                      okText="Remover"
                      cancelText="Cancelar"
                      onConfirm={() => void removeLore(openLore.id)}
                    >
                      <Button danger>Remover</Button>
                    </Popconfirm>

                    <Button type="primary" onClick={() => void saveEdit()}>
                      Salvar
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Preview" key="preview">
              <Card density="comfy" title="Conteúdo">
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {(editContent ?? '').trim() ? (editContent ?? '').trim() : '—'}
                </Typography.Paragraph>
              </Card>
            </Tabs.TabPane>
          </Tabs>
        </Drawer>
      )}

      {loading && <Spinner />}
    </>
  );
};

export default LoresAdminPage;
