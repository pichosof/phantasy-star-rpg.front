import React from 'react';
import { notification } from 'antd';
import styled from 'styled-components';
import { CheckCircleFilled, ExclamationCircleFilled, InfoCircleFilled, StopFilled } from '@ant-design/icons';
interface IconWrapperProps {
  $isOnlyTitle: boolean;
}

const IconWrapper = styled.div<IconWrapperProps>`
  font-size: ${(props) => (props.$isOnlyTitle ? '2rem' : '3rem')};
  line-height: 2rem;
`;

const EmptyDescription = styled.div`
  margin-top: -0.75rem;
`;

type NotificationProps = Omit<Parameters<typeof notification.success>[0], 'btn' | 'message'> & {
  title: React.ReactNode;
};

const openSuccessNotification = (config: NotificationProps): void => {
  notification.success({
    ...config,
    icon: (
      <IconWrapper $isOnlyTitle={!config.description}>
        <CheckCircleFilled className="success-icon" />
      </IconWrapper>
    ),
    title: <div className={`title ${!config.description && `title-only`}`}>{config.title}</div>,
    description: config.description ? <div className="description">{config.description}</div> : <EmptyDescription />,
    className: config.description ? '' : 'notification-without-description',
  });
};

const openInfoNotification = (config: NotificationProps): void => {
  notification.info({
    ...config,
    icon: (
      <IconWrapper $isOnlyTitle={!config.description}>
        <InfoCircleFilled className="info-icon" />
      </IconWrapper>
    ),
    title: <div className={`title ${!config.description && `title-only`}`}>{config.title}</div>,
    description: config.description ? <div className="description">{config.description}</div> : <EmptyDescription />,
    className: config.description ? '' : 'notification-without-description',
  });
};

const openWarningNotification = (config: NotificationProps): void => {
  notification.warning({
    ...config,
    icon: (
      <IconWrapper $isOnlyTitle={!config.description}>
        <ExclamationCircleFilled className="warning-icon" />
      </IconWrapper>
    ),
    title: <div className={`title ${!config.description && `title-only`}`}>{config.title}</div>,
    description: config.description ? <div className="description">{config.description}</div> : <EmptyDescription />,
    className: config.description ? '' : 'notification-without-description',
  });
};

const openErrorNotification = (config: NotificationProps): void => {
  notification.error({
    ...config,
    icon: (
      <IconWrapper $isOnlyTitle={!config.description}>
        <StopFilled className="error-icon" />
      </IconWrapper>
    ),
    title: <div className={`title ${!config.description && `title-only`}`}>{config.title}</div>,
    description: config.description ? <div className="description">{config.description}</div> : <EmptyDescription />,
    className: config.description ? '' : 'notification-without-description',
  });
};

export const notificationController = {
  success: openSuccessNotification,
  info: openInfoNotification,
  warning: openWarningNotification,
  error: openErrorNotification,
};
