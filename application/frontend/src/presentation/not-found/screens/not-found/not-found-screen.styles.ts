import { surfaceRecipes } from '../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../shared/ui/foundation/ui-typography';

export const rootStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '50vh',
  padding: uiThemeTokens.spacing.lg,
} as const;

export const cardStyle = {
  ...surfaceRecipes.elevated,
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  maxWidth: '28rem',
  padding: uiThemeTokens.spacing.xl,
  textAlign: 'center',
  width: '100%',
} as const;

export const iconStyle = {
  color: uiThemeTokens.color.brand.primary,
  display: 'inline-flex',
} as const;

export const codeStyle = {
  ...uiTypeScale.mono,
  color: uiThemeTokens.color.brand.primary,
  fontSize: 'clamp(4rem, 8vw, 6rem)',
  fontWeight: 700,
  lineHeight: 1,
  margin: 0,
  opacity: 0.7,
} as const;

export const titleStyle = {
  ...uiTypeScale.pageTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

export const descStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
} as const;

export const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
} as const;
