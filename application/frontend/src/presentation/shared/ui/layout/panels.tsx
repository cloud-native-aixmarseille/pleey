import { Paper } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { SupportingText } from './typography';

interface ElevatedPanelProps extends PropsWithChildren {
  readonly padding?: 'md' | 'lg';
}

interface HeroPanelProps extends PropsWithChildren {
  readonly padding?: 'lg' | 'xl';
}

const elevatedStyle = surfaceRecipes.elevated;
const heroStyle = surfaceRecipes.hero;

export function ElevatedPanel({ children, padding = 'md' }: ElevatedPanelProps) {
  return (
    <Paper p={padding} style={elevatedStyle}>
      {children}
    </Paper>
  );
}

export function HeroPanel({ children, padding = 'lg' }: HeroPanelProps) {
  return (
    <Paper p={padding} style={heroStyle}>
      {children}
    </Paper>
  );
}

interface InsetPanelProps extends PropsWithChildren {
  readonly padding?: 'md' | 'lg';
  readonly tone?: 'accent' | 'default' | 'success';
}

const insetDefaultStyle = surfaceRecipes.inset;

const insetSuccessStyle = {
  ...surfaceRecipes.inset,
  border: `1px solid ${uiThemeTokens.color.border.success}`,
} as const;

const insetAccentStyle = {
  ...surfaceRecipes.inset,
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.accentGlow,
} as const;

export function InsetPanel({ children, padding = 'md', tone = 'default' }: InsetPanelProps) {
  const panelStyle =
    tone === 'accent'
      ? insetAccentStyle
      : tone === 'success'
        ? insetSuccessStyle
        : insetDefaultStyle;

  return (
    <Paper p={padding} style={panelStyle}>
      {children}
    </Paper>
  );
}

const dashedNoticeStyle = {
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px dashed ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.inset,
} as const;

export function DashedNoticePanel({ children }: PropsWithChildren) {
  return (
    <Paper p="lg" style={dashedNoticeStyle}>
      <SupportingText>{children}</SupportingText>
    </Paper>
  );
}
