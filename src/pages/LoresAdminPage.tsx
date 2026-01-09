import React from 'react';
import { Divider, Drawer, Empty, Space, Tag, Typography, message, Select, Popconfirm } from 'antd';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Spinner } from '@app/components/common/Spinner/Spinner';

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

function isVisible(x: Lore) {
  return (x.visible ?? true) === true;
}

function formatDate(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export const LoresAdminPage: React.FC = () => {
  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  const [items, setItems] = React.useState<Lore[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState('');

  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<LoreCategory | null>(null);
  const [newContent, setNewContent] = React.useState<string>('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const openLore = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [editTitle, setEditTitle] = React.useState('');
  const [editCategory, setEditCategory] = React.useState<LoreCategory | null>(null);
  const [editContent, setEditContent] = React.useState<string>('');

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
  }, [openLore]);

  const q = search.trim().toLowerCase();
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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return message.warning('Informe um título');

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
    const next = !isVisible(l);

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
    if (!title) return message.warning('Título não pode ser vazio');

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
      if (openId === id) setOpenId(null);
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

  return (
    <>
      <PageTitle>Lores (GM)</PageTitle>

      <Card density="dense">
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
            <Input
              allowClear
              placeholder="Buscar (título ou conteúdo)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 420 }}
            />
            <Button onClick={() => setCreating((v) => !v)}>{creating ? 'Fechar' : 'Criar lore'}</Button>
          </Space>

          {creating && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 900 }}>
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
                  rows={6}
                />

                <Space>
                  <Button type="primary" htmlType="submit">
                    Criar
                  </Button>
                  <Button onClick={() => setCreating(false)}>Cancelar</Button>
                </Space>
              </form>
            </>
          )}
        </Space>
      </Card>

      <Card density="dense" title="Admin — Lores">
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table
            rowKey="id"
            dataSource={filtered}
            loading={loading}
            style={{ minWidth: 980 }}
            scroll={{ x: 980 }}
            onRow={(l: Lore) => ({ onClick: () => setOpenId(l.id) })}
            columns={[
              { title: '#', dataIndex: 'id', key: 'id', width: 70 },
              {
                title: 'Lore',
                key: 'title',
                render: (_, l) => (
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space wrap size={8}>
                      <span style={{ fontWeight: 700 }}>{l.title}</span>
                      {l.category ? <Tag>{l.category}</Tag> : <Tag>(sem categoria)</Tag>}
                      {isVisible(l) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
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
                render: (_, l) => <Switch checked={isVisible(l)} onChange={() => void toggleVisible(l)} />,
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

        {!filtered.length && !loading && (
          <Card density="comfy" style={{ marginTop: 12 }}>
            <Empty description="Nenhuma lore encontrada." />
          </Card>
        )}
      </Card>

      <Drawer
        open={!!openLore}
        onClose={() => setOpenId(null)}
        width={720}
        title={
          <Space wrap size={8}>
            <span style={{ fontWeight: 800 }}>Editar · {openLore?.title ?? 'Lore'}</span>
            {openLore && (isVisible(openLore) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>)}
          </Space>
        }
        extra={
          openLore ? (
            <Space>
              <Popconfirm
                title="Remover lore? Isso remove a lore permanentemente (e vínculos podem ficar órfãos se não tiver FK)."
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
          ) : null
        }
      >
        {!openLore ? null : (
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Card density="dense" title="Dados">
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título" />

                <Select
                  style={{ maxWidth: 320 }}
                  value={(editCategory ?? 'null') as any}
                  onChange={(v) => setEditCategory(v === 'null' ? null : (v as LoreCategory))}
                  options={categoryOptions}
                />

                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Conteúdo"
                  rows={10}
                />

                <Divider style={{ margin: '6px 0' }} />

                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Typography.Text>Visível para jogadores</Typography.Text>
                  <Switch checked={isVisible(openLore)} onChange={() => void toggleVisible(openLore)} />
                </Space>

                <Typography.Text type="secondary">
                  Criado: {formatDate(openLore.createdAt)}
                  <br />
                  Atualizado: {formatDate(openLore.updatedAt)}
                </Typography.Text>
              </Space>
            </Card>

            {loading && <Spinner />}
          </Space>
        )}
      </Drawer>
    </>
  );
};

export default LoresAdminPage;
