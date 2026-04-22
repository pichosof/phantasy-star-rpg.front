import React from 'react';
import { message } from 'antd';
import { DropdownCollapse } from '@app/components/header/Header.styles';
import { NightModeSettings } from '../nightModeSettings/NightModeSettings';
import { ThemePicker } from '../ThemePicker/ThemePicker';
import { Button } from '@app/components/common/buttons/Button/Button';
import { useAppDispatch, useAppSelector } from '@app/hooks/reduxHooks';
import { clearDeferredPrompt } from '@app/store/slices/pwaSlice';
import * as S from './SettingsOverlay.styles';

export const SettingsOverlay: React.FC = () => {
  const dispatch = useAppDispatch();
  const { event, isStandalone } = useAppSelector((state) => state.pwa);
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

  const handleInstallApp = async () => {
    if (event) {
      await event.prompt();
      await event.userChoice;
      dispatch(clearDeferredPrompt());
      return;
    }

    if (!window.isSecureContext) {
      message.info(
        'Install prompt requires HTTPS or localhost. This network URL can open the app, but cannot install it as a PWA.',
      );
      return;
    }

    message.info('Use your browser menu to install this app on your device.');
  };

  return (
    <S.SettingsOverlayMenu>
      <DropdownCollapse
        bordered={false}
        expandIconPlacement="end"
        ghost
        defaultActiveKey="themePicker"
        items={collapseItems}
      />
      {!isStandalone && (
        <S.PwaInstallWrapper>
          <Button block type="primary" onClick={() => void handleInstallApp()}>
            Install App
          </Button>
        </S.PwaInstallWrapper>
      )}
    </S.SettingsOverlayMenu>
  );
};
