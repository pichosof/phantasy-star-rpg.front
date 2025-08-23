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

  .ant-card-body {
    padding: 0;
  }

  /* Efeito de “zoom NFT” só em dispositivos com hover + mouse (desktop) */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      ${(p) =>
        p.$img &&
        `
        background-image: url(${p.$img});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `}
    }
  }
`;

export const PlayerImage = styled.img`
  width: 100%;
  height: 200px; /* desktop */
  object-fit: cover; /* desktop: pode cortar pra preencher */
  animation: imgOut 0.5s;

  /* MOBILE: mostrar a imagem inteira (sem corte) com limite de altura */
  @media only screen and (max-width: ${BREAKPOINTS.md - 0.02}px) {
    height: auto; /* respeita proporção natural */
    max-height: 320px; /* ajustável: 280–360px funciona bem */
    object-fit: contain; /* mostra a imagem inteira */
    background: var(--secondary-background-color); /* fundo atrás de PNG/WebP transpar. */
    display: block;
  }

  @keyframes imgIn {
    99% {
      transform: scale(2);
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes imgOut {
    0% {
      transform: scale(2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Zoom/fade só no desktop */
  @media (hover: hover) and (pointer: fine) {
    ${Card}:hover & {
      animation: imgIn 0.5s;
      animation-fill-mode: forwards;
    }
  }
`;

export const TopOverlay = styled.div`
  position: absolute;
  inset: 0 0 auto 0;
  height: 200px; /* casa com a altura desktop da imagem */
  pointer-events: none;

  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.15) 35%,
    rgba(0, 0, 0, 0.35) 70%,
    rgba(0, 0, 0, 0.55) 100%
  );

  /* MOBILE: sem overlay (altura da imagem é variável) */
  @media only screen and (max-width: ${BREAKPOINTS.md - 0.02}px) {
    display: none;
  }
`;

export const Info = styled.div`
  position: relative;
  padding: 12px;
  display: grid;
  gap: 10px;

  /* Só troca cores no hover em desktop */
  @media (hover: hover) and (pointer: fine) {
    ${Card}:hover & {
      color: var(--text-secondary-color);
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

  @media (hover: hover) and (pointer: fine) {
    ${Card}:hover & {
      color: var(--text-secondary-color);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
  }
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
