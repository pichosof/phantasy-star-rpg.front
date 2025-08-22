import React from 'react';
import { Col, Row } from 'antd';
import { NotificationsDropdown } from '../components/notificationsDropdown/NotificationsDropdown';
import { ProfileDropdown } from '../components/profileDropdown/ProfileDropdown/ProfileDropdown';
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../Header.styles';
import { Popover } from '@app/components/common/Popover/Popover';
import GMSwitchPanel from '@app/components/GMSwitchPanel';
import { Button } from '@app/components/common/buttons/Button/Button';

interface MobileHeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ toggleSider, isSiderOpened }) => {
  return (
    <Row justify="space-between" align="middle">
      <Col>
        <ProfileDropdown />
      </Col>

      <Col>
        <Row align="middle">
          <Col>
            <NotificationsDropdown />
          </Col>

          <Col>
            <HeaderSearch />
          </Col>

          <Col>
            <SettingsDropdown />
          </Col>
          <Col>
            <Popover placement="bottomRight" trigger="click" content={<GMSwitchPanel />}>
              <Button size="small">GM</Button>
            </Popover>
          </Col>
        </Row>
      </Col>

      <S.BurgerCol>
        <S.MobileBurger onClick={toggleSider} isCross={isSiderOpened} />
      </S.BurgerCol>
    </Row>
  );
};
