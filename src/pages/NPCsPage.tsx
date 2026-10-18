/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Avatar,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
} from 'antd-mobile';
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PictureOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  AddOutline,
  DeleteOutline,
  FileOutline,
  FilterOutline,
  PictureOutline,
  SetOutline,
  UserOutline,
} from 'antd-mobile-icons';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
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
import { resolveApiUrl, fetchBlobUrl } from '@app/api/http.api';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Spin } from 'antd';

import type { Npc, CreateNpcDTO } from '@app/types/rpg';
import { NpcApi } from '@app/api/npc.api';
import { TagSelect } from '@app/components/rpg/TagSelect/TagSelect';
import { apiErrorMessage } from '../utils/api-error';
import { m0, w100, textSm, textMd, bold700, spaceBetween, dividerSm, tableWrap } from '@app/styles/styleUtils';
import * as S from './NPCsPage.styles';

import EntityDrawer, { visibilityControl } from '@app/components/common/EntityDrawer/EntityDrawer';
import EntityCard, { EntityCardGrid } from '@app/components/common/EntityCard/EntityCard';

type NpcViewMode = 'public' | 'admin';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type NpcSheetTab = 'profile' | 'sheet' | 'gm';

// ── Role enum ─────────────────────────────────────────────────────────────────

export const NPC_ROLES = [
  'Ally',
  'Enemy',
  'Merchant',
  'Contractor',
  'Informant',
  'Guide',
  'Guardian',
  'Healer',
  'Leader',
  'Sage',
  'Neutral',
] as const;

export type NpcRole = (typeof NPC_ROLES)[number];

// ── Role colour system ────────────────────────────────────────────────────────

const ROLE_META: Record<string, { color: string; hex: string }> = {
  aliado: { color: 'green', hex: '#52c41a' },
  ally: { color: 'green', hex: '#52c41a' },
  amigo: { color: 'green', hex: '#52c41a' },
  mercador: { color: 'blue', hex: '#1677ff' },
  vendor: { color: 'blue', hex: '#1677ff' },
  comerciante: { color: 'blue', hex: '#1677ff' },
  contratante: { color: 'gold', hex: '#faad14' },
  'quest giver': { color: 'gold', hex: '#faad14' },
  informante: { color: 'purple', hex: '#722ed1' },
  inimigo: { color: 'red', hex: '#f5222d' },
  antagonista: { color: 'red', hex: '#f5222d' },
  enemy: { color: 'red', hex: '#f5222d' },
  líder: { color: 'orange', hex: '#fa8c16' },
  lider: { color: 'orange', hex: '#fa8c16' },
  guia: { color: 'cyan', hex: '#13c2c2' },
  guide: { color: 'cyan', hex: '#13c2c2' },
  guardião: { color: 'geekblue', hex: '#2f54eb' },
  guardiao: { color: 'geekblue', hex: '#2f54eb' },
  curandeiro: { color: 'volcano', hex: '#fa541c' },
  mestre: { color: 'magenta', hex: '#eb2f96' },
  sábio: { color: 'magenta', hex: '#eb2f96' },
  sabio: { color: 'magenta', hex: '#eb2f96' },
  neutro: { color: 'default', hex: '#8c8c8c' },
};

