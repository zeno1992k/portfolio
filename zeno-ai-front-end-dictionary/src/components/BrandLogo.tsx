import { useAppTheme } from '../lib/AppThemeProvider';

export function BrandLogo({ className, alt = '' }: { className: string; alt?: string }) {
  const { resolvedTheme } = useAppTheme();
  const file = resolvedTheme === 'dark' ? 'logo-dark.svg' : 'logo.svg';
  return <img className={className} src={`${import.meta.env.BASE_URL}brand/zeno-blue/${file}`} alt={alt} width={145} height={145} />;
}
