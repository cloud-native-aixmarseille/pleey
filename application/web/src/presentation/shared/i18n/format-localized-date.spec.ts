import { describe, expect, it } from 'vitest';
import { formatLocalizedDate } from './format-localized-date';

describe('formatLocalizedDate', () => {
  it('formats dates using the provided locale', () => {
    // Arrange
    const english = formatLocalizedDate('2025-01-15T10:30:00Z', {
      locale: 'en-US',
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });
    // Act
    const french = formatLocalizedDate('2025-01-15T10:30:00Z', {
      locale: 'fr-FR',
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    // Assert
    expect(english).not.toBe(french);
  });

  it('returns the input when the date is invalid', () => {
    // Arrange + Act + Assert
    expect(formatLocalizedDate('not-a-date', { locale: 'en' })).toBe('not-a-date');
  });
});