function getRoleMeta(role?: string | null): { color: string; hex: string } {
  const key = (role ?? '').toLowerCase().trim();
  for (const [k, v] of Object.entries(ROLE_META)) {
    if (key.includes(k)) return v;
  }
  return { color: 'default', hex: '#8c8c8c' };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function isVisible(n: Npc) {
  return (n.visible ?? true) === true;
}

// ── PDF Viewer ────────────────────────────────────────────────────────────────

const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
const PDF_STANDARD_FONTS_URL = `https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/`;

const PdfViewer: React.FC<{ url: string }> = ({ url }) => {
  const layoutPlugin = defaultLayoutPlugin();
  return (
    <Worker workerUrl={PDF_WORKER_URL}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Viewer
          fileUrl={url}
          plugins={[layoutPlugin]}
          transformGetDocumentParams={(options) => ({
            ...options,
            standardFontDataUrl: PDF_STANDARD_FONTS_URL,
          })}
        />
      </div>
    </Worker>
  );
};

const NpcSheetViewer: React.FC<{ sheetUrl: string }> = ({ sheetUrl }) => {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchBlobUrl(sheetUrl)
      .then((url) => {
        if (alive) setBlobUrl(url);
      })
      .catch(() => {
        if (alive) setBlobUrl(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [sheetUrl]);

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <Spin size="large" />
      </div>
    );
  if (!blobUrl) return <div style={{ padding: 16, color: '#8c8c8c' }}>Failed to load sheet.</div>;
  return (
    <div style={{ height: '70vh' }}>
      <PdfViewer url={blobUrl} />
    </div>
  );
};

// ── Admin Drawer ──────────────────────────────────────────────────────────────

type AdminProps = {
  open: boolean;
  npc: Npc | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

const NpcAdminDrawer: React.FC<AdminProps> = ({ open, npc, onClose, onChanged }) => {
  const { mobileOnly } = useResponsive();
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [imgAlt, setImgAlt] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!npc) return;
    setName(npc.name ?? '');
    setRole(npc.role ?? '');
    setLocation(npc.location ?? '');
    setDesc(npc.description ?? '');
    setImgAlt(npc.imageAlt ?? '');
  }, [npc]);

  const meta = npc ? getRoleMeta(npc.role) : { color: 'default' as const, hex: '#8c8c8c' };

  async function save() {
    if (!npc) return;
    if (!name.trim()) return message.warning('Name is required');
    setSaving(true);
    try {
      await NpcApi.update(npc.id, {
        name: name.trim(),
        role: role.trim() || null,
        location: location.trim() || null,
        description: desc.trim() || null,
      });
      await onChanged();
      message.success('NPC updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!npc) return;
    if (!window.confirm(`Delete "${npc.name}"?`)) return;
    try {
      await NpcApi.remove(npc.id);
      await onChanged();
      onClose();
      message.success('NPC deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete'));
    }
  }

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: 'image/*',
    customRequest: async (opts: RcCustomRequestOptions) => {
      if (!npc) return;
      try {
        await NpcApi.uploadImage(npc.id, opts.file as File, imgAlt || undefined);
        await onChanged();
        message.success('Portrait uploaded');
        opts.onSuccess?.({});
      } catch (e) {
        message.error(apiErrorMessage(e, 'Upload failed'));
        opts.onError?.(new Error('Upload failed'));
      }
    },
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={mobileOnly ? '100%' : 500}
      styles={{ body: S.adminDrawerBody }}
      title={
        npc ? (
          <Space size={10} align="center">
            <Avatar size={36} style={{ background: meta.hex, flexShrink: 0, fontWeight: 700, fontSize: 14 }}>
              {initials(npc.name)}
            </Avatar>
            <div>
              <div style={bold700}>{npc.name}</div>
              {npc.role && (
                <Tag color={meta.color} style={{ margin: 0, marginTop: 2, fontSize: 11 }}>
                  {npc.role}
                </Tag>
              )}
            </div>
          </Space>
        ) : (
          'NPC'
        )
      }
    >
      {npc ? (
        <Tabs defaultActiveKey="edit">
          {/* ── Edit ── */}
          <Tabs.TabPane tab="Edit" key="edit">
            <Form layout="vertical">
              <Form.Item label="Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Role">
                <Select
                  value={role || undefined}
                  onChange={(v) => setRole(v ?? '')}
                  placeholder="Select a role…"
                  allowClear
                  style={w100}
                  options={NPC_ROLES.map((r) => {
                    const m = getRoleMeta(r);
                    return {
                      value: r,
                      label: (
                        <Space size={6}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: m.hex,
                            }}
                          />
                          {r}
                        </Space>
                      ),
                    };
                  })}
                />
              </Form.Item>
              <Form.Item label="Location" extra="City name where this NPC usually appears">
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#8c8c8c' }} />}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g.: Aiedo, Piata…"
                />
              </Form.Item>
              <Form.Item label="Description / Background">
                <Input.TextArea
                  rows={6}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="History, motivations, behavior…"
                />
              </Form.Item>
              <Form.Item label={<IconLabel icon="tags">Tags</IconLabel>}>
                <TagSelect entityType="npc" entityId={npc.id} />
              </Form.Item>
              <Space>
                <Button type="primary" loading={saving} onClick={() => void save()}>
                  Save
                </Button>
                <Button danger onClick={() => void remove()}>
                  Delete
                </Button>
              </Space>
            </Form>
          </Tabs.TabPane>

          {/* ── Portrait ── */}
          <Tabs.TabPane tab="Portrait" key="image">
            <Space orientation="vertical" size={12} style={w100}>
              {npc.imageUrl ? (
                <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 260 }}>
                  <img
                    src={resolveApiUrl(npc.imageUrl)}
                    alt={npc.imageAlt ?? npc.name}
                    style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 140,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: meta.hex + '20',
                    border: `1px dashed ${meta.hex}`,
                  }}
                >
                  <Avatar size={80} style={{ background: meta.hex, fontSize: 28, fontWeight: 700 }}>
                    {initials(npc.name)}
                  </Avatar>
                </div>
              )}
              <Form.Item label="Alt text" style={{ marginBottom: 8 }}>
                <Input value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} placeholder={npc.name} />
              </Form.Item>
              <Upload {...uploadProps}>
                <Button icon={<PictureOutlined />}>{npc.imageUrl ? 'Change portrait' : 'Upload portrait'}</Button>
              </Upload>
            </Space>
          </Tabs.TabPane>

          {/* ── Sheet ── */}
          <Tabs.TabPane tab="Sheet" key="sheet">
            <Space orientation="vertical" size={12} style={w100}>
              {npc.sheetUrl && <NpcSheetViewer sheetUrl={npc.sheetUrl} />}
              {!npc.sheetUrl && (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#8c8c8c' }}>No sheet attached yet.</div>
              )}
              <Upload
                showUploadList={false}
                accept="application/pdf"
                customRequest={async (opts: RcCustomRequestOptions) => {
                  if (!npc) return;
                  try {
                    await NpcApi.uploadSheet(npc.id, opts.file as File);
                    await onChanged();
                    message.success('Sheet uploaded');
                    opts.onSuccess?.({});
                  } catch (e) {
                    message.error(apiErrorMessage(e, 'Upload failed'));
                    opts.onError?.(new Error('Upload failed'));
                  }
                }}
              >
                <Button icon={<PictureOutlined />}>
                  {npc.sheetUrl ? 'Replace sheet (PDF)' : 'Upload sheet (PDF)'}
                </Button>
              </Upload>
            </Space>
          </Tabs.TabPane>

          {/* ── Visibility ── */}
          <Tabs.TabPane tab="Visibility" key="ctrl">
            <Space orientation="vertical" size={16} style={w100}>
              <Space style={spaceBetween}>
                <div>
                  <Typography.Text>Visible to players</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={textSm}>
                    Hidden NPCs do not appear in the codex.
                  </Typography.Text>
                </div>
                <Switch
                  checked={isVisible(npc)}
                  onChange={async (v) => {
                    await NpcApi.setVisible(npc.id, v);
                    await onChanged();
                  }}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </Space>
            </Space>
          </Tabs.TabPane>
        </Tabs>
      ) : null}
    </Drawer>
  );
};

