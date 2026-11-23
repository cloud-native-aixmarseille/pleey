import { uiBooleanChoiceColors } from '../../../../shared/ui/foundation/ui-boolean-choice-colors';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';

export const outcomeDropZoneStyle = {
  display: 'grid',
  gap: '0.35rem',
} as const;

export function createOutcomeBlockStyle(isCorrect: boolean, canReorder: boolean, booleanValue?: boolean) {
  const choiceColors =
    typeof booleanValue === 'boolean' ? uiBooleanChoiceColors[booleanValue ? 'true' : 'false'] : null;

  return {
    background: choiceColors?.surfaceBackground ?? uiThemeTokens.color.surface.recessed,
    border: choiceColors
      ? `1px solid ${choiceColors.surfaceBorder}`
      : isCorrect
        ? `1px solid ${uiThemeTokens.color.brand.primary}`
        : `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: '1rem',
    cursor: canReorder ? 'grab' : 'default',
    padding: '1rem',
    touchAction: canReorder ? 'none' : 'auto',
  } as const;
}
