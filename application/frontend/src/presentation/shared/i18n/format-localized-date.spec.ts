import { describe, expect, it } from 'vitest';
import { formatLocalizedDate } from './format-localized-date';

describe('formatLocalizedDate', () => {
  it('formats dates using the provided locale', () => {
    const english = formatLocalizedDate('2025-01-15T10:30:00Z', {
      locale: 'en-US',
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });
    const french = formatLocalizedDate('2025-01-15T10:30:00Z', {
      locale: 'fr-FR',
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    expect(english).not.toBe(french);
  });

  it('returns the input when the date is invalid', () => {
    expect(formatLocalizedDate('not-a-date', { locale: 'en' })).toBe('not-a-date');
  });
});
