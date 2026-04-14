import React from 'react';
import { message, Collapse as AntdCollapse, Space, Tag, Typography, Switch, Divider } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Upload } from '@app/components/common/Upload/Upload';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Collapse } from '@app/components/common/Collapse/Collapse';
import { useResponsive } from '@app/hooks/useResponsive';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

import type { Player } from '@app/types/rpg';
import { PlayersApi } from '@app/api/rpg.api';
import { PlayerCard } from '@app/components/rpg/PlayerCard/PlayerCard';
import { resolveApiUrl } from '@app/api/http.api';

type AltMap = Record<number, string>;
type EditMap = Record<number, { name: string; level: number; background: string }>;
type EditingSet = Record<number, boolean>;

function isPlayerVisible(p: Player) {
  return (p.visible ?? true) === true;
}

export const PlayersPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [isGM, setIsGM] = React.useState<boolean>(!!localStorage.getItem('gm_api_key'));
  React.useEffect(() => {
    const onStorage = () => setIsGM(!!localStorage.getItem('gm_api_key'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [level, setLevel] = React.useState<number>(1);
  const [background, setBackground] = React.useState<string>('');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  const [altById, setAltById] = React.useState<AltMap>({});
  const setAlt = (id: number, v: string) => setAltById((prev) => ({ ...prev, [id]: v }));

  const [editById, setEditById] = React.useState<EditMap>({});
  const [editingSet, setEditingSet] = React.useState<EditingSet>({});

  function startEdit(p: Player) {
    setEditById((prev) => ({
      ...prev,
      [p.id]: { name: p.name, level: p.level, background: p.background ?? '' },
    }));
    setEditingSet((prev) => ({ ...prev, [p.id]: true }));
  }

  function cancelEdit(id: number) {
    setEditingSet((prev) => ({ ...prev, [id]: false }));
  }

  async function saveEdit(id: number) {
    const e = editById[id];
    if (!e) return;
    if (!e.name.trim()) return message.warning('Nome obrigatório');
    try {
      await PlayersApi.update(id, {
        name: e.name.trim(),
        level: e.level,
        background: e.background.trim() || null,
      });
      setEditingSet((prev) => ({ ...prev, [id]: false }));
      await load();
      message.success('Player atualizado');
    } catch {
      message.error('Falha ao atualizar (GM key?)');
    }
  }

  const toFile = (f: RcCustomRequestOptions['file']): File => f as File;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await PlayersApi.list();
      setItems(data);
    } catch {
      message.error('Falha ao carregar players');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await PlayersApi.create({
        name: name.trim(),
        level,
        background: background.trim() || null,
      });
      setCreating(false);
      setName('');
      setLevel(1);
      setBackground('');
      await load();
      message.success('Player criado');
    } catch {
      message.error('Falha ao criar player (é preciso GM key)');
    }
  }

  async function toggleVisible(p: Player) {
    try {
      await PlayersApi.setVisible(p.id, !isPlayerVisible(p));
      await load();
    } catch {
      message.error('Não foi possível alterar visibilidade (GM key?)');
    }
  }

  const imageProps = (player: Player): UploadProps => ({
    name: 'image',
    accept: 'image/png,image/jpeg,image/webp,image/gif',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const { onError, onSuccess } = options;
      const file = toFile(options.file);
      PlayersApi.uploadImage(player.id, file, altById[player.id])
        .then(async () => {
          onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Imagem atualizada');
          await load();
        })
        .catch((err) => {
          onError?.(err as Error);
          message.error('Falha ao enviar imagem (GM key?)');
        });
    },
  });

  const sheetProps = (player: Player): UploadProps => ({
    name: 'sheet',
    accept: 'application/pdf',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const { onError, onSuccess } = options;
      const file = toFile(options.file);
      PlayersApi.uploadSheet(player.id, file)
        .then(async () => {
          onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Ficha enviada');
          await load();
        })
        .catch((err) => {
          onError?.(err as Error);
          message.error('Falha ao enviar ficha (PDF) — (GM key?)');
        });
    },
  });

  const normalizedItems = React.useMemo(
    () =>
      items.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ? resolveApiUrl(p.imageUrl) : p.imageUrl,
        sheetUrl: p.sheetUrl ? resolveApiUrl(p.sheetUrl) : p.sheetUrl,
      })),
    [items],
  );

  const q = search.trim().toLowerCase();
  const displayItems = React.useMemo(
    () =>
      normalizedItems.filter((p) => {
        if (!isGM && !isPlayerVisible(p)) return false;
        if (isGM && filterVis === 'visible' && !isPlayerVisible(p)) return false;
        if (isGM && filterVis === 'hidden' && isPlayerVisible(p)) return false;
        if (!q) return true;
        return (p.name ?? '').toLowerCase().includes(q) || (p.background ?? '').toLowerCase().includes(q);
      }),
    [normalizedItems, q, filterVis, isGM],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isPlayerVisible).length;
    return { total, visible, hidden: total - visible };
  }, [items]);

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <Card density="dense" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }} size={8}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Personagens
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {isGM
                ? 'Gerencie os personagens — imagem, ficha e visibilidade.'
                : 'Os aventureiros que enfrentam o destino do sistema Algol.'}
            </Typography.Text>
          </div>
          {isGM && (
            <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
              {creating ? 'Fechar' : '+ Novo Player'}
            </Button>
          )}
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} personagens</Tag>
          {isGM && <Tag color="green">{stats.visible} visíveis</Tag>}
          {isGM && <Tag color="red">{stats.hidden} ocultos</Tag>}
        </Space>

        <Space wrap size={8} style={{ width: '100%' }}>
          <Input
            allowClear
            placeholder="Buscar por nome ou background…"
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
                  {v === 'all' ? 'Todos' : v === 'visible' ? 'Visíveis' : 'Ocultos'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {isGM && creating && (
          <>
            <Divider style={{ margin: '4px 0' }} />
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
              <Typography.Text strong>Novo Personagem</Typography.Text>
              <Space wrap size={8}>
                <Input
                  placeholder="Nome *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ minWidth: 240 }}
                  required
                />
                <Space size={6}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Nível:
                  </Typography.Text>
                  <InputNumber min={1} value={level} onChange={(n) => setLevel(Number(n) || 1)} />
                </Space>
              </Space>
              <TextArea
                placeholder="Background (opcional)"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={mobileOnly ? 4 : 3}
              />
              <Space>
                <Button htmlType="submit" type="primary">
                  Criar
                </Button>
                <Button onClick={() => setCreating(false)}>Cancelar</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  return (
    <>
      <PageTitle>Players</PageTitle>

      {Header}

      {loading ? (
        <Spinner />
      ) : displayItems.length === 0 ? (
        <Card density="comfy">
          <Space direction="vertical" size={8} style={{ width: '100%', alignItems: 'center' }}>
            <Typography.Text type="secondary">Nenhum personagem encontrado.</Typography.Text>
          </Space>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {displayItems.map((p) => (
            <div key={p.id} style={{ display: 'grid', gap: 8 }}>
              <PlayerCard player={p} gm={isGM} onToggleVisible={toggleVisible} />

              {isGM && (
                <Collapse>
                  <AntdCollapse.Panel
                    header={
                      <Space size={8}>
                        <span>Gerenciar</span>
                        <Tag color={isPlayerVisible(p) ? 'green' : 'red'} style={{ margin: 0 }}>
                          {isPlayerVisible(p) ? 'Visível' : 'Oculto'}
                        </Tag>
                      </Space>
                    }
                    key={`gm-${p.id}`}
                  >
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Typography.Text style={{ fontSize: 13 }}>Visível para jogadores</Typography.Text>
                        <Switch
                          size="small"
                          checked={isPlayerVisible(p)}
                          onChange={() => void toggleVisible(p)}
                          checkedChildren={<EyeOutlined />}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>
                      <Divider style={{ margin: '4px 0' }} />

                      {/* ── Edição de dados ── */}
                      {editingSet[p.id] ? (
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Space wrap size={8}>
                            <Input
                              placeholder="Nome *"
                              value={editById[p.id]?.name ?? ''}
                              onChange={(e) =>
                                setEditById((prev) => ({
                                  ...prev,
                                  [p.id]: { ...prev[p.id], name: e.target.value },
                                }))
                              }
                              style={{ minWidth: 180 }}
                            />
                            <Space size={4}>
                              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                Nível:
                              </Typography.Text>
                              <InputNumber
                                min={1}
                                value={editById[p.id]?.level ?? 1}
                                onChange={(n) =>
                                  setEditById((prev) => ({
                                    ...prev,
                                    [p.id]: { ...prev[p.id], level: Number(n) || 1 },
                                  }))
                                }
                                style={{ width: 70 }}
                              />
                            </Space>
                          </Space>
                          <TextArea
                            placeholder="Background"
                            rows={3}
                            value={editById[p.id]?.background ?? ''}
                            onChange={(e) =>
                              setEditById((prev) => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], background: e.target.value },
                              }))
                            }
                          />
                          <Space size={6}>
                            <Button size="small" type="primary" onClick={() => void saveEdit(p.id)}>
                              Salvar
                            </Button>
                            <Button size="small" onClick={() => cancelEdit(p.id)}>
                              Cancelar
                            </Button>
                          </Space>
                        </Space>
                      ) : (
                        <Button size="small" onClick={() => startEdit(p)}>
                          Editar nome / nível / background
                        </Button>
                      )}

                      <Divider style={{ margin: '4px 0' }} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Input
                          placeholder="Alt text da imagem"
                          value={altById[p.id] ?? ''}
                          onChange={(e) => setAlt(p.id, e.target.value)}
                          style={{ maxWidth: 200 }}
                        />
                        <Upload {...imageProps(p)}>
                          <Button size="small">Upload imagem</Button>
                        </Upload>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Upload {...sheetProps(p)}>
                          <Button size="small">Upload PDF</Button>
                        </Upload>
                        {p.sheetUrl && (
                          <a href={p.sheetUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                            abrir ficha
                          </a>
                        )}
                      </div>
                    </Space>
                  </AntdCollapse.Panel>
                </Collapse>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PlayersPage;
