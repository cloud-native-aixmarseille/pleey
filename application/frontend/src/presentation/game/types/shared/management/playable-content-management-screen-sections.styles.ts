import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';

const managementThemeVars = {
  panelBackground: uiThemeTokens.color.surface.recessed,
  panelBorder: uiThemeTokens.color.border.subtle,
  sectionGap: 'var(--mantine-spacing-lg)',
} as const;

export const tabsStyle = {
  background: managementThemeVars.panelBackground,
  border: `1px solid ${managementThemeVars.panelBorder}`,
  borderRadius: '1rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  overflow: 'visible',
} as const;

export const editorLayoutStyle = {
  display: 'grid',
  gap: managementThemeVars.sectionGap,
  gridTemplateColumns: 'minmax(18rem, 1fr) minmax(32rem, 2fr)',
  width: '100%',
} as const;
