/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { UPLOAD_MAX_MB } from '@app/config/config';
import {
  Drawer,
  Tabs,
  Space,
  Input,
  Button,
  Tag,
  Divider,
  Select,
  message,
  Typography,
  Upload,
  Modal,
  Popconfirm,
  Spin,
} from 'antd';
import { SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import type { TabsProps } from 'antd';
import type { CityForAdmin } from '@app/types/rpg';
import { listWorlds, World } from '@app/api/worlds.api';
import { listLores, linkLoreToCity, unlinkLoreFromCity, Lore } from '@app/api/lore.api';
import { listQuestsPublic, linkQuestToCity, unlinkQuestFromCity, Quest } from '@app/api/quests.api';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';
import { addCityImage, deleteCityImage, CityImage } from '@app/api/cities.api';

import { CitiesApi } from '@app/api/rpg.api';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import * as S from './CityAdminDrawer.styles';

// ── Images Tab ────────────────────────────────────────────────────────────────

interface CityImagesTabProps {
  city: CityForAdmin;
  onChanged: () => Promise<void>;
}

const CityImagesTab: React.FC<CityImagesTabProps> = ({ city, onChanged }) => {
  const [images, setImages] = React.useState<CityImage[]>((city as any).images ?? []);
  const [uploading, setUploading] = React.useState(false);
  const [altInput, setAltInput] = React.useState('');
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [lightbox, setLightbox] = React.useState<{ src: string; alt: string } | null>(null);

  React.useEffect(() => {
    setImages((city as any).images ?? []);
  }, [city]);

  function handleUpload(options: RcCustomRequestOptions) {
    const { onError, onSuccess, file } = options;
    const f = file as File;

    setUploading(true);

    addCityImage(city.id, f, altInput.trim() || undefined)
      .then((img) => {
        onSuccess?.({}, undefined as unknown as XMLHttpRequest);
        setImages((prev) => [...prev, img]);
        setAltInput('');
        message.success('Image added.');
        void onChanged();
      })
      .catch((err: unknown) => {
        onError?.(err as Error);
        message.error('Failed to upload image.');
      })
      .finally(() => setUploading(false));
  }

  async function handleDelete(imgId: number) {
    setDeletingId(imgId);

    try {
      await deleteCityImage(city.id, imgId);
      setImages((prev) => prev.filter((i) => i.id !== imgId));
      message.success('Image removed.');
      void onChanged();
    } catch {
      message.error('Failed to delete image.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Space orientation="vertical" size={14} style={S.fullWidth}>
      {images.length > 0 ? (
        <div style={S.imagesGrid}>
          {images.map((img) => {
            const src = resolveApiUrl(img.url) ?? img.url;

            return (
              <div key={img.id} style={S.imageCard}>
                <img
                  src={src}
                  alt={img.alt ?? undefined}
                  onClick={() => setLightbox({ src, alt: img.alt ?? '' })}
                  style={S.imageThumb}
                />

                <Popconfirm
                  title="Remove this image?"
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => void handleDelete(img.id)}
                >
                  <Button
                    size="small"
                    danger
                    icon={deletingId === img.id ? <Spin size="small" /> : <DeleteOutlined />}
                    style={S.imageDeleteButton}
                  />
                </Popconfirm>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={S.emptyImagesState}>
          <IconLabel icon="image">No images yet</IconLabel>
        </div>
      )}

      <div>
        <Typography.Text type="secondary" style={S.fieldLabel}>
          Alt text for next image (optional)
        </Typography.Text>

        <Input
          placeholder="e.g. Aerial view of the city"
          value={altInput}
          onChange={(e) => setAltInput(e.target.value)}
        />
      </div>

      <Upload
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple={false}
        showUploadList={false}
        customRequest={(opts: RcCustomRequestOptions) => handleUpload(opts)}
      >
        <Button type="primary" icon={<PlusOutlined />} loading={uploading}>
          Add image
        </Button>
      </Upload>

      <Typography.Text type="secondary" style={S.uploadHint}>
        PNG, JPG, WebP or GIF · max {UPLOAD_MAX_MB} MB
      </Typography.Text>

      <Modal
        open={!!lightbox}
        onCancel={() => setLightbox(null)}
        footer={null}
        centered
        width="90vw"
        styles={{
          body: S.lightboxBody,
        }}
        destroyOnHidden
      >
        {lightbox && <img src={lightbox.src} alt={lightbox.alt} style={S.lightboxImage} />}
      </Modal>
    </Space>
  );
};

type Props = {
  open: boolean;
  city: CityForAdmin | null;
  isGM: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

export const CityAdminDrawer: React.FC<Props> = ({ open, city, isGM, onClose, onChanged }) => {
  const { mobileOnly } = useResponsive();
  const isMobile = mobileOnly;

  const [, setLoading] = React.useState(false);

  const [worlds, setWorlds] = React.useState<World[]>([]);
  const [allLores, setAllLores] = React.useState<Lore[]>([]);
  const [allQuests, setAllQuests] = React.useState<Quest[]>([]);
  const [linkedLores, setLinkedLores] = React.useState<Lore[]>([]);
  const [linkedQuests, setLinkedQuests] = React.useState<Quest[]>([]);

  const [qLore, setQLore] = React.useState('');
  const [qQuest, setQQuest] = React.useState('');

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
  }, [city]);

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

      if (lore) {
        setLinkedLores((prev) => [...prev, lore]);
      }

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

      if (quest) {
        setLinkedQuests((prev) => [...prev, quest]);
      }

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

    if (!n) {
      return message.warning('Name cannot be empty.');
    }

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

  const drawerTitle = (
    <div style={S.drawerTitle}>
      <div style={S.drawerTitleRow}>
        <span style={S.drawerTitleText}>Admin · {city?.name ?? 'City'}</span>
      </div>

      <div style={S.drawerTagRow}>
        {city?.visible === false && <Tag color="red">Hidden</Tag>}
        {city?.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
      </div>
    </div>
  );

  const tabItems: TabsProps['items'] = !city
    ? []
    : [
        {
          key: 'edit',
          label: <IconLabel icon="edit">Edit</IconLabel>,
          children: (
            <Space orientation="vertical" size={14} style={S.fullWidth}>
              <div>
                <Typography.Text type="secondary" style={S.fieldLabel}>
                  Name *
                </Typography.Text>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="City name" />
              </div>

              <div>
                <Typography.Text type="secondary" style={S.fieldLabel}>
                  Region
                </Typography.Text>
                <Input
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  placeholder="E.g.: Motavia, Palma..."
                />
              </div>

              <div>
                <Typography.Text type="secondary" style={S.fieldLabel}>
                  Description
                </Typography.Text>
                <Input.TextArea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="City description..."
                  rows={6}
                  style={S.textAreaResize}
                />
              </div>

              <div>
                <Typography.Text type="secondary" style={S.fieldLabel}>
                  <IconLabel icon="tags">Tags</IconLabel>
                </Typography.Text>
                <TagSelect entityType="city" entityId={cityId} />
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
          ),
        },
        {
          key: 'lores',
          label: 'Lores',
          children: (
            <Space orientation="vertical" style={S.fullWidth} size={12}>
              <Typography.Text type="secondary">
                Linked: {linkedLores.length} · Available: {availableLores.length}
              </Typography.Text>

              <Divider style={S.dividerSpaced} />

              <Typography.Text strong>Linked</Typography.Text>

              <div style={S.sectionGrid}>
                {linkedLores.map((l) => (
                  <div key={l.id} style={S.listItem}>
                    <Space wrap size={6}>
                      <Typography.Text style={S.itemTitle}>{l.title}</Typography.Text>
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

              <div style={S.scrollList(mobileOnly)}>
                {availableLores.map((l) => (
                  <div key={l.id} style={S.listItem}>
                    <Space wrap size={6}>
                      <Typography.Text style={S.itemTitle}>{l.title}</Typography.Text>
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
          ),
        },
        {
          key: 'quests',
          label: 'Quests',
          children: (
            <Space orientation="vertical" style={S.fullWidth} size={12}>
              <Typography.Text type="secondary">
                Linked: {linkedQuests.length} · Available: {availableQuests.length}
              </Typography.Text>

              <Divider style={S.dividerSpaced} />

              <Typography.Text strong>Linked</Typography.Text>

              <div style={S.sectionGrid}>
                {linkedQuests.map((q) => (
                  <div key={q.id} style={S.listItem}>
                    <Space wrap size={6}>
                      <Typography.Text style={S.itemTitle}>{q.title}</Typography.Text>
                      {(q as any).status && <Tag style={S.statusTag}>{(q as any).status}</Tag>}
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

              <div style={S.scrollList(mobileOnly)}>
                {availableQuests.map((q) => (
                  <div key={q.id} style={S.listItem}>
                    <Space wrap size={6}>
                      <Typography.Text style={S.itemTitle}>{q.title}</Typography.Text>
                      {(q as any).status && <Tag style={S.statusTag}>{(q as any).status}</Tag>}
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
          ),
        },
        {
          key: 'image',
          label: <IconLabel icon="image">Images</IconLabel>,
          children: <CityImagesTab city={city} onChanged={onChanged} />,
        },
        {
          key: 'world',
          label: <IconLabel icon="world">World</IconLabel>,
          children: (
            <Space orientation={mobileOnly ? 'vertical' : 'horizontal'} wrap style={S.fullWidth}>
              <span>World:</span>

              <Select
                style={S.worldSelect(mobileOnly)}
                value={city.worldId ?? null}
                onChange={(v) => void setCityWorld(v)}
                options={[
                  { label: '(No world)', value: null },
                  ...worlds.map((w) => ({ label: `#${w.id} — ${w.name}`, value: w.id })),
                ]}
              />
            </Space>
          ),
        },
      ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement={mobileOnly ? 'bottom' : 'right'}
      size={mobileOnly ? '92vh' : 720}
      styles={S.drawerStyles(isMobile)}
      destroyOnHidden
      title={
        isMobile ? (
          drawerTitle
        ) : (
          <Space>
            <span>Admin · {city?.name ?? 'City'}</span>
            {city?.visible === false && <Tag color="red">Hidden</Tag>}
            {city?.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Undiscovered</Tag>}
          </Space>
        )
      }
    >
      {!city ? null : <Tabs defaultActiveKey="edit" items={tabItems} />}
    </Drawer>
  );
};
