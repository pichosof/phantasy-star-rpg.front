import { useEffect } from 'react';
import { WithChildrenProps } from '@app/types/generalTypes';

export const PageTitle: React.FC<WithChildrenProps> = ({ children }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${children} | RPG Companion`;
    return () => {
      document.title = prev;
    };
  }, [children]);

  return null;
};
