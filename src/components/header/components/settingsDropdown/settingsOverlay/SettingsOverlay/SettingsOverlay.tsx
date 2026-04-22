import React from 'react';
import { DropdownCollapse } from '@app/components/header/Header.styles';
import { NightModeSettings } from '../nightModeSettings/NightModeSettings';
import { ThemePicker } from '../ThemePicker/ThemePicker';
import { Button } from '@app/components/common/buttons/Button/Button';
import { useAppSelector } from '@app/hooks/reduxHooks';
import * as S from './SettingsOverlay.styles';

export const SettingsOverlay: React.FC = ({ ...props }) => {
  const { isPWASupported, event } = useAppSelector((state) => state.pwa);

  return (
    <S.SettingsOverlayMenu mode="inline" selectable={false} {...props}>
      <DropdownCollapse bordered={false} expandIconPosition="end" ghost defaultActiveKey="themePicker">
        <DropdownCollapse.Panel header="Change Theme" key="themePicker">
          <ThemePicker />
        </DropdownCollapse.Panel>
        <DropdownCollapse.Panel header="Night Mode" key="nightMode">
          <NightModeSettings />
        </DropdownCollapse.Panel>
      </DropdownCollapse>
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
