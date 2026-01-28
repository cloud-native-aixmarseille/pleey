import type { PredictionPromptOption } from '../../../../domains/prediction/entities/prediction-prompt';
import { formatLocalizedDate } from '../../../shared/i18n/format-localized-date';

export function resolveCorrectOptionLabel(options: readonly PredictionPromptOption[]): string {
  const correct = options.find((option) => option.isCorrect);

  return correct ? optionLabel(correct.position) : '-';
}

export function optionLabel(position: number): string {
  return ['A', 'B', 'C', 'D'][position - 1] ?? String(position);
}

export function formatDate(value: string, locale?: string): string {
  return formatLocalizedDate(value, {
    locale,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
