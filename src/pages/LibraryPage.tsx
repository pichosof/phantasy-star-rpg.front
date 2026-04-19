import React from 'react';
import {
  Button,
  Card,
  Divider,
  Empty,
  Input,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
  KeyOutlined,
  LockOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  UnlockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useResponsive } from '@app/hooks/useResponsive';
import {
  deleteLibraryDocument,
  formatBytes,
  getLibraryKey,
  getLibrarySettings,
  LibraryDocument,
  listLibraryDocuments,
  mimeLabel,
  resolveDocUrl,
  setLibraryKey,
  setLibrarySettings,
  updateLibraryDocument,
  uploadLibraryDocument,
} from '@app/api/library.api';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const GM_KEY_STORAGE = 'gm_api_key';

const CATEGORIES = ['rulebook', 'supplement', 'reference', 'adventure', 'other'];

const ACCEPTED = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/epub+zip',
  'text/markdown',
].join(',');

function mimeColor(mime: string) {
  if (mime === 'application/pdf') return 'red';
  if (mime.includes('word')) return 'blue';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'green';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'orange';
  if (mime === 'text/plain' || mime === 'text/markdown') return 'default';
  return 'purple';
}

// ── Key Entry Screen ───────────────────────────────────────────────────────────

const KeyEntryScreen: React.FC<{ onAccess: () => void }> = ({ onAccess }) => {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function tryKey() {
    const k = input.trim();
    if (!k) return;
    setLoading(true);
    try {
      setLibraryKey(k);
      await listLibraryDocuments(); // will throw 401 if wrong
      onAccess();
    } catch {
      setLibraryKey(null);
      message.error('Invalid library key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <LockOutlined style={{ fontSize: 48, color: 'var(--primary-color)' }} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Library Access
            </Typography.Title>
            <Typography.Text type="secondary">
              Enter the access key provided by your Game Master.
            </Typography.Text>
          </div>
          <Input.Password
            size="large"
            placeholder="Library access key..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={() => void tryKey()}
            prefix={<KeyOutlined />}
          />
          <Button type="primary" size="large" block loading={loading} onClick={() => void tryKey()}>
            Unlock Library
          </Button>
        </Space>
      </Card>
    </div>
  );
};

// ── Document Card ──────────────────────────────────────────────────────────────

interface DocCardProps {
  doc: LibraryDocument;
  isGM: boolean;
  isMobile: boolean;
  onEdit: (doc: LibraryDocument) => void;
  onDelete: (doc: LibraryDocument) => void;
  onToggleVisible: (doc: LibraryDocument) => void;
}

const DocCard: React.FC<DocCardProps> = ({ doc, isGM, isMobile, onEdit, onDelete, onToggleVisible }) => (
  <Card
    size="small"
    style={{ opacity: !doc.visible && isGM ? 0.65 : 1 }}
    title={
      <Space wrap size={6}>
        <FileOutlined />
        <span style={{ fontWeight: 700 }}>{doc.title}</span>
        <Tag color={mimeColor(doc.mime)}>{mimeLabel(doc.mime)}</Tag>
        {doc.category && <Tag>{doc.category}</Tag>}
        {isGM && !doc.visible && <Tag color="red">Hidden</Tag>}
      </Space>
    }
    extra={
      <Space size={6} wrap>
        {isGM && (
          <>
            <Switch
              size="small"
              checked={doc.visible}
              onChange={() => onToggleVisible(doc)}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(doc)} />
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(doc)} />
          </>
        )}
        <Button
          size="small"
          type="primary"
          icon={<DownloadOutlined />}
          href={resolveDocUrl(doc.url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {!isMobile && 'Open'}
        </Button>
      </Space>
    }
  >
    {doc.description && (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {doc.description}
      </Typography.Text>
    )}
    <div style={{ marginTop: doc.description ? 6 : 0 }}>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {formatBytes(doc.size)} · {doc.originalName}
      </Typography.Text>
    </div>
  </Card>
);

// ── Edit Modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  doc: LibraryDocument | null;
  onClose: () => void;
  onSaved: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ doc, onClose, onSaved }) => {
  const [title, setTitle] = React.useState(doc?.title ?? '');
  const [description, setDescription] = React.useState(doc?.description ?? '');
  const [category, setCategory] = React.useState(doc?.category ?? '');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setDescription(doc.description ?? '');
      setCategory(doc.category ?? '');
    }
  }, [doc?.id]);

  async function save() {
    if (!doc) return;
    if (!title.trim()) return message.warning('Title cannot be empty.');
    setSaving(true);
    try {
      await updateLibraryDocument(doc.id, {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
      });
      message.success('Document updated.');
      onSaved();
    } catch {
      message.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={!!doc}
      onCancel={onClose}
      title="Edit Document"
      footer={null}
      destroyOnClose
    >
      <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 8 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Title *
          </Typography.Text>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Category
          </Typography.Text>
          <Select
            allowClear
            style={{ width: '100%' }}
            value={category || undefined}
            onChange={(v) => setCategory(v ?? '')}
            placeholder="Select category..."
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Description
          </Typography.Text>
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description..."
            rows={3}
          />
        </div>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save()} block>
          Save changes
        </Button>
      </Space>
    </Modal>
  );
};

