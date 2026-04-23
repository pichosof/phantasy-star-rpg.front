import styled from 'styled-components';
import { Input, Space, Typography } from 'antd';
import { Card } from '@app/components/common/Card/Card';
import { Tabs } from '@app/components/common/Tabs/Tabs';

export const SheetCardTitle = styled.span`
  font-weight: 700;
`;

export const TitleCard = styled(Card)`
  .ant-typography {
    margin: 0;
  }
`;

export const SheetToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

export const FilterTabs = styled(Tabs)`
  margin-bottom: 16px;
`;

export const SheetsGrid = styled.div<{ $mobile: boolean }>`
  display: grid;
  gap: 10px;
  grid-template-columns: ${({ $mobile }) => ($mobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))')};
`;

export const SheetNameInput = styled(Input)`
  width: 220px;
  font-weight: 700;
`;

export const ModalFields = styled(Space).attrs({
  direction: 'vertical',
  size: 12,
})`
  width: 100%;
`;

export const FieldLabel = styled(Typography.Text)`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
`;

export const FieldLabelWide = styled(Typography.Text)`
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
`;

export const SystemChoiceRow = styled(Space).attrs({
  size: 12,
})``;
