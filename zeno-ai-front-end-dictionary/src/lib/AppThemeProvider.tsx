import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { ThemeProvider, useThemeControl } from '@montage-ui/core';
import {
  BRAND_PRIMARY,
  SYSTEM_THEME_QUERY,
  THEME_CHROME_COLOR,
  THEME_STORAGE_KEY,
  colorRgb,
  parseThemePreference,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
  themeHeadAssets,
  themePreferenceFromStorageEvent,
  type ResolvedTheme,
  type ThemePreference,
} from './theme-preference';

type AppThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (value: ThemePreference) => void;
  storageIssue?: string;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);
const getLocalStorage = () => window.localStorage;

function systemPrefersDark() {
  try {
    return window.matchMedia(SYSTEM_THEME_QUERY).matches;
  } catch {
    return document.documentElement.dataset.theme === 'dark';
  }
}

function syncDocumentTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  // Montage theme.semantic.primary uses these public CSS token references.
  // Set the RGB counterparts too: interaction layers use them with opacity.
  for (const [name, color] of Object.entries(BRAND_PRIMARY[theme])) {
    root.style.setProperty(`--semantic-primary-${name}`, color);
    root.style.setProperty(`--semantic-primary-${name}-rgb`, colorRgb(color));
  }
  const inversePrimary = BRAND_PRIMARY[theme === 'dark' ? 'light' : 'dark'].normal;
  root.style.setProperty('--semantic-inverse-primary', inversePrimary);
  root.style.setProperty('--semantic-inverse-primary-rgb', colorRgb(inversePrimary));

  document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.setAttribute('content', theme);
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', THEME_CHROME_COLOR[theme]);
  document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')
    ?.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');

  const assets = themeHeadAssets(theme, import.meta.env.BASE_URL);
  const favicon = document.getElementById('zeno-favicon') as HTMLLinkElement | null
    ?? document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const appleIcon = document.getElementById('zeno-apple-touch-icon') as HTMLLinkElement | null
    ?? document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (favicon) favicon.href = assets.favicon;
  if (appleIcon) appleIcon.href = assets.appleTouchIcon;
  const lightFavicon = document.getElementById('zeno-favicon-light') as HTMLLinkElement | null;
  const darkFavicon = document.getElementById('zeno-favicon-dark') as HTMLLinkElement | null;
  if (lightFavicon) lightFavicon.media = theme === 'light' ? 'all' : 'not all';
  if (darkFavicon) darkFavicon.media = theme === 'dark' ? 'all' : 'not all';
}

function MontageThemeBridge({ children, value }: PropsWithChildren<{ value: AppThemeContextValue }>) {
  const { themeOriginValue, setTheme } = useThemeControl();

  useLayoutEffect(() => {
    if (themeOriginValue !== value.preference) setTheme(value.preference);
    syncDocumentTheme(value.resolvedTheme);
  }, [value.preference, value.resolvedTheme, themeOriginValue, setTheme]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [initial] = useState(() => readThemePreference(getLocalStorage));
  const [preference, setPreferenceState] = useState(initial.preference);
  const [storageIssue, setStorageIssue] = useState(initial.storageIssue);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  const setPreference = useCallback((value: ThemePreference) => {
    const next = parseThemePreference(value);
    setPreferenceState(next);
    setStorageIssue(saveThemePreference(next, getLocalStorage));
  }, []);

  useEffect(() => {
    let media: MediaQueryList;
    try {
      media = window.matchMedia(SYSTEM_THEME_QUERY);
    } catch {
      return;
    }
    const onChange = () => setSystemDark(media.matches);
    onChange();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
      } catch {
        return;
      }
      const next = themePreferenceFromStorageEvent(event.key, event.newValue);
      if (next !== undefined) setPreferenceState(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AppThemeContextValue>(() => ({
    preference,
    resolvedTheme: resolveTheme(preference, systemDark),
    setPreference,
    storageIssue,
  }), [preference, systemDark, setPreference, storageIssue]);

  return <ThemeProvider enableDarkMode storageKey={THEME_STORAGE_KEY} disableDefaultGlobalStyle>
    <MontageThemeBridge value={value}>{children}</MontageThemeBridge>
  </ThemeProvider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside AppThemeProvider.');
  return value;
}
