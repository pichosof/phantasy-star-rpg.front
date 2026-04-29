import React from 'react';
import { GM_MODE_CHANGE_EVENT, initGMKeyFromStorage, isGMAuthenticated } from '@app/api/http.api';
import { IS_DEMO } from '@app/demo/demoMode';

export const useGMMode = (): boolean => {
  const [isGM, setIsGM] = React.useState<boolean>(() => {
    if (IS_DEMO) return false;
    initGMKeyFromStorage();
    return isGMAuthenticated();
  });

  React.useEffect(() => {
    if (IS_DEMO) return;

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
