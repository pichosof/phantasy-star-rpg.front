import React from 'react';
import styled from 'styled-components';
import { GithubOutlined } from '@ant-design/icons';
import { IS_DEMO } from './demoMode';

const Bar = styled.div`
  position: sticky;
  top: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: #1a1a1a;
  background: linear-gradient(90deg, #ffd54f 0%, #ffca28 50%, #ffd54f 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);
  text-align: center;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.85);
  color: #ffd54f;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const RepoLink = styled.a`
  color: #1a1a1a;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #000;
  }
`;

/**
 * Sticky banner shown above the app shell whenever the build is in demo mode.
 * Communicates that the deploy is read-only and points to the source.
 */
export const DemoBanner: React.FC = () => {
  if (!IS_DEMO) return null;
  return (
    <Bar role="status" aria-label="Read-only demo">
      <Pill>🎲 Demo</Pill>
      <span>
        Read-only preview of <strong>Picho-RPG</strong>. No GM mode, no uploads, no edits — every action is mocked.
      </span>
      <RepoLink
        href="https://github.com/picho-org/picho-rpg-front"
        target="_blank"
        rel="noreferrer"
        aria-label="View source on GitHub"
      >
        <GithubOutlined /> Source
      </RepoLink>
    </Bar>
  );
};

export default DemoBanner;
