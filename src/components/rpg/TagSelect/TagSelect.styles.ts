import styled from 'styled-components';
import { Select, Tag } from 'antd';

export const ReadonlyTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const ReadonlyTag = styled(Tag)`
  margin: 0;
`;

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FullWidthSelect = styled(Select)`
  width: 100%;
`;

export const OptionLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const OptionDot = styled.span<{ $color?: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color ?? 'transparent'};
  display: inline-block;
  flex-shrink: 0;
`;

export const SelectedTag = styled(Tag)`
  margin-right: 4px;
`;

export const CreateRow = styled.div`
  display: flex;
  gap: 4px;
`;

export const CreateInput = styled.input`
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font-size: 13px;
`;

export const CreateButton = styled.button`
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  color: inherit;
`;
