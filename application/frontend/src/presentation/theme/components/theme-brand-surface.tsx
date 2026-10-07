import type { PropsWithChildren } from 'react';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { usePresentationThemeState } from '../../shared/ui/provider';
import { themeBrandContentStyle, themeBrandLogoStyle, themeBrandSurfaceStyle } from './theme-brand-surface.styles';
export function ThemeBrandSurface({ children }: PropsWithChildren) {
  const { t } = usePresentationTranslation();
  const { brandAssets: assets, activeThemeName } = usePresentationThemeState();
  if (!assets?.logoUrl && (!assets || assets.backgroundImage === 'none')) return children;
  return (
    <div style={themeBrandSurfaceStyle}>
      <div style={themeBrandContentStyle}>
        {assets.logoUrl && (
          <img
            src={assets.logoUrl}
            alt={t('theme.builder.logoAlt', { name: activeThemeName })}
            style={themeBrandLogoStyle}
          />
        )}
        {children}
      </div>
    </div>
  );
}