// ── GM Settings Drawer ─────────────────────────────────────────────────────────

interface SettingsPanelProps {
  onClose: () => void;
  onReload: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onReload }) => {
  const [currentKey, setCurrentKey] = React.useState<string | null>(null);
  const [newKey, setNewKey] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getLibrarySettings()
      .then((s) => {
        setCurrentKey(s.playerKey);
        setNewKey(s.playerKey ?? '');
      })
      .catch(() => message.error('Failed to load settings.'));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await setLibrarySettings(newKey.trim() || null);
      message.success('Library key updated.');
      onClose();
      onReload();
    } catch {
      message.error('Failed to update key.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        Set the access key that players must enter to access the library. Leave blank to lock the library for all
        players.
      </Typography.Text>
      {currentKey && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Current key: <code style={{ color: 'var(--primary-color)' }}>{currentKey}</code>
        </Typography.Text>
      )}
      <Input.Password
        placeholder="New player access key..."
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        prefix={<KeyOutlined />}
      />
      <Space>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save()}>
          Save key
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </Space>
    </Space>
  );
};

// ── Upload Form ───────────────────────────────────────────────────────────────

interface UploadFormProps {
  isMobile: boolean;
  onUploaded: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ isMobile, onUploaded }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  function handleUpload(options: RcCustomRequestOptions) {
    const { onError, onSuccess, file } = options;
    const f = file as File;
    const meta = {
      title: title.trim() || f.name.replace(/\.[^.]+$/, ''),
      description: description.trim() || undefined,
      category: category || undefined,
    };
    setUploading(true);
    uploadLibraryDocument(f, meta)
      .then(() => {
        onSuccess?.({}, undefined as unknown as XMLHttpRequest);
        message.success('Document uploaded.');
        setTitle('');
        setDescription('');
        setCategory('');
        onUploaded();
      })
      .catch((err: Error) => {
        onError?.(err);
        message.error('Upload failed (GM key?)');
      })
      .finally(() => setUploading(false));
  }

  return (
    <Card size="small" title={<Space><PlusOutlined /> Upload document</Space>}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space wrap style={{ width: '100%' }}>
          <Input
            placeholder="Title (optional — defaults to filename)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ minWidth: 220, flex: 1 }}
          />
          <Select
            allowClear
            placeholder="Category..."
            value={category || undefined}
            onChange={(v) => setCategory(v ?? '')}
            style={{ minWidth: 160 }}
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
        </Space>
        <Input
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Upload
          accept={ACCEPTED}
          multiple={false}
          showUploadList={false}
          customRequest={(opts: RcCustomRequestOptions) => handleUpload(opts)}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={uploading}
            block={isMobile}
          >
            Choose & upload file
          </Button>
        </Upload>
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, EPUB · max {process.env.MAX_UPLOAD_MB || 30} MB
        </Typography.Text>
      </Space>
    </Card>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const LibraryPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const isGM = React.useMemo(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)), []);

  const [hasAccess, setHasAccess] = React.useState<boolean>(() => {
    if (isGM) return true;
    return Boolean(getLibraryKey());
  });

  const [docs, setDocs] = React.useState<LibraryDocument[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('');
  const [editDoc, setEditDoc] = React.useState<LibraryDocument | null>(null);
  const [showSettings, setShowSettings] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLibraryDocuments();
      setDocs(data);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setLibraryKey(null);
        setHasAccess(false);
      } else {
        message.error('Failed to load documents.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasAccess) void load();
  }, [hasAccess, load]);

  // Filter
  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (filterCat && d.category !== filterCat) return false;
      if (s && !d.title.toLowerCase().includes(s) && !d.originalName.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [docs, search, filterCat]);

  const categories = React.useMemo(() => {
    const set = new Set(docs.map((d) => d.category).filter(Boolean) as string[]);
    return [...set].sort();
  }, [docs]);

  async function handleDelete(doc: LibraryDocument) {
    Modal.confirm({
      title: 'Delete document',
      content: `Delete "${doc.title}"? This cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteLibraryDocument(doc.id);
          message.success('Document deleted.');
          await load();
        } catch {
          message.error('Failed to delete.');
        }
      },
    });
  }

  async function handleToggleVisible(doc: LibraryDocument) {
    try {
      await updateLibraryDocument(doc.id, { visible: !doc.visible });
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, visible: !d.visible } : d)));
    } catch {
      message.error('Failed to update visibility.');
    }
  }

  function handleClearKey() {
    setLibraryKey(null);
    setHasAccess(false);
    setDocs([]);
  }

  if (!hasAccess) {
    return (
      <>
        <PageTitle>Library</PageTitle>
        <KeyEntryScreen onAccess={() => setHasAccess(true)} />
      </>
    );
  }

  return (
    <>
      <PageTitle>Library</PageTitle>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Header */}
        <Card size="small">
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Document Library
              </Typography.Title>
              <Space wrap>
                {isGM && (
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setShowSettings((v) => !v)}
                  >
                    {showSettings ? 'Close settings' : 'Library settings'}
                  </Button>
                )}
                {!isGM && (
                  <Button icon={<UnlockOutlined />} onClick={handleClearKey} size="small">
                    Change key
                  </Button>
                )}
              </Space>
            </Space>

            {showSettings && isGM && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <SettingsPanel onClose={() => setShowSettings(false)} onReload={load} />
              </>
            )}

            <Divider style={{ margin: '6px 0' }} />

            <Space wrap>
              <Input
                allowClear
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260 }}
              />
              {categories.length > 0 && (
                <Select
                  allowClear
                  placeholder="Filter by category..."
                  value={filterCat || undefined}
                  onChange={(v) => setFilterCat(v ?? '')}
                  style={{ minWidth: 180 }}
                  options={categories.map((c) => ({ label: c, value: c }))}
                />
              )}
              <Tag>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</Tag>
            </Space>
          </Space>
        </Card>

        {/* Upload form (GM only) */}
        {isGM && <UploadForm isMobile={mobileOnly} onUploaded={load} />}

        {/* Document list */}
        {loading ? (
          <Card size="small">
            <Typography.Text type="secondary">Loading...</Typography.Text>
          </Card>
        ) : filtered.length === 0 ? (
          <Card size="small">
            <Empty description={docs.length === 0 ? 'No documents in the library yet.' : 'No documents match your search.'} />
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                isGM={isGM}
                isMobile={mobileOnly}
                onEdit={setEditDoc}
                onDelete={() => void handleDelete(doc)}
                onToggleVisible={() => void handleToggleVisible(doc)}
              />
            ))}
          </div>
        )}
      </Space>

      <EditModal
        doc={editDoc}
        onClose={() => setEditDoc(null)}
        onSaved={() => {
          setEditDoc(null);
          void load();
        }}
      />
    </>
  );
};


export default LibraryPage;
