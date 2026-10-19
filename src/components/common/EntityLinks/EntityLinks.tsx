import React from 'react';
import { Alert, Empty, List, Space, Spin, Tag, Typography } from 'antd';
import {
  ENTITY_TYPE_LABEL,
  type EntityLinks,
  type LinkEntityType,
  type LinkMention,
  getEntityLinks,
} from '@app/api/links.api';
import { openEntity } from '@app/utils/wiki-links';

/** Loads the links data of one entity; `reloadKey` refetches (e.g. after an edit). */
export function useEntityLinks(ref: { type: LinkEntityType; id: number } | null, reloadKey?: unknown) {
  const [data, setData] = React.useState<EntityLinks | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!ref) return undefined;
    let alive = true;
    setData(null);
    setError(null);
    getEntityLinks(ref.type, ref.id)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError('Could not load the links.'));
    return () => {
      alive = false;
    };
  }, [ref?.type, ref?.id, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error };
}

const MentionList: React.FC<{ items: LinkMention[]; empty: string; showType?: boolean }> = ({
  items,
  empty,
  showType = true,
}) =>
  items.length === 0 ? (
    <Empty description={empty} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  ) : (
    <List
      dataSource={items}
      renderItem={(m) => (
        <List.Item
          key={`${m.type}-${m.id}`}
          onClick={() => openEntity(m.type, m.id)}
          style={{ cursor: 'pointer', display: 'block' }}
        >
          <Space size={6} wrap>
            {showType && <Tag>{ENTITY_TYPE_LABEL[m.type]}</Tag>}
            <Typography.Link>{m.name}</Typography.Link>
            {m.date && <Typography.Text type="secondary">{m.date}</Typography.Text>}
            {!m.explicit && (
              <Typography.Text style={{ fontSize: 12 }} type="secondary">
                mentioned
              </Typography.Text>
            )}
          </Space>
          {m.snippet && (
            <Typography.Paragraph style={{ margin: '4px 0 0', fontSize: 13 }} type="secondary">
              {m.snippet}
            </Typography.Paragraph>
          )}
        </List.Item>
      )}
      size="small"
    />
  );

export const AppearsInPanel: React.FC<{ data: EntityLinks | null; error?: string | null }> = ({ data, error }) => {
  if (error) return <Alert showIcon type="error" message={error} />;
  if (!data) return <Spin />;
  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        Pages that link to <b>{data.entity.name}</b> with [[…]] or mention it by name.
      </Typography.Text>
      <MentionList empty="Not mentioned anywhere yet." items={data.appearsIn} />
    </Space>
  );
};

export const HistoryPanel: React.FC<{ data: EntityLinks | null; error?: string | null }> = ({ data, error }) => {
  if (error) return <Alert showIcon type="error" message={error} />;
  if (!data) return <Spin />;
  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={5}>Timeline</Typography.Title>
        <MentionList empty="No timeline events mention it." items={data.history.timeline} showType={false} />
      </div>
      <div>
        <Typography.Title level={5}>Sessions</Typography.Title>
        <MentionList empty="No sessions mention it." items={data.history.sessions} showType={false} />
      </div>
    </Space>
  );
};

/** "Appears in" + "History" tabs for an EntityDrawer. */
export function entityLinkTabs(data: EntityLinks | null, error: string | null) {
  return [
    { key: 'appears-in', label: 'Appears in', children: <AppearsInPanel data={data} error={error} /> },
    { key: 'history', label: 'History', children: <HistoryPanel data={data} error={error} /> },
  ];
}
