import { uiThemeTokens } from '../../shared/ui/foundation/ui-theme';

export const themeBrandSurfaceStyle = {
  backgroundImage: uiThemeTokens.assets.backgroundImage,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: uiThemeTokens.spacing.md,
  borderRadius: uiThemeTokens.radius.panel,
} as const;

export const themeBrandContentStyle = {
  background: uiThemeTokens.color.surface.canvas,
  color: uiThemeTokens.color.text.primary,
  padding: uiThemeTokens.spacing.md,
  borderRadius: uiThemeTokens.radius.panel,
} as const;

export const themeBrandLogoStyle = {
  display: 'block',
  maxWidth: '100%',
  width: '10rem',
  maxHeight: '6rem',
  objectFit: 'contain',
  marginBottom: uiThemeTokens.spacing.md,
} as const;
