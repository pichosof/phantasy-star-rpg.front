import styled from 'styled-components';
import { Button, List, SideBar } from 'antd-mobile';
import { Link } from 'react-router-dom';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '@app/styles/themes/constants';

export const MenuSheet = styled.div`
  width: min(92vw, 25rem);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--layout-sider-bg-color);
  color: var(--text-sider-secondary-color);
  box-shadow: -18px 0 36px rgba(0, 0, 0, 0.24);
`;

export const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 1rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

export const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  min-width: 0;
`;

export const LogoMark = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.875rem;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.375rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
`;

export const BrandCopy = styled.div`
  min-width: 0;
`;

export const BrandEyebrow = styled.div`
  color: var(--primary-color);
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.bold};
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
`;

export const BrandTitle = styled.div`
  color: #fff;
  font-size: ${FONT_SIZE.lg};
  font-weight: ${FONT_WEIGHT.extraBold};
  line-height: 1.1;
  white-space: nowrap;
`;

export const BrandSubtitle = styled.div`
  color: var(--text-sider-secondary-color);
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.medium};
  white-space: nowrap;
`;

export const SheetCloseButton = styled(Button)`
  && {
    color: var(--text-sider-secondary-color);
    padding: 0.375rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
  }
`;

export const MenuBody = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 6.25rem;
`;

export const MobileSideBar = styled(SideBar)`
  height: 100%;
  --width: 6.25rem;
  --background-color: transparent;
  padding: 0.75rem 0.75rem 0.75rem 0.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);

  .adm-side-bar-item {
    margin-bottom: 0.375rem;
    border-radius: 1rem;
    color: var(--text-sider-secondary-color);
  }

  .adm-side-bar-item-active {
    background: rgba(var(--primary-rgb-color), 0.12);
    box-shadow: inset 0 0 0 1px rgba(var(--primary-rgb-color), 0.18);
  }
`;

export const SideBarTitle = styled.div`
  display: grid;
  gap: 0.25rem;
  justify-items: center;
  text-align: center;
  color: var(--text-sider-secondary-color);
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.semibold};

  span[role='img'],
  svg {
    font-size: 1.125rem;
  }

  .adm-side-bar-item-active & {
    color: var(--primary-color);
  }
`;

export const MenuPanel = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 0.75rem;
`;

export const SectionMeta = styled.div`
  padding: 0.25rem 0.25rem 0;
`;

export const SectionEyebrow = styled.div`
  color: var(--primary-color);
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.bold};
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

export const SectionTitle = styled.div`
  color: #fff;
  font-size: ${FONT_SIZE.xl};
  font-weight: ${FONT_WEIGHT.extraBold};
`;

export const SectionHint = styled.div`
  color: var(--text-sider-secondary-color);
  font-size: ${FONT_SIZE.xs};
`;

export const SectionList = styled(List)`
  && {
    --border-top: none;
    --border-bottom: none;
    --border-inner: 1px solid rgba(255, 255, 255, 0.08);
    --background-color: rgba(255, 255, 255, 0.04);
    border-radius: ${BORDER_RADIUS};
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
  }

  .adm-list-item-content-prefix {
    color: var(--primary-color);
  }

  .adm-list-item {
    transition: background-color 0.2s ease;
  }

  .adm-list-item:active {
    background: rgba(var(--primary-rgb-color), 0.08);
  }

  .adm-list-item-content-arrow {
    order: -1;
    margin-left: 0;
    margin-right: 0.5rem;
  }
`;

export const ItemTitle = styled.div`
  color: var(--text-sider-primary-color);
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const ItemSubtitle = styled.div`
  color: var(--text-sider-secondary-color);
  font-size: ${FONT_SIZE.xs};
`;

export const ItemArrow = styled.span`
  color: var(--text-sider-primary-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;
