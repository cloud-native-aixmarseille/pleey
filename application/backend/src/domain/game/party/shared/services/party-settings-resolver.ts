import { DEFAULT_PARTY_SETTINGS, type PartySettings } from '../entities/party-settings';

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
    return {
      ...DEFAULT_PARTY_SETTINGS,
      ...(organizationDefaultSettings ?? {}),
      ...(projectDefaultSettings ?? {}),
      ...(settingsOverride ?? {}),
    };
  }
}
