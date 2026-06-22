import { uiThemeTokens } from '../ui/foundation/ui-theme';

export const shellMainStyle = {
  background: uiThemeTokens.color.surface.canvas,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
} as const;

export const shellContentStyle = {
  display: 'flex',
  flex: 1,
  minHeight: 0,
} as const;

export const mainContentStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xl,
  margin: '0 auto',
  maxWidth: '110rem',
  minHeight: 0,
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.md}`,
  width: '100%',
} as const;
