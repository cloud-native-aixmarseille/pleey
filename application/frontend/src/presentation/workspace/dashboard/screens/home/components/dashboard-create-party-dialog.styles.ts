import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';

export const partyTabsListStyle = {
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.inset,
  display: 'grid',
  gap: uiThemeTokens.spacing.xxs,
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  padding: uiThemeTokens.spacing.xxs,
} as const;
