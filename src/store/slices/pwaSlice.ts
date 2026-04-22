import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PWAState {
  event: BeforeInstallPromptEvent | null;
  isPWASupported: boolean;
  isStandalone: boolean;
}

const getIsStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const initialState: PWAState = {
  event: null,
  isPWASupported: false,
  isStandalone: getIsStandalone(),
};

export const pwaSlice = createSlice({
  name: 'pwa',
  initialState,
  reducers: {
    addDeferredPrompt: (state, action: PayloadAction<BeforeInstallPromptEvent>) => {
      state.event = action.payload;
      state.isPWASupported = true;
    },
    clearDeferredPrompt: (state) => {
      state.event = null;
      state.isPWASupported = false;
    },
    setStandalone: (state, action: PayloadAction<boolean>) => {
      state.isStandalone = action.payload;
    },
  },
});

export const { addDeferredPrompt, clearDeferredPrompt, setStandalone } = pwaSlice.actions;

export default pwaSlice.reducer;
