import styled from 'styled-components';
import { Radio } from 'antd';
import { BORDER_RADIUS } from '@app/styles/themes/constants';

export const SettingsOverlayMenu = styled.div<{ $isSheet?: boolean }>`
  width: ${(props) => (props.$isSheet ? '100%' : '13rem')};
  background: ${(props) => (props.$isSheet ? 'transparent' : 'var(--additional-background-color)')};
  border: ${(props) => (props.$isSheet ? '0' : '1px solid var(--border-color)')};
  border-radius: ${(props) => (props.$isSheet ? '0' : BORDER_RADIUS)};
  box-shadow: ${(props) => (props.$isSheet ? 'none' : 'var(--box-shadow)')};
  padding: ${(props) => (props.$isSheet ? '0.25rem 0 0' : '0.5rem 0 0')};
  overflow: hidden;
`;

export const RadioBtn = styled(Radio)`
  font-size: 0.875rem;
`;

export const PwaInstallWrapper = styled.div`
  padding: 0 1rem 0.75rem;
`;
