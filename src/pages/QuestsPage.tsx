import React from 'react';
import { message } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';

import type { Quest } from '../types/rpg';
import { QuestsApi } from '../api/rpg.api';

export const QuestsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>('');
  const [reward, setReward] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await QuestsApi.list();
      setItems(data);
    } catch {
      message.error('Falha ao carregar quests');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await QuestsApi.create({
        title: title.trim(),
        reward: reward.trim() || null,
        description: description.trim() || null,
      });
      setCreating(false);
      setTitle('');
      setReward('');
      setDescription('');
      await load();
      message.success('Quest criada');
    } catch {
      message.error('Falha ao criar quest (GM key?)');
    }
  }

  async function toggleVisible(q: Quest) {
    try {
      await QuestsApi.setVisible(q.id, !(q.visible ?? true));
      await load();
    } catch {
      message.error('Falha ao mudar visibilidade (GM key?)');
    }
  }

  async function complete(q: Quest) {
    try {
      await QuestsApi.complete(q.id);
      await load();
      message.success('Quest concluída');
    } catch {
      message.error('Falha ao concluir quest (GM key?)');
    }
  }

  const DesktopTable: React.FC = () => (
    <Card>
      <Table
        rowKey="id"
        dataSource={items}
        loading={loading}
        columns={[
          { title: '#', dataIndex: 'id', key: 'id', width: 70 },
          { title: 'Título', dataIndex: 'title', key: 'title' },
          { title: 'Recompensa', dataIndex: 'reward', key: 'reward', width: 180 },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (s: Quest['status']) => <b>{s}</b>,
          },
          {
            title: 'Visível',
            key: 'visible',
            width: 120,
            render: (_, q) => <Switch checked={q.visible ?? true} onChange={() => void toggleVisible(q)} />,
          },
          {
            title: 'Ações',
            key: 'act',
            width: 160,
            render: (_, q) => (
              <Button disabled={q.status === 'completed'} onClick={() => void complete(q)}>
                Concluir
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );

  const MobileList: React.FC = () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {loading && <Spinner />}
      {!loading &&
        items.map((q) => (
          <Card key={q.id} title={`#${q.id} — ${q.title}`}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div>Recompensa: {q.reward || '-'}</div>
              <div>
                Status: <b>{q.status}</b>
              </div>
              {q.description && <div>{q.description}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Visível: <Switch checked={q.visible ?? true} onChange={() => void toggleVisible(q)} />
              </div>
              <Button disabled={q.status === 'completed'} onClick={() => void complete(q)}>
                Concluir
              </Button>
            </div>
          </Card>
        ))}
    </div>
  );

  return (
    <>
      <PageTitle>Quests</PageTitle>

      <Card
        title="Nova Quest"
        extra={<Button onClick={() => setCreating((v) => !v)}>{creating ? 'Fechar' : 'Abrir'}</Button>}
      >
        {creating && (
          <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 12, maxWidth: 620 }}>
            <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="Recompensa (opcional)" value={reward} onChange={(e) => setReward(e.target.value)} />
            <TextArea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" htmlType="submit">
                Criar
              </Button>
              <Button onClick={() => setCreating(false)}>Cancelar</Button>
            </div>
          </form>
        )}
      </Card>

      {mobileOnly ? <MobileList /> : <DesktopTable />}
    </>
  );
};

export default QuestsPage;
