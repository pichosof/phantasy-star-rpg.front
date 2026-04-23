import { useResponsive } from '@app/hooks/useResponsive';

export const useIsMobile = (): boolean => {
  const { mobileOnly } = useResponsive();
  return mobileOnly;
};
