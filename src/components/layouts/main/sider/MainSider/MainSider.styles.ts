import styled, { css } from 'styled-components';
import { Button, Layout } from 'antd';
import { Link } from 'react-router-dom';
import { media } from '@app/styles/themes/constants';
import { LAYOUT } from '@app/styles/themes/constants';

export const Sider = styled(Layout.Sider)`
  position: fixed;
  overflow: visible;
  right: 0;
  z-index: 5;
  min-height: 100vh;
  max-height: 100vh;
  background: var(--layout-sider-bg-color) !important;

  color: var(--text-secondary-color);

  .ant-layout-sider-children {
    background: transparent;
  }

  @media only screen and ${media.md} {
    right: unset;
    left: 0;
  }

  @media only screen and ${media.xl} {
    position: unset;
  }
`;

export const CollapseButton = styled(Button)<{ $isCollapsed: boolean }>`
  background: var(--collapse-background-color);

  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  position: absolute;
  right: 0.5rem;

  ${(props) =>
    props.$isCollapsed &&
    css`
      right: -1rem;
    `}

  color: var(--text-secondary-color);

  &:hover {
    color: var(--text-secondary-color);
    background: var(--primary-color);
    border: 1px solid var(--border-color);
  }

  &:focus {
    color: var(--text-secondary-color);
    background: var(--primary-color);
    border: 1px solid var(--border-color);
  }
`;

export const SiderContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - ${LAYOUT.mobile.headerHeight});

  @media only screen and ${media.md} {
    max-height: calc(100vh - ${LAYOUT.desktop.headerHeight});
  }
`;

export const SiderLogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex: 1;
  min-width: 0;
`;

export const SiderLogoDiv = styled.div<{ $isCollapsed?: boolean }>`
  height: ${LAYOUT.mobile.headerHeight};
  padding: ${(p) => (p.$isCollapsed ? '18px 0' : '16px 18px')};
  display: flex;
  justify-content: ${(p) => (p.$isCollapsed ? 'center' : 'space-between')};
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media only screen and ${media.md} {
    height: ${LAYOUT.desktop.headerHeight};
    padding: ${(p) => (p.$isCollapsed ? '18px 0' : '16px 18px')};
  }
`;

export const LogoMark = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: contain;
`;

export const BrandBlock = styled.div`
  line-height: 1.25;
  min-width: 0;
`;

export const BrandName = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
`;

export const BrandAccent = styled.span`
  color: var(--primary-color);
`;

export const BrandSub = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: var(--primary-color);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
`;

/** @deprecated — kept only so old imports don't break during migration */
export const BrandSpan = BrandName;
