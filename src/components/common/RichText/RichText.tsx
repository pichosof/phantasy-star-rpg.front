import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
import { resolveApiUrl } from '@app/api/http.api';
import { thumbUrl } from '@app/api/images.api';

/**
 * Markdown for entity text fields (descriptions, summaries, backgrounds, notes…).
 * Inherits font size, line height and color from where it is placed, so it can
 * replace a plain Paragraph/Text without changing the surrounding layout.
 * remark-breaks keeps single line breaks, which existing plain-text entries rely on.
 */
const Body = styled.div`
  color: inherit;
  font-size: inherit;
  line-height: inherit;
  overflow-wrap: anywhere;
  /* Parents often use pre-wrap for plain text; line breaks come from remark-breaks here. */
  white-space: normal;

  & > :first-child {
    margin-top: 0;
  }
  & > :last-child {
    margin-bottom: 0;
  }

  p {
    margin: 0 0 0.6em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--heading-color);
    line-height: 1.3;
    margin: 0.9em 0 0.4em;
  }
  h1 {
    font-size: 1.35em;
  }
  h2 {
    font-size: 1.2em;
  }
  h3 {
    font-size: 1.08em;
  }
  h4,
  h5,
  h6 {
    font-size: 1em;
  }

  a {
    color: var(--primary-color);
  }

  ul,
  ol {
    padding-left: 1.4em;
    margin: 0.3em 0 0.6em;
  }
  li {
    margin: 0.15em 0;
  }

  blockquote {
    margin: 0.6em 0;
    padding: 6px 12px;
    border-left: 3px solid var(--primary-color);
    background: var(--additional-background-color);
    border-radius: 0 6px 6px 0;
  }

  code {
    background: var(--background-base-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0 4px;
    font-size: 0.88em;
  }
  pre {
    background: var(--additional-background-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 10px 12px;
    overflow-x: auto;
    code {
      background: none;
      border: none;
      padding: 0;
    }
  }

  hr {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 0.9em 0;
  }

  table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    margin: 0.6em 0;
    font-size: 0.92em;
  }
  th,
  td {
    border: 1px solid var(--border-color);
    padding: 5px 9px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--additional-background-color);
    font-weight: 600;
  }

  img {
    max-width: 100%;
    border-radius: 6px;
  }
`;

const components = {
  img: ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...rest}
      alt={alt ?? ''}
      loading="lazy"
      src={thumbUrl(resolveApiUrl(typeof src === 'string' ? src : undefined), 1280) ?? src}
    />
  ),
  a: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...rest} href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  ),
};

interface RichTextProps {
  children?: string | null;
  /** Shown (as plain text) when there is no content. */
  fallback?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const RichText: React.FC<RichTextProps> = ({ children, fallback = null, className, style }) => {
  const text = children?.trim();
  if (!text) return <>{fallback}</>;
  return (
    <Body className={className} style={style}>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
        {text}
      </ReactMarkdown>
    </Body>
  );
};

/** Plain-text version of a Markdown string, for previews, excerpts and tooltips. */
export function stripMarkdown(md: string | null | undefined): string {
  if (!md) return '';
  return (
    md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
      .replace(/^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*$/gm, '')
      .replace(/\|/g, ' ')
      // Emphasis only when the markers hug non-space text and aren't inside a word (snake_case, 2*3*4).
      .replace(/(^|[^\w*])(\*\*|__)(?=\S)(.+?)(?<=\S)\2(?![\w*])/g, '$1$3')
      .replace(/(^|[^\w*])([*_])(?=\S)(.+?)(?<=\S)\2(?![\w*])/g, '$1$3')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/^\s*([-*_]\s*){3,}$/gm, '')
      .replace(/[ \t]+/g, ' ')
      .trim()
  );
}

export default RichText;
