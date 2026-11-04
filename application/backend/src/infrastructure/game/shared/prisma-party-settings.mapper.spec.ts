import { describe, expect, it } from 'vitest';
import { DEFAULT_PARTY_SETTINGS } from '../../../domain/game/party/shared/entities/party-settings';
import { PrismaPartySettingsMapper } from './prisma-party-settings.mapper';

describe('PrismaPartySettingsMapper reading time', () => {
  it.each([0, 5, 30])('persists and reloads %s seconds', (seconds) => {
    // Arrange
    const mapper = new PrismaPartySettingsMapper();
    const settings = { ...DEFAULT_PARTY_SETTINGS, questionReadingTimeSeconds: seconds };
    // Act
    const reloaded = mapper.toPartySettings(mapper.toPersistedPartySettings(settings));
    // Assert
    expect(reloaded).toEqual(settings);
  });

  it.each([undefined, null, '5', -1, 31, 2.5])(
    'uses the default for absent or invalid persisted reading time %s',
    (value) => {
      // Arrange
      const mapper = new PrismaPartySettingsMapper();
      // Act
      const settings = mapper.toPartySettings({ questionReadingTimeSeconds: value });
      // Assert
      expect(settings.questionReadingTimeSeconds).toBe(DEFAULT_PARTY_SETTINGS.questionReadingTimeSeconds);
    },
  );
});
