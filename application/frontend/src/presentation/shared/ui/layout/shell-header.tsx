import type { ReactNode } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface ShellHeaderProps {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly navigation: ReactNode;
}

const rootStyle = {
  ...surfaceRecipes.elevated,
  padding: uiThemeTokens.spacing.xl,
} as const;

const rowStyle = {
  alignItems: 'flex-start',
  display: 'flex',
  gap: uiThemeTokens.spacing.xl,
  justifyContent: 'space-between',
} as const;

const textGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  maxWidth: '48rem',
} as const;

const kickerStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.primary,
  margin: 0,
  textTransform: 'uppercase',
} as const;

const titleStyle = {
  ...uiTypeScale.hero,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const subtitleStyle = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  maxWidth: '48rem',
} as const;

export function ShellHeader({ kicker, title, subtitle, navigation }: ShellHeaderProps) {
  return (
    <header style={rootStyle}>
      <div style={rowStyle}>
        <div style={textGroupStyle}>
          <p style={kickerStyle}>{kicker}</p>
          <h1 style={titleStyle}>{title}</h1>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>
        {navigation}
      </div>
    </header>
  );
}
