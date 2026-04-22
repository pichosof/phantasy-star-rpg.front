/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ReactReader } from 'react-reader';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
  Button,
  Card,
  Divider,
  Empty,
  Input,
  message,
  Modal,
  Progress,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import { apiErrorMessage } from '../utils/api-error';
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
  downloadDocument,
  fetchDocumentArrayBuffer,
  fetchDocumentBlobUrl,
  formatBytes,
  getLibraryKey,
  getLibrarySettings,
  LibraryDocument,
  listLibraryDocuments,
  mimeLabel,
  setLibraryKey,
  setLibrarySettings,
  updateLibraryDocument,
  uploadLibraryDocument,
} from '@app/api/library.api';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { UPLOAD_MAX_MB } from '@app/config/config';
import {
  dividerMd,
  flex1Min0,
  flexCenter,
  flexCenterFull,
  flexRowToCol,
  flexShrink0,
  gridGap10,
  m0,
  mb6,
  spaceBetween,
  textMd,
  textSm,
  textXs,
  w100,
  wordBreakAll,
  wrapAnywhere,
} from '@app/styles/styleUtils';

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
  'application/x-mobipocket-ebook',
  'application/mobi',
  'text/markdown',
  '.mobi',
].join(',');

const VIEWABLE_MIME = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
  'application/mobi',
]);

const MOBI_MIMES = new Set(['application/x-mobipocket-ebook', 'application/mobi']);

// ── Per-format viewers ─────────────────────────────────────────────────────────

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

const DocxViewer: React.FC<{ url: string; isMobile: boolean }> = ({ url, isMobile }) => {
  const [html, setHtml] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => import('mammoth').then((m) => m.convertToHtml({ arrayBuffer: buf })))
      .then(({ value }) => {
        if (!cancelled) setHtml(value);
      })
      .catch(() => {
        if (!cancelled) setErr('Failed to render document.');
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (err) return <div style={{ padding: 24, color: 'red' }}>{err}</div>;
  if (!html)
    return (
      <div style={flexCenterFull}>
        <Spin />
      </div>
    );
  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: '#fff',
        lineHeight: 1.7,
        padding: isMobile ? '16px' : '24px 40px',
        fontSize: isMobile ? 15 : 16,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const TxtViewer: React.FC<{ url: string; isMobile: boolean }> = ({ url, isMobile }) => {
  const [text, setText] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.text())
      .then((t) => {
        if (!cancelled) setText(t);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!text)
    return (
      <div style={flexCenterFull}>
        <Spin />
      </div>
    );
  return (
    <pre
      style={{
        height: '100%',
        overflowY: 'auto',
        margin: 0,
        padding: isMobile ? '12px 14px' : '24px 32px',
        fontFamily: 'monospace',
        fontSize: isMobile ? 13 : 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        background: '#fafafa',
      }}
    >
      {text}
    </pre>
  );
};

// ── MOBI Viewer ────────────────────────────────────────────────────────────────
// Most modern MOBI files are KF8 (EPUB-based) and are handled by epub.js.
// Older Palm-MOBI files are not supported by epub.js; we catch the error and
// offer a download fallback instead of a blank or broken viewer.

interface MobiViewerProps {
  url: string | ArrayBuffer;
  title: string;
  isMobile: boolean;
  onDownload: () => void;
}

class MobiErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  componentDidCatch() {
    this.setState({ failed: true });
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const MobiViewer: React.FC<MobiViewerProps> = ({ url, title, isMobile, onDownload }) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <Typography.Text type="secondary" style={{ maxWidth: 360 }}>
          This MOBI file uses an older format that cannot be displayed in the browser. Download it and open with an
          e-reader (Calibre, KoReader, etc.).
        </Typography.Text>
        <Button type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
          Download to read
        </Button>
      </div>
    );
  }

  return (
    <MobiErrorBoundary onError={() => setFailed(true)}>
      <EpubViewer url={url} title={title} isMobile={isMobile} />
    </MobiErrorBoundary>
  );
};

// ── EPUB Viewer ────────────────────────────────────────────────────────────────

type EpubTheme = 'light' | 'sepia' | 'dark';

interface EpubViewerProps {
  url: string | ArrayBuffer;
  title: string;
  isMobile: boolean;
}

