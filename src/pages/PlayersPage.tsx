// src/pages/PlayersPage.tsx
import React from 'react';
import { message } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Upload, UploadDragger } from '@app/components/common/Upload/Upload';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Modal } from '@app/components/common/Modal/Modal';
import { useResponsive } from '@app/hooks/useResponsive';
import type { UploadProps } from 'antd';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { resolveApiUrl } from '@app/api/http.api';

import type { Player } from '@app/types/rpg';
import { PlayersApi } from '@app/api/rpg.api';

type AltMap = Record<number, string>;

const GRID: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
};

const COVER: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 180,
  borderRadius: 12,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1f1f1f, #434343)',
};

const COVER_IMG: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  filter: 'contrast(1.05)',
};

const COVER_OVERLAY: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.0) 100%)',
};

const COVER_TITLE_WRAP: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  bottom: 10,
  right: 12,
  color: '#fff',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 8,
};

const NAME: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 18,
  textShadow: '0 2px 8px rgba(0,0,0,0.45)',
};

const LVL_BADGE: React.CSSProperties = {
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: 8,
  background: 'rgba(0,0,0,0.45)',
  color: '#fff',
  fontSize: 12,
  whiteSpace: 'nowrap',
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

  // modal PDF
  const [pdfOpen, setPdfOpen] = React.useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const openPdf = (url: string) => {
    setPdfUrl(url);
    setPdfOpen(true);
  };

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
    accept: 'image/png,image/jpeg,image/webp',
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

  const PlayerCard: React.FC<{ p: Player }> = ({ p }) => {
    const hasSheet = !!p.sheetUrl;

    return (
      <Card>
        {/* Capa com imagem */}
        <div style={COVER}>
          {p.imageUrl && <img src={resolveApiUrl(p.imageUrl)} alt={altById[p.id] || p.name} style={COVER_IMG} />}
          <div style={COVER_OVERLAY} />
          <div style={COVER_TITLE_WRAP}>
            <div style={NAME}>{p.name}</div>
            <div style={LVL_BADGE}>LV {p.level}</div>
          </div>
        </div>

        {/* Background / descrição curta */}
        {p.background && <div style={{ marginTop: 10, color: 'var(--text-secondary-color)' }}>{p.background}</div>}

        {/* Ações (ver ficha / GM controls) */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button type="primary" disabled={!hasSheet} onClick={() => hasSheet && openPdf(p.sheetUrl!)}>
              Ver ficha
            </Button>
            {hasSheet && (
              <>
                <Button type="primary" onClick={() => openPdf(resolveApiUrl(p.sheetUrl)!)}>
                  Ver ficha
                </Button>
                <a href={resolveApiUrl(p.sheetUrl)!} target="_blank" rel="noreferrer">
                  abrir em nova aba
                </a>
              </>
            )}
          </div>

          {isGM && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ opacity: 0.75 }}>Visível</span>
              <Switch checked={p.visible ?? true} onChange={() => void toggleVisible(p)} />
            </div>
          )}
        </div>

        {isGM && (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <>
      <PageTitle>Players</PageTitle>

      {/* Form de criação: somente GM */}
      {isGM && (
        <Card
          title="Novo Player"
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
          {items.map((p) => (
            <PlayerCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Modal do PDF */}
      <Modal
        visible={pdfOpen}
        onCancel={() => setPdfOpen(false)}
        footer={null}
        width={mobileOnly ? '95vw' : '80vw'}
        bodyStyle={{ padding: 0, height: mobileOnly ? '75vh' : '80vh' }}
        destroyOnClose
        title="Ficha do personagem"
      >
        {pdfUrl ? (
          <iframe title="player-sheet" src={pdfUrl} style={{ border: 0, width: '100%', height: '100%' }} />
        ) : (
          <div style={{ padding: 16 }}>Ficha indisponível.</div>
        )}
      </Modal>
    </>
  );
};

export default PlayersPage;
