import styled from 'styled-components';
import { Typography } from 'antd';
import { NFTCard } from '@app/components/nft-dashboard/common/NFTCard/NFTCard';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, media, BREAKPOINTS, BORDER_RADIUS } from '@app/styles/themes/constants';

interface CardInternalProps {
  $img: string;
}

export const Card = styled(NFTCard)<CardInternalProps>`
  overflow: hidden;
  box-shadow: var(--box-shadow-nft-color);

  &:hover {
    & {
      background: ${(p) => `url(${p.$img})`};
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    ${() => PlayerImage} {
      animation: imgIn 0.5s;
      animation-fill-mode: forwards;
    }

    ${() => Title} {
      animation: titleIn 0.5s ease;
      animation-fill-mode: forwards;
      color: var(--text-secondary-color);
    }

    ${() => BackgroundText} {
      color: var(--text-secondary-color);
    }
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

  @keyframes titleIn {
    0% {
      left: 0;
    }
    100% {
      left: 50%;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  @keyframes titleOut {
    0% {
      left: 50%;
      transform: translate(-50%, -50%) scale(1.2);
    }
    100% {
      left: 0;
    }
  }
`;

export const PlayerImage = styled.img`
  animation: imgOut 0.5s;
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-top-left-radius: ${BORDER_RADIUS};
  border-top-right-radius: ${BORDER_RADIUS};

  @media only screen and ${media.xl} {
    height: 260px;
  }
`;

export const Info = styled.div`
  padding: 1rem 1.25rem 1.25rem;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

export const Title = styled(Typography.Title)`
  position: relative;
  animation: titleOut 0.5s;

  &.ant-typography {
    margin-bottom: 0;
    font-size: ${FONT_SIZE.lg};
    line-height: 1.2;
  }
`;

export const LevelBadge = styled.div`
  background: var(--primary-color);
  color: var(--text-secondary-color);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.semibold};
  white-space: nowrap;
`;

export const BackgroundText = styled.div`
  color: var(--text-nft-light-color);
  font-size: ${FONT_SIZE.xs};
  font-family: ${FONT_FAMILY.secondary};
  margin-bottom: 0.75rem;
  max-height: 3.2em;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;

  @media only screen and ${media.xl} {
    font-size: ${FONT_SIZE.md};
  }
`;

export const ActionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
`;

export const GMRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-nft-color);

  & > span {
    color: var(--text-main-color);
    font-size: ${FONT_SIZE.xs};
  }
`;

export const PdfFrameWrapper = styled.div`
  width: 100%;
  height: 80vh;

  @media only screen and (max-width: ${BREAKPOINTS.md - 0.02}px) {
    height: 70vh;
  }
`;
