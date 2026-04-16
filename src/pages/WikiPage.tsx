import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Badge,
  Divider,
  Empty,
  Input,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileImageOutlined,
  LoadingOutlined,
  PlusOutlined,
  PushpinFilled,
  PushpinOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';
import {
  createWikiPage,
  deleteWikiPage,
  listWikiPages,
  setWikiPageVisibility,
  updateWikiPage,
  uploadWikiImage,
} from '@app/api/wiki.api';
import type { WikiPage as WikiPageType } from '@app/api/wiki.api';

const GM_KEY = 'gm_api_key';

// ── Styled components ────────────────────────────────────────────────────────

const Shell = styled.div`
  display: flex;
  gap: 0;
  min-height: calc(100vh - 10rem);
`;

const Sidebar = styled.aside<{ $mobile: boolean }>`
  width: ${(p) => (p.$mobile ? '100%' : '260px')};
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  padding: ${(p) => (p.$mobile ? '12px 0 0' : '16px 0')};
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--additional-background-color);
`;

const SidebarSection = styled.div`
  padding: 4px 0;
`;

const SidebarLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-superLight-color);
  padding: 10px 16px 4px;
`;

const SidebarItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 16px;
  cursor: pointer;
  border-radius: 0;
  background: ${(p) => (p.$active ? 'var(--item-hover-bg)' : 'transparent')};
  border-left: 3px solid ${(p) => (p.$active ? 'var(--primary-color)' : 'transparent')};
  transition: all 0.15s;

  &:hover {
    background: var(--item-hover-bg);
  }
`;

const SidebarItemTitle = styled.span<{ $active?: boolean }>`
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  color: ${(p) => (p.$active ? 'var(--primary-color)' : 'var(--text-main-color)')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const MainArea = styled.main`
  flex: 1;
  min-width: 0;
  padding: 24px 28px;
  background: var(--background-color);
`;

const ArticleBody = styled.div`
  /* Markdown renderer styles */
  color: var(--text-main-color);
  font-size: 15px;
  line-height: 1.8;

  h1, h2, h3, h4 {
    color: var(--heading-color);
    margin: 1.4em 0 0.5em;
    line-height: 1.3;
    &:first-child { margin-top: 0; }
  }
  h1 { font-size: 1.6em; }
  h2 { font-size: 1.3em; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; }
  h3 { font-size: 1.1em; }

  p { margin: 0.7em 0; }

  a { color: var(--primary-color); }

  code {
    background: var(--background-base-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.88em;
    color: var(--primary-color);
  }

  pre {
    background: var(--additional-background-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 14px 16px;
    overflow-x: auto;
    code { background: none; border: none; padding: 0; color: var(--text-main-color); font-size: 0.9em; }
  }

  blockquote {
    margin: 1em 0;
    padding: 8px 16px;
    border-left: 3px solid var(--primary-color);
    background: var(--additional-background-color);
    color: var(--text-light-color);
    border-radius: 0 6px 6px 0;
    p { margin: 0; }
  }

  ul, ol {
    padding-left: 1.6em;
    margin: 0.6em 0;
    li { margin: 0.25em 0; }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.92em;
    th {
      background: var(--additional-background-color);
      color: var(--heading-color);
      padding: 8px 12px;
      text-align: left;
      border: 1px solid var(--border-color);
      font-weight: 600;
    }
    td {
      padding: 7px 12px;
      border: 1px solid var(--border-color);
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: var(--background-base-color);
    }
  }

  hr {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 1.5em 0;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 0.6em 0;
    display: block;
    border: 1px solid var(--border-color);
  }

  strong { color: var(--text-dark-color); }
  em { color: var(--text-light-color); }
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding: 6px 8px;
  background: var(--additional-background-color);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
`;

const ToolbarBtn = styled.button`
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-light-color);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  &:hover {
    background: var(--item-hover-bg);
    border-color: var(--border-color);
    color: var(--text-main-color);
  }
`;

const EditorGrid = styled.div<{ $split: boolean }>`
  display: grid;
  grid-template-columns: ${(p) => (p.$split ? '1fr 1fr' : '1fr')};
  gap: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const EditorPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewPane = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--additional-background-color);
  min-height: 320px;
  overflow-y: auto;
