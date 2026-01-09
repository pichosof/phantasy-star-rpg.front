import React from 'react';
import { Col, Row } from 'antd';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../Header.styles';
import { Popover } from '@app/components/common/Popover/Popover';
import GMSwitchPanel from '@app/components/GMSwitchPanel';
import { Button } from '@app/components/common/buttons/Button/Button';

interface DesktopHeaderProps {
  isTwoColumnsLayout: boolean;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ isTwoColumnsLayout }) => {
  const leftSide = isTwoColumnsLayout ? (
    <Col></Col>
  ) : (
    <>
      <Col lg={10} xxl={8}></Col>
      <Col></Col>
    </>
  );

  return (
    <Row justify="space-between" align="middle">
      {leftSide}

      <S.ProfileColumn xl={8} xxl={7} $isTwoColumnsLayout={isTwoColumnsLayout}>
        <Row align="middle" justify="end" gutter={[10, 10]}>
          <Col>
            <Row gutter={[{ xxl: 10 }, { xxl: 10 }]}>
              <Col></Col>

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
        </Row>
      </S.ProfileColumn>
    </Row>
  );
};
