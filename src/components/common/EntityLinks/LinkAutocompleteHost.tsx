import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { ENTITY_TYPE_LABEL, type LinkIndexEntry } from '@app/api/links.api';
import { useGMMode } from '@app/hooks/useGMMode';
import { useLinkIndex } from '@app/hooks/useLinkIndex';
import { normalizeName } from '@app/utils/wiki-links';

/**
 * Global `[[` autocomplete: works in every <textarea> of the app (antd and antd-mobile),
 * so no form needs to change. Typing `[[Pia` suggests entities; Enter/Tab/click inserts
 * `[[Piata]]`. Only for the GM (players do not edit content).
 */

const MAX = 8;

const Popup = styled.ul`
  position: fixed;
  z-index: 2000;
  margin: 0;
  padding: 4px;
  list-style: none;
  min-width: 240px;
  max-width: min(360px, calc(100vw - 32px));
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 6px 24px var(--shadow-color);

  li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-main-color);
  }

  li[aria-selected='true'] {
    background: var(--secondary-background-selected-color);
  }

  small {
    color: var(--text-muted-color);
    white-space: nowrap;
  }
`;

interface OpenState {
  el: HTMLTextAreaElement;
  start: number; // index right after `[[`
  query: string;
  top: number;
  left: number;
}

/** Text between the last unclosed `[[` and the caret, if any. */
function pendingQuery(value: string, caret: number): { start: number; query: string } | null {
  const before = value.slice(0, caret);
  const open = before.lastIndexOf('[[');
  if (open < 0) return null;
  const query = before.slice(open + 2);
  if (query.includes(']') || query.includes('\n') || query.includes('|') || query.length > 60) return null;
  return { start: open + 2, query };
}

/** Sets a textarea value so React's onChange fires (works for controlled inputs). */
function setNativeValue(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export const LinkAutocompleteHost: React.FC = () => {
  const isGM = useGMMode();
  const { index } = useLinkIndex(isGM);
  const [state, setState] = React.useState<OpenState | null>(null);
  const [active, setActive] = React.useState(0);

  const matches = React.useMemo<LinkIndexEntry[]>(() => {
    if (!state) return [];
    const q = normalizeName(state.query);
    const scored = index
      .map((e) => {
        const n = normalizeName(e.name);
        const score = !q ? 1 : n.startsWith(q) ? 0 : n.includes(q) ? 1 : -1;
        return { e, score };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score || a.e.name.localeCompare(b.e.name));
    return scored.slice(0, MAX).map((x) => x.e);
  }, [state, index]);

  const close = React.useCallback(() => setState(null), []);

  const insert = React.useCallback(
    (entry: LinkIndexEntry) => {
      if (!state) return;
      const { el, start } = state;
      const caret = el.selectionStart ?? start;
      const after = el.value.slice(caret);
      const closing = after.startsWith(']]') ? '' : ']]';
      const text = `${entry.name}${closing}`;
      const next = el.value.slice(0, start) + text + after;
      setNativeValue(el, next);
      const pos = start + text.length + (closing ? 0 : 2);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(pos, pos);
      });
      setState(null);
    },
    [state],
  );

  React.useEffect(() => {
    if (!isGM) return undefined;
    const onInput = (e: Event) => {
      const el = e.target;
      if (!(el instanceof HTMLTextAreaElement)) return;
      const hit = pendingQuery(el.value, el.selectionStart ?? el.value.length);
      if (!hit) return setState(null);
      const r = el.getBoundingClientRect();
      const below = Math.min(r.bottom + 4, window.innerHeight - 280);
      setState({
        el,
        start: hit.start,
        query: hit.query,
        top: Math.max(8, below),
        left: Math.max(8, Math.min(r.left, window.innerWidth - 380)),
      });
      setActive(0);
    };
    const onBlur = (e: FocusEvent) => {
      if (e.target instanceof HTMLTextAreaElement)
        setTimeout(() => setState((s) => (s?.el === e.target ? null : s)), 150);
    };
    document.addEventListener('input', onInput, true);
    document.addEventListener('focusout', onBlur, true);
    return () => {
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('focusout', onBlur, true);
    };
  }, [isGM]);

  React.useEffect(() => {
    if (!state || !matches.length) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== state.el) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        insert(matches[Math.min(active, matches.length - 1)]);
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [state, matches, active, insert, close]);

  if (!state || !matches.length) return null;
  return createPortal(
    <Popup role="listbox" style={{ top: state.top, left: state.left }}>
      {matches.map((m, i) => (
        <li
          aria-selected={i === active}
          key={`${m.type}-${m.id}`}
          onMouseDown={(e) => {
            e.preventDefault();
            insert(m);
          }}
          onMouseEnter={() => setActive(i)}
          role="option"
        >
          <span>{m.name}</span>
          <small>{ENTITY_TYPE_LABEL[m.type]}</small>
        </li>
      ))}
    </Popup>,
    document.body,
  );
};
