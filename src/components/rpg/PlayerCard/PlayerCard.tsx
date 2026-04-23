import React from 'react';
import { EyeOutlined, IdcardOutlined } from '@ant-design/icons';
import { Button } from '@app/components/common/buttons/Button/Button';
import { PdfDocumentViewer } from '@app/components/common/pdf/PdfDocumentViewer/PdfDocumentViewer';
import { Switch } from '@app/components/common/Switch/Switch';
import { Modal } from '@app/components/common/Modal/Modal';
import { Spin } from 'antd';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl, fetchBlobUrl } from '@app/api/http.api';
import type { Player } from '@app/types/rpg';
import * as S from './PlayerCard.styles';

type PlayerCardProps = {
  player: Player;
  gm?: boolean;
  onToggleVisible?: (player: Player) => void;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, gm = false, onToggleVisible }) => {
  const { mobileOnly } = useResponsive();

  const [openProfile, setOpenProfile] = React.useState(false);
  const [openPdf, setOpenPdf] = React.useState(false);
  const [sheetBlobUrl, setSheetBlobUrl] = React.useState<string | null>(null);
  const [sheetLoading, setSheetLoading] = React.useState(false);

  const imageUrl = player.imageUrl ? resolveApiUrl(player.imageUrl) : '/assets/images/stub-avatar.webp';
  const hasSheet = Boolean(player.sheetUrl);

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

  const renderBackground = (text: string) => {
    const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/);

    return (
      <S.BackgroundParagraphs>
        {paragraphs.map((paragraph, index) => (
          <S.BackgroundParagraph key={index}>{paragraph}</S.BackgroundParagraph>
        ))}
      </S.BackgroundParagraphs>
    );
  };

  const previewBackground =
    player.background && player.background.length > 120
      ? `${player.background.slice(0, 120).trimEnd()}`
      : player.background || '';

  return (
    <>
      <S.Card padding={0} $img={imageUrl}>
        <S.PlayerImage src={imageUrl} alt={player.imageAlt || player.name} />
        <S.TopOverlay />

        <S.Info>
          <S.HeaderRow>
            <S.Title>{player.name}</S.Title>
            <S.LevelBadge>LV {player.level}</S.LevelBadge>
          </S.HeaderRow>

          {!!previewBackground && (
            <S.BackgroundPreview title={player.background || ''}>{previewBackground}</S.BackgroundPreview>
          )}

          <S.ActionsRow>
            <S.ActionButtonsRow>
              <Button icon={<IdcardOutlined />} onClick={() => setOpenProfile(true)}>
                Profile
              </Button>

              <Button disabled={!hasSheet} type="primary" icon={<EyeOutlined />} onClick={openSheet}>
                {hasSheet ? 'Sheet' : 'No sheet'}
              </Button>
            </S.ActionButtonsRow>

            {gm && (
              <S.GMRow>
                <S.VisibleLabel>Visible</S.VisibleLabel>
                <Switch checked={player.visible ?? true} onChange={() => onToggleVisible?.(player)} />
              </S.GMRow>
            )}
          </S.ActionsRow>
        </S.Info>
      </S.Card>

      <Modal
        open={openProfile}
        onCancel={() => setOpenProfile(false)}
        footer={null}
        width={mobileOnly ? '96vw' : '760px'}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden
        title={`Profile â€” ${player.name}`}
      >
        <S.ProfileContent>
          <S.ProfileHero $height={mobileOnly ? 220 : 260}>
            <S.ProfileHeroImage src={imageUrl} alt={player.imageAlt || player.name} />
            <S.ProfileHeroOverlay />
            <S.ProfileHeroMeta>
              <S.ProfileHeroName $mobile={mobileOnly}>{player.name}</S.ProfileHeroName>
              <S.ProfileHeroLevel>LV {player.level}</S.ProfileHeroLevel>
            </S.ProfileHeroMeta>
          </S.ProfileHero>

          <S.ProfileSections>
            {player.background && (
              <section>
                <S.SectionTitle>Story</S.SectionTitle>
                {renderBackground(player.background)}
              </section>
            )}

            <S.DetailsSection>
              <S.SectionTitle>Details</S.SectionTitle>
              <S.DetailsList>
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
              </S.DetailsList>
            </S.DetailsSection>
          </S.ProfileSections>
        </S.ProfileContent>
      </Modal>

      <Modal
        open={openPdf}
        title={`Sheet â€” ${player.name}`}
        onCancel={() => setOpenPdf(false)}
        footer={null}
        width={mobileOnly ? '96vw' : '82vw'}
        styles={{ body: { padding: 0, height: '80vh' } }}
        destroyOnHidden
      >
        <S.PdfFrameWrapper>
          {sheetLoading ? (
            <S.LoadingShell>
              <Spin size="large" />
            </S.LoadingShell>
          ) : sheetBlobUrl ? (
            <PdfDocumentViewer url={sheetBlobUrl} />
          ) : (
            <S.EmptySheet>No sheet attached.</S.EmptySheet>
          )}
        </S.PdfFrameWrapper>
      </Modal>
    </>
  );
};
