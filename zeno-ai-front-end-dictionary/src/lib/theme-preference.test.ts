import assert from 'node:assert/strict';
import test from 'node:test';
import { darkOriginTheme, lightOriginTheme } from '@montage-ui/core';
import {
  BRAND_PRIMARY,
  THEME_STORAGE_KEY,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
  themeHeadAssets,
  themePreferenceFromStorageEvent,
} from './theme-preference.ts';

function contrast(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const [dark, light] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (light + 0.05) / (dark + 0.05);
}

test('a fresh device follows its system while explicit choices ignore OS changes', () => {
  const initial = readThemePreference(() => ({ getItem: () => null }));
  assert.equal(initial.preference, 'system');
  assert.equal(resolveTheme(initial.preference, false), 'light');
  assert.equal(resolveTheme(initial.preference, true), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('invalid or foreign stored values cannot become an invalid document theme', () => {
  for (const value of ['', 'sepia', '"dark"', '{"theme":"dark"}', 'DARK']) {
    const initial = readThemePreference(() => ({ getItem: () => value }));
    assert.equal(initial.preference, 'system');
    assert.equal(resolveTheme(initial.preference, true), 'dark');
    assert.equal(initial.storageIssue, undefined);
  }
});

test('the raw preference survives a reload under its own storage key', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  for (const preference of ['light', 'dark', 'system'] as const) {
    assert.equal(saveThemePreference(preference, () => storage), undefined);
    assert.equal(values.get(THEME_STORAGE_KEY), preference);
    assert.equal(readThemePreference(() => storage).preference, preference);
  }
});

test('blocked storage access returns a usable system preference and an explanation', () => {
  const initial = readThemePreference(() => { throw new Error('SecurityError'); });
  assert.equal(initial.preference, 'system');
  assert.ok(initial.storageIssue);
  assert.equal(resolveTheme(initial.preference, true), 'dark');
});

test('failed reads and quota-limited writes are handled without throwing', () => {
  assert.ok(readThemePreference(() => ({ getItem: () => { throw new Error('SecurityError'); } })).storageIssue);
  assert.ok(saveThemePreference('dark', () => ({ setItem: () => { throw new Error('QuotaExceededError'); } })));
  assert.ok(saveThemePreference('light', () => { throw new Error('SecurityError'); }));
  // Persistence failure leaves the caller's selected in-memory theme usable.
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('other tabs update this preference only for its key, including removal and clear', () => {
  assert.equal(themePreferenceFromStorageEvent('zeno-study', 'dark'), undefined);
  assert.equal(themePreferenceFromStorageEvent(THEME_STORAGE_KEY, 'dark'), 'dark');
  assert.equal(themePreferenceFromStorageEvent(THEME_STORAGE_KEY, 'light'), 'light');
  assert.equal(themePreferenceFromStorageEvent(THEME_STORAGE_KEY, null), 'system');
  assert.equal(themePreferenceFromStorageEvent(null, null), 'system');
  assert.equal(themePreferenceFromStorageEvent(THEME_STORAGE_KEY, 'broken'), 'system');
});

test('head icons switch together and preserve a deployment subdirectory', () => {
  assert.deepEqual(themeHeadAssets('dark', '/commute/'), {
    favicon: '/commute/brand/zeno-blue/favicon-dark.png',
    appleTouchIcon: '/commute/brand/zeno-blue/apple-icon-dark.png',
  });
  assert.deepEqual(themeHeadAssets('light', '/'), {
    favicon: '/brand/zeno-blue/favicon.png',
    appleTouchIcon: '/brand/zeno-blue/apple-icon.png',
  });
  assert.equal(themeHeadAssets('light', '/commute').favicon, '/commute/brand/zeno-blue/favicon.png');
});

test('brand primary text remains readable on actual Montage surfaces in both modes', () => {
  for (const [mode, theme] of [['light', lightOriginTheme], ['dark', darkOriginTheme]] as const) {
    const surfaces = [
      theme.semantic.background.normal.normal,
      theme.semantic.background.normal.alternative,
      theme.semantic.background.elevated.normal,
      theme.semantic.background.elevated.alternative,
    ];
    for (const [emphasis, primary] of Object.entries(BRAND_PRIMARY[mode])) {
      for (const surface of surfaces) {
        assert.ok(contrast(primary, surface) >= 4.5, `${mode} ${emphasis} primary ${primary} on ${surface}`);
      }
    }
  }
});

test('solid brand action labels pass contrast with the mode-specific foreground', () => {
  for (const [mode, foreground] of [['light', '#ffffff'], ['dark', '#000000']] as const) {
    for (const primary of Object.values(BRAND_PRIMARY[mode])) {
      assert.ok(contrast(foreground, primary) >= 4.5, `${foreground} on ${mode} primary ${primary}`);
    }
  }
});
