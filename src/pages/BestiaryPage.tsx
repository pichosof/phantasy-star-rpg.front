import { StatBlocksEditor } from '@app/components/bestiary/StatBlocksEditor';
import React from 'react';
import {
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PictureOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
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
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
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
} from '@app/components/common/mobile';
import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';

import type { Monster, MonsterForAdmin } from '@app/types/rpg';
import { BestiaryApi } from '@app/api/bestiary.api';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { apiErrorMessage } from '../utils/api-error';
import { m0, w100, textSm, bold700, spaceBetween, dividerSm, tableWrap, imgCoverH } from '@app/styles/styleUtils';
import * as S from './BestiaryPage.styles';
import { stripMarkdown } from '@app/components/common/RichText/RichText';
import EntityDrawer, { discoveredControl, visibilityControl } from '@app/components/common/EntityDrawer/EntityDrawer';
import EntityCard, { EntityCardGrid } from '@app/components/common/EntityCard/EntityCard';

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
  const [statsFor, setStatsFor] = React.useState<Monster | null>(null);
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

  const renderMonsterDrawer = (phone?: {
    footer?: React.ReactNode;
    activeKey: string;
    onTabChange: (key: string) => void;
    gm: React.ReactNode;
  }) =>
    openMonster ? (
      <EntityDrawer
        onClose={() => setOpenId(null)}
        open={openId !== null}
        overview={{
          image: mobileCanReadOpen
            ? {
                src: openMonster.imageUrl ? resolveApiUrl(openMonster.imageUrl) : null,
                alt: openMonster.imageAlt ?? openMonster.name,
              }
            : null,
          meta: openMonster.type ? <Tag color={typeColor(openMonster.type)}>{openMonster.type}</Tag> : null,
          sections: [
            { title: 'Description', text: openMonster.description },
            ...(openMonster.habitat ? [{ title: 'Habitat', text: openMonster.habitat }] : []),
            ...(openMonster.weaknesses ? [{ title: 'Weaknesses / Behavior', text: openMonster.weaknesses }] : []),
          ],
          unavailable: mobileCanReadOpen ? null : 'Information about this creature has not been revealed yet.',
        }}
        tabs={
          isGM
            ? [
                {
                  key: 'combat',
                  label: 'Combat stats',
                  children: <StatBlocksEditor monsterId={Number(openMonster.id)} />,
                },
              ]
            : []
        }
        title={openMonster.name}
        controls={
          phone
            ? [
                visibilityControl(isVisible(openMonster), () => void toggleVisible(openMonster), 'creatures'),
                discoveredControl(Boolean(openMonster.discovered), () => void toggleDiscovered(openMonster), 'details'),
              ]
            : []
        }
        createdAt={openMonster.createdAt}
        gmTabs={phone ? [{ key: 'edit', label: 'Edit', children: null, mobileChildren: phone.gm }] : []}
        gmView={Boolean(phone) && isGM}
        mobileActiveKey={phone?.activeKey}
        mobileFooter={phone?.footer}
        onMobileTabChange={phone?.onTabChange}
        status={{ visible: isVisible(openMonster), discovered: Boolean(openMonster.discovered) }}
        subtitle={openMonster.type ?? undefined}
      />
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
            <MonsterCards
              data={mobileItems}
              mode={isGM && viewMode === 'gm' ? 'gm' : 'players'}
              onOpen={(m, tab) => {
                setMonsterSheetTab(isGM ? tab : 'overview');
                setOpenId(m.id);
              }}
            />
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

        {renderMonsterDrawer({
          footer:
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
            ) : undefined,
          activeKey: monsterSheetTab,
          onTabChange: (key) => setMonsterSheetTab(key as MonsterSheetTab),
          gm: mobileMonsterGM,
        })}
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
  function MonsterCards({
    data,
    mode,
    onOpen,
  }: {
    data: Monster[];
    mode: ViewMode;
    onOpen?: (m: Monster, tab: MonsterSheetTab) => void;
  }) {
    if (loading) return <Spinner />;
    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty description={mode === 'players' ? 'No creatures visible to players yet.' : 'No creatures found.'} />
        </Card>
      );
    }
    return (
      <EntityCardGrid shape="square">
        {data.map((m) => {
          const playerCanRead = m.discovered === true;
          const vis = isVisible(m);
          const showCover = mode === 'gm' || playerCanRead;

          return (
            <EntityCard
              shape="square"
              actions={
                mode === 'gm' ? (
                  <>
                    <Switch
                      checked={vis}
                      checkedChildren={<EyeOutlined />}
                      onChange={() => void toggleVisible(m)}
                      size="small"
                      title="Visible to players"
                      unCheckedChildren={<EyeInvisibleOutlined />}
                    />
                    <Switch
                      checked={m.discovered}
                      onChange={() => void toggleDiscovered(m)}
                      size="small"
                      title="Discovered"
                    />
                    <Button
                      onClick={() => {
                        setAdminId(m.id);
                        setAdminOpen(true);
                      }}
                      size="small"
                    >
                      Admin
                    </Button>
                  </>
                ) : null
              }
              chips={showCover && m.habitat ? <Tag>{m.habitat}</Tag> : null}
              cover={showCover && m.imageUrl ? { src: resolveApiUrl(m.imageUrl), alt: m.imageAlt ?? m.name } : null}
              coverTags={m.type ? <Tag color={typeColor(m.type)}>{m.type}</Tag> : null}
              icon="beast"
              key={m.id}
              label="Creature"
              locked={mode === 'players' && !playerCanRead ? 'Information unavailable.' : null}
              onClick={() => {
                if (onOpen) {
                  onOpen(m, mode === 'gm' ? 'gm' : 'overview');
                } else if (mode === 'gm') {
                  setAdminId(m.id);
                  setAdminOpen(true);
                } else {
                  setOpenId(m.id);
                }
              }}
              openText={mode === 'gm' ? 'Manage' : 'Open entry'}
              seed={m.id}
              status={mode === 'gm' ? { visible: vis, discovered: Boolean(m.discovered) } : undefined}
              summary={m.description}
              title={m.name}
            />
          );
        })}
      </EntityCardGrid>
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
                  {stripMarkdown(m.description) || '—'}
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
              width: 120,
              render: (_: unknown, m: Monster) => (
                <Space size={4}>
                  <Tooltip title="Combat stats">
                    <Button
                      aria-label="Combat stats"
                      icon={<ThunderboltOutlined />}
                      onClick={() => setStatsFor(m)}
                      size="small"
                    />
                  </Tooltip>
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
          <Modal
            destroyOnHidden
            footer={null}
            onCancel={() => setStatsFor(null)}
            open={Boolean(statsFor)}
            title={statsFor ? `${statsFor.name} · Combat stats` : ''}
            width={760}
          >
            {statsFor && <StatBlocksEditor monsterId={Number(statsFor.id)} />}
          </Modal>
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

          {renderMonsterDrawer()}
        </>
      )}
    </>
  );
};

export default BestiaryPage;
