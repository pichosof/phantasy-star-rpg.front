import type { CSSProperties } from 'react';
import styled from 'styled-components';

export const Shell = styled.div`
  display: flex;
  gap: 0;
  min-height: calc(100vh - 10rem);
`;

export const Sidebar = styled.aside<{ $mobile: boolean }>`
  width: ${(p) => (p.$mobile ? '100%' : '260px')};
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  padding: ${(p) => (p.$mobile ? '12px 0 0' : '16px 0')};
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--additional-background-color);
`;

export const SidebarLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-superLight-color);
  padding: 10px 16px 4px;
`;

export const SidebarItem = styled.div<{ $active?: boolean }>`
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

export const SidebarItemTitle = styled.span<{ $active?: boolean }>`
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  color: ${(p) => (p.$active ? 'var(--primary-color)' : 'var(--text-main-color)')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

export const MainArea = styled.main`
  flex: 1;
  min-width: 0;
  padding: 24px 28px;
  background: var(--background-color);
`;

export const ArticleBody = styled.div`
  color: var(--text-main-color);
  font-size: 15px;
  line-height: 1.8;

  h1,
  h2,
  h3,
  h4 {
    color: var(--heading-color);
    margin: 1.4em 0 0.5em;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    font-size: 1.6em;
  }

  h2 {
    font-size: 1.3em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 6px;
  }

  h3 {
    font-size: 1.1em;
  }

  p {
    margin: 0.7em 0;
  }

  a {
    color: var(--primary-color);
  }

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

    code {
      background: none;
      border: none;
      padding: 0;
      color: var(--text-main-color);
      font-size: 0.9em;
    }
  }

  blockquote {
    margin: 1em 0;
    padding: 8px 16px;
    border-left: 3px solid var(--primary-color);
    background: var(--additional-background-color);
    color: var(--text-light-color);
    border-radius: 0 6px 6px 0;

    p {
      margin: 0;
    }
  }

  ul,
  ol {
    padding-left: 1.6em;
    margin: 0.6em 0;

    li {
      margin: 0.25em 0;
    }
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

  strong {
    color: var(--text-dark-color);
  }

  em {
    color: var(--text-light-color);
  }
`;

export const EditorToolbar = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding: 6px 8px;
  background: var(--additional-background-color);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
`;

export const ToolbarBtn = styled.button`
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

export const EditorGrid = styled.div<{ $split: boolean }>`
  display: grid;
  grid-template-columns: ${(p) => (p.$split ? '1fr 1fr' : '1fr')};
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const EditorPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PreviewPane = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--additional-background-color);
  min-height: 320px;
  overflow-y: auto;
`;

export const sidebarSearchWrap: CSSProperties = {
  padding: '0 12px 10px',
};

export const searchIcon: CSSProperties = {
  color: 'var(--text-superLight-color)',
};

export const menuIcon: CSSProperties = {
  marginRight: 6,
};

export const pinnedLabelIcon: CSSProperties = {
  marginRight: 6,
  color: 'var(--warning-color)',
};

export const warningIcon: CSSProperties = {
  color: 'var(--warning-color)',
};

export const searchInput: CSSProperties = {
  borderRadius: 6,
};

export const badgeStyle: CSSProperties = {
  backgroundColor: 'var(--border-color)',
  color: 'var(--text-light-color)',
  boxShadow: 'none',
  fontSize: 10,
};

export const sidebarFooter: CSSProperties = {
  marginTop: 'auto',
  padding: '12px 12px 4px',
};

export const listWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const emptyState: CSSProperties = {
  marginTop: 48,
};

export const ArticleCard = styled.div`
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  background: var(--additional-background-color);
  transition: all 0.15s;

  &:hover {
    border-color: var(--primary-color);
  }
`;

export const pinnedIcon: CSSProperties = {
  color: 'var(--warning-color)',
  fontSize: 12,
};

export const articleTitle: CSSProperties = {
  color: 'var(--text-main-color)',
  fontSize: 14,
};

export const categoryTag: CSSProperties = {
  margin: 0,
  fontSize: 11,
};

export const hiddenTag: CSSProperties = {
  margin: 0,
  fontSize: 11,
};

export const articleExcerpt: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-superLight-color)',
};

export const articleHeader: CSSProperties = {
  justifyContent: 'space-between',
  width: '100%',
  flexWrap: 'wrap',
  marginBottom: 6,
};

export const articleTitleMain: CSSProperties = {
  margin: 0,
  color: 'var(--heading-color)',
};

export const articleDivider: CSSProperties = {
  margin: '12px 0 20px',
};

export const articleEmpty: CSSProperties = {
  marginTop: 40,
};

export const editorHeader: CSSProperties = {
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 16,
};

export const editorTitle: CSSProperties = {
  margin: 0,
  color: 'var(--heading-color)',
};

export const editorFields: CSSProperties = {
  width: '100%',
  marginBottom: 16,
};

export const editorTitleField: CSSProperties = {
  flex: 2,
  minWidth: 200,
};

export const editorCategoryField: CSSProperties = {
  flex: 1,
  minWidth: 140,
};

export const editorFieldLabel: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-light-color)',
  marginBottom: 4,
};

export const toggleText: CSSProperties = {
  fontSize: 13,
  color: 'var(--text-main-color)',
};

export const contentLabel: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-light-color)',
};

export const markdownAccent: CSSProperties = {
  color: 'var(--primary-color)',
};

export const codeChip: CSSProperties = {
  fontSize: 11,
};

export const imageButton: CSSProperties = {
  color: 'var(--primary-color)',
  fontWeight: 600,
};

export const editorTextarea: CSSProperties = {
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
};

export const previewLabel: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-light-color)',
};

export const previewEmpty: CSSProperties = {
  color: 'var(--text-superLight-color)',
  fontSize: 13,
};

export const mobileContent: CSSProperties = {
  padding: '16px',
};

export const HiddenFileInput = styled.input`
  display: none;
`;

export const MobileMetaTags = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  > * {
    flex: 1;
  }
`;

export const MobileArticleList = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileArticleBody = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileArticleTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 1.05rem;
  line-height: 1.2;
  font-weight: 800;
  overflow-wrap: anywhere;
`;

export const MobileArticleExcerpt = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const MobileEmptyState = styled.div`
  min-height: 112px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--text-secondary-color);
`;

export const MobileSectionStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileArticleReader = styled(ArticleBody)`
  font-size: 0.95rem;
  line-height: 1.75;
`;

export const MobileInlineControls = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileSwitchRow = styled.div`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const MobileSwitchLabel = styled.span`
  color: var(--text-main-color);
  font-size: 0.92rem;
  font-weight: 600;
`;

export const MobileEditorToolbar = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const MobileMarkdownButton = styled.button`
  min-height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0 12px;
  background: var(--psr-mobile-elevated-bg);
  color: var(--text-main-color);
  font-size: 0.82rem;
  font-weight: 700;
`;

export const MobilePreviewPane = styled.div`
  min-height: 260px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  padding: 14px;
  background: var(--additional-background-color);
`;
