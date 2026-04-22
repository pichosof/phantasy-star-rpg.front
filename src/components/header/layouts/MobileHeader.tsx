import React from 'react';
import { Col, Row, Space } from 'antd';
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
    <Row justify="space-between" align="middle" wrap={false} style={{ width: '100%' }}>
      <Col flex="auto" style={{ minWidth: 0 }}>
        <Space size={8} wrap={false}>
          <SettingsDropdown />
          <div>
            <Popover placement="bottomRight" trigger="click" content={<GMSwitchPanel />}>
              <Button size="small">GM</Button>
            </Popover>
          </div>
        </Space>
      </Col>

      <S.BurgerCol flex="none">
        <S.MobileBurger onClick={toggleSider} isCross={isSiderOpened} />
      </S.BurgerCol>
    </Row>
  );
};
