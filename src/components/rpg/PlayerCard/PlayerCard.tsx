import React from 'react';
import { FilePdfOutlined, EyeOutlined, IdcardOutlined } from '@ant-design/icons';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Modal } from '@app/components/common/Modal/Modal';
import { Spin } from 'antd';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl, fetchBlobUrl } from '@app/api/http.api';
import type { Player } from '@app/types/rpg';
import * as S from './PlayerCard.styles';

const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const PdfViewer: React.FC<{ url: string }> = ({ url }) => {
  const layoutPlugin = defaultLayoutPlugin();
  return (
    <Worker workerUrl={PDF_WORKER_URL}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Viewer fileUrl={url} plugins={[layoutPlugin]} />
      </div>
    </Worker>
  );
};

type PlayerCardProps = {
  player: Player;
  /** Mostra controles do GM (visibilidade, etc) */
  gm?: boolean;
  onToggleVisible?: (p: Player) => void;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, gm = false, onToggleVisible }) => {
  const { mobileOnly } = useResponsive();

  const [openProfile, setOpenProfile] = React.useState(false);
  const [openPdf, setOpenPdf] = React.useState(false);
  const [sheetBlobUrl, setSheetBlobUrl] = React.useState<string | null>(null);
  const [sheetLoading, setSheetLoading] = React.useState(false);

  const img = player.imageUrl ? resolveApiUrl(player.imageUrl) : '/assets/images/stub-avatar.webp';
  const hasSheet = !!player.sheetUrl;

  function openSheet() {
    if (!player.sheetUrl) return;
    setOpenPdf(true);
    if (sheetBlobUrl) return;
    setSheetLoading(true);
    fetchBlobUrl(player.sheetUrl)
      .then((url) => setSheetBlobUrl(url))
      .catch(() => setSheetBlobUrl(null))
      .finally(() => setSheetLoading(false));
  }

  // Renderiza o background com quebras preservadas
  const renderBackground = (text: string) => {
    const norm = text.replace(/\r\n/g, '\n');
    const paragraphs = norm.split(/\n{2,}/);
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {paragraphs.map((para, idx) => (
          <p key={idx} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {para}
          </p>
        ))}
      </div>
    );
  };

  const previewBg =
    player.background && player.background.length > 120
      ? player.background.slice(0, 120).trimEnd() + '…'
      : player.background || '';

  return (
    <>
      <S.Card padding={0} $img={img}>
        {/* topo com imagem e overlay; a imagem "some" com zoom no hover e o BG do card assume */}
        <S.PlayerImage src={img} alt={player.imageAlt || player.name} />
        <S.TopOverlay />

        {/* conteúdo */}
        <S.Info>
          <S.HeaderRow>
            <S.Title>{player.name}</S.Title>
            <S.LevelBadge>LV {player.level}</S.LevelBadge>
          </S.HeaderRow>

          {!!previewBg && <S.BackgroundPreview title={player.background || ''}>{previewBg}</S.BackgroundPreview>}

          <S.ActionsRow>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button icon={<IdcardOutlined />} onClick={() => setOpenProfile(true)}>
                Profile
              </Button>

              <Button disabled={!hasSheet} type="primary" icon={<EyeOutlined />} onClick={openSheet}>
                {hasSheet ? 'Sheet' : 'No sheet'}
              </Button>
            </div>

            {gm && (
              <S.GMRow>
                <span style={{ opacity: 0.75 }}>Visible</span>
                <Switch checked={player.visible ?? true} onChange={() => onToggleVisible?.(player)} />
              </S.GMRow>
            )}
          </S.ActionsRow>
        </S.Info>
      </S.Card>

      {/* Modal: Perfil (background completo + dados) */}
      <Modal
        visible={openProfile}
        onCancel={() => setOpenProfile(false)}
        footer={null}
        width={mobileOnly ? '96vw' : '760px'}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
        title={`Profile — ${player.name}`}
      >
        <div style={{ display: 'grid' }}>
          {/* header com imagem */}
          <div style={{ position: 'relative', height: mobileOnly ? 220 : 260 }}>
            <img
              src={img}
              alt={player.imageAlt || player.name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                color: '#fff',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: mobileOnly ? 18 : 22 }}>{player.name}</div>
              <div
                style={{
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.45)',
                  fontSize: 12,
                }}
              >
                LV {player.level}
              </div>
            </div>
          </div>

          {/* detalhes */}
          <div style={{ padding: 16, display: 'grid', gap: 16 }}>
            {player.background && (
              <section>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Story</div>
                {renderBackground(player.background)}
              </section>
            )}

            <section style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 700 }}>Details</div>
              <div style={{ display: 'grid', gap: 6 }}>
                <div>
                  <b>Name:</b> {player.name}
                </div>
                <div>
                  <b>Level:</b> {player.level}
                </div>
                {player.imageAlt && (
                  <div>
                    <b>Image (alt):</b> {player.imageAlt}
                  </div>
                )}
                <div>
                  <b>Created:</b> {new Date(player.createdAt).toLocaleString()}
                </div>
                <div>
                  <b>Updated:</b> {new Date(player.updatedAt).toLocaleString()}
                </div>
              </div>
            </section>
          </div>
        </div>
      </Modal>

      {/* Modal: Ficha (PDF) */}
      <Modal
        visible={openPdf}
        title={`Sheet — ${player.name}`}
        onCancel={() => setOpenPdf(false)}
        footer={null}
        width={mobileOnly ? '96vw' : '82vw'}
        bodyStyle={{ padding: 0, height: '80vh' }}
        destroyOnClose
      >
        <S.PdfFrameWrapper>
          {sheetLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Spin size="large" />
            </div>
          ) : sheetBlobUrl ? (
            <PdfViewer url={sheetBlobUrl} />
          ) : (
            <div style={{ padding: 16 }}>No sheet attached.</div>
          )}
        </S.PdfFrameWrapper>
      </Modal>
    </>
  );
};
