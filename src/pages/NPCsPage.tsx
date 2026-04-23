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
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PictureOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
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

const GM_KEY = 'gm_api_key';

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

  const [npcs, setNpcs] = React.useState<Npc[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isGM, setIsGM] = React.useState(() => Boolean(localStorage.getItem(GM_KEY)));

  const [viewMode, setViewMode] = React.useState<'public' | 'admin'>('public');

  const [search, setSearch] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<string | null>(null);
  const [filterLoc, setFilterLoc] = React.useState<string | null>(null);
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [adminId, setAdminId] = React.useState<number | null>(null);
  const [adminOpen, setAdminOpen] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newRole, setNewRole] = React.useState('');
  const [newLoc, setNewLoc] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY) setIsGM(Boolean(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
        if (!isGM && !isVisible(n)) return false;
        if (isGM && filterVis === 'visible' && !isVisible(n)) return false;
        if (isGM && filterVis === 'hidden' && isVisible(n)) return false;
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
    [npcs, isGM, filterVis, filterRole, filterLoc, q],
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
      message.success('NPC deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete NPC'));
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = newName.trim();
    if (!n) return message.warning('Name is required');
    try {
      await NpcApi.create({
        name: n,
        role: newRole || null,
        location: newLoc.trim() || null,
        description: newDesc.trim() || null,
      } as CreateNpcDTO);
      setCreating(false);
      setNewName('');
      setNewRole('');
      setNewLoc('');
      setNewDesc('');
      await load();
      message.success('NPC created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create NPC'));
    }
  }

  const detailNpc = npcs.find((x) => x.id === openId) ?? null;
  const adminNpc = npcs.find((x) => x.id === adminId) ?? null;
  const cols = mobileOnly ? 1 : isTablet ? 2 : 3;

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
