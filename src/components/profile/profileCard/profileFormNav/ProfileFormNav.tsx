import React from 'react';
import { Notifications } from './nav/notifications/Notifications/Notifications';
import { Payments } from './nav/payments/Payments';
import { PersonalInfo } from './nav/PersonalInfo/PersonalInfo';

interface ProfileFormNavProps {
  menu: string;
}

export const ProfileFormNav: React.FC<ProfileFormNavProps> = ({ menu }) => {
  let currentMenu;

  switch (menu) {
    case 'info': {
      currentMenu = <PersonalInfo />;
      break;
    }

    case 'notifications': {
      currentMenu = <Notifications />;
      break;
    }

    case 'payments': {
      currentMenu = <Payments />;
      break;
    }

    default: {
      currentMenu = null;
    }
  }

  return currentMenu;
};
