import styled from 'styled-components';
import { Button, Popup } from 'antd-mobile';
import { FONT_SIZE, FONT_WEIGHT, LAYOUT } from '@app/styles/themes/constants';

export const MobileNavShell = styled.div`
  width: 100%;

  .adm-nav-bar {
    padding: 0;
    --height: ${LAYOUT.mobile.headerHeight};
    --border-bottom: none;
  }

  .adm-nav-bar-right {
    flex: 0 0 auto;
  }

  .adm-nav-bar-right {
    display: flex;
    justify-content: flex-end;
  }

  .adm-nav-bar-title {
    min-width: 0;
    display: flex;
    justify-content: center;
  }
`;

export const MobileBrand = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.125rem;
  text-align: center;
`;

export const MobileBrandEyebrow = styled.div`
  color: var(--primary-color);
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.bold};
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.9;
`;

export const MobileBrandTitle = styled.div`
  color: var(--text-main-color);
  font-size: ${FONT_SIZE.lg};
  font-weight: ${FONT_WEIGHT.extraBold};
  line-height: 1;
  white-space: nowrap;
`;

export const MobileActionCluster = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export const MobileIconButton = styled(Button)<{ $isActive?: boolean }>`
  && {
    --text-color: ${(props) => (props.$isActive ? 'var(--white)' : 'var(--text-main-color)')};
    --background-color: ${(props) =>
      props.$isActive ? 'var(--primary-color)' : 'rgba(var(--primary-rgb-color), 0.08)'};
    --border-color: rgba(var(--primary-rgb-color), 0.14);
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(var(--primary-rgb-color), 0.1);
  }

  svg,
  span[role='img'] {
    font-size: 1.125rem;
  }
`;

export const MobileSheet = styled.div`
  width: 100%;
  max-height: min(88vh, 42rem);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--additional-background-color) 0%, var(--background-color) 100%);
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  overflow: hidden;
`;

export const MobileSheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(var(--primary-rgb-color), 0.12);
`;

export const MobileSheetTitleBlock = styled.div`
  min-width: 0;
`;

export const MobileSheetEyebrow = styled.div`
  color: var(--primary-color);
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.bold};
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

export const MobileSheetTitle = styled.div`
  color: var(--text-main-color);
  font-size: ${FONT_SIZE.xl};
  font-weight: ${FONT_WEIGHT.extraBold};
`;

export const MobileSheetHint = styled.div`
  color: var(--text-light-color);
  font-size: ${FONT_SIZE.xs};
  line-height: 1.45;
`;

export const MobileSheetBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 1rem 1rem;
`;

export const MobileSheetPopup = styled(Popup)`
  .adm-popup-body {
    background: transparent;
  }
`;
