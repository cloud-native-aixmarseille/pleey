import type { GameId } from '@pleey/contracts/game';
import type { PartySettings } from '@pleey/contracts/party';
import type { ThemeId } from '@pleey/contracts/theme';
import type { Party } from '../../shared/entities/party';

export interface CreatePartyCommand {
  readonly gameId: GameId;
  readonly privatePartyPassword?: string;
  readonly settingsOverride?: Partial<PartySettings>;
  readonly themeIdOverride?: ThemeId | null;
}

export interface PartyManagementPort {
  createParty(command: CreatePartyCommand): Promise<Party>;
  listParties(): Promise<readonly Party[]>;
}

export const PartyManagementPortToken = Symbol('PartyManagementPort');