// ── NPC Codex Card ────────────────────────────────────────────────────────────

type CardProps = {
  npc: Npc;
  gmMode: boolean;
  onView: () => void;
  onAdmin: () => void;
  onToggleVisible: () => void;
};

const NpcCodexCard: React.FC<CardProps> = ({ npc, gmMode, onView, onAdmin, onToggleVisible }) => {
  const meta = getRoleMeta(npc.role);
  const vis = isVisible(npc);
  return (
    <EntityCard
      shape="portrait"
      actions={
        gmMode ? (
          <>
            <Switch
              checked={vis}
              checkedChildren={<EyeOutlined />}
              onChange={() => onToggleVisible()}
              size="small"
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
            <Button onClick={onAdmin} size="small">
              Admin
            </Button>
          </>
        ) : null
      }
      cover={npc.imageUrl ? { src: resolveApiUrl(npc.imageUrl), alt: npc.imageAlt ?? npc.name } : null}
      coverTags={
        npc.role ? (
          <Tag color={meta.color} style={{ margin: 0, fontWeight: 600 }}>
            {npc.role}
          </Tag>
        ) : null
      }
      icon="npc"
      label="NPC"
      meta={
        npc.location ? (
          <Space size={4}>
            <EnvironmentOutlined />
            <span>{npc.location}</span>
          </Space>
        ) : null
      }
      onClick={onView}
      openText="View profile"
      seed={npc.id}
      status={gmMode ? { visible: vis } : undefined}
      summary={npc.description}
      summaryFallback="No information available."
      title={npc.name}
    />
  );
};

// ── Detail Drawer ─────────────────────────────────────────────────────────────

type DetailProps = {
  open: boolean;
  npc: Npc | null;
  onClose: () => void;
  isGM?: boolean;
  /** GM panel view: shows status tags and the GM Actions tab. */
  gmView?: boolean;
  onToggleVisible?: (npc: Npc) => void;
  /** Phone sheet: tab state, footer and the touch versions of the GM tabs. */
  mobile?: {
    subtitle?: React.ReactNode;
    footer?: React.ReactNode;
    activeKey: string;
    onTabChange: (key: string) => void;
    sheet: React.ReactNode;
    gm: React.ReactNode;
  };
};