const EpubViewer: React.FC<EpubViewerProps> = ({ url, title, isMobile }) => {
  const [location, setLocation] = React.useState<string | number>(0);
  const [toc, setToc] = React.useState<{ label: string; href: string }[]>([]);
  const [showToc, setShowToc] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(100);
  const [theme, setTheme] = React.useState<EpubTheme>('light');
  const renditionRef = React.useRef<any>(null);

  const THEME_LABELS: Record<EpubTheme, string> = { light: 'Light', sepia: 'Sepia', dark: 'Dark' };
  const THEME_SHORT: Record<EpubTheme, string> = { light: 'L', sepia: 'S', dark: 'D' };

  const bg = { light: '#ffffff', sepia: '#f4ecd8', dark: '#1a1a1a' }[theme];
  const bar = { light: '#fafafa', sepia: '#ede3c8', dark: '#111111' }[theme];
  const border = theme === 'dark' ? '#333' : '#e8e8e8';
  const fgMuted = theme === 'dark' ? '#aaa' : '#555';

  function changeFontSize(delta: number) {
    const next = Math.max(70, Math.min(200, fontSize + delta));
    setFontSize(next);
    renditionRef.current?.themes.fontSize(`${next}%`);
  }

  function changeTheme(t: EpubTheme) {
    setTheme(t);
    renditionRef.current?.themes.select(t);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: isMobile ? 4 : 8,
          padding: isMobile ? '5px 8px' : '6px 12px',
          borderBottom: `1px solid ${border}`,
          background: bar,
        }}
      >
        <Button
          size="small"
          type={showToc ? 'primary' : 'default'}
          onClick={() => setShowToc((v) => !v)}
          disabled={toc.length === 0}
        >
          {isMobile ? '≡' : 'Contents'}
        </Button>

        <div style={{ flex: 1 }} />

        {/* Font size */}
        <Space size={2}>
          <Button size="small" onClick={() => changeFontSize(-10)}>
            A−
          </Button>
          {!isMobile && (
            <span style={{ fontSize: 12, minWidth: 34, textAlign: 'center', color: fgMuted }}>{fontSize}%</span>
          )}
          <Button size="small" onClick={() => changeFontSize(10)}>
            A+
          </Button>
        </Space>

        {/* Theme */}
        <Space size={2}>
          {(['light', 'sepia', 'dark'] as EpubTheme[]).map((t) => (
            <Button key={t} size="small" type={theme === t ? 'primary' : 'default'} onClick={() => changeTheme(t)}>
              {isMobile ? THEME_SHORT[t] : THEME_LABELS[t]}
            </Button>
          ))}
        </Space>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* TOC — overlay on mobile, sidebar on desktop */}
        {showToc && (
          <div
            style={{
              ...(isMobile
                ? {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 10,
                    boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
                  }
                : { position: 'relative', borderRight: `1px solid ${border}` }),
              width: isMobile ? '80vw' : 220,
              maxWidth: 320,
              overflowY: 'auto',
              padding: '8px 0',
              background: bar,
            }}
          >
            {isMobile && (
              <div
                style={{
                  padding: '6px 14px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography.Text strong style={{ color: fgMuted, fontSize: 13 }}>
                  Contents
                </Typography.Text>
                <Button size="small" onClick={() => setShowToc(false)}>
                  ✕
                </Button>
              </div>
            )}
            {toc.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setLocation(item.href);
                  setShowToc(false);
                }}
                style={{
                  padding: isMobile ? '10px 16px' : '6px 14px',
                  cursor: 'pointer',
                  fontSize: isMobile ? 15 : 13,
                  color: theme === 'dark' ? '#ccc' : theme === 'sepia' ? '#5b4636' : '#333',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme === 'dark' ? '#222' : '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {item.label.trim()}
              </div>
            ))}
          </div>
        )}

        {/* Dim overlay when TOC open on mobile */}
        {showToc && isMobile && (
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9 }}
            onClick={() => setShowToc(false)}
          />
        )}

        {/* Reader */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <ReactReader
            url={url}
            title={title}
            location={location}
            locationChanged={(loc) => setLocation(loc)}
            tocChanged={(t) => setToc(t as { label: string; href: string }[])}
            getRendition={(rendition) => {
              renditionRef.current = rendition;
              rendition.themes.register('light', { body: { color: '#111', background: '#fff' } });
              rendition.themes.register('sepia', { body: { color: '#5b4636', background: '#f4ecd8' } });
              rendition.themes.register('dark', { body: { color: '#ddd', background: '#1a1a1a' } });
              rendition.themes.select('light');
              rendition.themes.fontSize(`${fontSize}%`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Document Viewer Modal ──────────────────────────────────────────────────────

interface DocumentViewerModalProps {
  doc: LibraryDocument | null;
  onClose: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose }) => {
  const { mobileOnly, isTablet } = useResponsive();
  // EPUB/MOBI use ArrayBuffer (epub.js is more reliable with buffers than blob URLs).
  // PDF/DOCX/TXT use a blob URL so the viewer can stream or fetch by URL.
  const [content, setContent] = React.useState<string | ArrayBuffer | null>(null);
  const [loading, setLoading] = React.useState(false);

  const needsBuffer = (mime: string) => mime === 'application/epub+zip' || MOBI_MIMES.has(mime);

  React.useEffect(() => {
    if (!doc) {
      setContent(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetch$ = needsBuffer(doc.mime) ? fetchDocumentArrayBuffer(doc) : fetchDocumentBlobUrl(doc);
    fetch$
      .then((result) => {
        if (!cancelled) setContent(result);
      })
      .catch((e) => message.error(apiErrorMessage(e, 'Failed to load document.')))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
      setContent((prev) => {
        if (typeof prev === 'string') URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const modalWidth = mobileOnly ? '100vw' : isTablet ? '98vw' : '92vw';
  const modalTop = mobileOnly ? 0 : isTablet ? 8 : 20;
  // 55 px ≈ Ant Design modal header height
  const bodyHeight = mobileOnly ? 'calc(100dvh - 55px)' : '85vh';

  return (
    <Modal
      open={!!doc}
      onCancel={onClose}
      title={doc?.title ?? 'Document'}
      footer={null}
      width={modalWidth}
      style={{ top: modalTop, padding: 0, margin: mobileOnly ? 0 : undefined, maxWidth: '100vw' }}
      bodyStyle={{ padding: 0, height: bodyHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      destroyOnClose
    >
      {loading && (
        <div style={{ ...flexCenter, flex: 1 }}>
          <Spin size="large" tip="Loading document…" />
        </div>
      )}
      {!loading &&
        content &&
        doc &&
        (() => {
          const mime = doc.mime;
          if (mime === 'application/epub+zip')
            return <EpubViewer url={content as ArrayBuffer} title={doc.title} isMobile={mobileOnly} />;
          if (MOBI_MIMES.has(mime))
            return (
              <MobiViewer
                url={content as ArrayBuffer}
                title={doc.title}
                isMobile={mobileOnly}
                onDownload={() => {
                  void downloadDocument(doc);
                  onClose();
                }}
              />
            );
          if (mime === 'application/pdf') return <PdfViewer url={content as string} />;
          if (
            mime === 'application/msword' ||
            mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          )
            return <DocxViewer url={content as string} isMobile={mobileOnly} />;
          return <TxtViewer url={content as string} isMobile={mobileOnly} />;
        })()}
    </Modal>
  );
};

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
      await listLibraryDocuments();
      onAccess();
    } catch (e: any) {
      setLibraryKey(null);
      if (e?.response?.status === 429) {
        const retry = e?.response?.data?.retryAfterSeconds;
        message.error(
          retry ? `Too many attempts. Try again in ${retry}s.` : 'Too many attempts. Please wait before trying again.',
        );
      } else {
        message.error('Invalid library key.');
      }
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
        <Space direction="vertical" size={20} style={w100}>
          <LockOutlined style={{ fontSize: 48, color: 'var(--primary-color)' }} />
          <div>
            <Typography.Title level={4} style={m0}>
              Library Access
            </Typography.Title>
            <Typography.Text type="secondary">Enter the access key provided by your Game Master.</Typography.Text>
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
  onView: (doc: LibraryDocument) => void;
}

const DocCard: React.FC<DocCardProps> = ({ doc, isGM, isMobile, onEdit, onDelete, onToggleVisible, onView }) => {
  const [downloading, setDownloading] = React.useState(false);
  const canView = VIEWABLE_MIME.has(doc.mime);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadDocument(doc);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Download failed.'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card size="small" style={{ opacity: !doc.visible && isGM ? 0.65 : 1 }}>
      {/* Header row — stacks on mobile so long titles don't crush the action buttons */}
      <div style={{ ...flexRowToCol(isMobile), ...mb6 }}>
        {/* Title + badges */}
        <Space size={6} wrap style={flex1Min0}>
          <FileOutlined style={flexShrink0} />
          <Typography.Text strong style={wrapAnywhere}>
            {doc.title}
          </Typography.Text>
          <Tag color={mimeColor(doc.mime)} style={m0}>
            {mimeLabel(doc.mime)}
          </Tag>
          {doc.category && <Tag style={m0}>{doc.category}</Tag>}
          {isGM && !doc.visible && (
            <Tag color="red" style={m0}>
              Hidden
            </Tag>
          )}
        </Space>

        {/* Action buttons */}
        <Space size={6} wrap style={{ ...flexShrink0, justifyContent: isMobile ? 'flex-end' : undefined }}>
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
          {canView && (
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => onView(doc)}>
              {!isMobile && 'Open'}
            </Button>
          )}
          <Button
            size="small"
            type={canView ? 'default' : 'primary'}
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={() => void handleDownload()}
          >
            {!isMobile && (canView ? 'Download' : 'Open')}
          </Button>
        </Space>
      </div>

      {doc.description && (
        <Typography.Text type="secondary" style={textMd}>
          {doc.description}
        </Typography.Text>
      )}
      <div style={{ marginTop: doc.description ? 6 : 0 }}>
        <Typography.Text type="secondary" style={{ ...textXs, ...wordBreakAll }}>
          {formatBytes(doc.size)} · {doc.originalName}
        </Typography.Text>
      </div>
    </Card>
  );
};

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
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!doc} onCancel={onClose} title="Edit Document" footer={null} destroyOnClose>
      <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 8 }}>
        <div>
          <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
            Title *
          </Typography.Text>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
            Category
          </Typography.Text>
          <Select
            allowClear
            style={w100}
            value={category || undefined}
            onChange={(v) => setCategory(v ?? '')}
            placeholder="Select category..."
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
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
  const [hasKey, setHasKey] = React.useState<boolean | null>(null);
  const [newKey, setNewKey] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  React.useEffect(() => {
    getLibrarySettings()
      .then((s) => setHasKey(s.hasPlayerKey))
      .catch((e) => message.error(apiErrorMessage(e, 'Failed to load settings.')));
  }, []);

  async function save() {
    const k = newKey.trim();
    if (!k) return message.warning('Enter a key to save, or use "Remove key" to lock the library.');
    setSaving(true);
    try {
      await setLibrarySettings(k);
      message.success('Library key updated. The key is now stored as a secure hash.');
      setNewKey('');
      onClose();
      onReload();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update key.'));
    } finally {
      setSaving(false);
    }
  }

  async function clearKey() {
    setClearing(true);
    try {
      await setLibrarySettings(null);
      message.success('Library key removed. Library is now locked for all players.');
      onClose();
      onReload();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove key.'));
    } finally {
      setClearing(false);
    }
  }

  return (
    <Space direction="vertical" size={14} style={w100}>
      <Typography.Text type="secondary" style={textMd}>
        Set the access key players must enter to unlock the library. The key is stored as a <strong>scrypt hash</strong>{' '}
        — it cannot be read back. Min 12 chars, 2+ character classes.
      </Typography.Text>

      {hasKey !== null && (
        <Tag color={hasKey ? 'green' : 'red'} icon={hasKey ? <UnlockOutlined /> : <LockOutlined />}>
          {hasKey ? 'A player key is currently set' : 'No player key set — library locked for players'}
        </Tag>
      )}

      <Input.Password
        placeholder="New player access key (min 12 chars)..."
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        onPressEnter={() => void save()}
        prefix={<KeyOutlined />}
      />

      <Space wrap>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void save()}>
          {hasKey ? 'Change key' : 'Set key'}
        </Button>
        {hasKey && (
          <Button danger loading={clearing} onClick={() => void clearKey()}>
            Remove key (lock library)
          </Button>
        )}
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

interface UploadEntry {
  name: string;
  percent: number;
  status: 'uploading' | 'done' | 'error';
}

const UploadForm: React.FC<UploadFormProps> = ({ isMobile, onUploaded }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [uploads, setUploads] = React.useState<Map<string, UploadEntry>>(new Map());

  const activeCount = React.useMemo(
    () => Array.from(uploads.values()).filter((u) => u.status === 'uploading').length,
    [uploads],
  );

  function setEntry(uid: string, patch: Partial<UploadEntry>) {
    setUploads((prev) => {
      const next = new Map(prev);
      const cur = next.get(uid);
      if (cur) next.set(uid, { ...cur, ...patch });
      return next;
    });
  }

  function removeEntry(uid: string) {
    setUploads((prev) => {
      const next = new Map(prev);
      next.delete(uid);
      return next;
    });
  }

  function handleUpload(options: RcCustomRequestOptions) {
    const { onError, onSuccess, file } = options;
    const f = file as File & { uid: string };
    const uid = f.uid;

    setUploads((prev) => new Map(prev).set(uid, { name: f.name, percent: 0, status: 'uploading' }));

    const meta = {
      title: title.trim() || f.name.replace(/\.[^.]+$/, ''),
      description: description.trim() || undefined,
      category: category || undefined,
    };

    uploadLibraryDocument(f, meta, (pct) => setEntry(uid, { percent: pct }))
      .then(() => {
        onSuccess?.({}, undefined as unknown as XMLHttpRequest);
        setEntry(uid, { percent: 100, status: 'done' });
        onUploaded();
        setTimeout(() => removeEntry(uid), 2500);
      })
      .catch((err: unknown) => {
        onError?.(err as Error);
        message.error(apiErrorMessage(err, `Upload failed: ${f.name}`));
        setEntry(uid, { status: 'error' });
        setTimeout(() => removeEntry(uid), 5000);
      });
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <PlusOutlined /> Upload documents
        </Space>
      }
    >
      <Space direction="vertical" size={10} style={w100}>
        <Space wrap style={w100}>
          <Input
            placeholder="Title (optional — each file defaults to its filename)"
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
          placeholder="Short description (optional — applied to all files)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Upload
          accept={ACCEPTED}
          multiple={true}
          showUploadList={false}
          customRequest={(opts: RcCustomRequestOptions) => handleUpload(opts)}
        >
          <Button type="primary" icon={<PlusOutlined />} loading={activeCount > 0} block={isMobile}>
            {activeCount > 0
              ? `Uploading ${activeCount} file${activeCount !== 1 ? 's' : ''}…`
              : 'Choose & upload files'}
          </Button>
        </Upload>
        {uploads.size > 0 && (
          <Space direction="vertical" size={6} style={w100}>
            {Array.from(uploads.entries()).map(([uid, entry]) => (
              <div key={uid}>
                <Typography.Text style={textSm} ellipsis>
                  {entry.name}
                </Typography.Text>
                <Progress
                  percent={entry.percent}
                  size="small"
                  status={entry.status === 'error' ? 'exception' : entry.status === 'done' ? 'success' : 'active'}
                />
              </div>
            ))}
          </Space>
        )}
        <Typography.Text type="secondary" style={textXs}>
          PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, EPUB · max {UPLOAD_MAX_MB} MB per file
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
  const [viewDoc, setViewDoc] = React.useState<LibraryDocument | null>(null);
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
        message.error(apiErrorMessage(e, 'Failed to load documents.'));
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
    return Array.from(set).sort();
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
        } catch (e) {
          message.error(apiErrorMessage(e, 'Failed to delete.'));
        }
      },
    });
  }

  async function handleToggleVisible(doc: LibraryDocument) {
    try {
      await updateLibraryDocument(doc.id, { visible: !doc.visible });
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, visible: !d.visible } : d)));
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to update visibility.'));
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

      <Space direction="vertical" size={16} style={w100}>
        {/* Header */}
        <Card size="small">
          <Space direction="vertical" size={10} style={w100}>
            <Space style={spaceBetween}>
              <Typography.Title level={5} style={m0}>
                Document Library
              </Typography.Title>
              <Space wrap>
                {isGM && (
                  <Button icon={<SettingOutlined />} onClick={() => setShowSettings((v) => !v)}>
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
                <Divider style={dividerMd} />
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
              <Tag>
                {filtered.length} document{filtered.length !== 1 ? 's' : ''}
              </Tag>
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
            <Empty
              description={docs.length === 0 ? 'No documents in the library yet.' : 'No documents match your search.'}
            />
          </Card>
        ) : (
          <div style={gridGap10}>
            {filtered.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                isGM={isGM}
                isMobile={mobileOnly}
                onEdit={setEditDoc}
                onDelete={() => void handleDelete(doc)}
                onToggleVisible={() => void handleToggleVisible(doc)}
                onView={setViewDoc}
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

      <DocumentViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} />
    </>
  );
};

export default LibraryPage;
