import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../shared/ui/foundation/ui-theme';

export const themePaletteStyle = {
  display: 'flex',
  height: uiThemeTokens.spacing.lg,
  overflow: 'hidden',
  borderRadius: uiThemeTokens.radius.field,
} as const;
export function themePaletteShadeStyle(color: string): CSSProperties {
  return { background: /^#[0-9a-f]{6}$/i.test(color) ? color : 'transparent', flex: 1 };
}
