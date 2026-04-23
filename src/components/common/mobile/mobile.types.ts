import type { ReactNode } from 'react';

export interface MobileTabItem {
  key: string;
  title: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  forceRender?: boolean;
  destroyOnClose?: boolean;
}

export type MobileSelectorValue = string | number;
