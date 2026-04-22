import React from 'react';
import { DropdownCollapse } from '@app/components/header/Header.styles';
import { NightModeSettings } from '../nightModeSettings/NightModeSettings';
import { ThemePicker } from '../ThemePicker/ThemePicker';
import { Button } from '@app/components/common/buttons/Button/Button';
import { useAppSelector } from '@app/hooks/reduxHooks';
import * as S from './SettingsOverlay.styles';

export const SettingsOverlay: React.FC = () => {
  const { isPWASupported, event } = useAppSelector((state) => state.pwa);
  const collapseItems = [
    {
      key: 'themePicker',
      label: 'Change Theme',
      children: <ThemePicker />,
    },
    {
      key: 'nightMode',
      label: 'Night Mode',
      children: <NightModeSettings />,
    },
  ];

  return (
    <S.SettingsOverlayMenu>
      <DropdownCollapse
        bordered={false}
        expandIconPlacement="end"
        ghost
        defaultActiveKey="themePicker"
        items={collapseItems}
      />
      {isPWASupported && (
        <S.PwaInstallWrapper>
          <Button block type="primary" onClick={() => event && (event as BeforeInstallPromptEvent).prompt()}>
            Install App
          </Button>
        </S.PwaInstallWrapper>
      )}
    </S.SettingsOverlayMenu>
  );
};