const NpcDetailDrawer: React.FC<DetailProps> = ({ open, npc, onClose, isGM, gmView, onToggleVisible, mobile }) => {
  if (!npc) return null;
  const meta = getRoleMeta(npc.role);

  return (
    <EntityDrawer
      controls={onToggleVisible ? [visibilityControl(isVisible(npc), () => onToggleVisible(npc), 'NPCs')] : []}
      createdAt={npc.createdAt}
      gmView={isGM && gmView}
      onClose={onClose}
      open={open}
      overview={{
        label: 'Profile',
        image: { src: npc.imageUrl ? resolveApiUrl(npc.imageUrl) : null, alt: npc.imageAlt ?? npc.name },
        meta:
          npc.role || npc.location ? (
            <>
              {npc.role && (
                <Tag color={meta.color} style={S.detailRoleTag(meta.hex)}>
                  {npc.role}
                </Tag>
              )}
              {npc.location && <Tag icon={<EnvironmentOutlined />}>{npc.location}</Tag>}
            </>
          ) : null,
        sections: [{ title: 'Profile', text: npc.description, fallback: 'No information available.' }],
      }}
      status={{ visible: isVisible(npc) }}
      gmTabs={mobile ? [{ key: 'edit', label: 'Edit', children: null, mobileChildren: mobile.gm }] : []}
      mobileActiveKey={mobile ? (mobile.activeKey === 'profile' ? 'overview' : mobile.activeKey) : undefined}
      mobileFooter={mobile?.footer}
      onMobileTabChange={mobile ? (k) => mobile.onTabChange(k === 'overview' ? 'profile' : k) : undefined}
      subtitle={mobile?.subtitle}
      tabs={
        isGM && (npc.sheetUrl || mobile)
          ? [
              {
                key: 'sheet',
                label: mobile ? 'Sheet' : 'Character Sheet',
                children: (
                  <Card density="comfy" title="Character Sheet">
                    {npc.sheetUrl ? <NpcSheetViewer sheetUrl={npc.sheetUrl} /> : null}
                  </Card>
                ),
                mobileChildren: mobile?.sheet,
              },
            ]
          : []
      }
      title={npc.name}
      updatedAt={(npc as { updatedAt?: string }).updatedAt}
    />
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const NPCsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = useGMMode();
  const initialViewModeSyncedRef = React.useRef(false);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const sheetInputRef = React.useRef<HTMLInputElement | null>(null);

  const [npcs, setNpcs] = React.useState<Npc[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [viewMode, setViewMode] = React.useState<NpcViewMode>('public');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [npcSheetTab, setNpcSheetTab] = React.useState<NpcSheetTab>('profile');

  const [search, setSearch] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<string | null>(null);
  const [filterLoc, setFilterLoc] = React.useState<string | null>(null);
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [adminId, setAdminId] = React.useState<number | null>(null);
  const [adminOpen, setAdminOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newRole, setNewRole] = React.useState('');
  const [newLoc, setNewLoc] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [creatingNpc, setCreatingNpc] = React.useState(false);

  const [mobileName, setMobileName] = React.useState('');
  const [mobileRole, setMobileRole] = React.useState('');
  const [mobileLocation, setMobileLocation] = React.useState('');
  const [mobileDesc, setMobileDesc] = React.useState('');
  const [mobileImgAlt, setMobileImgAlt] = React.useState('');
  const [mobileSaving, setMobileSaving] = React.useState(false);
  const [mobileUploadingImage, setMobileUploadingImage] = React.useState(false);
  const [mobileUploadingSheet, setMobileUploadingSheet] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!initialViewModeSyncedRef.current) {
      initialViewModeSyncedRef.current = true;
      if (isGM) setViewMode('admin');
    }

    if (!isGM) {
      setViewMode('public');
      setFilterVis('all');
      setNpcSheetTab('profile');
    }
  }, [isGM]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setNpcs(await NpcApi.list());
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load NPCs'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Derived filter lists
  const allRoles = React.useMemo(() => {
    const s = new Set<string>();
    npcs.forEach((n) => {
      if (n.role) s.add(n.role);
    });
    return Array.from(s).sort();
  }, [npcs]);

  const allLocations = React.useMemo(() => {
    const s = new Set<string>();
    npcs.forEach((n) => {
      if (n.location) s.add(n.location);
    });
    return Array.from(s).sort();
  }, [npcs]);

  const q = search.trim().toLowerCase();

  const filtered = React.useMemo(
    () =>
      npcs.filter((n) => {
        if (viewMode === 'public' && !isVisible(n)) return false;
        if (isGM && viewMode === 'admin' && filterVis === 'visible' && !isVisible(n)) return false;
        if (isGM && viewMode === 'admin' && filterVis === 'hidden' && isVisible(n)) return false;
        if (filterRole && n.role !== filterRole) return false;
        if (filterLoc && n.location !== filterLoc) return false;
        if (q)
          return (
            n.name.toLowerCase().includes(q) ||
            (n.role ?? '').toLowerCase().includes(q) ||
            (n.location ?? '').toLowerCase().includes(q) ||
            (n.description ?? '').toLowerCase().includes(q)
          );
        return true;
      }),
    [npcs, isGM, viewMode, filterVis, filterRole, filterLoc, q],
  );

  const stats = React.useMemo(
    () => ({
      total: npcs.length,
      visible: npcs.filter(isVisible).length,
      hidden: npcs.filter((n) => !isVisible(n)).length,
    }),
    [npcs],
  );

  async function toggleVisible(n: Npc) {
    const next = !isVisible(n);
    setNpcs((prev) => prev.map((x) => (x.id === n.id ? { ...x, visible: next } : x)));
    try {
      await NpcApi.setVisible(n.id, next);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility'));
      await load();
    }
  }

  async function deleteNpc(id: number) {
    try {
      await NpcApi.remove(id);
      setNpcs((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      if (adminId === id) {
        setAdminId(null);
        setAdminOpen(false);
      }
      setDeleteDialogOpen(false);
      message.success('NPC deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete NPC'));
    }
  }

  function resetCreateForm() {
    setNewName('');
    setNewRole('');
    setNewLoc('');
    setNewDesc('');
  }

  async function createNpc() {
    const n = newName.trim();
    if (!n) return message.warning('Name is required');
    setCreatingNpc(true);
    try {
      await NpcApi.create({
        name: n,
        role: newRole || null,
        location: newLoc.trim() || null,
        description: newDesc.trim() || null,
      } as CreateNpcDTO);
      setCreating(false);
      resetCreateForm();
      await load();
      message.success('NPC created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create NPC'));
    } finally {
      setCreatingNpc(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createNpc();
  }

  const detailNpc = npcs.find((x) => x.id === openId) ?? null;
  const adminNpc = npcs.find((x) => x.id === adminId) ?? null;

  React.useEffect(() => {
    if (!detailNpc) return;
    setMobileName(detailNpc.name ?? '');
    setMobileRole(detailNpc.role ?? '');
    setMobileLocation(detailNpc.location ?? '');
    setMobileDesc(detailNpc.description ?? '');
    setMobileImgAlt(detailNpc.imageAlt ?? '');
  }, [detailNpc]);

  function resetMobileDraft() {
    if (!detailNpc) return;
    setMobileName(detailNpc.name ?? '');
    setMobileRole(detailNpc.role ?? '');
    setMobileLocation(detailNpc.location ?? '');
    setMobileDesc(detailNpc.description ?? '');
    setMobileImgAlt(detailNpc.imageAlt ?? '');
  }

  async function saveMobileNpc() {
    if (!detailNpc) return;
    const n = mobileName.trim();
    if (!n) {
      message.warning('Name is required');
      return;
    }

    setMobileSaving(true);
    try {
      await NpcApi.update(detailNpc.id, {
        name: n,
        role: mobileRole.trim() || null,
        location: mobileLocation.trim() || null,
        description: mobileDesc.trim() || null,
      });
      await load();
      message.success('NPC updated');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save NPC'));
    } finally {
      setMobileSaving(false);
    }
  }

  async function uploadMobileNpcImage(file: File) {
    if (!detailNpc) return;
    setMobileUploadingImage(true);
    try {
      await NpcApi.uploadImage(detailNpc.id, file, mobileImgAlt || undefined);
      await load();
      message.success('Portrait uploaded');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Upload failed'));
    } finally {
      setMobileUploadingImage(false);
    }
  }

  async function uploadMobileNpcSheet(file: File) {
    if (!detailNpc) return;
    setMobileUploadingSheet(true);
    try {
      await NpcApi.uploadSheet(detailNpc.id, file);
      await load();
      message.success('Sheet uploaded');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Upload failed'));
    } finally {
      setMobileUploadingSheet(false);
    }
  }

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {stats.total} characters
      </AdmMobileTag>
      {isGM ? (
        <>
          <AdmMobileTag color="success" fill="outline" round>
            {stats.visible} visible
          </AdmMobileTag>
          {stats.hidden > 0 ? (
            <AdmMobileTag color="warning" fill="outline" round>
              {stats.hidden} hidden
            </AdmMobileTag>
          ) : null}
        </>
      ) : null}
    </S.MobileMetaTags>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search characters..." value={search} />
      <S.MobileFilterRow>
        <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
          <FilterOutline fontSize={16} /> Filters
        </AdmMobileButton>
        {isGM ? (
          <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
            <AddOutline fontSize={16} /> New NPC
          </AdmMobileButton>
        ) : null}
      </S.MobileFilterRow>
    </>
  );

  const mobileNpcSheet = detailNpc ? (
    <S.MobileSectionStack>
      {detailNpc.sheetUrl ? (
        <MobileCard compact title="Character Sheet">
          <NpcSheetViewer sheetUrl={detailNpc.sheetUrl} />
        </MobileCard>
      ) : (
        <MobileCard compact title="Character Sheet">
          <S.MobileEmptyState>No sheet attached yet.</S.MobileEmptyState>
        </MobileCard>
      )}
      <AdmMobileButton
        block
        fill="outline"
        loading={mobileUploadingSheet}
        onClick={() => sheetInputRef.current?.click()}
      >
        <FileOutline fontSize={17} /> {detailNpc.sheetUrl ? 'Replace PDF sheet' : 'Upload PDF sheet'}
      </AdmMobileButton>
    </S.MobileSectionStack>
  ) : null;

  const mobileNpcGM = detailNpc ? (
    <S.MobileSectionStack>
      <MobileCard compact title="Profile">
        <MobileForm>
          <MobileForm.Item label="Name">
            <AdmMobileInput clearable onChange={setMobileName} placeholder="NPC name" value={mobileName} />
          </MobileForm.Item>
          <MobileForm.Item label="Role">
            <MobileSelector<string>
              columns={2}
              inset={false}
              onChange={(values) => setMobileRole((values[0] as string | undefined) ?? '')}
              options={NPC_ROLES.map((role) => ({ label: role, value: role }))}
              value={mobileRole ? [mobileRole] : []}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Location">
            <AdmMobileInput
              clearable
              onChange={setMobileLocation}
              placeholder="Aiedo, Piata..."
              value={mobileLocation}
            />
          </MobileForm.Item>
          <MobileForm.Item label="Description / Background">
            <AdmMobileTextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              onChange={setMobileDesc}
              placeholder="History, motivations, behavior..."
              value={mobileDesc}
            />
          </MobileForm.Item>
        </MobileForm>
      </MobileCard>

      <MobileCard compact title="Media">
        <S.MobileUploadStack>
          <S.MobileFieldLabel htmlFor={`npc-image-alt-${detailNpc.id}`}>Portrait alt text</S.MobileFieldLabel>
          <AdmMobileInput
            clearable
            id={`npc-image-alt-${detailNpc.id}`}
            onChange={setMobileImgAlt}
            placeholder="Describe the portrait"
            value={mobileImgAlt}
          />
          <S.MobileActionGrid>
            <AdmMobileButton
              block
              fill="outline"
              loading={mobileUploadingImage}
              onClick={() => imageInputRef.current?.click()}
            >
              <PictureOutline fontSize={17} /> Upload portrait
            </AdmMobileButton>
            <AdmMobileButton
              block
              fill="outline"
              loading={mobileUploadingSheet}
              onClick={() => sheetInputRef.current?.click()}
            >
              <FileOutline fontSize={17} /> Upload PDF
            </AdmMobileButton>
          </S.MobileActionGrid>
        </S.MobileUploadStack>
      </MobileCard>

      <MobileCard compact title="Tags">
        <TagSelect entityId={detailNpc.id} entityType="npc" />
      </MobileCard>

      <MobileCard compact title="Danger Zone">
        <S.MobileDangerZone>
          <S.MobileBodyText>Deleting an NPC removes the profile, portrait and attached sheet.</S.MobileBodyText>
          <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteOutline fontSize={17} /> Delete NPC
          </AdmMobileButton>
        </S.MobileDangerZone>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Codex - NPCs</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <S.MobileFilterRow>
                <AdmMobileButton
                  fill={viewMode === 'public' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('public')}
                  size="small"
                >
                  <UserOutline fontSize={16} /> View
                </AdmMobileButton>
                <AdmMobileButton
                  color="primary"
                  fill={viewMode === 'admin' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('admin')}
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
              ? 'Profiles, portraits, sheets and GM controls optimized for mobile.'
              : 'Characters known to the adventurers in the Algol system.'
          }
          title={<IconLabel icon="npc">Character Codex</IconLabel>}
        >
          {loading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !filtered.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No NPCs found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <EntityCardGrid shape="portrait">
              {filtered.map((n) => (
                <NpcCodexCard
                  gmMode={isGM && viewMode === 'admin'}
                  key={n.id}
                  npc={n}
                  onAdmin={() => {
                    setNpcSheetTab('gm');
                    setOpenId(n.id);
                  }}
                  onToggleVisible={() => void toggleVisible(n)}
                  onView={() => {
                    setNpcSheetTab('profile');
                    setOpenId(n.id);
                  }}
                />
              ))}
            </EntityCardGrid>
          )}
        </MobilePageScaffold>

        <MobileFilterSheet
          description="Tune the character codex for mobile reading or GM work."
          footer={
            <MobileActionBar sticky={false}>
              <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                Done
              </AdmMobileButton>
            </MobileActionBar>
          }
          onClose={() => setFilterSheetOpen(false)}
          title="NPC filters"
          visible={filterSheetOpen}
        >
          <S.MobileSectionStack>
            {isGM ? (
              <S.MobileCreateField>
                <S.MobileFieldLabel>Panel</S.MobileFieldLabel>
                <MobileSelector<NpcViewMode>
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as NpcViewMode | undefined) ?? 'public')}
                  options={[
                    { label: 'Public view', value: 'public' },
                    { label: 'GM panel', value: 'admin' },
                  ]}
                  value={[viewMode]}
                />
              </S.MobileCreateField>
            ) : null}

            <S.MobileCreateField>
              <S.MobileFieldLabel>Role</S.MobileFieldLabel>
              <MobileSelector<string>
                columns={2}
                inset={false}
                onChange={(values) => {
                  const value = (values[0] as string | undefined) ?? 'all';
                  setFilterRole(value === 'all' ? null : value);
                }}
                options={[
                  { label: 'All roles', value: 'all' },
                  ...allRoles.map((role) => ({ label: role, value: role })),
                ]}
                value={[filterRole ?? 'all']}
              />
            </S.MobileCreateField>

            {allLocations.length ? (
              <S.MobileCreateField>
                <S.MobileFieldLabel>Location</S.MobileFieldLabel>
                <MobileSelector<string>
                  columns={1}
                  inset={false}
                  onChange={(values) => {
                    const value = (values[0] as string | undefined) ?? 'all';
                    setFilterLoc(value === 'all' ? null : value);
                  }}
                  options={[
                    { label: 'All locations', value: 'all' },
                    ...allLocations.map((location) => ({ label: location, value: location })),
                  ]}
                  value={[filterLoc ?? 'all']}
                />
              </S.MobileCreateField>
            ) : null}

            {isGM && viewMode === 'admin' ? (
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
            ) : null}
          </S.MobileSectionStack>
        </MobileFilterSheet>

        <NpcDetailDrawer
          gmView={isGM}
          isGM={isGM}
          mobile={{
            subtitle: detailNpc?.role ?? detailNpc?.location ?? undefined,
            footer:
              detailNpc && isGM && npcSheetTab === 'gm' ? (
                <MobileActionBar
                  primary={
                    <AdmMobileButton block color="primary" loading={mobileSaving} onClick={() => void saveMobileNpc()}>
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
            activeKey: npcSheetTab,
            onTabChange: (key) => setNpcSheetTab(key as NpcSheetTab),
            sheet: mobileNpcSheet,
            gm: mobileNpcGM,
          }}
          npc={detailNpc}
          onClose={() => {
            setOpenId(null);
            setNpcSheetTab('profile');
          }}
          onToggleVisible={(n) => void toggleVisible(n)}
          open={Boolean(detailNpc)}
        />
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadMobileNpcImage(file);
              event.currentTarget.value = '';
            }
          }}
          ref={imageInputRef}
          type="file"
        />
        <input
          accept="application/pdf"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadMobileNpcSheet(file);
              event.currentTarget.value = '';
            }
          }}
          ref={sheetInputRef}
          type="file"
        />

        <MobileEntitySheet
          description="Create the NPC now, then add portrait, PDF and tags from GM controls."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingNpc} onClick={() => void createNpc()}>
                  Create NPC
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
          title="New NPC"
          visible={creating && isGM}
        >
          <MobileCard compact title="NPC details">
            <MobileForm>
              <MobileForm.Item label="Name">
                <AdmMobileInput clearable onChange={setNewName} placeholder="NPC name" value={newName} />
              </MobileForm.Item>
              <MobileForm.Item label="Role">
                <MobileSelector<string>
                  columns={2}
                  inset={false}
                  onChange={(values) => setNewRole((values[0] as string | undefined) ?? '')}
                  options={NPC_ROLES.map((role) => ({ label: role, value: role }))}
                  value={newRole ? [newRole] : []}
                />
              </MobileForm.Item>
              <MobileForm.Item label="Location">
                <AdmMobileInput clearable onChange={setNewLoc} placeholder="Aiedo, Piata..." value={newLoc} />
              </MobileForm.Item>
              <MobileForm.Item label="Description">
                <AdmMobileTextArea
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  onChange={setNewDesc}
                  placeholder="History, motivations, behavior..."
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
              text: 'Delete NPC',
              danger: true,
              bold: true,
              onClick: () => {
                if (detailNpc) {
                  return deleteNpc(detailNpc.id);
                }
              },
            },
          ]}
          content={detailNpc ? `Delete "${detailNpc.name}" permanently?` : ''}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete NPC?"
          visible={deleteDialogOpen}
        />
      </>
    );
  }

  const AdminTable = (
    <Card density="dense" title="Manage NPCs">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 800 }}
          style={{ minWidth: 800 }}
          columns={[
            { title: '#', dataIndex: 'id', width: 60, render: (v: number) => <Tag style={m0}>#{v}</Tag> },
            {
              title: 'Visible',
              width: 80,
              render: (_: any, n: Npc) => (
                <Switch
                  size="small"
                  checked={isVisible(n)}
                  onChange={() => void toggleVisible(n)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'NPC',
              render: (_: any, n: Npc) => (
                <Space orientation="vertical" size={2}>
                  <Space size={6} wrap>
                    <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => setOpenId(n.id)}>
                      {n.name}
                    </Typography.Text>
                    {n.role && (
                      <Tag color="blue" style={m0}>
                        {n.role}
                      </Tag>
                    )}
                  </Space>
                  {n.location && (
                    <Typography.Text type="secondary" style={textSm}>
                      <EnvironmentOutlined /> {n.location}
                    </Typography.Text>
                  )}
                </Space>
              ),
            },
            {
              title: 'Description',
              ellipsis: true,
              render: (_: any, n: Npc) => (
                <Typography.Text type="secondary" style={textSm}>
                  {n.description?.slice(0, 80) || '—'}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              width: 90,
              render: (_: any, n: Npc) => (
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setAdminId(n.id);
                      setAdminOpen(true);
                    }}
                  />
                  <Popconfirm
                    title={`Delete "${n.name}" permanently?`}
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => void deleteNpc(n.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      {!filtered.length && !loading && <Empty description="No NPCs found." style={{ marginTop: 16 }} />}
    </Card>
  );

  return (
    <>
      <PageTitle>Codex — NPCs</PageTitle>

      {/* ── Header card ── */}
      <Card density="dense" className="rpg-page-header-card">
        <Space orientation="vertical" size={12} style={w100}>
          <Space style={spaceBetween} size={8}>
            <div>
              <Typography.Title level={4} style={m0}>
                {viewMode === 'admin' ? (
                  <IconLabel icon="gm">GM Panel - NPCs</IconLabel>
                ) : (
                  <IconLabel icon="npc">Character Codex</IconLabel>
                )}
              </Typography.Title>
              <Typography.Text type="secondary" style={textMd}>
                {viewMode === 'admin'
                  ? 'Manage NPCs, portraits, roles and visibility.'
                  : 'Characters known to the adventurers in the Algol system.'}
              </Typography.Text>
            </div>
            <Space size={8} wrap>
              {isGM && (
                <Space size={4}>
                  <Button
                    size="small"
                    type={viewMode === 'public' ? 'primary' : 'default'}
                    onClick={() => setViewMode('public')}
                  >
                    <IconLabel icon="read">View</IconLabel>
                  </Button>
                  <Button
                    size="small"
                    type={viewMode === 'admin' ? 'primary' : 'default'}
                    onClick={() => setViewMode('admin')}
                  >
                    <IconLabel icon="gm">GM Panel</IconLabel>
                  </Button>
                </Space>
              )}
              {isGM && viewMode === 'admin' && (
                <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                  {creating ? 'Close' : '+ New NPC'}
                </Button>
              )}
            </Space>
          </Space>

          {/* Stats chips */}
          <Space wrap size={6}>
            <Tag icon={<UserOutlined />}>{stats.total} characters</Tag>
            {isGM && <Tag color="green">{stats.visible} visible</Tag>}
            {isGM && stats.hidden > 0 && <Tag color="red">{stats.hidden} hidden</Tag>}
            {filtered.length !== npcs.length && <Tag color="blue">{filtered.length} shown</Tag>}
          </Space>

          {/* Filter bar */}
          <Space wrap size={8} style={w100}>
            {/* Text search */}
            <Input
              allowClear
              placeholder="Search character…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 240 }}
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            />

            {/* Role filter — buttons (limited set, coloured) */}
            <Space size={4} wrap>
              <Button size="small" type={!filterRole ? 'primary' : 'default'} onClick={() => setFilterRole(null)}>
                All
              </Button>
              {allRoles.map((r) => {
                const m = getRoleMeta(r);
                return (
                  <Button
                    key={r}
                    size="small"
                    type={filterRole === r ? 'primary' : 'default'}
                    onClick={() => setFilterRole(filterRole === r ? null : r)}
                    style={filterRole === r ? { background: m.hex, borderColor: m.hex } : {}}
                  >
                    {r}
                  </Button>
                );
              })}
            </Space>

            {/* Location filter — Select (scales to hundreds) */}
            {allLocations.length > 0 && (
              <Select
                allowClear
                placeholder={
                  <>
                    <EnvironmentOutlined /> Location
                  </>
                }
                value={filterLoc ?? undefined}
                onChange={(v) => setFilterLoc(v ?? null)}
                style={{ minWidth: 160 }}
                options={allLocations.map((loc) => ({ value: loc, label: loc }))}
              />
            )}

            {/* GM visibility filter */}
            {isGM && (
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

          {/* Create form */}
          {isGM && creating && (
            <>
              <Divider style={dividerSm} />
              <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
                <Typography.Text strong>New NPC</Typography.Text>
                <Space wrap size={8}>
                  <Input
                    placeholder="Nome *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ minWidth: 200 }}
                    required
                  />
                  <Select
                    value={newRole || undefined}
                    onChange={(v) => setNewRole(v ?? '')}
                    placeholder="Role…"
                    allowClear
                    style={{ minWidth: 160 }}
                    options={NPC_ROLES.map((r) => {
                      const m = getRoleMeta(r);
                      return {
                        value: r,
                        label: (
                          <Space size={6}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: m.hex,
                              }}
                            />
                            {r}
                          </Space>
                        ),
                      };
                    })}
                  />
                </Space>
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Location (ex: Aiedo)"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                />
                <Input.TextArea
                  placeholder="Description / Background"
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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

      {/* ── Content ── */}
      {viewMode === 'admin' && isGM ? (
        loading ? (
          <Spinner />
        ) : (
          AdminTable
        )
      ) : loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Card density="comfy">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              search || filterRole || filterLoc
                ? 'No characters match the filters.'
                : isGM
                  ? 'No NPCs registered yet.'
                  : 'No characters revealed yet.'
            }
          />
        </Card>
      ) : (
        <EntityCardGrid shape="portrait">
          {filtered.map((n) => (
            <NpcCodexCard
              key={n.id}
              npc={n}
              gmMode={isGM}
              onView={() => setOpenId(n.id)}
              onAdmin={() => {
                setAdminId(n.id);
                setAdminOpen(true);
              }}
              onToggleVisible={() => void toggleVisible(n)}
            />
          ))}
        </EntityCardGrid>
      )}

      {/* ── Drawers — always mounted, driven by open prop ── */}
      <NpcDetailDrawer
        gmView={viewMode === 'admin'}
        isGM={isGM}
        npc={detailNpc}
        onClose={() => setOpenId(null)}
        onToggleVisible={(n) => void toggleVisible(n)}
        open={openId !== null}
      />
      <NpcAdminDrawer
        open={adminOpen}
        npc={adminNpc}
        onClose={() => {
          setAdminOpen(false);
          setAdminId(null);
        }}
        onChanged={load}
      />
    </>
  );
};

export default NPCsPage;
