// src/components/rpg/PlayerCard/PlayerCard.styles.ts
import styled from 'styled-components';
import { Card as BaseCard } from '@app/components/common/Card/Card';
import { Button } from '@app/components/common/buttons/Button/Button';
import { BREAKPOINTS } from '@app/styles/themes/constants';

interface CardInternalProps {
  $img?: string;
}

export const Card = styled(BaseCard)<CardInternalProps>`
  position: relative;
  overflow: hidden;
  padding: 0;
  box-shadow: var(--box-shadow-nft-color);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  .ant-card-body {
    padding: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-3px);
      box-shadow:
        0 0 0 1px rgba(0, 200, 232, 0.2),
        0 8px 32px rgba(0, 200, 232, 0.08);
    }
  }
`;

export const PlayerImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center top;

  @media only screen and (max-width: ${BREAKPOINTS.md - 0.02}px) {
    height: auto;
    max-height: 320px;
    object-fit: contain;
    object-position: center top;
    background: var(--secondary-background-color);
    display: block;
  }
`;

export const TopOverlay = styled.div`
  display: none;
`;

export const Info = styled.div`
  position: relative;
  padding: 12px;
  display: grid;
  gap: 10px;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: baseline;
`;

export const Title = styled.div`
  font-weight: 800;
  font-size: 18px;
  line-height: 1.2;
  color: var(--text-main-color);
`;

export const LevelBadge = styled.span`
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
`;

export const BackgroundPreview = styled.div`
  color: var(--text-primary-color);
  opacity: 0.9;
`;

export const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const GMRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const PdfFrameWrapper = styled.div`
  width: 100%;
  height: 75vh;
  max-height: 80vh;
`;

export const BackgroundParagraphs = styled.div`
  display: grid;
  gap: 12px;
`;

export const BackgroundParagraph = styled.p`
  white-space: pre-wrap;
  margin: 0;
`;

export const ActionButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const VisibleLabel = styled.span`
  opacity: 0.75;
`;

export const ProfileContent = styled.div`
  display: grid;
`;

export const ProfileHero = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => `${$height}px`};
`;

export const ProfileHeroImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
`;

export const ProfileHeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.35) 40%, rgba(0, 0, 0, 0) 100%);
`;

export const ProfileHeroMeta = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: #fff;
`;

export const ProfileHeroName = styled.div<{ $mobile: boolean }>`
  font-weight: 800;
  font-size: ${({ $mobile }) => ($mobile ? '18px' : '22px')};
`;

export const ProfileHeroLevel = styled.div`
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.45);
  font-size: 12px;
`;

export const ProfileSections = styled.div`
  padding: 16px;
  display: grid;
  gap: 16px;
`;

export const SectionTitle = styled.div`
  font-weight: 700;
  margin-bottom: 8px;
`;

export const DetailsSection = styled.section`
  display: grid;
  gap: 8px;
`;

export const DetailsList = styled.div`
  display: grid;
  gap: 6px;
`;

export const LoadingShell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const EmptySheet = styled.div`
  padding: 16px;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LinkLike = styled(Button as any).attrs({ type: 'text' })`
  padding: 0;
  height: auto;
`;
