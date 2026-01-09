import React from 'react';
import { Drawer, Tabs, Space, Input, Button, Tag, Divider, Select, message, Typography } from 'antd';
import type { CityForAdmin } from '@app/types/rpg';
import { listWorlds, World } from '@app/api/worlds.api';
import { listLores, linkLoreToCity, unlinkLoreFromCity, Lore } from '@app/api/lore.api';
import { listQuests, linkQuestToCity, unlinkQuestFromCity, Quest } from '@app/api/quests.api';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';

import { CitiesApi } from '@app/api/rpg.api';

type Props = {
  open: boolean;
  city: CityForAdmin | null;
  isGM: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>; // para dar reload na lista de cidades (worldId etc)
};

export const CityAdminDrawer: React.FC<Props> = ({ open, city, isGM, onClose, onChanged }) => {
  const [loading, setLoading] = React.useState(false);

  const [worlds, setWorlds] = React.useState<World[]>([]);

  const [allLores, setAllLores] = React.useState<Lore[]>([]);
  const [allQuests, setAllQuests] = React.useState<Quest[]>([]);

  const [linkedLores, setLinkedLores] = React.useState<Lore[]>([]);
  const [linkedQuests, setLinkedQuests] = React.useState<Quest[]>([]);

  const [qLore, setQLore] = React.useState('');
  const [qQuest, setQQuest] = React.useState('');

  const cityId = city?.id ?? 0;

  const reload = React.useCallback(async () => {
    if (!open || !city || !isGM) return;

    setLoading(true);
    try {
      const [ws, loresAll, questsAll, loresLinked, questsLinked] = await Promise.all([
        listWorlds(),
        listLores(),
        listQuests(),
        listLoresByCityId(city.id),
        listQuestsByCityId(city.id),
      ]);

      setWorlds(ws);
      setAllLores(loresAll);
      setAllQuests(questsAll);
      setLinkedLores(loresLinked);
      setLinkedQuests(questsLinked);
    } catch (e) {
      console.error(e);
      message.error('Falha ao carregar vínculos da cidade.');
    } finally {
      setLoading(false);
    }
  }, [open, city, isGM]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const linkedLoreIds = React.useMemo(() => new Set(linkedLores.map((x) => x.id)), [linkedLores]);
  const linkedQuestIds = React.useMemo(() => new Set(linkedQuests.map((x) => x.id)), [linkedQuests]);

  const availableLores = React.useMemo(() => {
    const s = qLore.trim().toLowerCase();
    return allLores
      .filter((l) => !linkedLoreIds.has(l.id))
      .filter((l) => (!s ? true : l.title.toLowerCase().includes(s)));
  }, [allLores, linkedLoreIds, qLore]);

  const availableQuests = React.useMemo(() => {
    const s = qQuest.trim().toLowerCase();
    return allQuests
      .filter((q) => !linkedQuestIds.has(q.id))
      .filter((q) => (!s ? true : q.title.toLowerCase().includes(s)));
  }, [allQuests, linkedQuestIds, qQuest]);

  async function doLinkLore(loreId: number) {
    if (!city) return;
    try {
      await linkLoreToCity(loreId, city.id);
      const lore = allLores.find((x) => x.id === loreId);
      if (lore) setLinkedLores((prev) => [...prev, lore]);
      message.success('Lore vinculada.');
    } catch {
      message.error('Falha ao vincular lore.');
    }
  }

  async function doUnlinkLore(loreId: number) {
    if (!city) return;
    try {
      await unlinkLoreFromCity(loreId, city.id);
      setLinkedLores((prev) => prev.filter((x) => x.id !== loreId));
      message.success('Lore desvinculada.');
    } catch {
      message.error('Falha ao desvincular lore.');
    }
  }

  async function doLinkQuest(questId: number) {
    if (!city) return;
    try {
      await linkQuestToCity(questId, city.id);
      const quest = allQuests.find((x) => x.id === questId);
      if (quest) setLinkedQuests((prev) => [...prev, quest]);
      message.success('Quest vinculada.');
    } catch {
      message.error('Falha ao vincular quest.');
    }
  }

  async function doUnlinkQuest(questId: number) {
    if (!city) return;
    try {
      await unlinkQuestFromCity(questId, city.id);
      setLinkedQuests((prev) => prev.filter((x) => x.id !== questId));
      message.success('Quest desvinculada.');
    } catch {
      message.error('Falha ao desvincular quest.');
    }
  }

  async function setCityWorld(worldId: number | null) {
    if (!city) return;

    try {
      await CitiesApi.setWorld(city.id, worldId);
      message.success('Vínculo com mundo atualizado.');
      await onChanged();
    } catch (e) {
      console.error(e);
      message.error('Falha ao vincular cidade ao mundo.');
    }
  }

  return (
    <Drawer
      visible={open}
      onClose={onClose}
      width={720}
      title={
        <Space>
          <span>Admin · {city?.name ?? 'Cidade'}</span>
          {city?.visible === false && <Tag color="red">Invisível</Tag>}
          {city?.discovered ? <Tag color="gold">Descoberta</Tag> : <Tag>Não descoberta</Tag>}
        </Space>
      }
    >
      {!city ? null : (
        <Tabs defaultActiveKey="lores">
          <Tabs.TabPane tab="Lores" key="lores">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Typography.Text type="secondary">
                Vinculadas: {linkedLores.length} · Disponíveis: {availableLores.length}
              </Typography.Text>

              <Divider style={{ margin: '8px 0' }} />

              <Typography.Text strong>Vinculadas</Typography.Text>
              <div style={{ display: 'grid', gap: 8 }}>
                {linkedLores.map((l) => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <Typography.Text ellipsis>{l.title}</Typography.Text>
                      {l.category && <Tag style={{ marginLeft: 8 }}>{l.category}</Tag>}
                      {(l as any).visible === false && <Tag color="red">hidden</Tag>}
                    </div>
                    <Button danger size="small" onClick={() => void doUnlinkLore(l.id)}>
                      Desvincular
                    </Button>
                  </div>
                ))}
                {!linkedLores.length && <Typography.Text type="secondary">Nenhuma lore vinculada.</Typography.Text>}
              </div>

              <Divider />

              <Typography.Text strong>Vincular nova</Typography.Text>
              <Input allowClear placeholder="Buscar lore..." value={qLore} onChange={(e) => setQLore(e.target.value)} />

              <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflow: 'auto' }}>
                {availableLores.map((l) => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <Typography.Text ellipsis>{l.title}</Typography.Text>
                      {l.category && <Tag style={{ marginLeft: 8 }}>{l.category}</Tag>}
                      {(l as any).visible === false && <Tag color="red">hidden</Tag>}
                    </div>
                    <Button type="primary" size="small" onClick={() => void doLinkLore(l.id)}>
                      Vincular
                    </Button>
                  </div>
                ))}
                {!availableLores.length && <Typography.Text type="secondary">Nada pra vincular.</Typography.Text>}
              </div>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Quests" key="quests">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Typography.Text type="secondary">
                Vinculadas: {linkedQuests.length} · Disponíveis: {availableQuests.length}
              </Typography.Text>

              <Divider style={{ margin: '8px 0' }} />

              <Typography.Text strong>Vinculadas</Typography.Text>
              <div style={{ display: 'grid', gap: 8 }}>
                {linkedQuests.map((q) => (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <Typography.Text ellipsis>{q.title}</Typography.Text>
                      {(q as any).status && <Tag style={{ marginLeft: 8 }}>{(q as any).status}</Tag>}
                      {(q as any).visible === false && <Tag color="red">hidden</Tag>}
                    </div>
                    <Button danger size="small" onClick={() => void doUnlinkQuest(q.id)}>
                      Desvincular
                    </Button>
                  </div>
                ))}
                {!linkedQuests.length && <Typography.Text type="secondary">Nenhuma quest vinculada.</Typography.Text>}
              </div>

              <Divider />

              <Typography.Text strong>Vincular nova</Typography.Text>
              <Input
                allowClear
                placeholder="Buscar quest..."
                value={qQuest}
                onChange={(e) => setQQuest(e.target.value)}
              />

              <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflow: 'auto' }}>
                {availableQuests.map((q) => (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <Typography.Text ellipsis>{q.title}</Typography.Text>
                      {(q as any).status && <Tag style={{ marginLeft: 8 }}>{(q as any).status}</Tag>}
                      {(q as any).visible === false && <Tag color="red">hidden</Tag>}
                    </div>
                    <Button type="primary" size="small" onClick={() => void doLinkQuest(q.id)}>
                      Vincular
                    </Button>
                  </div>
                ))}
                {!availableQuests.length && <Typography.Text type="secondary">Nada pra vincular.</Typography.Text>}
              </div>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Mundo" key="world">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Typography.Text type="secondary">Associe a cidade a um mundo (ou remova o vínculo).</Typography.Text>

              <Space wrap>
                <span>Mundo:</span>
                <Select
                  style={{ minWidth: 260 }}
                  value={city.worldId ?? null}
                  onChange={(v) => void setCityWorld(v)}
                  options={[
                    { label: '(Sem mundo)', value: null },
                    ...worlds.map((w) => ({ label: `#${w.id} — ${w.name}`, value: w.id })),
                  ]}
                />
              </Space>

              {loading && <Typography.Text type="secondary">Carregando...</Typography.Text>}
            </Space>
          </Tabs.TabPane>
        </Tabs>
      )}
    </Drawer>
  );
};
