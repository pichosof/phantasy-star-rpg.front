import React from 'react';
import { message, Collapse as AntdCollapse } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Upload } from '@app/components/common/Upload/Upload';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Collapse } from '@app/components/common/Collapse/Collapse';
import { useResponsive } from '@app/hooks/useResponsive';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { resolveApiUrl } from '@app/api/http.api';

import type { Player } from '@app/types/rpg';
import { PlayersApi } from '@app/api/rpg.api';
import { PlayerCard } from '@app/components/rpg/PlayerCard/PlayerCard';
import styled from 'styled-components';
import * as S from '@app/pages/uiComponentsPages//UIComponentsPage.styles';

type AltMap = Record<number, string>;

const Card = styled(S.Card)`
  .ant-card-body {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const GRID: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
};

export const PlayersPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  // GM mode
  const [isGM, setIsGM] = React.useState<boolean>(!!localStorage.getItem('gm_api_key'));
  React.useEffect(() => {
    const onStorage = () => setIsGM(!!localStorage.getItem('gm_api_key'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // criação
  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [level, setLevel] = React.useState<number>(1);
  const [background, setBackground] = React.useState<string>('');

  // alt para imagem
  const [altById, setAltById] = React.useState<AltMap>({});

  // expandir/colapsar background por player
  const [bgExpanded, setBgExpanded] = React.useState<Record<number, boolean>>({});
  const toggleBg = (id: number) =>
    setBgExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

  const toFile = (f: RcCustomRequestOptions['file']): File => f as File;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await PlayersApi.list();
      setItems(data);
    } catch {
      message.error('Falha ao carregar players');
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
      await PlayersApi.create({
        name: name.trim(),
        level,
        background: background.trim() || null,
      });
      setCreating(false);
      setName('');
      setLevel(1);
      setBackground('');
      await load();
      message.success('Player criado');
    } catch {
      message.error('Falha ao criar player (é preciso GM key)');
    }
  }

  async function toggleVisible(p: Player) {
    try {
      await PlayersApi.setVisible(p.id, !(p.visible ?? true));
      await load();
    } catch {
      message.error('Não foi possível alterar visibilidade (GM key?)');
    }
  }

  function setAlt(id: number, v: string) {
    setAltById((prev) => ({ ...prev, [id]: v }));
  }

  // Uploads
  const imageProps = (player: Player): UploadProps => ({
    name: 'image',
    accept: 'image/png,image/jpeg,image/webp,image/gif',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const { onError, onSuccess } = options;
      const file = toFile(options.file);

      PlayersApi.uploadImage(player.id, file, altById[player.id])
        .then(async () => {
          onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Imagem atualizada');
          await load();
        })
        .catch((err) => {
          onError?.(err as Error);
          message.error('Falha ao enviar imagem (GM key?)');
        });
    },
  });

  const sheetProps = (player: Player): UploadProps => ({
    name: 'sheet',
    accept: 'application/pdf',
    multiple: false,
    customRequest: (options: RcCustomRequestOptions): void => {
      const { onError, onSuccess } = options;
      const file = toFile(options.file);

      PlayersApi.uploadSheet(player.id, file)
        .then(async () => {
          onSuccess?.({}, undefined as unknown as XMLHttpRequest);
          message.success('Ficha enviada');
          await load();
        })
        .catch((err) => {
          onError?.(err as Error);
          message.error('Falha ao enviar ficha (PDF) — (GM key?)');
        });
    },
  });

  // Normaliza URLs para o host da API
  const normalizedItems = React.useMemo(
    () =>
      items.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ? resolveApiUrl(p.imageUrl) : p.imageUrl,
        sheetUrl: p.sheetUrl ? resolveApiUrl(p.sheetUrl) : p.sheetUrl,
      })),
    [items],
  );

  // Renderiza background com parágrafos/linhas preservados
  const renderBackground = (text: string, expanded: boolean) => {
    const norm = text.replace(/\r\n/g, '\n');
    const paragraphs = norm.split(/\n{2,}/);

    // quando colapsado: mostra só o 1º parágrafo (com \n → <br/>) e corta em ~240 chars
    if (!expanded) {
      const first = paragraphs[0] ?? '';
      const trimmed = first.length > 240 ? first.slice(0, 240).trimEnd() + '…' : first;

      return <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text-secondary-color)' }}>{trimmed}</p>;
    }

    // expandido: mostra todos os parágrafos e quebras de linha
    return (
      <div style={{ display: 'grid', gap: 8, color: 'var(--text-secondary-color)' }}>
        {paragraphs.map((para, idx) => (
          <p key={idx} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {para}
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      <PageTitle>Players</PageTitle>

      {/* Form de criação: somente GM */}
      {isGM && (
        <Card
          title="Novo Player"
          autoHeight={false}
          extra={<Button onClick={() => setCreating((v) => !v)}>{creating ? 'Fechar' : 'Abrir'}</Button>}
          style={{ marginBottom: 16 }}
        >
          {creating && (
            <form onSubmit={(e) => void onCreate(e)} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
              <InputNumber min={1} value={level} onChange={(n) => setLevel(Number(n) || 1)} />
              <TextArea
                placeholder="Background (opcional)"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button htmlType="submit" type="primary">
                  Criar
                </Button>
                <Button type="default" onClick={() => setCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div style={GRID}>
          {normalizedItems.map((p) => (
            <div key={p.id} style={{ display: 'grid', gap: 8 }}>
              {/* Card bonito com modal + toggle visibilidade */}
              <PlayerCard player={p} gm={isGM} onToggleVisible={toggleVisible} />

              {/* Background com parágrafos/linhas + ver mais/menos */}
              {p.background && (
                <Card style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {renderBackground(p.background, !!bgExpanded[p.id])}
                    <div>
                      <Button type="text" onClick={() => toggleBg(p.id)}>
                        {bgExpanded[p.id] ? 'Ver menos' : 'Ver mais'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Painel extra de GM para upload/alt */}
              {isGM && (
                <Collapse>
                  <AntdCollapse.Panel header="Gerenciar (imagem & ficha)" key={`gm-${p.id}`}>
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Input
                          placeholder="Texto alternativo (alt) da imagem"
                          value={altById[p.id] ?? ''}
                          onChange={(e) => setAlt(p.id, e.target.value)}
                          style={{ maxWidth: 260 }}
                        />
                        <Upload {...imageProps(p)}>
                          <Button>Upload imagem</Button>
                        </Upload>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Upload {...sheetProps(p)}>
                          <Button>Upload PDF</Button>
                        </Upload>
                        {p.sheetUrl && (
                          <a href={p.sheetUrl} target="_blank" rel="noreferrer">
                            abrir em nova aba
                          </a>
                        )}
                      </div>
                    </div>
                  </AntdCollapse.Panel>
                </Collapse>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PlayersPage;
