import React from 'react';
import { GM_MODE_CHANGE_EVENT, initGMKeyFromStorage, isGMAuthenticated } from '@app/api/http.api';

export const useGMMode = (): boolean => {
  const [isGM, setIsGM] = React.useState<boolean>(() => {
    initGMKeyFromStorage();
    return isGMAuthenticated();
  });

  React.useEffect(() => {
    const syncGMMode = () => {
      initGMKeyFromStorage();
      setIsGM(isGMAuthenticated());
    };

    syncGMMode();

    window.addEventListener('storage', syncGMMode);
    window.addEventListener(GM_MODE_CHANGE_EVENT, syncGMMode);

    return () => {
      window.removeEventListener('storage', syncGMMode);
      window.removeEventListener(GM_MODE_CHANGE_EVENT, syncGMMode);
    };
  }, []);

  return isGM;
};
