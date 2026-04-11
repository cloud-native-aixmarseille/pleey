import type { PropsWithChildren } from 'react';
import { PleeyLogo } from '../branding/pleey-logo';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';
import { SectionContainer } from './containers';

interface LandingSurfaceProps extends PropsWithChildren {
  readonly ariaLabel?: string;
  readonly maxWidth?: string;
}

interface LandingStepBadgeProps {
  readonly stepNumber: number;
}

const heroSurfaceStyle = {
  ...surfaceRecipes.hero,
  overflow: 'hidden',
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.lg}`,
  textAlign: 'center',
} as const;

const calloutSurfaceStyle = {
  ...surfaceRecipes.interactive,
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  padding: uiThemeTokens.spacing.xl,
  textAlign: 'center',
} as const;

const heroLogoGlowStyle = {
  filter: `drop-shadow(0 0 24px ${uiThemeTokens.color.brand.accent})`,
} as const;

const stepBadgeStyle = {
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

export function LandingHeroSurface({
  ariaLabel,
  children,
  maxWidth = '40rem',
}: LandingSurfaceProps) {
  return (
    <section aria-label={ariaLabel} style={heroSurfaceStyle}>
      <SectionContainer centered gap="md" maxWidth={maxWidth}>
        {children}
      </SectionContainer>
    </section>
  );
}

export function LandingCalloutSurface({ children, maxWidth = '50rem' }: LandingSurfaceProps) {
  return (
    <section style={calloutSurfaceStyle}>
      <SectionContainer centered gap="md" maxWidth={maxWidth}>
        {children}
      </SectionContainer>
    </section>
  );
}

export function LandingHeroLogo() {
  return <PleeyLogo size="xl" style={heroLogoGlowStyle} />;
}

export function LandingStepBadge({ stepNumber }: LandingStepBadgeProps) {
  return (
    <div aria-hidden style={stepBadgeStyle}>
      {stepNumber}
    </div>
  );
}
