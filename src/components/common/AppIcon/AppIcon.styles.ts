import styled from 'styled-components';

const resolveSize = (value?: number | string) => {
  if (typeof value === 'number') return `${value}px`;
  return value ?? '1em';
};

export const IconSlot = styled.span<{ $size?: number | string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: ${(props) => resolveSize(props.$size)};
  flex-shrink: 0;

  svg {
    display: block;
  }
`;

export const IconLabelRoot = styled.span<{ $gap?: number | string }>`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => resolveSize(props.$gap)};
  line-height: inherit;
`;
