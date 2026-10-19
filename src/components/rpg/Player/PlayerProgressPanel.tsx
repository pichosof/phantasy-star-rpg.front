import React from 'react';
import { Alert, Empty, List, Space, Spin, Statistic, Typography } from 'antd';
import { type PlayerProgress, getPlayerProgress } from '@app/api/progress.api';
import { openEntity } from '@app/utils/wiki-links';

const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toLocaleString()}`;

/** XP and credits a player earned, session by session (visible to everyone). */
export const PlayerProgressPanel: React.FC<{ playerId: number }> = ({ playerId }) => {
  const [data, setData] = React.useState<PlayerProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    getPlayerProgress(playerId)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError('Could not load the progress.'));
    return () => {
      alive = false;
    };
  }, [playerId]);

  if (error) return <Alert showIcon type="error" message={error} />;
  if (!data) return <Spin />;

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Space size={32} wrap>
        <Statistic title="Total XP" value={data.totals.xp} />
        <Statistic suffix="cr" title="Total credits" value={data.totals.credits} />
      </Space>
      {data.entries.length === 0 ? (
        <Empty description="No rewards yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={[...data.entries].reverse()}
          renderItem={(e) => (
            <List.Item key={e.id} style={{ display: 'block' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                {e.sessionId && e.sessionTitle ? (
                  <Typography.Link onClick={() => openEntity('session', e.sessionId as number)}>
                    {e.sessionTitle}
                  </Typography.Link>
                ) : (
                  <Typography.Text type="secondary">{e.sessionId ? 'Session' : 'Other reward'}</Typography.Text>
                )}
                <Typography.Text strong>
                  {e.xp !== 0 && `${signed(e.xp)} XP`}
                  {e.xp !== 0 && e.credits !== 0 && ' · '}
                  {e.credits !== 0 && `${signed(e.credits)} cr`}
                </Typography.Text>
              </Space>
              {e.note && (
                <Typography.Paragraph style={{ margin: '4px 0 0' }} type="secondary">
                  {e.note}
                </Typography.Paragraph>
              )}
            </List.Item>
          )}
          size="small"
        />
      )}
    </Space>
  );
};
