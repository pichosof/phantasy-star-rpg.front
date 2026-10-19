/* theme-isolation-ignore-file: the remaining colors are overlays on the player portrait */
// src/components/rpg/PlayerCard/PlayerCard.styles.ts
import styled from 'styled-components';
import { Card as BaseCard } from '@app/components/common/Card/Card';

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
        0 0 0 1px rgba(var(--primary-rgb-color), 0.2),
        0 8px 32px rgba(var(--primary-rgb-color), 0.08);
    }
  }
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

export const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const PdfFrameWrapper = styled.div`
  width: 100%;
  height: 75vh;
  max-height: 80vh;
`;

export const SectionTitle = styled.div`
  font-weight: 700;
  margin-bottom: 8px;
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
