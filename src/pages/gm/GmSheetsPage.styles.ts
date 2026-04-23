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

export const MobileMetaTags = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  > * {
    flex: 1;
  }
`;

export const MobileSheetsList = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileSheetBody = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileSheetTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 1.05rem;
  line-height: 1.2;
  font-weight: 800;
  overflow-wrap: anywhere;
`;

export const MobileSheetMeta = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.82rem;
  line-height: 1.45;
`;

export const MobileSheetActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

export const MobileEmptyState = styled.div`
  min-height: 112px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--text-secondary-color);
`;
