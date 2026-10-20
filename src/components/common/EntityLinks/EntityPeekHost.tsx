import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import { ENTITY_TYPE_LABEL, type LinkEntityType } from '@app/api/links.api';
import { resolveApiUrl } from '@app/api/http.api';
import { thumbUrl } from '@app/api/images.api';
import { EntityDrawer } from '@app/components/common/EntityDrawer/EntityDrawer';
import RichText from '@app/components/common/RichText/RichText';
import { ROUTES } from '@app/constants/routes';
import { OPEN_ENTITY_EVENT } from '@app/utils/wiki-links';
import { entityLinkTabs, useEntityLinks } from './EntityLinks';

const PAGE: Partial<Record<LinkEntityType, string>> = {
  city: ROUTES.CITIES,
  npc: ROUTES.NPCS,
  player: ROUTES.PLAYERS,
  dungeon: ROUTES.DUNGEONS,
  world: ROUTES.WORLDS,
  quest: ROUTES.QUESTS,
  session: ROUTES.SESSIONS,
  lore: ROUTES.LORES,
  wiki: ROUTES.WIKI,
  beast: ROUTES.MONSTERS,
  timeline: ROUTES.TIMELINE,
  gmNote: ROUTES.GM_NOTES,
  item: ROUTES.ITEMS,
};

type Ref = { type: LinkEntityType; id: number };

/** Preview drawer for any entity, opened by clicking a [[wiki link]] anywhere in the app. */
export const EntityPeekHost: React.FC = () => {
  const navigate = useNavigate();
  const [stack, setStack] = React.useState<Ref[]>([]);
  const current = stack[stack.length - 1] ?? null;
  const { data, error } = useEntityLinks(current);

  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const ref = (e as CustomEvent<Ref>).detail;
      setStack((s) => {
        const top = s[s.length - 1];
        return top && top.type === ref.type && top.id === ref.id ? s : [...s, ref].slice(-10);
      });
    };
    window.addEventListener(OPEN_ENTITY_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ENTITY_EVENT, onOpen);
  }, []);

  if (!current) return null;
  const entity = data?.entity;
  const page = PAGE[current.type];

  return (
    <EntityDrawer
      extra={
        <Space>
          {stack.length > 1 && (
            <Button icon={<ArrowLeftOutlined />} onClick={() => setStack((s) => s.slice(0, -1))} size="small">
              Back
            </Button>
          )}
          {page && (
            <Button
              icon={<ExportOutlined />}
              onClick={() => {
                setStack([]);
                navigate(page);
              }}
              size="small"
            >
              Open page
            </Button>
          )}
        </Space>
      }
      onClose={() => setStack([])}
      open
      overview={{
        label: 'Overview',
        image: entity?.imageUrl
          ? { src: resolveApiUrl(thumbUrl(entity.imageUrl, 640)) ?? null, alt: entity.name }
          : null,
        meta: (
          <Space size={4} wrap>
            <Tag>{ENTITY_TYPE_LABEL[current.type]}</Tag>
            {entity?.subtitle && <Typography.Text type="secondary">{entity.subtitle}</Typography.Text>}
          </Space>
        ),
        unavailable: entity && !entity.readable ? 'Information about this has not been revealed yet.' : null,
        children: entity ? (
          <RichText fallback={<Typography.Text type="secondary">No text yet.</Typography.Text>}>{entity.text}</RichText>
        ) : null,
      }}
      tabs={entityLinkTabs(data, error)}
      title={entity?.name ?? (error ? 'Not available' : 'Loading…')}
      zIndex={1100}
    />
  );
};
