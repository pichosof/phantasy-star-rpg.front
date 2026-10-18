import React from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Button } from '@app/components/common/buttons/Button/Button';
import { PdfDocumentViewer } from '@app/components/common/pdf/PdfDocumentViewer/PdfDocumentViewer';
import { Switch } from '@app/components/common/Switch/Switch';
import { Modal } from '@app/components/common/Modal/Modal';
import { Spin } from 'antd';
import { useResponsive } from '@app/hooks/useResponsive';
import { resolveApiUrl, fetchBlobUrl } from '@app/api/http.api';
import type { Player } from '@app/types/rpg';
import * as S from './PlayerCard.styles';
import RichText from '@app/components/common/RichText/RichText';
import EntityCard from '@app/components/common/EntityCard/EntityCard';
import { Tag } from 'antd';

type PlayerCardProps = {
  player: Player;
  gm?: boolean;
  onToggleVisible?: (player: Player) => void;
  /** Replaces the profile modal (phones open the player sheet). */
  onOpen?: () => void;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, gm = false, onToggleVisible, onOpen }) => {
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

  return (
    <>
      <EntityCard
        actions={
          <>
            {gm && (
              <Switch
                checked={player.visible ?? true}
                onChange={() => onToggleVisible?.(player)}
                size="small"
                title="Visible to players"
              />
            )}
            <Button disabled={!hasSheet} icon={<EyeOutlined />} onClick={openSheet} size="small" type="primary">
              {hasSheet ? 'Sheet' : 'No sheet'}
            </Button>
          </>
        }
        cover={player.imageUrl ? { src: imageUrl, alt: player.imageAlt || player.name } : null}
        coverTags={<Tag color="geekblue">LV {player.level}</Tag>}
        icon="player"
        label="Player"
        onClick={onOpen ?? (() => setOpenProfile(true))}
        openText="Profile"
        seed={player.id}
        status={gm ? { visible: player.visible ?? true } : undefined}
        summary={player.background}
        summaryFallback="No background added yet."
        title={player.name}
      />

      <Modal
        open={openProfile}
        onCancel={() => setOpenProfile(false)}
        footer={null}
        width={mobileOnly ? '96vw' : '760px'}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden
        title={`Profile - ${player.name}`}
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
                <S.BackgroundParagraphs>
                  <RichText>{player.background}</RichText>
                </S.BackgroundParagraphs>
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
        title={`Sheet - ${player.name}`}
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
