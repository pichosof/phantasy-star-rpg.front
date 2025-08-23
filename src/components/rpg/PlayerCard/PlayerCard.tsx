import React from 'react';
import { FilePdfOutlined, EyeOutlined, IdcardOutlined } from '@ant-design/icons';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Modal } from '@app/components/common/Modal/Modal';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl } from '@app/api/http.api';
import type { Player } from '@app/types/rpg';
import * as S from './PlayerCard.styles';

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

  const img = player.imageUrl ? resolveApiUrl(player.imageUrl) : '/assets/images/stub-avatar.webp';
  const sheetUrl = player.sheetUrl ? resolveApiUrl(player.sheetUrl) : undefined;
  const hasSheet = !!sheetUrl;

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

          {!!previewBg && (
            <S.BackgroundPreview title={player.background || ''}>{previewBg}</S.BackgroundPreview>
          )}

          <S.ActionsRow>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button icon={<IdcardOutlined />} onClick={() => setOpenProfile(true)}>
                Perfil
              </Button>

              <Button disabled={!hasSheet} type="primary" icon={<EyeOutlined />} onClick={() => setOpenPdf(true)}>
                {hasSheet ? 'Ficha' : 'Sem ficha'}
              </Button>

              {hasSheet && (
                <a href={sheetUrl!} target="_blank" rel="noreferrer">
                  <S.LinkLike icon={<FilePdfOutlined />}>Abrir em nova aba</S.LinkLike>
                </a>
              )}
            </div>

            {gm && (
              <S.GMRow>
                <span style={{ opacity: 0.75 }}>Visível</span>
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
        title={`Perfil — ${player.name}`}
      >
        <div style={{ display: 'grid' }}>
          {/* header com imagem */}
          <div style={{ position: 'relative', height: mobileOnly ? 220 : 260 }}>
            <img
              src={img}
              alt={player.imageAlt || player.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 100%)',
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
                <div style={{ fontWeight: 700, marginBottom: 8 }}>História</div>
                {renderBackground(player.background)}
              </section>
            )}

            <section style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 700 }}>Detalhes</div>
              <div style={{ display: 'grid', gap: 6 }}>
                <div>
                  <b>Nome:</b> {player.name}
                </div>
                <div>
                  <b>Nível:</b> {player.level}
                </div>
                {player.imageAlt && (
                  <div>
                    <b>Imagem (alt):</b> {player.imageAlt}
                  </div>
                )}
                <div>
                  <b>Criado em:</b> {new Date(player.createdAt).toLocaleString()}
                </div>
                <div>
                  <b>Atualizado em:</b> {new Date(player.updatedAt).toLocaleString()}
                </div>
              </div>
            </section>
          </div>
        </div>
      </Modal>

      {/* Modal: Ficha (PDF) */}
      <Modal
        visible={openPdf}
        title={`Ficha — ${player.name}`}
        onCancel={() => setOpenPdf(false)}
        footer={null}
        width={mobileOnly ? '96vw' : '80vw'}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        {hasSheet ? (
          <S.PdfFrameWrapper>
            <iframe title={`sheet-${player.id}`} src={sheetUrl!} frameBorder={0} style={{ width: '100%', height: '100%' }} />
          </S.PdfFrameWrapper>
        ) : (
          <div style={{ padding: 16 }}>Sem ficha anexada.</div>
        )}
      </Modal>
    </>
  );
};
