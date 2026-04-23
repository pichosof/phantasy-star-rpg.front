import React from 'react';
import { Button, NavBar, SafeArea } from 'antd-mobile';
import { CloseOutline, SetOutline, UnorderedListOutline, UserCircleOutline } from 'antd-mobile-icons';
import GMSwitchPanel from '../components/gmSwitchPanel/GMSwitchPanel';
import { SettingsOverlay } from '../components/settingsDropdown/settingsOverlay/SettingsOverlay/SettingsOverlay';
import { useGMMode } from '@app/hooks/useGMMode';
import * as S from './MobileHeader.styles';

interface MobileHeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ toggleSider, isSiderOpened }) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [gmOpen, setGMOpen] = React.useState(false);
  const isGM = useGMMode();

  return (
    <>
      <S.MobileNavShell>
        <NavBar
          back={null}
          right={
            <S.MobileActionCluster>
              <S.MobileIconButton
                fill="none"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
                $isActive={settingsOpen}
              >
                <SetOutline />
              </S.MobileIconButton>
              <S.MobileIconButton
                fill="none"
                onClick={() => setGMOpen(true)}
                aria-label="Open GM mode"
                $isActive={gmOpen || isGM}
              >
                <UserCircleOutline />
              </S.MobileIconButton>
              <S.MobileIconButton
                fill="none"
                onClick={toggleSider}
                aria-label="Toggle navigation"
                $isActive={isSiderOpened}
              >
                {isSiderOpened ? <CloseOutline /> : <UnorderedListOutline />}
              </S.MobileIconButton>
            </S.MobileActionCluster>
          }
        >
          <S.MobileBrand>
            <S.MobileBrandEyebrow>Algol system</S.MobileBrandEyebrow>
            <S.MobileBrandTitle>RPG Companion</S.MobileBrandTitle>
          </S.MobileBrand>
        </NavBar>
      </S.MobileNavShell>

      <S.MobileSheetPopup
        visible={settingsOpen}
        position="bottom"
        onClose={() => setSettingsOpen(false)}
        onMaskClick={() => setSettingsOpen(false)}
      >
        <S.MobileSheet>
          <SafeArea position="top" />
          <S.MobileSheetHeader>
            <S.MobileSheetTitleBlock>
              <S.MobileSheetEyebrow>Theme controls</S.MobileSheetEyebrow>
              <S.MobileSheetTitle>Settings</S.MobileSheetTitle>
              <S.MobileSheetHint>Theme, night mode and install shortcuts for mobile play.</S.MobileSheetHint>
            </S.MobileSheetTitleBlock>

            <Button fill="none" onClick={() => setSettingsOpen(false)}>
              <CloseOutline />
            </Button>
          </S.MobileSheetHeader>

          <S.MobileSheetBody>
            <SettingsOverlay variant="sheet" />
          </S.MobileSheetBody>
          <SafeArea position="bottom" />
        </S.MobileSheet>
      </S.MobileSheetPopup>

      <S.MobileSheetPopup
        visible={gmOpen}
        position="bottom"
        onClose={() => setGMOpen(false)}
        onMaskClick={() => setGMOpen(false)}
      >
        <S.MobileSheet>
          <SafeArea position="top" />
          <S.MobileSheetHeader>
            <S.MobileSheetTitleBlock>
              <S.MobileSheetEyebrow>Game master</S.MobileSheetEyebrow>
              <S.MobileSheetTitle>GM Mode</S.MobileSheetTitle>
              <S.MobileSheetHint>
                Authenticate once to unlock admin routes and hidden campaign controls.
              </S.MobileSheetHint>
            </S.MobileSheetTitleBlock>

            <Button fill="none" onClick={() => setGMOpen(false)}>
              <CloseOutline />
            </Button>
          </S.MobileSheetHeader>

          <S.MobileSheetBody>
            <GMSwitchPanel variant="sheet" onClose={() => setGMOpen(false)} />
          </S.MobileSheetBody>
          <SafeArea position="bottom" />
        </S.MobileSheet>
      </S.MobileSheetPopup>
    </>
  );
};
