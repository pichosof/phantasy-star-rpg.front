import React from 'react';
import { Divider, Drawer, Empty, Form, Input, Popconfirm, Space, Switch, Tag, Typography, Upload, message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Switch as AdmMobileSwitch,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import { AddOutline, DeleteOutline, FilterOutline, PictureOutline, SetOutline } from 'antd-mobile-icons';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import {
  MobileActionBar,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobileFilterSheet,
  MobileForm,
  MobilePageScaffold,
  MobileSearchBar,
  MobileSelector,
  MobileTabs,
} from '@app/components/common/mobile';
import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';

import type { Monster, MonsterForAdmin } from '@app/types/rpg';
import { BestiaryApi } from '@app/api/bestiary.api';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { apiErrorMessage } from '../utils/api-error';
import {
  m0,
  w100,
  textSm,
  mutedSm,
  bold700,
  bold800,
  spaceBetween,
  dividerSm,
  dividerMd,
  tableWrap,
  cardGrid2,
  imgCoverH,
  preWrap,
} from '@app/styles/styleUtils';
import * as S from './BestiaryPage.styles';

type ViewMode = 'players' | 'gm';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type MonsterSheetTab = 'overview' | 'gm';

const TYPE_COLORS: Record<string, string> = {
  doméstico: 'blue',
  predador: 'red',
  'apex predador': 'volcano',
  enxame: 'orange',
  oportunista: 'gold',
  'selvagem útil': 'green',
  subterrâneo: 'cyan',
  aquático: 'geekblue',
  flora: 'lime',
  evento: 'purple',
};

function typeColor(type?: string | null) {
  if (!type) return 'default';
  const key = type.toLowerCase();
  return TYPE_COLORS[key] ?? 'default';
}

function mobileTypeColor(type?: string | null): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  const color = typeColor(type);
  if (color === 'red' || color === 'volcano') return 'danger';
  if (color === 'green' || color === 'lime') return 'success';
  if (color === 'gold' || color === 'orange') return 'warning';
  if (color === 'default') return 'default';
  return 'primary';
}

function isVisible(m: Monster) {
  return (m.visible ?? true) === true;
}

function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

// ── Admin Drawer ─────────────────────────────────────────────────────────────

