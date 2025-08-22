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

import type { City } from '../types/rpg';
import { CitiesApi } from '../api/rpg.api';

export const CitiesPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [desc, setDesc] = React.useState<string>('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await CitiesApi.list();
      setItems(data);
    } catch {
      message.error('Falha ao carregar cidades');
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
      await CitiesApi.create({ name: name.trim(), description: desc.trim() || null });
      setCreating(false);
      setName('');
      setDesc('');
      await load();
      message.success('Cidade criada');
    } catch {
      message.error('Falha ao criar cidade (GM key?)');
    }
  }

  async function toggleVisible(c: City) {
    try {
      await CitiesApi.setVisible(c.id, !(c.visible ?? true));
      await load();
    } catch {
      message.error('Falha ao mudar visibilidade (GM key?)');
    }
  }

  async function toggleDiscovered(c: City) {
    try {
      await CitiesApi.setDiscovered(c.id, !c.discovered);
      await load();
    } catch {
      message.error('Falha ao mudar descoberta (GM key?)');
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
          { title: 'Nome', dataIndex: 'name', key: 'name' },
          { title: 'Descrição', dataIndex: 'description', key: 'description' },
          {
            title: 'Visível',
            key: 'visible',
            width: 120,
            render: (_, c) => <Switch checked={c.visible ?? true} onChange={() => void toggleVisible(c)} />,
          },
          {
            title: 'Descoberta',
            key: 'discovered',
            width: 140,
            render: (_, c) => <Switch checked={c.discovered} onChange={() => void toggleDiscovered(c)} />,
          },
          {
            title: 'Criado',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string) => new Date(v).toLocaleString(),
          },
        ]}
      />
    </Card>
  );

  const MobileList: React.FC = () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {loading && <Spinner />}
      {!loading &&
        items.map((c) => (
          <Card key={c.id} title={`#${c.id} — ${c.name}`}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div>{c.description || '-'}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                Visível: <Switch checked={c.visible ?? true} onChange={() => void toggleVisible(c)} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                Descoberta: <Switch checked={c.discovered} onChange={() => void toggleDiscovered(c)} />
              </div>
            </div>
          </Card>
        ))}
    </div>
  );

  return (
    <>
      <PageTitle>Cidades</PageTitle>

      <Card
        title="Nova Cidade"
        extra={<Button onClick={() => setCreating((v) => !v)}>{creating ? 'Fechar' : 'Abrir'}</Button>}
      >
        {creating && (
          <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
            <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextArea placeholder="Descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
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

export default CitiesPage;
