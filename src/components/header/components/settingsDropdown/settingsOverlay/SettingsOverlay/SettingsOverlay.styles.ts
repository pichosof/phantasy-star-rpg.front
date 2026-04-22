import styled from 'styled-components';
import { Radio } from 'antd';
import { BORDER_RADIUS } from '@app/styles/themes/constants';

export const SettingsOverlayMenu = styled.div`
  width: 13rem;
  background: var(--component-background);
  border-radius: ${BORDER_RADIUS};
  box-shadow: var(--box-shadow);
  padding: 0.5rem 0 0;
  overflow: hidden;
`;

export const RadioBtn = styled(Radio)`
  font-size: 0.875rem;
`;

export const PwaInstallWrapper = styled.div`
  padding: 0 1rem 0.75rem;
`;