type AdminDrawerProps = {
  open: boolean;
  monster: MonsterForAdmin | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

const MonsterAdminDrawer: React.FC<AdminDrawerProps> = ({ open, monster, onClose, onChanged }) => {
  const { mobileOnly } = useResponsive();

  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('');
  const [habitat, setHabitat] = React.useState('');
  const [weaknesses, setWeaknesses] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [imgAlt, setImgAlt] = React.useState('');

  React.useEffect(() => {
    if (!monster) return;
    setName(monster.name ?? '');
    setType(monster.type ?? '');
    setHabitat(monster.habitat ?? '');
    setWeaknesses(monster.weaknesses ?? '');
    setDesc(monster.description ?? '');
    setImgAlt(monster.imageAlt ?? '');
  }, [monster]);

  async function handleSave() {
    if (!monster) return;
    const n = name.trim();
    if (!n) return message.warning('Name is required');
    setSaving(true);
    try {
      await BestiaryApi.update(monster.id, {
        name: n,
        type: type.trim() || null,
        habitat: habitat.trim() || null,
        weaknesses: weaknesses.trim() || null,
        description: desc.trim() || null,
      });
      await onChanged();
      message.success('Monster updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!monster) return;
    if (!window.confirm(`Delete "${monster.name}"?`)) return;
    try {
      await BestiaryApi.remove(monster.id);
      await onChanged();
      onClose();
      message.success('Monster deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete'));
    }
  }

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: 'image/*',
    customRequest: async (options: RcCustomRequestOptions) => {
      if (!monster) return;
      const file = options.file as File;
      try {
        await BestiaryApi.uploadImage(monster.id, file, imgAlt || undefined);
        await onChanged();
        message.success('Image uploaded');
        options.onSuccess?.({});
      } catch (e) {
        message.error(apiErrorMessage(e, 'Upload failed'));
        options.onError?.(new Error('Upload failed'));
      }
    },
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={mobileOnly ? '100%' : 520}
      title={
        monster ? (
          <Space size={8} wrap>
            <span style={bold700}>{monster.name}</span>
            {monster.type ? <Tag color={typeColor(monster.type)}>{monster.type}</Tag> : null}
            <Tag color={monster.visible ? 'green' : 'red'}>{monster.visible ? 'Visible' : 'Hidden'}</Tag>
            <Tag color={monster.discovered ? 'gold' : 'default'}>
              {monster.discovered ? 'Discovered' : 'Not discovered'}
            </Tag>
          </Space>
        ) : (
          'Monster'
        )
      }
    >
      {monster ? (
        <Tabs defaultActiveKey="edit">
          <Tabs.TabPane tab="Edit" key="edit">
            <Form layout="vertical" style={S.formCompact}>
              <Form.Item label="Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Type" extra="E.g.: Predator, Domestic, Swarm…">
                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (optional)" />
              </Form.Item>
              <Form.Item label="Habitat">
                <Input
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  placeholder="E.g.: Dunes, Canyons, Aquifers…"
                />
              </Form.Item>
              <Form.Item label="Weaknesses / Behavior">
                <Input
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="E.g.: fire, light, sound…"
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea
                  rows={6}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Full description for players…"
                />
              </Form.Item>
              <Form.Item label={<IconLabel icon="tags">Tags</IconLabel>}>
                <TagSelect entityType="beast" entityId={monster.id} />
              </Form.Item>
              <Space>
                <Button type="primary" loading={saving} onClick={() => void handleSave()}>
                  Save
                </Button>
                <Button danger onClick={() => void handleDelete()}>
                  Delete
                </Button>
              </Space>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Image" key="image">
            <Space orientation="vertical" size={12} style={w100}>
              {monster.imageUrl && (
                <div style={S.drawerImagePreview}>
                  <img
                    src={resolveApiUrl(monster.imageUrl)}
                    alt={monster.imageAlt ?? monster.name}
                    style={imgCoverH(220)}
                  />
                </div>
              )}
              <Form.Item label="Image alt text" style={S.drawerImageFormItem}>
                <Input value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} placeholder={monster.name} />
              </Form.Item>
              <Upload {...uploadProps}>
                <Button icon={<PictureOutlined />}>{monster.imageUrl ? 'Change image' : 'Upload image'}</Button>
              </Upload>
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Controls" key="controls">
            <Space orientation="vertical" size={16} style={w100}>
              <Space style={spaceBetween}>
                <div>
                  <Typography.Text>Visible to players</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={textSm}>
                    Hidden monsters do not appear in the list.
                  </Typography.Text>
                </div>
                <Switch
                  checked={monster.visible ?? true}
                  onChange={async (v) => {
                    await BestiaryApi.setVisible(monster.id, v);
                    await onChanged();
                  }}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </Space>
              <Space style={spaceBetween}>
                <div>
                  <Typography.Text>Marked as discovered</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={textSm}>
                    Unlocks full description for players.
                  </Typography.Text>
                </div>
                <Switch
                  checked={monster.discovered ?? false}
                  onChange={async (v) => {
                    await BestiaryApi.setDiscovered(monster.id, v);
                    await onChanged();
                  }}
                />
              </Space>
            </Space>
          </Tabs.TabPane>
        </Tabs>
      ) : null}
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const BestiaryPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = useGMMode();
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const initialViewModeSyncedRef = React.useRef(false);

  const [items, setItems] = React.useState<Monster[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const [viewMode, setViewMode] = React.useState<ViewMode>('players');
  const [monsterSheetTab, setMonsterSheetTab] = React.useState<MonsterSheetTab>('overview');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const openMonster = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [adminOpen, setAdminOpen] = React.useState(false);
  const [adminId, setAdminId] = React.useState<number | null>(null);
  const adminMonster = React.useMemo(
    () => (items.find((x) => x.id === adminId) ?? null) as MonsterForAdmin | null,
    [items, adminId],
  );

  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState('');
  const [newHabitat, setNewHabitat] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [creatingMonster, setCreatingMonster] = React.useState(false);

  const [mobileName, setMobileName] = React.useState('');
  const [mobileType, setMobileType] = React.useState('');
  const [mobileHabitat, setMobileHabitat] = React.useState('');
  const [mobileWeaknesses, setMobileWeaknesses] = React.useState('');
  const [mobileDesc, setMobileDesc] = React.useState('');
  const [mobileImgAlt, setMobileImgAlt] = React.useState('');
  const [mobileSaving, setMobileSaving] = React.useState(false);
  const [mobileUploadingImage, setMobileUploadingImage] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!initialViewModeSyncedRef.current) {
      initialViewModeSyncedRef.current = true;
      if (isGM) setViewMode('gm');
    }

    if (!isGM) {
      setViewMode('players');
      setFilterVis('all');
      setMonsterSheetTab('overview');
    }
  }, [isGM]);

  React.useEffect(() => {
    if (!openMonster) return;
    setMobileName(openMonster.name ?? '');
    setMobileType(openMonster.type ?? '');
    setMobileHabitat(openMonster.habitat ?? '');
    setMobileWeaknesses(openMonster.weaknesses ?? '');
    setMobileDesc(openMonster.description ?? '');
    setMobileImgAlt(openMonster.imageAlt ?? '');
  }, [openMonster]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await BestiaryApi.list();
      setItems(data);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load bestiary'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const q = search.trim().toLowerCase();

  const playerItems = React.useMemo(
    () =>
      items
        .filter((m) => isVisible(m))
        .filter((m) =>
          q
            ? m.name.toLowerCase().includes(q) ||
              (m.type ?? '').toLowerCase().includes(q) ||
              (m.habitat ?? '').toLowerCase().includes(q)
            : true,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, q],
  );

  const gmItems = React.useMemo(
    () =>
      items
        .filter((m) => {
          if (filterVis === 'visible' && !isVisible(m)) return false;
          if (filterVis === 'hidden' && isVisible(m)) return false;
          return q
            ? m.name.toLowerCase().includes(q) ||
                (m.type ?? '').toLowerCase().includes(q) ||
                (m.habitat ?? '').toLowerCase().includes(q)
            : true;
        })
        .sort((a, b) => a.id - b.id),
    [items, q, filterVis],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter((m) => isVisible(m)).length;
    const discovered = items.filter((m) => m.discovered).length;
    return { total, visible, hidden: total - visible, discovered, undiscovered: total - discovered };
  }, [items]);

  async function toggleVisible(m: Monster) {
    const next = !isVisible(m);
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, visible: next } : x)));
    try {
      await BestiaryApi.setVisible(m.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility'));
      await load();
    }
  }

  async function toggleDiscovered(m: Monster) {
    const next = !m.discovered;
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, discovered: next } : x)));
    try {
      await BestiaryApi.setDiscovered(m.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change discovered status'));
      await load();
    }
  }

  async function deleteMonster(id: number) {
    try {
      await BestiaryApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      if (adminId === id) {
        setAdminId(null);
        setAdminOpen(false);
      }
      setDeleteDialogOpen(false);
      message.success('Monster deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete monster'));
    }
  }

  function resetCreateForm() {
    setNewName('');
    setNewType('');
    setNewHabitat('');
    setNewDesc('');
  }

  async function createMonster() {
    const n = newName.trim();
    if (!n) return message.warning('Name is required');
    setCreatingMonster(true);
    try {
      await BestiaryApi.create({
        name: n,
        type: newType.trim() || null,
        habitat: newHabitat.trim() || null,
        description: newDesc.trim() || null,
      });
      setCreating(false);
      resetCreateForm();
      await load();
      message.success('Monster created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create monster'));
    } finally {
      setCreatingMonster(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createMonster();
  }

  async function saveMobileMonster() {
    if (!openMonster) return;
    const n = mobileName.trim();
    if (!n) {
      message.warning('Name is required');
      return;
    }

    setMobileSaving(true);
    try {
      await BestiaryApi.update(openMonster.id, {
        name: n,
        type: mobileType.trim() || null,
        habitat: mobileHabitat.trim() || null,
        weaknesses: mobileWeaknesses.trim() || null,
        description: mobileDesc.trim() || null,
      });
      await load();
      message.success('Monster updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save monster'));
    } finally {
      setMobileSaving(false);
    }
  }

  async function uploadMobileMonsterImage(file: File) {
    if (!openMonster) return;
    setMobileUploadingImage(true);
    try {
      await BestiaryApi.uploadImage(openMonster.id, file, mobileImgAlt || undefined);
      await load();
      message.success('Image uploaded');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Upload failed'));
    } finally {
      setMobileUploadingImage(false);
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────
  function resetMobileDraft() {
    if (!openMonster) return;
    setMobileName(openMonster.name ?? '');
    setMobileType(openMonster.type ?? '');
    setMobileHabitat(openMonster.habitat ?? '');
    setMobileWeaknesses(openMonster.weaknesses ?? '');
    setMobileDesc(openMonster.description ?? '');
    setMobileImgAlt(openMonster.imageAlt ?? '');
  }

  const mobileItems = viewMode === 'gm' && isGM ? gmItems : playerItems;
  const mobileCanReadOpen = Boolean(openMonster && (openMonster.discovered || (isGM && viewMode === 'gm')));

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search creatures..." value={search} />
      {isGM ? (
        <S.MobileFilterRow>
          <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
            <FilterOutline fontSize={16} /> Filters
          </AdmMobileButton>
          <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
            <AddOutline fontSize={16} /> New creature
          </AdmMobileButton>
        </S.MobileFilterRow>
      ) : null}
    </>
  );

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} creatures
      </AdmMobileTag>
      {isGM ? (
        <>
          <AdmMobileTag color="success" fill="outline" round>
            {stats.visible} visible
          </AdmMobileTag>
          <AdmMobileTag color="warning" fill="outline" round>
            {stats.discovered} discovered
          </AdmMobileTag>
        </>
      ) : null}
    </S.MobileMetaTags>
  );

  const mobileMonsterOverview = openMonster ? (
    <S.MobileSectionStack>
      <MobileCard compact>
        <S.MobileMonsterHero>
          {mobileCanReadOpen && openMonster.imageUrl ? (
            <S.MobileMonsterImage
              alt={openMonster.imageAlt ?? openMonster.name}
              src={resolveApiUrl(openMonster.imageUrl)}
            />
          ) : (
            <S.MobileMonsterFallback>
              <AppIcon name="beast" size={44} />
            </S.MobileMonsterFallback>
          )}
        </S.MobileMonsterHero>
        <S.MobileMonsterInfo>
          <S.MobileMonsterTitle>{openMonster.name}</S.MobileMonsterTitle>
          <S.MobileMetaTags>
            {openMonster.type ? (
              <AdmMobileTag color={mobileTypeColor(openMonster.type)} fill="outline" round>
                {openMonster.type}
              </AdmMobileTag>
            ) : null}
            {openMonster.habitat ? (
              <AdmMobileTag fill="outline" round>
                {openMonster.habitat}
              </AdmMobileTag>
            ) : null}
            {isGM ? (
              <AdmMobileTag color={isVisible(openMonster) ? 'success' : 'danger'} fill="outline" round>
                {isVisible(openMonster) ? 'Visible' : 'Hidden'}
              </AdmMobileTag>
            ) : null}
            <AdmMobileTag color={openMonster.discovered ? 'warning' : 'default'} fill="outline" round>
              {openMonster.discovered ? 'Discovered' : 'Unknown'}
            </AdmMobileTag>
          </S.MobileMetaTags>
        </S.MobileMonsterInfo>
      </MobileCard>

      {mobileCanReadOpen ? (
        <>
          <MobileCard compact title="Creature Details">
            <S.MobileDetailGrid>
              <S.MobileDetailItem>
                <S.MobileDetailLabel>Habitat</S.MobileDetailLabel>
                <S.MobileDetailValue>{openMonster.habitat || 'Unknown'}</S.MobileDetailValue>
              </S.MobileDetailItem>
              <S.MobileDetailItem>
                <S.MobileDetailLabel>Weaknesses / Behavior</S.MobileDetailLabel>
                <S.MobileDetailValue>{openMonster.weaknesses || 'Not documented yet.'}</S.MobileDetailValue>
              </S.MobileDetailItem>
            </S.MobileDetailGrid>
          </MobileCard>

          <MobileCard compact title="Description">
            <S.MobileBodyText>{openMonster.description?.trim() || 'No description yet.'}</S.MobileBodyText>
          </MobileCard>
        </>
      ) : (
        <MobileCard compact title="Unknown creature">
          <S.MobileBodyText>Information about this creature has not been revealed yet.</S.MobileBodyText>
        </MobileCard>
      )}
    </S.MobileSectionStack>
  ) : null;

  const mobileMonsterGM = openMonster ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Profile">
        <MobileForm>
          <MobileForm.Item label="Name">
            <AdmMobileInput clearable onChange={setMobileName} placeholder="Creature name" value={mobileName} />
          </MobileForm.Item>
          <MobileForm.Item label="Type">
            <AdmMobileInput
              clearable
              onChange={setMobileType}
              placeholder="Predator, swarm, flora..."
              value={mobileType}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Habitat">
            <AdmMobileInput
              clearable
              onChange={setMobileHabitat}
              placeholder="Dunes, caves, aquifers..."
              value={mobileHabitat}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Weaknesses / Behavior">
            <AdmMobileTextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              onChange={setMobileWeaknesses}
              placeholder="Fire, sound, pack behavior..."
              value={mobileWeaknesses}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Description">
            <AdmMobileTextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              onChange={setMobileDesc}
              placeholder="Full player-facing description"
              value={mobileDesc}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isVisible(openMonster)} onChange={() => void toggleVisible(openMonster)} />
        </S.MobileVisibilityRow>
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Marked as discovered</S.MobileInlineLabel>
          <AdmMobileSwitch checked={openMonster.discovered} onChange={() => void toggleDiscovered(openMonster)} />
        </S.MobileVisibilityRow>
      </MobileCard>

      <MobileCard compact title="Image">
        <S.MobileUploadStack>
          <S.MobileFieldLabel htmlFor={`monster-image-alt-${openMonster.id}`}>Image alt text</S.MobileFieldLabel>
          <AdmMobileInput
            clearable
            id={`monster-image-alt-${openMonster.id}`}
            onChange={setMobileImgAlt}
            placeholder="Describe the creature image"
            value={mobileImgAlt}
          />
          <AdmMobileButton
            block
            fill="outline"
            loading={mobileUploadingImage}
            onClick={() => imageInputRef.current?.click()}
          >
            <PictureOutline fontSize={17} /> {openMonster.imageUrl ? 'Change image' : 'Upload image'}
          </AdmMobileButton>
        </S.MobileUploadStack>
      </MobileCard>

      <MobileCard compact title="Tags">
        <TagSelect entityId={openMonster.id} entityType="beast" />
      </MobileCard>

      <MobileCard compact title="Danger Zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>Deleting a creature removes it from the bestiary permanently.</S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete creature
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Bestiary</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'players' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('players')}
                  size="small"
                >
                  <IconLabel icon="read" iconSize={16}>
                    View
                  </IconLabel>
                </AdmMobileButton>
                <AdmMobileButton
                  color="primary"
                  fill={viewMode === 'gm' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('gm')}
                  size="small"
                >
                  <SetOutline fontSize={16} /> GM
                </AdmMobileButton>
              </S.MobileFilterRow>
            ) : null
          }
          filters={mobileFilters}
          meta={mobileMeta}
          subtitle={
            isGM
              ? 'Manage discovery, visibility, images and lore-safe creature cards.'
              : 'Creatures of Motavia, revealed as the campaign discovers them.'
          }
          title={<IconLabel icon="beast">Bestiary</IconLabel>}
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !mobileItems.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No creatures found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileBestiaryGrid>
              {mobileItems.map((monster) => {
                const gmPanel = isGM && viewMode === 'gm';
                const canRead = monster.discovered || gmPanel;

                return (
                  <MobileCard compact key={monster.id}>
                    <S.MobileMonsterCardBody>
                      <S.MobileMonsterCardMedia>
                        {canRead && monster.imageUrl ? (
                          <S.MobileMonsterCardImage
                            alt={monster.imageAlt ?? monster.name}
                            src={resolveApiUrl(monster.imageUrl)}
                          />
                        ) : (
                          <S.MobileMonsterFallback>
                            <AppIcon name="beast" size={38} />
                          </S.MobileMonsterFallback>
                        )}
                      </S.MobileMonsterCardMedia>

                      <S.MobileMonsterTitle>{monster.name}</S.MobileMonsterTitle>
                      <S.MobileMetaTags>
                        {monster.type ? (
                          <AdmMobileTag color={mobileTypeColor(monster.type)} fill="outline" round>
                            {monster.type}
                          </AdmMobileTag>
                        ) : null}
                        {monster.habitat ? (
                          <AdmMobileTag fill="outline" round>
                            {monster.habitat}
                          </AdmMobileTag>
                        ) : null}
                        {gmPanel ? (
                          <AdmMobileTag color={isVisible(monster) ? 'success' : 'danger'} fill="outline" round>
                            {isVisible(monster) ? 'Visible' : 'Hidden'}
                          </AdmMobileTag>
                        ) : null}
                      </S.MobileMetaTags>

                      <S.MobileMonsterPreview>
                        {canRead ? monster.description?.trim() || 'No description yet.' : 'Information unavailable.'}
                      </S.MobileMonsterPreview>

                      <S.MobileActionGrid>
                        <AdmMobileButton
                          block
                          color="primary"
                          onClick={() => {
                            setMonsterSheetTab('overview');
                            setOpenId(monster.id);
                          }}
                        >
                          Open entry
                        </AdmMobileButton>
                        {gmPanel ? (
                          <AdmMobileButton
                            block
                            fill="outline"
                            onClick={() => {
                              setMonsterSheetTab('gm');
                              setOpenId(monster.id);
                            }}
                          >
                            <SetOutline fontSize={17} /> GM controls
                          </AdmMobileButton>
                        ) : null}
                      </S.MobileActionGrid>
                    </S.MobileMonsterCardBody>
                  </MobileCard>
                );
              })}
            </S.MobileBestiaryGrid>
          )}
        </MobilePageScaffold>

        {isGM ? (
          <MobileFilterSheet
            description="Switch panels and filter what the GM list should show."
            footer={
              <MobileActionBar sticky={false}>
                <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                  Done
                </AdmMobileButton>
              </MobileActionBar>
            }
            onClose={() => setFilterSheetOpen(false)}
            title="Bestiary filters"
            visible={filterSheetOpen}
          >
            <S.MobileSectionStack>
              <S.MobileCreateField>
                <S.MobileFieldLabel>Panel</S.MobileFieldLabel>
                <MobileSelector<ViewMode>
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'players')}
                  options={[
                    { label: 'Bestiary', value: 'players' },
                    { label: 'GM panel', value: 'gm' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileCreateField>

              <S.MobileCreateField>
                <S.MobileFieldLabel>Visibility</S.MobileFieldLabel>
                <MobileSelector<VisibilityFilter>
                  columns={3}
                  inset={false}
                  onChange={(values) => setFilterVis((values[0] as VisibilityFilter | undefined) ?? 'all')}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Visible', value: 'visible' },
                    { label: 'Hidden', value: 'hidden' },
                  ]}
                  value={[filterVis]}
                />
              </S.MobileCreateField>
            </S.MobileSectionStack>
          </MobileFilterSheet>
        ) : null}

        <MobileEntitySheet
          description={
            openMonster
              ? mobileCanReadOpen
                ? 'Creature profile and campaign-facing details.'
                : 'This entry is still hidden from the party.'
              : undefined
          }
          footer={
            openMonster && isGM && monsterSheetTab === 'gm' ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton
                    block
                    color="primary"
                    loading={mobileSaving}
                    onClick={() => void saveMobileMonster()}
                  >
                    Save changes
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block fill="outline" onClick={resetMobileDraft}>
                    Reset
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={() => {
            setOpenId(null);
            setMonsterSheetTab('overview');
          }}
          subtitle={openMonster?.type ?? undefined}
          title={openMonster?.name ?? 'Creature'}
          visible={Boolean(openMonster)}
        >
          {openMonster && isGM ? (
            <MobileTabs
              activeKey={monsterSheetTab}
              items={[
                { key: 'overview', title: 'Overview', children: mobileMonsterOverview },
                { key: 'gm', title: 'GM', children: mobileMonsterGM },
              ]}
              onChange={(key) => setMonsterSheetTab(key as MonsterSheetTab)}
            />
          ) : (
            mobileMonsterOverview
          )}

          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadMobileMonsterImage(file);
                event.currentTarget.value = '';
              }
            }}
            ref={imageInputRef}
            type="file"
          />
        </MobileEntitySheet>

        <MobileEntitySheet
          description="Create a creature now, then add image and tags from GM controls."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingMonster} onClick={() => void createMonster()}>
                  Create creature
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton
                  block
                  fill="outline"
                  onClick={() => {
                    setCreating(false);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => {
            setCreating(false);
            resetCreateForm();
          }}
          subtitle="GM only"
          title="New creature"
          visible={creating && isGM}
        >
          <MobileCard compact title="Creature details">
            <MobileForm>
              <MobileForm.Item label="Name">
                <AdmMobileInput clearable onChange={setNewName} placeholder="Creature name" value={newName} />
              </MobileForm.Item>
              <MobileForm.Item label="Type">
                <AdmMobileInput
                  clearable
                  onChange={setNewType}
                  placeholder="Predator, domestic, swarm..."
                  value={newType}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Habitat">
                <AdmMobileInput
                  clearable
                  onChange={setNewHabitat}
                  placeholder="Dunes, canyons, aquifers..."
                  value={newHabitat}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Description">
                <AdmMobileTextArea
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  onChange={setNewDesc}
                  placeholder="Initial description"
                  value={newDesc}
                />
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
        </MobileEntitySheet>

        <MobileDialog
          actions={[
            {
              key: 'cancel',
              text: 'Cancel',
              onClick: () => setDeleteDialogOpen(false),
            },
            {
              key: 'delete',
              text: 'Delete creature',
              danger: true,
              bold: true,
              onClick: () => {
                if (openMonster) {
                  return deleteMonster(openMonster.id);
                }
              },
            },
          ]}
          content={openMonster ? `Delete "${openMonster.name}" permanently?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete creature?"
          visible={deleteDialogOpen}
        />
      </>
    );
  }

  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space orientation="vertical" size={10} style={w100}>
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'gm' ? (
                <IconLabel icon="gm">GM Panel - Bestiary</IconLabel>
              ) : (
                <IconLabel icon="beast">Bestiary</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text type="secondary" className="rpg-text-md">
              {viewMode === 'gm'
                ? 'Control visibility, discovery and monster data.'
                : 'Motavia creatures — details appear when the GM marks as discovered.'}
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
                  <IconLabel icon="read">Bestiary</IconLabel>
                </Button>
                <Button size="small" type={viewMode === 'gm' ? 'primary' : 'default'} onClick={() => setViewMode('gm')}>
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
              </Space>
            )}
            {isGM && viewMode === 'gm' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New Monster'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} creatures</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
          {isGM && <Tag color="gold">{stats.discovered} discovered</Tag>}
          {isGM && <Tag>{stats.undiscovered} undiscovered</Tag>}
        </Space>

        <Space wrap size={8} style={w100}>
          <Input
            allowClear
            placeholder="Search creature…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.searchField}
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
                  {v === 'all' ? 'All' : v === 'visible' ? 'Visible' : 'Hidden'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {isGM && viewMode === 'gm' && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={S.createForm}>
              <Typography.Text strong>New Creature</Typography.Text>
              <Input placeholder="Name *" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <Input
                placeholder="Type (e.g.: Predator, Domestic, Swarm…)"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
              <Input
                placeholder="Habitat (e.g.: Dunes, Canyons…)"
                value={newHabitat}
                onChange={(e) => setNewHabitat(e.target.value)}
              />
              <Input.TextArea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
              <Space>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  // ── Monster Cards ─────────────────────────────────────────────────────────
  function MonsterCards({ data, mode }: { data: Monster[]; mode: ViewMode }) {
    if (loading) return <Spinner />;
    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty description={mode === 'players' ? 'No creatures visible to players yet.' : 'No creatures found.'} />
        </Card>
      );
    }
    return (
      <div style={cardGrid2(mobileOnly)}>
        {data.map((m) => {
          const playerCanRead = m.discovered === true;
          const vis = isVisible(m);

          return (
            <Card
              key={m.id}
              density={mode === 'players' ? 'comfy' : 'dense'}
              title={
                <Space size={8} wrap>
                  <span style={bold700}>{m.name}</span>
                  {m.type ? <Tag color={typeColor(m.type)}>{m.type}</Tag> : null}
                  {m.habitat ? <Tag>{m.habitat}</Tag> : null}
                  {mode === 'gm' && (
                    <>
                      <Tag color={vis ? 'green' : 'red'}>{vis ? 'Visible' : 'Hidden'}</Tag>
                      <Tag color={m.discovered ? 'gold' : 'default'}>
                        {m.discovered ? 'Discovered' : 'Not discovered'}
                      </Tag>
                    </>
                  )}
                </Space>
              }
              extra={
                mode === 'gm' ? (
                  <Button
                    size="small"
                    onClick={() => {
                      setAdminId(m.id);
                      setAdminOpen(true);
                    }}
                  >
                    Admin
                  </Button>
                ) : (
                  <Button size="small" onClick={() => setOpenId(m.id)}>
                    View
                  </Button>
                )
              }
            >
              {mode === 'players' && playerCanRead && m.imageUrl && (
                <div style={S.monsterCardCover}>
                  <img src={resolveApiUrl(m.imageUrl)} alt={m.imageAlt ?? m.name} style={S.monsterCardCoverImage} />
                </div>
              )}
              <Typography.Paragraph style={m0} ellipsis={{ rows: 3 }}>
                {mode === 'players'
                  ? playerCanRead
                    ? m.description?.trim() || 'No description yet.'
                    : 'Information unavailable.'
                  : m.description?.trim() || '—'}
              </Typography.Paragraph>

              {mode === 'gm' && (
                <>
                  <Divider style={dividerMd} />
                  <Space wrap size={16}>
                    <Space size={8}>
                      <span style={mutedSm}>Visible:</span>
                      <Switch
                        size="small"
                        checked={vis}
                        onChange={() => void toggleVisible(m)}
                        checkedChildren={<EyeOutlined />}
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                    </Space>
                    <Space size={8}>
                      <span style={mutedSm}>Discovered:</span>
                      <Switch size="small" checked={m.discovered} onChange={() => void toggleDiscovered(m)} />
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
    <Card density="dense" title="Manage Bestiary">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={gmItems}
          loading={loading}
          style={S.adminTable}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (v: number) => <Tag style={m0}>#{v}</Tag>,
            },
            {
              title: 'Vis.',
              key: 'visible',
              width: 70,
              render: (_: unknown, m: Monster) => (
                <Switch
                  size="small"
                  checked={isVisible(m)}
                  onChange={() => void toggleVisible(m)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Disc.',
              key: 'discovered',
              width: 80,
              render: (_: unknown, m: Monster) => (
                <Switch size="small" checked={m.discovered} onChange={() => void toggleDiscovered(m)} />
              ),
            },
            {
              title: 'Name',
              key: 'name',
              width: 220,
              render: (_: unknown, m: Monster) => (
                <Space orientation="vertical" size={2} style={w100}>
                  <Space size={6} wrap>
                    <Typography.Text strong>{m.name}</Typography.Text>
                    {m.type ? <Tag color={typeColor(m.type)}>{m.type}</Tag> : null}
                  </Space>
                  {m.habitat && (
                    <Typography.Text type="secondary" className="rpg-text-sm" style={S.habitatEllipsis}>
                      Habitat: {m.habitat}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Description',
              key: 'description',
              ellipsis: true,
              render: (_: unknown, m: Monster) => (
                <Typography.Text type="secondary" style={textSm}>
                  {m.description?.trim() || '—'}
                </Typography.Text>
              ),
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 150,
              render: (v: string) => (
                <Typography.Text type="secondary" style={textSm}>
                  {formatDate(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 90,
              render: (_: unknown, m: Monster) => (
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setAdminId(m.id);
                      setAdminOpen(true);
                    }}
                  />
                  <Popconfirm
                    title={`Delete "${m.name}" permanently?`}
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => void deleteMonster(m.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!gmItems.length && !loading && <Empty description="No creatures found." style={S.emptyWithTopSpacing} />}
    </Card>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageTitle>Bestiary</PageTitle>

      {Header}

      {viewMode === 'gm' && isGM ? (
        <>
          {loading ? <Spinner /> : mobileOnly ? <MonsterCards data={gmItems} mode="gm" /> : DesktopAdminTable}
          <MonsterAdminDrawer
            open={adminOpen}
            monster={adminMonster}
            onClose={() => {
              setAdminOpen(false);
              setAdminId(null);
            }}
            onChanged={load}
          />
        </>
      ) : (
        <>
          {loading ? <Spinner /> : <MonsterCards data={playerItems} mode="players" />}

          <Drawer
            open={openId !== null}
            onClose={() => setOpenId(null)}
            size={mobileOnly ? '100%' : 540}
            title={
              openMonster ? (
                <Space wrap size={8}>
                  <span style={bold800}>{openMonster.name}</span>
                  {openMonster.type ? <Tag color={typeColor(openMonster.type)}>{openMonster.type}</Tag> : null}
                </Space>
              ) : null
            }
          >
            {openMonster && (
              <>
                {openMonster.discovered && openMonster.imageUrl && (
                  <div style={S.publicDrawerImagePreview}>
                    <img
                      src={resolveApiUrl(openMonster.imageUrl)}
                      alt={openMonster.imageAlt ?? openMonster.name}
                      style={imgCoverH(240)}
                    />
                  </div>
                )}

                {openMonster.discovered ? (
                  <Space orientation="vertical" size={12} style={w100}>
                    {openMonster.habitat && (
                      <Card density="dense" title="Habitat">
                        <Typography.Text>{openMonster.habitat}</Typography.Text>
                      </Card>
                    )}
                    {openMonster.weaknesses && (
                      <Card density="dense" title="Weaknesses / Behavior">
                        <Typography.Text>{openMonster.weaknesses}</Typography.Text>
                      </Card>
                    )}
                    <Card density="comfy" title="Description">
                      <Typography.Paragraph style={preWrap}>
                        {openMonster.description?.trim() || 'No description yet.'}
                      </Typography.Paragraph>
                    </Card>
                  </Space>
                ) : (
                  <Card density="comfy">
                    <Typography.Text type="secondary">
                      Information about this creature has not been revealed yet.
                    </Typography.Text>
                  </Card>
                )}
              </>
            )}
          </Drawer>
        </>
      )}
    </>
  );
};

export default BestiaryPage;
