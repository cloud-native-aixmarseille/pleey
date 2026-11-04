import { describe, expect, it } from 'vitest';
import { GameValidationFailedError } from '../../../errors';
import { DEFAULT_PARTY_SETTINGS } from '../entities/party-settings';
import { PartySettingsResolver } from './party-settings-resolver';

describe('PartySettingsResolver reading time', () => {
  it.each([
    { organization: undefined, project: undefined, override: undefined, expected: 3 },
    { organization: 5, project: undefined, override: undefined, expected: 5 },
    { organization: 5, project: 7, override: undefined, expected: 7 },
    { organization: 5, project: 7, override: 0, expected: 0 },
    { organization: 5, project: 7, override: 30, expected: 30 },
  ])('resolves reading time to $expected seconds', ({ organization, project, override, expected }) => {
    // Arrange
    const resolver = new PartySettingsResolver();
    // Act
    const settings = resolver.resolve({
      organizationDefaultSettings:
        organization === undefined
          ? undefined
          : { ...DEFAULT_PARTY_SETTINGS, questionReadingTimeSeconds: organization },
      projectDefaultSettings:
        project === undefined ? undefined : { ...DEFAULT_PARTY_SETTINGS, questionReadingTimeSeconds: project },
      settingsOverride: override === undefined ? undefined : { questionReadingTimeSeconds: override },
    });
    // Assert
    expect(settings.questionReadingTimeSeconds).toBe(expected);
  });

  it.each([-1, 31, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid reading time %s', (seconds) => {
    // Arrange
    const resolver = new PartySettingsResolver();
    // Act + Assert
    expect(() => resolver.resolve({ settingsOverride: { questionReadingTimeSeconds: seconds } })).toThrow(
      GameValidationFailedError,
    );
  });
});
