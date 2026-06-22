import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';

export const outcomeDropZoneStyle = {
  display: 'grid',
  gap: '0.35rem',
} as const;

export function createOutcomeBlockStyle(isCorrect: boolean, canReorder: boolean) {
  return {
    background: uiThemeTokens.color.surface.recessed,
    border: isCorrect
      ? `1px solid ${uiThemeTokens.color.brand.primary}`
      : `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: '1rem',
    cursor: canReorder ? 'grab' : 'default',
    padding: '1rem',
    touchAction: canReorder ? 'none' : 'auto',
  } as const;
}
