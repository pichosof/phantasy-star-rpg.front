import { useEffect } from 'react';
import { useAppDispatch } from '@app/hooks/reduxHooks';
import { addDeferredPrompt, clearDeferredPrompt, setStandalone } from '@app/store/slices/pwaSlice';

const getIsStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export const usePWA = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const syncStandalone = () => {
      dispatch(setStandalone(getIsStandalone()));
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      dispatch(addDeferredPrompt(e as BeforeInstallPromptEvent));
      syncStandalone();
    };

    const handleAppInstalled = () => {
      dispatch(clearDeferredPrompt());
      dispatch(setStandalone(true));
    };

    syncStandalone();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', syncStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', syncStandalone);
    };
  }, [dispatch]);
};
