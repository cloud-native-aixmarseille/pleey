import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { PartySettingsInput } from './party-settings-input';

describe('PartySettingsInput', () => {
  it.each([0, 3, 30, undefined])('accepts reading time %s', (value) => {
    // Arrange
    const input = plainToInstance(PartySettingsInput, { questionReadingTimeSeconds: value });
    // Act
    const errors = validateSync(input);
    // Assert
    expect(errors).toEqual([]);
  });

  it.each([-1, 31, 1.5, '3'])('rejects reading time %s', (value) => {
    // Arrange
    const input = plainToInstance(PartySettingsInput, { questionReadingTimeSeconds: value });
    // Act
    const errors = validateSync(input);
    // Assert
    expect(errors).toEqual([expect.objectContaining({ property: 'questionReadingTimeSeconds' })]);
  });
});
