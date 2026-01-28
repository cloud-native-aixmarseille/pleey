import { Paper } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { SupportingText } from './typography';

interface InsetPanelProps extends PropsWithChildren {
  readonly padding?: 'md' | 'lg';
  readonly tone?: 'default' | 'success';
}

const insetDefaultStyle = surfaceRecipes.inset;

const insetSuccessStyle = {
  ...surfaceRecipes.inset,
  borderColor: uiThemeTokens.color.border.success,
} as const;

export function InsetPanel({ children, padding = 'md', tone = 'default' }: InsetPanelProps) {
  return (
    <Paper p={padding} style={tone === 'success' ? insetSuccessStyle : insetDefaultStyle}>
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
