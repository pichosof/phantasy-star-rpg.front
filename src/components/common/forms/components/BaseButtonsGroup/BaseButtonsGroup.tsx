import React, { ComponentProps } from 'react';
import { Col, Row } from 'antd';
import { Button } from '@app/components/common/buttons/Button/Button';

interface BaseButtonsGroupProps extends ComponentProps<typeof Button> {
  className?: string;
  onCancel: () => void;
  loading?: boolean;
}

export const BaseButtonsGroup: React.FC<BaseButtonsGroupProps> = ({ className, onCancel, loading, ...props }) => {
  return (
    <Row className={className} gutter={[10, 10]} wrap={false}>
      <Col span={12}>
        <Button block type="ghost" onClick={onCancel} {...props}>
          Cancel
        </Button>
      </Col>
      <Col span={12}>
        <Button block type="primary" loading={loading} htmlType="submit" {...props}>
          Save
        </Button>
      </Col>
    </Row>
  );
};
