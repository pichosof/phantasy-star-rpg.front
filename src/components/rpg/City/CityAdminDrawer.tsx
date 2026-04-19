import React from 'react';
import { Drawer, Tabs, Space, Input, Button, Tag, Divider, Select, message, Typography, Upload } from 'antd';
import { PictureOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import type { CityForAdmin } from '@app/types/rpg';
import { listWorlds, World } from '@app/api/worlds.api';
import { listLores, linkLoreToCity, unlinkLoreFromCity, Lore } from '@app/api/lore.api';
import { listQuestsPublic, linkQuestToCity, unlinkQuestFromCity, Quest } from '@app/api/quests.api';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';

import { CitiesApi } from '@app/api/rpg.api';

type Props = {
  open: boolean;
  city: CityForAdmin | null;
  isGM: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>; // para dar reload na lista de cidades (worldId etc)
};

export const CityAdminDrawer: React.FC<Props> = ({ open, city, isGM, onClose, onChanged }) => {
  const { mobileOnly } = useResponsive();
  const isMobile = mobileOnly;
  const [loading, setLoading] = React.useState(false);

  const [worlds, setWorlds] = React.useState<World[]>([]);

  const [allLores, setAllLores] = React.useState<Lore[]>([]);
  const [allQuests, setAllQuests] = React.useState<Quest[]>([]);

  const [linkedLores, setLinkedLores] = React.useState<Lore[]>([]);
  const [linkedQuests, setLinkedQuests] = React.useState<Quest[]>([]);

  const [qLore, setQLore] = React.useState('');
  const [qQuest, setQQuest] = React.useState('');
  const [imgAlt, setImgAlt] = React.useState('');

  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [editRegion, setEditRegion] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const cityId = city?.id ?? 0;

  const reload = React.useCallback(async () => {
    if (!open || !city || !isGM) return;

    setLoading(true);
    try {
      const [ws, loresAll, questsAll, loresLinked, questsLinked] = await Promise.all([
        listWorlds(),
        listLores(),
        listQuestsPublic(),
        listLoresByCityId(city.id, { gm: true }),
        listQuestsByCityId(city.id, { gm: true }),
      ]);

      setWorlds(ws);
      setAllLores(loresAll);
      setAllQuests(questsAll);
      setLinkedLores(loresLinked);
      setLinkedQuests(questsLinked);
    } catch (e) {
      console.error(e);
      message.error('Failed to load city links.');
    } finally {
      setLoading(false);
    }
  }, [open, city, isGM]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  React.useEffect(() => {
    if (city) {
      setEditName(city.name ?? '');
      setEditDesc(city.description ?? '');
      setEditRegion(city.region ?? '');
    }
  }, [city?.id]);

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
      message.success('Lore linked.');
    } catch {
      message.error('Failed to link lore.');
    }
  }

  async function doUnlinkLore(loreId: number) {
    if (!city) return;
    try {
      await unlinkLoreFromCity(loreId, city.id);
      setLinkedLores((prev) => prev.filter((x) => x.id !== loreId));
      message.success('Lore unlinked.');
    } catch {
      message.error('Failed to unlink lore.');
    }
  }

  async function doLinkQuest(questId: number) {
    if (!city) return;
    try {
      await linkQuestToCity(questId, city.id);
      const quest = allQuests.find((x) => x.id === questId);
      if (quest) setLinkedQuests((prev) => [...prev, quest]);
      message.success('Quest linked.');
    } catch {
      message.error('Failed to link quest.');
    }
  }

  async function doUnlinkQuest(questId: number) {
    if (!city) return;
    try {
      await unlinkQuestFromCity(questId, city.id);
      setLinkedQuests((prev) => prev.filter((x) => x.id !== questId));
      message.success('Quest unlinked.');
    } catch {
      message.error('Failed to unlink quest.');
    }
  }

  async function saveEdit() {
    if (!city) return;
    const n = editName.trim();
    if (!n) return message.warning('Name cannot be empty.');
    setSaving(true);
    try {
      await CitiesApi.update(city.id, {
        name: n,
        description: editDesc.trim() || null,
        region: editRegion.trim() || null,
      });
      message.success('City updated.');
      await onChanged();
    } catch {
      message.error('Failed to save (GM key?)');
    } finally {
      setSaving(false);
    }
  }

  async function setCityWorld(worldId: number | null) {
    if (!city) return;

    try {
      await CitiesApi.setWorld(city.id, worldId);
      message.success('World link updated.');
      await onChanged();
    } catch (e) {
      console.error(e);
      message.error('Failed to link city to world.');
    }
  }

  const DrawerTitle = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Admin · {city?.name ?? 'City'}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {city?.visible === false && <Tag color="red">Hidden</Tag>}
        {city?.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
        {/* se quiser tags extras aqui (mapped/hidden etc), é aqui */}
      </div>
    </div>
  );

  return (
    <Drawer
      visible={open}
      onClose={onClose}
      placement={mobileOnly ? 'bottom' : 'right'}
      width={mobileOnly ? undefined : 720}
      height={mobileOnly ? '92vh' : undefined}
      headerStyle={
        isMobile
          ? {
              padding: `calc(12px + env(safe-area-inset-top)) 12px 8px`,
              alignItems: 'flex-start',
            }
          : undefined
      }
      bodyStyle={isMobile ? { padding: 12, paddingBottom: `calc(12px + env(safe-area-inset-bottom))` } : undefined}
      destroyOnClose
      title={
        isMobile ? (
          DrawerTitle
        ) : (
          <Space>
            <span>Admin · {city?.name ?? 'City'}</span>
            {city?.visible === false && <Tag color="red">Hidden</Tag>}
            {city?.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
          </Space>
        )
      }
    >
      {!city ? null : (
        <Tabs defaultActiveKey="edit">
          <Tabs.TabPane tab="✏️ Edit" key="edit">
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Name *
                </Typography.Text>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="City name" />
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Region
                </Typography.Text>
                <Input
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  placeholder="E.g.: Motavia, Palma..."
                />
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Description
                </Typography.Text>
                <Input.TextArea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="City description..."
                  rows={6}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => void saveEdit()}
                block={mobileOnly}
              >
                Save changes
              </Button>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Lores" key="lores">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Typography.Text type="secondary">
                Linked: {linkedLores.length} · Available: {availableLores.length}
              </Typography.Text>

              <Divider style={{ margin: '8px 0' }} />

              <Typography.Text strong>Linked</Typography.Text>
              <div style={{ display: 'grid', gap: 8 }}>
                {linkedLores.map((l) => (
                  <div key={l.id} style={{ display: 'grid', gap: 6 }}>
                    <Space wrap size={6}>
                      <Typography.Text style={{ fontWeight: 600 }}>{l.title}</Typography.Text>
                      {l.category && <Tag>{l.category}</Tag>}
                      {(l as any).visible === false && <Tag color="red">hidden</Tag>}
                    </Space>

                    <Button danger size="small" block={mobileOnly} onClick={() => void doUnlinkLore(l.id)}>
                      Unlink
                    </Button>
                  </div>
                ))}
                {!linkedLores.length && <Typography.Text type="secondary">No lores linked.</Typography.Text>}
              </div>

              <Divider />

              <Typography.Text strong>Link new</Typography.Text>
              <Input allowClear placeholder="Search lore..." value={qLore} onChange={(e) => setQLore(e.target.value)} />

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  maxHeight: mobileOnly ? '45vh' : 320,
                  overflow: 'auto',
                  paddingRight: 4,
                }}
              >
                {availableLores.map((l) => (
                  <div key={l.id} style={{ display: 'grid', gap: 6 }}>
                    <Space wrap size={6}>
                      <Typography.Text style={{ fontWeight: 600 }}>{l.title}</Typography.Text>
                      {l.category && <Tag>{l.category}</Tag>}
                      {(l as any).visible === false && <Tag color="red">hidden</Tag>}
                    </Space>

                    <Button type="primary" size="small" block={mobileOnly} onClick={() => void doLinkLore(l.id)}>
                      Link
                    </Button>
                  </div>
                ))}
                {!availableLores.length && <Typography.Text type="secondary">Nothing to link.</Typography.Text>}
              </div>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Quests" key="quests">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Typography.Text type="secondary">
                Linked: {linkedQuests.length} · Available: {availableQuests.length}
              </Typography.Text>

              <Divider style={{ margin: '8px 0' }} />

              <Typography.Text strong>Linked</Typography.Text>
              <div style={{ display: 'grid', gap: 8 }}>
                {linkedQuests.map((q) => (
                  <div key={q.id} style={{ display: 'grid', gap: 6 }}>
                    <Space wrap size={6}>
                      <Typography.Text style={{ fontWeight: 600 }}>{q.title}</Typography.Text>
                      {(q as any).status && <Tag style={{ marginLeft: 8 }}>{(q as any).status}</Tag>}
                      {(q as any).visible === false && <Tag color="red">hidden</Tag>}
                    </Space>
                    <Button danger size="small" block={mobileOnly} onClick={() => void doUnlinkQuest(q.id)}>
                      Unlink
                    </Button>
                  </div>
                ))}
                {!linkedQuests.length && <Typography.Text type="secondary">No quests linked.</Typography.Text>}
              </div>

              <Divider />

              <Typography.Text strong>Link new</Typography.Text>
              <Input
                allowClear
                placeholder="Search quest..."
                value={qQuest}
                onChange={(e) => setQQuest(e.target.value)}
              />

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  maxHeight: mobileOnly ? '45vh' : 320,
                  overflow: 'auto',
                  paddingRight: 4,
                }}
              >
                {availableQuests.map((q) => (
                  <div key={q.id} style={{ display: 'grid', gap: 6 }}>
                    <Space wrap size={6}>
                      <Typography.Text style={{ fontWeight: 600 }}>{q.title}</Typography.Text>
                      {(q as any).status && <Tag style={{ marginLeft: 8 }}>{(q as any).status}</Tag>}
                      {(q as any).visible === false && <Tag color="red">hidden</Tag>}
                    </Space>
                    <Button type="primary" size="small" block={mobileOnly} onClick={() => void doLinkQuest(q.id)}>
                      Link
                    </Button>
                  </div>
                ))}
                {!availableQuests.length && <Typography.Text type="secondary">Nothing to link.</Typography.Text>}
              </div>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Image" key="image">
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              {city.imageUrl && (
                <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 260 }}>
                  <img
                    src={resolveApiUrl(city.imageUrl)}
                    alt={city.imageAlt ?? city.name}
                    style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
              {!city.imageUrl && (
                <div
                  style={{
                    height: 120,
                    borderRadius: 8,
                    border: '1px dashed rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: 13,
                    gap: 8,
                  }}
                >
                  <PictureOutlined />
                  No image yet
                </div>
              )}

              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Alt text (accessibility / tooltip)
                </Typography.Text>
                <Input
                  placeholder="Image description..."
                  value={imgAlt || city.imageAlt || ''}
                  onChange={(e) => setImgAlt(e.target.value)}
                />
              </div>

              <Upload
                name="image"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple={false}
                showUploadList={false}
                customRequest={(options: RcCustomRequestOptions): void => {
                  const { onError, onSuccess } = options;
                  const file = options.file as File;
                  const alt = imgAlt || city.imageAlt || undefined;
                  CitiesApi.uploadImage(city.id, file, alt)
                    .then(async () => {
                      onSuccess?.({}, undefined as unknown as XMLHttpRequest);
                      message.success('Image updated');
                      await onChanged();
                    })
                    .catch((err: Error) => {
                      onError?.(err);
                      message.error('Failed to upload image (GM key?)');
                    });
                }}
              >
                <Button icon={<PictureOutlined />} type="primary">
                  {city.imageUrl ? 'Change image' : 'Upload image'}
                </Button>
              </Upload>

              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                PNG, JPG, WebP or GIF · max {process.env.MAX_UPLOAD_MB || 30} MB
              </Typography.Text>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="World" key="world">
            <Space direction={mobileOnly ? 'vertical' : 'horizontal'} wrap style={{ width: '100%' }}>
              <span>World:</span>
              <Select
                style={{ width: mobileOnly ? '100%' : 260 }}
                value={city.worldId ?? null}
                onChange={(v) => void setCityWorld(v)}
                options={[
                  { label: '(No world)', value: null },
                  ...worlds.map((w) => ({ label: `#${w.id} — ${w.name}`, value: w.id })),
                ]}
              />
            </Space>
          </Tabs.TabPane>
        </Tabs>
      )}
    </Drawer>
  );
};
