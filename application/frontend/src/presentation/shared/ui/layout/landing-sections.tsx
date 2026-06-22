import { Group, Paper, Text } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { PleeyLogo } from '../branding/pleey-logo';
import { uiThemeTokens } from '../foundation/ui-theme';
import { SectionContainer } from './containers';
import { HeroPanel, InteractivePanel } from './panels';

interface LandingSurfaceProps extends PropsWithChildren {
  readonly ariaLabel?: string;
  readonly maxWidth?: string;
}

interface LandingStepBadgeProps {
  readonly stepNumber: number;
}

const landingStepBadgeStyle = {
  backdropFilter: 'blur(12px)',
  background: `linear-gradient(135deg, color-mix(in srgb, ${uiThemeTokens.color.surface.accentMuted} 90%, ${uiThemeTokens.color.surface.canvas}) 0%, color-mix(in srgb, ${uiThemeTokens.color.surface.strongAccent} 38%, ${uiThemeTokens.color.surface.canvas}) 100%)`,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.subtle,
  display: 'inline-flex',
} as const;

const landingStepBadgeDotStyle = {
  background: uiThemeTokens.color.brand.primary,
  borderRadius: '999px',
  boxShadow: `0 0 12px ${uiThemeTokens.color.brand.primary}`,
  height: '0.45rem',
  width: '0.45rem',
} as const;

export function LandingHeroSurface({
  ariaLabel,
  children,
  maxWidth = '40rem',
}: LandingSurfaceProps) {
  return (
    <section aria-label={ariaLabel}>
      <HeroPanel padding="xl">
        <SectionContainer centered gap="md" maxWidth={maxWidth}>
          {children}
        </SectionContainer>
      </HeroPanel>
    </section>
  );
}

export function LandingCalloutSurface({ children, maxWidth = '50rem' }: LandingSurfaceProps) {
  return (
    <section>
      <InteractivePanel padding="xl">
        <SectionContainer centered gap="md" maxWidth={maxWidth}>
          {children}
        </SectionContainer>
      </InteractivePanel>
    </section>
  );
}

export function LandingHeroLogo() {
  return <PleeyLogo glow="accent" size="xl" />;
}

export function LandingStepBadge({ stepNumber }: LandingStepBadgeProps) {
  return (
    <Paper component="span" px="sm" py="0.4rem" radius="xl" style={landingStepBadgeStyle}>
      <Group component="span" gap="xs" wrap="nowrap">
        <span aria-hidden="true" style={landingStepBadgeDotStyle} />
        <Text
          aria-hidden="true"
          c={uiThemeTokens.color.brand.primary}
          component="span"
          ff={uiThemeTokens.typography.displayFamily}
          fs="normal"
          fz="0.95rem"
          fw={800}
          lh={1}
          lts="0.03em"
          m={0}
          ta="center"
        >
          {stepNumber}
        </Text>
      </Group>
    </Paper>
  );
}
