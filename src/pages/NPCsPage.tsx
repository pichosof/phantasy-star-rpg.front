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
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  Button as AdmMobileButton,
  Input as AdmMobileInput,
  SpinLoading,
  Switch as AdmMobileSwitch,
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
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';

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
  MobileTabs,
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

function mobileRoleColor(role?: string | null): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  const color = getRoleMeta(role).color;
  if (color === 'red' || color === 'volcano') return 'danger';
  if (color === 'green') return 'success';
  if (color === 'gold' || color === 'orange') return 'warning';
  if (color === 'default') return 'default';
  return 'primary';
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

const PdfViewer: React.FC<{ url: string }> = ({ url }) => {
  const layoutPlugin = defaultLayoutPlugin();
  return (
    <Worker workerUrl={PDF_WORKER_URL}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Viewer fileUrl={url} plugins={[layoutPlugin]} />
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
    <div
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--background-color, #fff)',
        border: `1px solid ${gmMode && !vis ? '#ff4d4f40' : meta.hex + '40'}`,
        boxShadow: gmMode && !vis ? 'none' : `0 2px 12px ${meta.hex}18, 0 1px 3px rgba(0,0,0,.08)`,
        transition: 'box-shadow .2s, transform .15s',
        opacity: gmMode && !vis ? 0.65 : 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (!gmMode) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
      }}
    >
      {/* Portrait */}
      <div style={{ position: 'relative', height: 180, flexShrink: 0, overflow: 'hidden' }}>
        {npc.imageUrl ? (
          <img
            src={resolveApiUrl(npc.imageUrl)}
            alt={npc.imageAlt ?? npc.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${meta.hex}30 0%, ${meta.hex}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              size={80}
              style={{
                background: meta.hex,
                fontSize: 28,
                fontWeight: 700,
                boxShadow: `0 4px 16px ${meta.hex}60`,
              }}
            >
              {initials(npc.name)}
            </Avatar>
          </div>
        )}

        {/* Role badge */}
        {npc.role && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <Tag
              color={meta.color}
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                background: meta.hex + 'dd',
                border: 'none',
                color: '#fff',
              }}
            >
              {npc.role}
            </Tag>
          </div>
        )}

        {/* GM status badge */}
        {gmMode && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <Tooltip title={vis ? 'Visible' : 'Hidden'}>
              <Tag
                style={{ margin: 0, cursor: 'pointer', fontSize: 11 }}
                color={vis ? 'green' : 'red'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible();
                }}
              >
                {vis ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </Tag>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Typography.Text strong style={{ fontSize: 15, lineHeight: 1.3 }}>
          {npc.name}
        </Typography.Text>

        {npc.location && (
          <Space size={4} style={{ color: '#8c8c8c', fontSize: 12 }}>
            <EnvironmentOutlined />
            <span>{npc.location}</span>
          </Space>
        )}

        {npc.description && (
          <Typography.Paragraph
            style={{ margin: 0, fontSize: 12, color: '#595959', lineHeight: 1.5 }}
            ellipsis={{ rows: 3 }}
          >
            {npc.description}
          </Typography.Paragraph>
        )}

        {/* accent line */}
        <div style={{ height: 2, borderRadius: 2, background: meta.hex + '40', marginTop: 'auto', paddingTop: 8 }} />

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {!gmMode ? (
            <Button size="small" type="link" style={{ padding: 0, height: 'auto', color: meta.hex }} onClick={onView}>
              View profile →
            </Button>
          ) : (
            <Space size={6}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdmin();
                }}
              >
                Admin
              </Button>
              <Switch
                size="small"
                checked={vis}
                onChange={() => onToggleVisible()}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
              />
            </Space>
          )}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: meta.hex,
              boxShadow: `0 0 6px ${meta.hex}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Detail Drawer ─────────────────────────────────────────────────────────────

type DetailProps = { open: boolean; npc: Npc | null; onClose: () => void; isGM?: boolean };

const NpcDetailDrawer: React.FC<DetailProps> = ({ open, npc, onClose, isGM }) => {
  const { mobileOnly } = useResponsive();
  const meta = npc ? getRoleMeta(npc.role) : { color: 'default' as const, hex: '#8c8c8c' };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={mobileOnly ? '100%' : 520}
      styles={{ body: S.detailDrawerBody }}
      title={null}
      closable={false}
    >
      {npc && (
        <>
          {/* Hero portrait */}
          <div style={S.detailHeroShell}>
            {npc.imageUrl ? (
              <div style={S.detailHeroImageWrap}>
                <img src={resolveApiUrl(npc.imageUrl)} alt={npc.imageAlt ?? npc.name} style={S.detailHeroImage} />
              </div>
            ) : (
              <div style={S.detailHeroFallback(meta.hex)}>
                <Avatar size={100} style={S.detailHeroAvatar(meta.hex)}>
                  {initials(npc.name)}
                </Avatar>
              </div>
            )}
            {/* Close button */}
            <Button size="small" style={S.detailCloseButton} icon={<AppIcon name="close" />} onClick={onClose} />
            {/* Gradient fade */}
            <div style={S.detailHeroFade} />
          </div>

          {/* Content */}
          <div style={S.detailContent}>
            <Space orientation="vertical" size={16} style={w100}>
              <Space orientation="vertical" size={4} style={S.detailHeaderStack}>
                <Typography.Title level={3} style={m0}>
                  {npc.name}
                </Typography.Title>
                <Space size={8} wrap>
                  {npc.role && (
                    <Tag color={meta.color} style={S.detailRoleTag(meta.hex)}>
                      {npc.role}
                    </Tag>
                  )}
                  {npc.location && (
                    <Space size={4} style={S.detailLocationMeta}>
                      <EnvironmentOutlined />
                      <span>{npc.location}</span>
                    </Space>
                  )}
                </Space>
              </Space>

              <div style={S.detailAccent(meta.hex)} />

              {npc.description ? (
                <Card density="dense" title="Profile">
                  <Typography.Paragraph style={S.detailParagraph}>{npc.description}</Typography.Paragraph>
                </Card>
              ) : (
                <Typography.Text type="secondary">No information available.</Typography.Text>
              )}

              {isGM && npc.sheetUrl && (
                <Card density="dense" title="Character Sheet">
                  <NpcSheetViewer sheetUrl={npc.sheetUrl} />
                </Card>
              )}
            </Space>
          </div>
        </>
      )}
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const NPCsPage: React.FC = () => {
  const { mobileOnly, isTablet } = useResponsive();
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
  const cols = mobileOnly ? 1 : isTablet ? 2 : 3;

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

  const mobileNpcProfile = detailNpc ? (
    <S.MobileSectionStack>
      <MobileCard compact>
        <S.MobileNpcHero $accent={getRoleMeta(detailNpc.role).hex}>
          {detailNpc.imageUrl ? (
            <S.MobileNpcHeroImage alt={detailNpc.imageAlt ?? detailNpc.name} src={resolveApiUrl(detailNpc.imageUrl)} />
          ) : (
            <S.MobileNpcFallback $accent={getRoleMeta(detailNpc.role).hex}>
              <span>{initials(detailNpc.name)}</span>
            </S.MobileNpcFallback>
          )}
        </S.MobileNpcHero>
        <S.MobileNpcHeroInfo>
          <S.MobileNpcTitle>{detailNpc.name}</S.MobileNpcTitle>
          <S.MobileMetaTags>
            {detailNpc.role ? (
              <AdmMobileTag color={mobileRoleColor(detailNpc.role)} fill="outline" round>
                {detailNpc.role}
              </AdmMobileTag>
            ) : null}
            {detailNpc.location ? (
              <AdmMobileTag fill="outline" round>
                {detailNpc.location}
              </AdmMobileTag>
            ) : null}
            {isGM ? (
              <AdmMobileTag color={isVisible(detailNpc) ? 'success' : 'danger'} fill="outline" round>
                {isVisible(detailNpc) ? 'Visible' : 'Hidden'}
              </AdmMobileTag>
            ) : null}
          </S.MobileMetaTags>
        </S.MobileNpcHeroInfo>
      </MobileCard>

      <MobileCard compact title="Profile">
        <S.MobileBodyText>{detailNpc.description?.trim() || 'No information available.'}</S.MobileBodyText>
      </MobileCard>

      <MobileCard compact title="Details">
        <S.MobileDetailGrid>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Role</S.MobileDetailLabel>
            <S.MobileDetailValue>{detailNpc.role || 'Unknown'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          <S.MobileDetailItem>
            <S.MobileDetailLabel>Location</S.MobileDetailLabel>
            <S.MobileDetailValue>{detailNpc.location || 'Unknown'}</S.MobileDetailValue>
          </S.MobileDetailItem>
          {isGM ? (
            <S.MobileDetailItem>
              <S.MobileDetailLabel>Sheet</S.MobileDetailLabel>
              <S.MobileDetailValue>{detailNpc.sheetUrl ? 'Available' : 'Not attached yet'}</S.MobileDetailValue>
            </S.MobileDetailItem>
          ) : null}
        </S.MobileDetailGrid>
      </MobileCard>
    </S.MobileSectionStack>
  ) : null;

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

      <MobileCard compact title="Visibility">
        <S.MobileVisibilityRow>
          <S.MobileInlineLabel>Visible to players</S.MobileInlineLabel>
          <AdmMobileSwitch checked={isVisible(detailNpc)} onChange={() => void toggleVisible(detailNpc)} />
        </S.MobileVisibilityRow>
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
            <S.MobileNpcsGrid>
              {filtered.map((npc) => {
                const meta = getRoleMeta(npc.role);
                const gmPanel = isGM && viewMode === 'admin';

                return (
                  <MobileCard compact key={npc.id}>
                    <S.MobileNpcCardBody>
                      <S.MobileNpcCardMedia $accent={meta.hex}>
                        {npc.imageUrl ? (
                          <S.MobileNpcCardImage alt={npc.imageAlt ?? npc.name} src={resolveApiUrl(npc.imageUrl)} />
                        ) : (
                          <S.MobileNpcFallback $accent={meta.hex}>
                            <span>{initials(npc.name)}</span>
                          </S.MobileNpcFallback>
                        )}
                      </S.MobileNpcCardMedia>

                      <S.MobileNpcTitle>{npc.name}</S.MobileNpcTitle>
                      <S.MobileMetaTags>
                        {npc.role ? (
                          <AdmMobileTag color={mobileRoleColor(npc.role)} fill="outline" round>
                            {npc.role}
                          </AdmMobileTag>
                        ) : null}
                        {npc.location ? (
                          <AdmMobileTag fill="outline" round>
                            {npc.location}
                          </AdmMobileTag>
                        ) : null}
                        {gmPanel ? (
                          <AdmMobileTag color={isVisible(npc) ? 'success' : 'danger'} fill="outline" round>
                            {isVisible(npc) ? 'Visible' : 'Hidden'}
                          </AdmMobileTag>
                        ) : null}
                      </S.MobileMetaTags>

                      <S.MobileNpcPreview>{npc.description?.trim() || 'No information available.'}</S.MobileNpcPreview>

                      <S.MobileActionGrid>
                        <AdmMobileButton
                          block
                          color="primary"
                          onClick={() => {
                            setNpcSheetTab('profile');
                            setOpenId(npc.id);
                          }}
                        >
                          Open profile
                        </AdmMobileButton>
                        {gmPanel ? (
                          <AdmMobileButton
                            block
                            fill="outline"
                            onClick={() => {
                              setNpcSheetTab('gm');
                              setOpenId(npc.id);
                            }}
                          >
                            <SetOutline fontSize={17} /> GM controls
                          </AdmMobileButton>
                        ) : null}
                      </S.MobileActionGrid>
                    </S.MobileNpcCardBody>
                  </MobileCard>
                );
              })}
            </S.MobileNpcsGrid>
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

        <MobileEntitySheet
          description={detailNpc ? 'Profile, sheet and GM controls for this NPC.' : undefined}
          footer={
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
            ) : undefined
          }
          onClose={() => {
            setOpenId(null);
            setNpcSheetTab('profile');
          }}
          subtitle={detailNpc?.role ?? detailNpc?.location ?? undefined}
          title={detailNpc?.name ?? 'NPC'}
          visible={Boolean(detailNpc)}
        >
          {detailNpc && isGM ? (
            <MobileTabs
              activeKey={npcSheetTab}
              items={[
                { key: 'profile', title: 'Profile', children: mobileNpcProfile },
                { key: 'sheet', title: 'Sheet', children: mobileNpcSheet },
                { key: 'gm', title: 'GM', children: mobileNpcGM },
              ]}
              onChange={(key) => setNpcSheetTab(key as NpcSheetTab)}
            />
          ) : (
            mobileNpcProfile
          )}

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
        </MobileEntitySheet>

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
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
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
        </div>
      )}

      {/* ── Drawers — always mounted, driven by open prop ── */}
      <NpcDetailDrawer open={openId !== null} npc={detailNpc} onClose={() => setOpenId(null)} isGM={isGM} />
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
