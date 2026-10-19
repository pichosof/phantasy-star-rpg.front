import styled, { css } from 'styled-components';

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const RoundBox = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main-color);
  font-weight: 600;

  small {
    color: var(--text-muted-color);
    font-weight: 400;
  }
`;

export const SyncText = styled.span<{ $tone: 'ok' | 'busy' | 'warn' | 'bad' }>`
  font-size: 0.85rem;
  color: ${({ $tone }) =>
    $tone === 'ok'
      ? 'var(--success-color)'
      : $tone === 'warn'
        ? 'var(--warning-color)'
        : $tone === 'bad'
          ? 'var(--error-color)'
          : 'var(--text-muted-color)'};
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Card = styled.div<{ $acting: boolean; $defeated: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--additional-background-color);
  color: var(--text-main-color);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  ${({ $acting }) =>
    $acting &&
    css`
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-color);
    `}

  ${({ $defeated }) =>
    $defeated &&
    css`
      opacity: 0.55;
    `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const Name = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Stat = styled.span`
  font-size: 0.8rem;
  color: var(--text-muted-color);
`;

export const Initiative = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

export const Pools = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 4px 16px;
`;

export const Pool = styled.div`
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;

  .ant-progress {
    margin: 0;
  }
`;

export const PoolLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted-color);
`;

export const PoolValue = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
`;

export const Conditions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 12px;

  @media (max-width: 1100px) {
    position: static;
  }
`;

export const Log = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 55vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;

  li {
    display: flex;
    gap: 8px;
    color: var(--text-main-color);
  }

  small {
    color: var(--text-muted-color);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
`;

export const Empty = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted-color);
  border: 1px dashed var(--border-color);
  border-radius: 12px;
`;
