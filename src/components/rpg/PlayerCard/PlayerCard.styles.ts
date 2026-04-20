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
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  .ant-card-body {
    padding: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0, 200, 232, 0.2), 0 8px 32px rgba(0, 200, 232, 0.08);
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

export const LinkLike = styled(Button).attrs({ type: 'text' })`
  padding: 0;
  height: auto;
`;
