import type { GameId } from '../../../entities/game';
import type { Party } from '../../shared/entities/party';
import type { PartySettings } from '../../shared/entities/party-settings';

export interface CreatePartyCommand {
  readonly gameId: GameId;
  readonly privatePartyPassword?: string;
  readonly settingsOverride?: Partial<PartySettings>;
}

export interface PartyManagementPort {
  createParty(command: CreatePartyCommand): Promise<Party>;
  listParties(): Promise<readonly Party[]>;
}

export const PartyManagementPortToken = Symbol('PartyManagementPort');
