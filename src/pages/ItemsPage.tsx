import React from 'react';
import { Alert, Card, Select, Space, Table, Tag, Typography } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { listItems, type PlayerItem } from '@app/api/items.api';
import { apiErrorMessage } from '@app/utils/api-error';
import { ItemText, KindCell, useItemFilters } from './items-shared';

/** Player catalogue: only items the GM published (the API sends player fields only). */
export const ItemsPage: React.FC = () => {
  const [items, setItems] = React.useState<PlayerItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [availability, setAvailability] = React.useState<string | undefined>();

  React.useEffect(() => {
    listItems()
      .then(setItems)
      .catch((e) => setError(apiErrorMessage(e, 'Could not load the items.')));
  }, []);

  const availabilities = React.useMemo(
    () => [...new Set((items ?? []).map((i) => i.availability).filter(Boolean) as string[])],
    [items],
  );
  const { shown, controls } = useItemFilters(items, {
    searchText: (i) => `${i.name} ${i.originalName ?? ''} ${i.description ?? ''}`,
    predicate: (i) => !availability || i.availability === availability,
    extra: (
      <Select
        allowClear
        onChange={setAvailability}
        options={availabilities.map((a) => ({ value: a, label: a }))}
        placeholder="Availability"
        style={{ width: 160 }}
        value={availability}
      />
    ),
  });

  return (
    <>
      <PageTitle>Items</PageTitle>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Items
        </Typography.Title>
        <Typography.Text type="secondary">
          Gear and goods known in Motávia. Availability depends on the city, the season and who sells it; prices are
          agreed at the counter.
        </Typography.Text>
        {error && <Alert showIcon type="error" title={error} />}
        <Card size="small">
          {controls}
          <Table
            columns={[
              {
                title: 'Item',
                dataIndex: 'name',
                sorter: (a: PlayerItem, b: PlayerItem) => a.name.localeCompare(b.name),
                render: (n: string, i: PlayerItem) => (
                  <Space orientation="vertical" size={0}>
                    <span>{n}</span>
                    {i.originalName && (
                      <Typography.Text style={{ fontSize: 12 }} type="secondary">
                        {i.originalName}
                      </Typography.Text>
                    )}
                  </Space>
                ),
              },
              { title: 'Kind', dataIndex: 'kind', render: (_: string, i: PlayerItem) => <KindCell item={i} /> },
              {
                title: 'Level',
                dataIndex: 'level',
                width: 80,
                sorter: (a: PlayerItem, b: PlayerItem) => a.level - b.level,
                render: (l: number, i: PlayerItem) => (i.origin === 'algol' ? '—' : l),
              },
              {
                title: 'Availability',
                dataIndex: 'availability',
                render: (a: string | null, i: PlayerItem) => (
                  <Space size={4} wrap>
                    {a && <Tag>{a}</Tag>}
                    {i.localPrice != null && <Tag color="gold">{i.localPrice.toLocaleString()} cr</Tag>}
                  </Space>
                ),
              },
            ]}
            dataSource={shown}
            expandable={{
              expandedRowRender: (i: PlayerItem) => (
                <ItemText description={i.description} rules={i.rules} sourceUrl={i.sourceUrl} />
              ),
            }}
            loading={!items && !error}
            pagination={{ pageSize: 25, showSizeChanger: false }}
            rowKey="id"
            scroll={{ x: 560 }}
            size="small"
          />
        </Card>
      </Space>
    </>
  );
};

export default ItemsPage;
