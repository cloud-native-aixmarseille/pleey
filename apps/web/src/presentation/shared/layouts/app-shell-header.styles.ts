import { surfaceRecipes } from '../ui/foundation/ui-recipes';
import { uiThemeTokens } from '../ui/foundation/ui-theme';
import { uiTypeScale } from '../ui/foundation/ui-typography';

export const shellHeaderStyle = {
  ...surfaceRecipes.elevated,
  borderBottom: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderLeft: 'none',
  borderRadius: 0,
  borderRight: 'none',
  borderTop: 'none',
  padding: `${uiThemeTokens.spacing.sm} clamp(${uiThemeTokens.spacing.sm}, 3vw, ${uiThemeTokens.spacing.lg})`,
  position: 'sticky',
  top: 0,
  zIndex: 200,
} as const;

export const headerRowStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'space-between',
} as const;

export const brandLabelStyle = {
  ...uiTypeScale.sectionTitle,
  fontFamily: uiThemeTokens.typography.displayFamily,
  letterSpacing: '0.04em',
} as const;

export const headerRightStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

export const desktopNavStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

export const drawerNavStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
} as const;

export const drawerDividerStyle = {
  border: 'none',
  borderTop: `1px solid ${uiThemeTokens.color.border.subtle}`,
  margin: `${uiThemeTokens.spacing.md} 0`,
} as const;

export const drawerControlsStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'flex-end',
} as const;

export const menuButtonPaddingX = uiThemeTokens.spacing.xs;
