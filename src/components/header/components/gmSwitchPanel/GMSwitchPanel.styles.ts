import styled from 'styled-components';
import { Card } from '@app/components/common/Card/Card';

export const PanelCard = styled(Card)`
  margin: 16px;
  padding: 12px;
`;

export const DesktopActiveRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const DesktopStatusLabel = styled.span`
  color: var(--success-color);
`;

export const DesktopForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DesktopFormRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

export const DesktopErrorText = styled.span`
  color: var(--error-color);
  font-size: 12px;
`;

export const SheetContent = styled.div`
  display: grid;
  gap: 0.875rem;
  padding: 0.25rem 0 0.5rem;
`;

export const StatusBlock = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: rgba(var(--success-rgb-color), 0.12);
  border: 1px solid rgba(var(--success-rgb-color), 0.18);
`;

export const StatusLabel = styled.div`
  color: var(--success-color);
  font-weight: 700;
`;

export const StatusHint = styled.div`
  color: var(--text-main-color);
  font-size: 0.875rem;
  line-height: 1.45;
`;

export const HelperText = styled.div`
  color: var(--text-main-color);
  font-size: 0.875rem;
  line-height: 1.45;
`;

export const ErrorText = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  line-height: 1.4;
`;
