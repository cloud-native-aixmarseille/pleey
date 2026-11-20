import { DEFAULT_PARTY_SETTINGS, PARTY_READING_TIME_LIMITS, type PartySettings } from '@pleey/contracts/party';
import { GameValidationFailedError } from '../../../errors';

interface ResolvePartySettingsInput {
  readonly organizationDefaultSettings?: PartySettings | null;
  readonly projectDefaultSettings?: PartySettings | null;
  readonly settingsOverride?: Partial<PartySettings> | null;
}

export class PartySettingsResolver {
  resolve({
    organizationDefaultSettings,
    projectDefaultSettings,
    settingsOverride,
  }: ResolvePartySettingsInput): PartySettings {
    const settings = {
      ...DEFAULT_PARTY_SETTINGS,
      ...(organizationDefaultSettings ?? {}),
      ...(projectDefaultSettings ?? {}),
      ...(settingsOverride ?? {}),
    };
    if (
      !Number.isInteger(settings.questionReadingTimeSeconds) ||
      settings.questionReadingTimeSeconds < PARTY_READING_TIME_LIMITS.min ||
      settings.questionReadingTimeSeconds > PARTY_READING_TIME_LIMITS.max
    ) {
      throw new GameValidationFailedError({
        questionReadingTimeSeconds: settings.questionReadingTimeSeconds,
        reason: 'invalidQuestionReadingTime',
      });
    }
    return settings;
  }
}
