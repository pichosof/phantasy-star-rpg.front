import React from 'react';
import styled from 'styled-components';
import { Empty, Input, Modal, Spin, Tag, Typography } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ENTITY_TYPE_LABEL, type SearchHit, searchEntities } from '@app/api/links.api';
import { openEntity } from '@app/utils/wiki-links';

/** Opens the search palette from anywhere (header buttons). */
export const OPEN_SEARCH_EVENT = 'picho:open-search';
export const openSearch = (): void => {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
};

const Results = styled.ul`
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  max-height: min(60vh, 520px);
  overflow-y: auto;

  li {
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-main-color);
  }

  li[aria-selected='true'] {
    background: var(--secondary-background-selected-color);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .snippet {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-muted-color);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

/**
 * Global search (Ctrl+K / Cmd+K): NPCs, cities, wiki, lore, sessions… (GM notes for the GM).
 * Results open in the entity preview drawer.
 */
export const SearchPaletteHost: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<InputRef>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Debounced search; stale responses are ignored.
  React.useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      searchEntities(term)
        .then((r) => {
          if (!alive) return;
          setHits(r);
          setActive(0);
        })
        .catch(() => alive && setHits([]))
        .finally(() => alive && setLoading(false));
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  React.useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const close = () => setOpen(false);
  const choose = (h: SearchHit) => {
    close();
    openEntity(h.type, h.id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!hits.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(hits[Math.min(active, hits.length - 1)]);
    }
  };

  return (
    <Modal
      afterOpenChange={(v) => v && inputRef.current?.focus({ cursor: 'all' })}
      closable={false}
      footer={null}
      onCancel={close}
      open={open}
      styles={{ body: { padding: 0 } }}
      title={null}
      width={620}
    >
      <Input
        allowClear
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search NPCs, cities, lore, wiki, sessions…"
        prefix={<SearchOutlined />}
        ref={inputRef}
        size="large"
        suffix={loading ? <Spin size="small" /> : null}
        value={q}
      />
      {q.trim().length >= 2 && !loading && hits.length === 0 ? (
        <Empty description="Nothing found." image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '16px 0 4px' }} />
      ) : (
        hits.length > 0 && (
          <Results ref={listRef} role="listbox">
            {hits.map((h, i) => (
              <li
                aria-selected={i === active}
                key={`${h.type}-${h.id}`}
                onClick={() => choose(h)}
                onMouseEnter={() => setActive(i)}
                role="option"
              >
                <div className="row">
                  <Tag style={{ marginInlineEnd: 0 }}>{ENTITY_TYPE_LABEL[h.type]}</Tag>
                  <span className="name">{h.name}</span>
                  {h.subtitle && (
                    <Typography.Text ellipsis style={{ fontSize: 12, maxWidth: 160 }} type="secondary">
                      {h.subtitle}
                    </Typography.Text>
                  )}
                </div>
                {h.snippet && <div className="snippet">{h.snippet}</div>}
              </li>
            ))}
          </Results>
        )
      )}
      {q.trim().length < 2 && (
        <Typography.Paragraph style={{ margin: '12px 4px 0' }} type="secondary">
          Type at least 2 letters. ↑↓ to move, Enter to open, Esc to close. Shortcut: Ctrl+K.
        </Typography.Paragraph>
      )}
    </Modal>
  );
};
