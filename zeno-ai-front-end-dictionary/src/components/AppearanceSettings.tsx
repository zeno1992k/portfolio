import { SectionMessage, SegmentedControl, SegmentedControlItem, Typography } from '@montage-ui/core';
import { useAppTheme } from '../lib/AppThemeProvider';
import type { ThemePreference } from '../lib/theme-preference';

export function AppearanceSettings() {
  const { preference, setPreference, storageIssue } = useAppTheme();
  return <section className="appearance-settings" aria-labelledby="appearance-heading">
    <Typography as="h3" id="appearance-heading" variant="label1" weight="medium">화면 테마</Typography>
    <SegmentedControl className="appearance-options" size="large" value={preference} onValueChange={(value) => setPreference(value as ThemePreference)} aria-label="화면 테마 선택">
      <SegmentedControlItem value="light">라이트</SegmentedControlItem>
      <SegmentedControlItem value="dark">다크</SegmentedControlItem>
      <SegmentedControlItem value="system">시스템</SegmentedControlItem>
    </SegmentedControl>
    {storageIssue && <SectionMessage variant="cautionary" role="status">{storageIssue}</SectionMessage>}
  </section>;
}
