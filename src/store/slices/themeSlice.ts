import { createAction, createSlice, PrepareAction } from '@reduxjs/toolkit';
import { DEFAULT_THEME_FOR_SCHEME, migrateThemeId, type ThemeId } from '@app/styles/themes/registry';

/**
 * manual   — the world the user picked
 * system   — follows the OS light/dark preference (dayTheme / nightTheme)
 * schedule — switches by time of day (nightTime in nightModeSlice)
 */
export type ThemeMode = 'manual' | 'system' | 'schedule';

interface ThemeState {
  /** Theme currently applied (data-theme). */
  theme: ThemeId;
  mode: ThemeMode;
  dayTheme: ThemeId;
  nightTheme: ThemeId;
}

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage: preferences just won't persist
  }
};

const storedMode = read('themeMode');
// Before world themes, the night switch lived in "nightMode": keep that choice.
const legacyNight = read('nightMode') === 'true';
const initialMode: ThemeMode =
  storedMode === 'manual' || storedMode === 'system' || storedMode === 'schedule'
    ? storedMode
    : legacyNight
      ? 'schedule'
      : 'manual';

const initialState: ThemeState = {
  theme: migrateThemeId(read('theme')),
  mode: initialMode,
  dayTheme: migrateThemeId(read('dayTheme'), DEFAULT_THEME_FOR_SCHEME.light),
  nightTheme: migrateThemeId(read('nightTheme'), DEFAULT_THEME_FOR_SCHEME.dark),
};
write('theme', initialState.theme);
write('themeMode', initialState.mode);

/** User picks a world: switches to manual mode. */
export const setTheme = createAction<PrepareAction<ThemeId>>('theme/setTheme', (theme: ThemeId) => {
  write('theme', theme);
  write('themeMode', 'manual');
  return { payload: theme };
});

/** Applied by the automatic modes; keeps the current mode. */
export const applyTheme = createAction<PrepareAction<ThemeId>>('theme/applyTheme', (theme: ThemeId) => {
  write('theme', theme);
  return { payload: theme };
});

export const setThemeMode = createAction<PrepareAction<ThemeMode>>('theme/setThemeMode', (mode: ThemeMode) => {
  write('themeMode', mode);
  return { payload: mode };
});

export const setAutoThemes = createAction<PrepareAction<{ dayTheme: ThemeId; nightTheme: ThemeId }>>(
  'theme/setAutoThemes',
  (pair: { dayTheme: ThemeId; nightTheme: ThemeId }) => {
    write('dayTheme', pair.dayTheme);
    write('nightTheme', pair.nightTheme);
    return { payload: pair };
  },
);

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setTheme, (state, action) => {
        state.theme = action.payload;
        state.mode = 'manual';
      })
      .addCase(applyTheme, (state, action) => {
        state.theme = action.payload;
      })
      .addCase(setThemeMode, (state, action) => {
        state.mode = action.payload;
      })
      .addCase(setAutoThemes, (state, action) => {
        state.dayTheme = action.payload.dayTheme;
        state.nightTheme = action.payload.nightTheme;
      });
  },
});

export default themeSlice.reducer;
