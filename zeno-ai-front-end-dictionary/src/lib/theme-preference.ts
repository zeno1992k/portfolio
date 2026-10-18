export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'zeno-theme-preference-v1';
export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';
const STORAGE_ISSUE = '화면 모드 설정을 이 기기에 저장할 수 없어요. 이 화면에서는 계속 사용할 수 있어요.';

export const BRAND_PRIMARY = {
  // Official Montage light primary colors; normal is the requested #0066FF.
  light: { normal: '#0066FF', strong: '#005EEB', heavy: '#0054D1' },
  // Use the supplied dark logo blue, with brighter Montage emphasis colors.
  dark: { normal: '#5E9FFF', strong: '#69A5FF', heavy: '#9EC5FF' },
} as const;

export const THEME_CHROME_COLOR = { light: '#ffffff', dark: '#1B1C1E' } as const;

export function parseThemePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

export function readThemePreference(getStorage: () => Pick<Storage, 'getItem'>): {
  preference: ThemePreference;
  storageIssue?: string;
} {
  try {
    return { preference: parseThemePreference(getStorage().getItem(THEME_STORAGE_KEY)) };
  } catch {
    return { preference: 'system', storageIssue: STORAGE_ISSUE };
  }
}

export function saveThemePreference(
  preference: ThemePreference,
  getStorage: () => Pick<Storage, 'setItem'>,
): string | undefined {
  try {
    getStorage().setItem(THEME_STORAGE_KEY, preference);
    return undefined;
  } catch {
    return STORAGE_ISSUE;
  }
}

export function themePreferenceFromStorageEvent(
  key: string | null,
  newValue: string | null,
): ThemePreference | undefined {
  return key === null || key === THEME_STORAGE_KEY ? parseThemePreference(newValue) : undefined;
}

export function themeHeadAssets(theme: ResolvedTheme, baseUrl: string) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const suffix = theme === 'dark' ? '-dark' : '';
  return {
    favicon: `${base}brand/zeno-blue/favicon${suffix}.png`,
    appleTouchIcon: `${base}brand/zeno-blue/apple-icon${suffix}.png`,
  };
}

export function colorRgb(hex: string): string {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)).join(', ');
}
