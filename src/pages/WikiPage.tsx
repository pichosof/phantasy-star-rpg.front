import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge, Divider, Empty, Input, Popconfirm, Space, Switch, Tag, Tooltip, Typography, message } from 'antd';
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
import { apiErrorMessage } from '../utils/api-error';
import { w100, spaceBetween, hiddenInput } from '@app/styles/styleUtils';
import * as S from './WikiPage.styles';

const GM_KEY = 'gm_api_key';

// ── Styled components ────────────────────────────────────────────────────────

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    () => (openId != null ? (pages.find((p) => p.id === openId) ?? null) : null),
    [pages, openId],
  );

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listWikiPages();
      setPages(data);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load wiki'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // popular form quando abrir edição
  React.useEffect(() => {
    if (!openPage || !editing) return;
    setFTitle(openPage.title ?? '');
    setFCategory(openPage.category ?? '');
    setFContent(openPage.content ?? '');
    setFPinned(openPage.pinned ?? false);
    setFVisible(openPage.visible ?? true);
  }, [openPage?.id, editing]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const { pinned, byCategory } = React.useMemo(
    () => groupByCategory(pages.filter((p) => isGM || p.visible)),
    [pages, isGM],
  );
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
    if (!fTitle.trim()) {
      message.warning('Title required');
      return;
    }
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
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save (GM key?)'));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteWikiPage(id);
      if (openId === id) setOpenId(null);
      await load();
      message.success('Article removed');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove'));
    }
  }

  async function handleToggleVisible(page: WikiPageType) {
    try {
      await setWikiPageVisibility(page.id, !page.visible);
      await load();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility'));
    }
  }

  async function handleTogglePin(page: WikiPageType) {
    try {
      await updateWikiPage(page.id, { pinned: !page.pinned });
      await load();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change pinning'));
    }
  }

  // ── Editor helpers ────────────────────────────────────────────────────────
  function insertAtCursor(snippet: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setFContent((c) => c + snippet);
      return;
    }
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
    if (!ta) {
      insertAtCursor(before + after);
      return;
    }
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
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to upload image (GM key?)'));
    } finally {
      setUploading(false);
    }
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = (
    <S.Sidebar $mobile={mobileOnly}>
      <div style={S.sidebarSearchWrap}>
        <Input
          prefix={<SearchOutlined style={S.searchIcon} />}
          placeholder="Search articles…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpenId(null);
          }}
          allowClear
          size="small"
          style={S.searchInput}
        />
      </div>

      <S.SidebarItem
        $active={activeCat === null}
        onClick={() => {
          setActiveCat(null);
          setOpenId(null);
          setEditing(false);
        }}
      >
        <S.SidebarItemTitle $active={activeCat === null}>
          <BookOutlined style={S.menuIcon} />
          All articles
        </S.SidebarItemTitle>
        <Badge count={pages.filter((p) => isGM || p.visible).length} showZero style={S.badgeStyle} />
      </S.SidebarItem>

      {pinned.length > 0 && (
        <>
          <S.SidebarLabel>Pinned</S.SidebarLabel>
          <S.SidebarItem
            $active={activeCat === '__pinned'}
            onClick={() => {
              setActiveCat('__pinned');
              setOpenId(null);
              setEditing(false);
            }}
          >
            <S.SidebarItemTitle $active={activeCat === '__pinned'}>
              <PushpinFilled style={S.pinnedLabelIcon} />
              Pinned articles
            </S.SidebarItemTitle>
            <Badge count={pinned.length} showZero style={S.badgeStyle} />
          </S.SidebarItem>
        </>
      )}

      {categories.length > 0 && <S.SidebarLabel>Categories</S.SidebarLabel>}
      {categories.map((cat) => {
        const count = (byCategory.get(cat) ?? []).length;
        const isActive = activeCat === cat;
        return (
          <S.SidebarItem
            key={cat}
            $active={isActive}
            onClick={() => {
              setActiveCat(cat);
              setOpenId(null);
              setEditing(false);
            }}
          >
            <S.SidebarItemTitle $active={isActive}>{cat}</S.SidebarItemTitle>
            <Badge count={count} showZero style={S.badgeStyle} />
          </S.SidebarItem>
        );
      })}

      {isGM && (
        <div style={S.sidebarFooter}>
          <Button type="primary" size="small" block icon={<PlusOutlined />} onClick={startNew}>
            New Article
          </Button>
        </div>
      )}
    </S.Sidebar>
  );

  // ── Article list (when no article open) ──────────────────────────────────
  const ArticleList = (
    <S.listWrap>
      {visible.length === 0 && (
        <Empty description={q ? 'No articles found.' : 'No articles in this category.'} style={S.emptyState} />
      )}
      {visible.map((page) => (
        <S.ArticleCard
          key={page.id}
          onClick={() => {
            setOpenId(page.id);
            setEditing(false);
          }}
        >
          <Space style={spaceBetween} wrap>
            <Space size={6}>
              {page.pinned && <PushpinFilled style={S.pinnedIcon} />}
              <Typography.Text strong style={S.articleTitle}>
                {page.title}
              </Typography.Text>
              {page.category && <Tag style={S.categoryTag}>{page.category}</Tag>}
              {isGM && !page.visible && (
                <Tag color="red" style={S.hiddenTag}>
                  Hidden
                </Tag>
              )}
            </Space>
            <Typography.Text style={S.articleExcerpt}>
              {page.content
                ? `${page.content
                    .slice(0, 80)
                    .replace(/[#*`>\n]/g, ' ')
                    .trim()}…`
                : 'No content'}
            </Typography.Text>
          </Space>
        </S.ArticleCard>
      ))}
    </S.listWrap>
  );

  // ── Article view ─────────────────────────────────────────────────────────
  const ArticleView =
    openPage && !editing ? (
      <div>
        <Space style={S.articleHeader} size={8}>
          <Space size={8} wrap>
            {openPage.pinned && <PushpinFilled style={S.warningIcon} />}
            <Typography.Title level={3} style={S.articleTitleMain}>
              {openPage.title}
            </Typography.Title>
            {openPage.category && <Tag>{openPage.category}</Tag>}
            {isGM && !openPage.visible && <Tag color="red">Hidden</Tag>}
          </Space>

          {isGM && (
            <Space size={6}>
              <Tooltip title={openPage.pinned ? 'Unpin' : 'Pin'}>
                <Button
                  size="small"
                  type="text"
                  icon={openPage.pinned ? <PushpinFilled style={S.warningIcon} /> : <PushpinOutlined />}
                  onClick={() => void handleTogglePin(openPage)}
                />
              </Tooltip>
              <Tooltip title={openPage.visible ? 'Hide' : 'Publish'}>
                <Button
                  size="small"
                  type="text"
                  icon={openPage.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={() => void handleToggleVisible(openPage)}
                />
              </Tooltip>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsNew(false);
                  setEditing(true);
                  setPreview(false);
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Remove this article?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => void handleDelete(openPage.id)}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )}
        </Space>

        <Divider style={S.articleDivider} />

        {openPage.content ? (
          <S.ArticleBody>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {openPage.content}
            </ReactMarkdown>
          </S.ArticleBody>
        ) : (
          <Empty description="Article has no content." style={S.articleEmpty} />
        )}
      </div>
    ) : null;

  // ── Editor ────────────────────────────────────────────────────────────────
  const Editor = editing ? (
    <div>
      <Space style={S.editorHeader} wrap>
        <Typography.Title level={4} style={S.editorTitle}>
          {isNew ? 'New Article' : `Editing: ${openPage?.title ?? ''}`}
        </Typography.Title>
        <Space size={6}>
          <Button size="small" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button size="small" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button type="primary" size="small" onClick={() => void handleSave()}>
            Save
          </Button>
        </Space>
      </Space>

      <Space orientation="vertical" size={10} style={S.editorFields}>
        <Space wrap size={10} style={w100}>
          <div style={S.editorTitleField}>
            <div style={S.editorFieldLabel}>Title *</div>
            <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Article title" />
          </div>
          <div style={S.editorCategoryField}>
            <div style={S.editorFieldLabel}>Category</div>
            <Input
              value={fCategory}
              onChange={(e) => setFCategory(e.target.value)}
              placeholder="E.g.: Techniques, Worlds…"
            />
          </div>
        </Space>

        <Space size={24}>
          <Space size={8}>
            <PushpinOutlined style={S.warningIcon} />
            <span style={S.toggleText}>Pinned</span>
            <Switch size="small" checked={fPinned} onChange={setFPinned} />
          </Space>
          <Space size={8}>
            <EyeOutlined />
            <span style={S.toggleText}>Visible</span>
            <Switch size="small" checked={fVisible} onChange={setFVisible} />
          </Space>
        </Space>
      </Space>

      <S.EditorGrid $split={preview}>
        <S.EditorPane>
          <div style={S.contentLabel}>
            Content — supports <strong style={S.markdownAccent}>Markdown</strong>
          </div>

          <div>
            <S.EditorToolbar>
              <S.ToolbarBtn type="button" onClick={() => insertMarkdown('**', '**')} title="Bold">
                <b>B</b>
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertMarkdown('*', '*')} title="Italic">
                <i>I</i>
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertMarkdown('`', '`')} title="Code">
                <code style={S.codeChip}>{'<>'}</code>
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertAtCursor('\n## ')} title="Subtitle">
                H2
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertAtCursor('\n### ')} title="Smaller heading">
                H3
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertAtCursor('\n- ')} title="List">
                — list
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertAtCursor('\n> ')} title="Blockquote">
                {'" bq.'}
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertAtCursor('\n```\n\n```\n')} title="Code block">
                {'```'}
              </S.ToolbarBtn>
              <S.ToolbarBtn type="button" onClick={() => insertAtCursor('\n---\n')} title="Divider">
                —
              </S.ToolbarBtn>
              <S.ToolbarBtn
                type="button"
                onClick={() => imgInputRef.current?.click()}
                title="Insert image"
                disabled={uploading}
                style={S.imageButton}
              >
                {uploading ? <LoadingOutlined /> : <FileImageOutlined />} {uploading ? 'Uploading…' : 'Image'}
              </S.ToolbarBtn>
            </S.EditorToolbar>

            <input
              ref={imgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={hiddenInput}
              onChange={(e) => void handleImageUpload(e)}
            />

            <textarea
              ref={textareaRef}
              value={fContent}
              onChange={(e) => setFContent(e.target.value)}
              rows={preview ? 24 : 20}
              placeholder={
                '# Title\n\nWrite the content in Markdown...\n\n## Section\n\n- Item 1\n- Item 2\n\n> Important quote'
              }
              style={S.editorTextarea}
            />
          </div>
        </S.EditorPane>

        {preview && (
          <S.EditorPane>
            <div style={S.previewLabel}>Preview</div>
            <S.PreviewPane>
              {fContent.trim() ? (
                <S.ArticleBody>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {fContent}
                  </ReactMarkdown>
                </S.ArticleBody>
              ) : (
                <span style={S.previewEmpty}>Start typing to see the preview…</span>
              )}
            </S.PreviewPane>
          </S.EditorPane>
        )}
      </S.EditorGrid>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  const mainContent = editing ? Editor : openPage ? ArticleView : ArticleList;

  if (mobileOnly) {
    return (
      <>
        <PageTitle>Wiki</PageTitle>
        {SidebarContent}
        <div style={S.mobileContent}>{loading ? <Spinner /> : mainContent}</div>
      </>
    );
  }

  return (
    <>
      <PageTitle>Wiki</PageTitle>
      <S.Shell>
        {SidebarContent}
        <S.MainArea>{loading ? <Spinner /> : mainContent}</S.MainArea>
      </S.Shell>
    </>
  );
};

export default WikiPage;
