import React from 'react';
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Modal } from '@app/components/common/Modal/Modal';
import * as S from './PlayerCard.styles';
import { useResponsive } from '@app/hooks/useResponsive';
import type { CardProps } from '@app/components/common/Card/Card';
import type { Player } from '@app/types/rpg';

type PlayerCardProps = CardProps & {
  player: Player;
  /** Mostra controles do GM (visibilidade, etc) */
  gm?: boolean;
  onToggleVisible?: (p: Player) => void;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, gm = false, onToggleVisible, ...cardProps }) => {
  const { mobileOnly } = useResponsive();
  const [openPdf, setOpenPdf] = React.useState(false);

  const hasSheet = !!player.sheetUrl;
  const img = player.imageUrl || '/assets/images/stub-avatar.webp';

  return (
    <>
      <S.Card padding={0} $img={img} {...cardProps}>
        {/* topo com imagem animada */}
        <S.PlayerImage src={img} alt={player.imageAlt || player.name} />

        {/* conteúdo */}
        <S.Info>
          <S.HeaderRow>
            <S.Title level={5} ellipsis>
              {player.name}
            </S.Title>
            <S.LevelBadge>Lv {player.level}</S.LevelBadge>
          </S.HeaderRow>

          {player.background && <S.BackgroundText title={player.background}>{player.background}</S.BackgroundText>}

          <S.ActionsRow>
            <Button disabled={!hasSheet} type="primary" icon={<EyeOutlined />} onClick={() => setOpenPdf(true)}>
              {hasSheet ? 'Abrir Ficha' : 'Sem ficha'}
            </Button>

            {hasSheet && (
              <a href={player.sheetUrl!} target="_blank" rel="noreferrer">
                <Button type="default" icon={<FilePdfOutlined />}>
                  Baixar PDF
                </Button>
              </a>
            )}
          </S.ActionsRow>

          {gm && (
            <S.GMRow>
              <span>Visível p/ jogadores</span>
              <Switch checked={player.visible ?? true} onChange={() => onToggleVisible?.(player)} />
            </S.GMRow>
          )}
        </S.Info>
      </S.Card>

      {/* Modal com a ficha PDF */}
      <Modal
        visible={openPdf}
        title={`Ficha — ${player.name}`}
        onCancel={() => setOpenPdf(false)}
        footer={null}
        width={mobileOnly ? '95%' : 900}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        {hasSheet ? (
          <S.PdfFrameWrapper>
            {/* usa iframe para deixar leve e compatível */}
            <iframe
              title={`sheet-${player.id}`}
              src={player.sheetUrl!}
              frameBorder="0"
              style={{ width: '100%', height: '100%' }}
            />
          </S.PdfFrameWrapper>
        ) : (
          <div style={{ padding: 16 }}>Sem ficha anexada.</div>
        )}
      </Modal>
    </>
  );
};
