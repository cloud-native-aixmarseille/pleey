import { formatLocalizedDate } from '../../../shared/i18n/format-localized-date';

export function formatDate(value: string, locale?: string): string {
  return formatLocalizedDate(value, {
    locale,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
