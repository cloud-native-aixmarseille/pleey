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

interface InteractivePanelProps extends PropsWithChildren {
  readonly padding?: 'lg' | 'xl';
}

const elevatedStyle = surfaceRecipes.elevated;

export function ElevatedPanel({ children, padding = 'md' }: ElevatedPanelProps) {
  return (
    <Paper
      bg={elevatedStyle.background}
      bd={elevatedStyle.border}
      p={padding}
      radius={uiThemeTokens.radius.panel}
      shadow="xl"
      style={{ backdropFilter: 'blur(16px)' }}
    >
      {children}
    </Paper>
  );
}

export function HeroPanel({ children, padding = 'lg' }: HeroPanelProps) {
  return (
    <Paper
      bg={surfaceRecipes.hero.background}
      bd={surfaceRecipes.hero.border}
      p={padding}
      radius={uiThemeTokens.radius.panel}
      shadow="md"
    >
      {children}
    </Paper>
  );
}

export function InteractivePanel({ children, padding = 'lg' }: InteractivePanelProps) {
  return (
    <Paper
      bg={surfaceRecipes.interactive.background}
      bd={surfaceRecipes.interactive.border}
      p={padding}
      radius={uiThemeTokens.radius.panel}
      shadow="sm"
    >
      {children}
    </Paper>
  );
}

interface InsetPanelProps extends PropsWithChildren {
  readonly padding?: 'md' | 'lg';
  readonly tone?: 'accent' | 'default' | 'success';
}

export function InsetPanel({ children, padding = 'md', tone = 'default' }: InsetPanelProps) {
  const background =
    tone === 'accent' ? uiThemeTokens.color.surface.accentMuted : surfaceRecipes.inset.background;
  const border =
    tone === 'accent'
      ? `1px solid ${uiThemeTokens.color.border.accent}`
      : tone === 'success'
        ? `1px solid ${uiThemeTokens.color.border.success}`
        : surfaceRecipes.inset.border;
  const shadow = tone === 'accent' ? 'md' : undefined;

  return (
    <Paper
      bg={background}
      bd={border}
      p={padding}
      radius={uiThemeTokens.radius.inset}
      shadow={shadow}
    >
      {children}
    </Paper>
  );
}

export function DashedNoticePanel({ children }: PropsWithChildren) {
  return (
    <Paper
      bg={uiThemeTokens.color.surface.accentMuted}
      bd={`1px dashed ${uiThemeTokens.color.border.accent}`}
      p="lg"
      radius={uiThemeTokens.radius.inset}
    >
      <SupportingText>{children}</SupportingText>
    </Paper>
  );
}