`;

// Renderer customizado: resolve URLs relativas de imagens contra o backend
const mdComponents = {
  img: ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...rest} src={resolveApiUrl(src) ?? src} alt={alt ?? ''} />
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByCategory(pages: WikiPageType[]) {
  const pinned = pages.filter((p) => p.pinned);
  const unpinned = pages.filter((p) => !p.pinned);

  const map = new Map<string, WikiPageType[]>();
  for (const p of unpinned) {
  const key = p.category?.trim() || 'General';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return { pinned, byCategory: map };
}

// ── Componente principal ─────────────────────────────────────────────────────

export const WikiPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY));

  const [pages, setPages] = React.useState<WikiPageType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // navegação
  const [activeCat, setActiveCat] = React.useState<string | null>(null); // null = todas
  const [openId, setOpenId] = React.useState<number | null>(null);

  // editor
  const [editing, setEditing] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [isNew, setIsNew] = React.useState(false);

  // form fields
  const [fTitle, setFTitle] = React.useState('');
  const [fCategory, setFCategory] = React.useState('');
  const [fContent, setFContent] = React.useState('');
  const [fPinned, setFPinned] = React.useState(false);
  const [fVisible, setFVisible] = React.useState(true);

  // editor refs & upload
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const imgInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const openPage = React.useMemo(
    () => (openId != null ? pages.find((p) => p.id === openId) ?? null : null),
    [pages, openId],
  );

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listWikiPages();
      setPages(data);
    } catch {
      message.error('Failed to load wiki');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  // popular form quando abrir edição
  React.useEffect(() => {
    if (!openPage || !editing) return;
    setFTitle(openPage.title ?? '');
    setFCategory(openPage.category ?? '');
    setFContent(openPage.content ?? '');
    setFPinned(openPage.pinned ?? false);
    setFVisible(openPage.visible ?? true);
  }, [openPage?.id, editing]);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();

  const visible = React.useMemo(
    () =>
      pages.filter((p) => {
        if (!isGM && !p.visible) return false;
        if (activeCat && activeCat !== '__pinned') {
          const cat = p.category?.trim() || 'General';
          if (cat !== activeCat) return false;
        }
        if (activeCat === '__pinned' && !p.pinned) return false;
        if (!q) return true;
        return (
          (p.title ?? '').toLowerCase().includes(q) ||
          (p.content ?? '').toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q)
        );
      }),
    [pages, isGM, activeCat, q],
  );

  const { pinned, byCategory } = React.useMemo(() => groupByCategory(pages.filter((p) => isGM || p.visible)), [pages, isGM]);
  const categories = React.useMemo(() => Array.from(byCategory.keys()).sort(), [byCategory]);

  // ── Ações ─────────────────────────────────────────────────────────────────
  function startNew() {
    setFTitle('');
    setFCategory(activeCat && activeCat !== '__pinned' ? activeCat : '');
    setFContent('');
    setFPinned(false);
    setFVisible(true);
    setIsNew(true);
    setEditing(true);
    setOpenId(null);
    setPreview(false);
  }

  function cancelEdit() {
    setEditing(false);
    setIsNew(false);
    setPreview(false);
  }

  async function handleSave() {
    if (!fTitle.trim()) { message.warning('Title required'); return; }
    try {
      if (isNew) {
        const created = await createWikiPage({
          title: fTitle.trim(),
          category: fCategory.trim() || null,
          content: fContent.trim() || null,
          pinned: fPinned,
          visible: fVisible,
        });
        await load();
        setOpenId(created.id);
  message.success('Article created');
      } else if (openId) {
        await updateWikiPage(openId, {
          title: fTitle.trim(),
          category: fCategory.trim() || null,
          content: fContent.trim() || null,
          pinned: fPinned,
          visible: fVisible,
        });
        await load();
        message.success('Article updated');
      }
      setEditing(false);
      setIsNew(false);
    } catch {
      message.error('Failed to save (GM key?)');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteWikiPage(id);
      if (openId === id) setOpenId(null);
      await load();
  message.success('Article removed');
    } catch {
      message.error('Failed to remove');
    }
  }

  async function handleToggleVisible(page: WikiPageType) {
    try {
      await setWikiPageVisibility(page.id, !page.visible);
      await load();
    } catch {
      message.error('Failed to change visibility');
    }
  }

  async function handleTogglePin(page: WikiPageType) {
    try {
      await updateWikiPage(page.id, { pinned: !page.pinned });
      await load();
    } catch {
      message.error('Failed to change pinning');
    }
  }

  // ── Editor helpers ────────────────────────────────────────────────────────
  function insertAtCursor(snippet: string) {
    const ta = textareaRef.current;
    if (!ta) { setFContent((c) => c + snippet); return; }
    const start = ta.selectionStart ?? fContent.length;
    const end = ta.selectionEnd ?? fContent.length;
    const next = fContent.slice(0, start) + snippet + fContent.slice(end);
    setFContent(next);
    // reposicionar cursor após o snippet
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }

  function insertMarkdown(before: string, after = '') {
    const ta = textareaRef.current;
    if (!ta) { insertAtCursor(before + after); return; }
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const selected = fContent.slice(start, end);
    const snippet = before + (selected || 'text') + after;
    const next = fContent.slice(0, start) + snippet + fContent.slice(end);
    setFContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const url = await uploadWikiImage(file);
      const alt = file.name.replace(/\.[^.]+$/, '');
      insertAtCursor(`\n![${alt}](${url})\n`);
  message.success('Image inserted');
    } catch {
      message.error('Failed to upload image (GM key?)');
    } finally {
      setUploading(false);
    }
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = (
    <Sidebar $mobile={mobileOnly}>
      <div style={{ padding: '0 12px 10px' }}>
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--text-superLight-color)' }} />}
          placeholder="Search articles…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
          allowClear
          size="small"
          style={{ borderRadius: 6 }}
        />
      </div>

      <SidebarItem $active={activeCat === null} onClick={() => { setActiveCat(null); setOpenId(null); setEditing(false); }}>
          <SidebarItemTitle $active={activeCat === null}>
          <BookOutlined style={{ marginRight: 6 }} />All articles
        </SidebarItemTitle>
        <Badge count={pages.filter((p) => isGM || p.visible).length} showZero
          style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-light-color)', boxShadow: 'none', fontSize: 10 }} />
      </SidebarItem>

      {pinned.length > 0 && (
        <>
      <SidebarLabel>Pinned</SidebarLabel>
          <SidebarItem $active={activeCat === '__pinned'} onClick={() => { setActiveCat('__pinned'); setOpenId(null); setEditing(false); }}>
              <SidebarItemTitle $active={activeCat === '__pinned'}>
              <PushpinFilled style={{ marginRight: 6, color: 'var(--warning-color)' }} />Pinned articles
            </SidebarItemTitle>
            <Badge count={pinned.length} showZero
              style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-light-color)', boxShadow: 'none', fontSize: 10 }} />
          </SidebarItem>
        </>
      )}

  {categories.length > 0 && <SidebarLabel>Categories</SidebarLabel>}
      {categories.map((cat) => {
        const count = (byCategory.get(cat) ?? []).length;
        const isActive = activeCat === cat;
        return (
          <SidebarItem key={cat} $active={isActive} onClick={() => { setActiveCat(cat); setOpenId(null); setEditing(false); }}>
            <SidebarItemTitle $active={isActive}>{cat}</SidebarItemTitle>
            <Badge count={count} showZero
              style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-light-color)', boxShadow: 'none', fontSize: 10 }} />
          </SidebarItem>
        );
      })}

      {isGM && (
        <div style={{ marginTop: 'auto', padding: '12px 12px 4px' }}>
          <Button type="primary" size="small" block icon={<PlusOutlined />} onClick={startNew}>
            New Article
          </Button>
        </div>
      )}
    </Sidebar>
  );

  // ── Article list (when no article open) ──────────────────────────────────
  const ArticleList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {visible.length === 0 && (
        <Empty description={q ? 'No articles found.' : 'No articles in this category.'} style={{ marginTop: 48 }} />
      )}
      {visible.map((page) => (
        <div
          key={page.id}
          onClick={() => { setOpenId(page.id); setEditing(false); }}
          style={{
            padding: '14px 18px',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            cursor: 'pointer',
            background: 'var(--additional-background-color)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-color)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Space size={6}>
              {page.pinned && <PushpinFilled style={{ color: 'var(--warning-color)', fontSize: 12 }} />}
              <Typography.Text strong style={{ color: 'var(--text-main-color)', fontSize: 14 }}>
                {page.title}
              </Typography.Text>
              {page.category && <Tag style={{ margin: 0, fontSize: 11 }}>{page.category}</Tag>}
              {isGM && !page.visible && <Tag color="red" style={{ margin: 0, fontSize: 11 }}>Hidden</Tag>}
            </Space>
            <Typography.Text style={{ fontSize: 12, color: 'var(--text-superLight-color)' }}>
              {page.content ? `${page.content.slice(0, 80).replace(/[#*`>\n]/g, ' ').trim()}…` : 'No content'}
            </Typography.Text>
          </Space>
        </div>
      ))}
    </div>
  );

  // ── Article view ─────────────────────────────────────────────────────────
  const ArticleView = openPage && !editing ? (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', marginBottom: 6 }} size={8}>
        <Space size={8} wrap>
          {openPage.pinned && <PushpinFilled style={{ color: 'var(--warning-color)' }} />}
          <Typography.Title level={3} style={{ margin: 0, color: 'var(--heading-color)' }}>
            {openPage.title}
          </Typography.Title>
          {openPage.category && <Tag>{openPage.category}</Tag>}
          {isGM && !openPage.visible && <Tag color="red">Hidden</Tag>}
        </Space>

        {isGM && (
          <Space size={6}>
            <Tooltip title={openPage.pinned ? 'Unpin' : 'Pin'}>
              <Button size="small" type="text"
                icon={openPage.pinned ? <PushpinFilled style={{ color: 'var(--warning-color)' }} /> : <PushpinOutlined />}
                onClick={() => void handleTogglePin(openPage)} />
            </Tooltip>
            <Tooltip title={openPage.visible ? 'Hide' : 'Publish'}>
              <Button size="small" type="text"
                icon={openPage.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={() => void handleToggleVisible(openPage)} />
            </Tooltip>
            <Button size="small" icon={<EditOutlined />}
              onClick={() => { setIsNew(false); setEditing(true); setPreview(false); }}>
              Edit
            </Button>
            <Popconfirm title="Remove this article?" okText="Yes" cancelText="No"
              onConfirm={() => void handleDelete(openPage.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )}
      </Space>

      <Divider style={{ margin: '12px 0 20px' }} />

      {openPage.content ? (
        <ArticleBody>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{openPage.content}</ReactMarkdown>
        </ArticleBody>
      ) : (
  <Empty description="Article has no content." style={{ marginTop: 40 }} />
      )}
    </div>
  ) : null;

  // ── Editor ────────────────────────────────────────────────────────────────
  const Editor = editing ? (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }} wrap>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--heading-color)' }}>
          {isNew ? 'New Article' : `Editing: ${openPage?.title ?? ''}`}
        </Typography.Title>
        <Space size={6}>
          <Button size="small" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button size="small" onClick={cancelEdit}>Cancel</Button>
          <Button type="primary" size="small" onClick={() => void handleSave()}>Save</Button>
        </Space>
      </Space>

      <Space direction="vertical" size={10} style={{ width: '100%', marginBottom: 16 }}>
        <Space wrap size={10} style={{ width: '100%' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: 'var(--text-light-color)', marginBottom: 4 }}>Title *</div>
            <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Article title" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: 'var(--text-light-color)', marginBottom: 4 }}>Category</div>
            <Input value={fCategory} onChange={(e) => setFCategory(e.target.value)} placeholder="E.g.: Techniques, Worlds…" />
          </div>
        </Space>

        <Space size={24}>
          <Space size={8}>
            <PushpinOutlined style={{ color: 'var(--warning-color)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-main-color)' }}>Pinned</span>
            <Switch size="small" checked={fPinned} onChange={setFPinned} />
          </Space>
          <Space size={8}>
            <EyeOutlined />
            <span style={{ fontSize: 13, color: 'var(--text-main-color)' }}>Visible</span>
            <Switch size="small" checked={fVisible} onChange={setFVisible} />
          </Space>
        </Space>
      </Space>

      <EditorGrid $split={preview}>
        <EditorPane>
            <div style={{ fontSize: 12, color: 'var(--text-light-color)' }}>
            Content — supports <strong style={{ color: 'var(--primary-color)' }}>Markdown</strong>
          </div>

          <div>
            <EditorToolbar>
              <ToolbarBtn type="button" onClick={() => insertMarkdown('**', '**')} title="Bold"><b>B</b></ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertMarkdown('*', '*')} title="Italic"><i>I</i></ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertMarkdown('`', '`')} title="Code"><code style={{ fontSize: 11 }}>{'<>'}</code></ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertAtCursor('\n## ')} title="Subtitle">H2</ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertAtCursor('\n### ')} title="Smaller heading">H3</ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertAtCursor('\n- ')} title="List">— list</ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertAtCursor('\n> ')} title="Blockquote">" bq.</ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertAtCursor('\n```\n\n```\n')} title="Code block">{'```'}</ToolbarBtn>
              <ToolbarBtn type="button" onClick={() => insertAtCursor('\n---\n')} title="Divider">—</ToolbarBtn>
              <ToolbarBtn
                type="button"
                onClick={() => imgInputRef.current?.click()}
                title="Insert image"
                disabled={uploading}
                style={{ color: 'var(--primary-color)', fontWeight: 600 }}
              >
                {uploading ? <LoadingOutlined /> : <FileImageOutlined />}
                {' '}{uploading ? 'Uploading…' : 'Image'}
              </ToolbarBtn>
            </EditorToolbar>

            <input
              ref={imgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => void handleImageUpload(e)}
            />

            <textarea
              ref={textareaRef}
              value={fContent}
              onChange={(e) => setFContent(e.target.value)}
              rows={preview ? 24 : 20}
                placeholder={'# Title\n\nWrite the content in Markdown...\n\n## Section\n\n- Item 1\n- Item 2\n\n> Important quote'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '0 0 8px 8px',
                border: '1px solid var(--border-color)',
                background: 'var(--additional-background-color)',
                color: 'var(--text-main-color)',
                fontSize: 13,
                fontFamily: 'monospace',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </EditorPane>

        {preview && (
          <EditorPane>
                  <div style={{ fontSize: 12, color: 'var(--text-light-color)' }}>Preview</div>
            <PreviewPane>
                  {fContent.trim() ? (
                <ArticleBody>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{fContent}</ReactMarkdown>
                </ArticleBody>
                ) : (
                <span style={{ color: 'var(--text-superLight-color)', fontSize: 13 }}>
                  Start typing to see the preview…
                </span>
              )}
            </PreviewPane>
          </EditorPane>
        )}
      </EditorGrid>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  const mainContent = editing ? Editor : openPage ? ArticleView : ArticleList;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Wiki</PageTitle>
        {SidebarContent}
        <div style={{ padding: '16px' }}>
          {loading ? <Spinner /> : mainContent}
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle>Wiki</PageTitle>
      <Shell>
        {SidebarContent}
        <MainArea>
          {loading ? <Spinner /> : mainContent}
        </MainArea>
      </Shell>
    </>
  );
};

export default WikiPage;
