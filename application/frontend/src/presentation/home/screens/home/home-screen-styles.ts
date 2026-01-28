import { surfaceRecipes } from '../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../shared/ui/foundation/ui-typography';

export interface HomeStep {
  readonly title: string;
  readonly description: string;
}

export interface HomeFeatureItem {
  readonly label: string;
  readonly description: string;
}

export const heroStyle = {
  ...surfaceRecipes.hero,
  overflow: 'hidden',
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.lg}`,
  textAlign: 'center',
} as const;

export const heroContentStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  margin: '0 auto',
  maxWidth: '40rem',
} as const;

export const heroLogoStyle = {
  filter: `drop-shadow(0 0 24px ${uiThemeTokens.color.brand.accent})`,
} as const;

export const heroActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
  marginTop: uiThemeTokens.spacing.sm,
} as const;

export const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  margin: '0 auto',
  maxWidth: '50rem',
  padding: `0 ${uiThemeTokens.spacing.sm}`,
} as const;

export const sectionCenterStyle = {
  ...sectionStyle,
  alignItems: 'center',
  textAlign: 'center',
} as const;

export const sectionEyebrowStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.primary,
  margin: 0,
  textTransform: 'uppercase',
} as const;

export const stepsGridStyle = {
  display: 'grid',
  gap: uiThemeTokens.spacing.md,
  gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
} as const;

export const stepCardStyle = {
  ...surfaceRecipes.elevated,
  borderTop: `2px solid ${uiThemeTokens.color.border.accent}`,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: uiThemeTokens.spacing.lg,
} as const;

export const stepNumberStyle = {
  ...uiTypeScale.label,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: '50%',
  color: uiThemeTokens.color.brand.primary,
  display: 'flex',
  height: '2.25rem',
  justifyContent: 'center',
  width: '2.25rem',
} as const;

export const stepTitleStyle = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

export const stepTitleRowStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.text.emphasis,
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

export const stepDescStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
} as const;

export const featuresGridStyle = {
  display: 'grid',
  gap: uiThemeTokens.spacing.md,
  gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
} as const;

export const featureCardStyle = {
  ...surfaceRecipes.inset,
  borderLeft: `2px solid ${uiThemeTokens.color.border.accent}`,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  padding: uiThemeTokens.spacing.lg,
} as const;

export const featureLabelStyle = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

export const featureHeaderStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.brand.primary,
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

export const featureDescStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
} as const;

export const closingStyle = {
  ...surfaceRecipes.interactive,
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  padding: uiThemeTokens.spacing.xl,
  textAlign: 'center',
} as const;
