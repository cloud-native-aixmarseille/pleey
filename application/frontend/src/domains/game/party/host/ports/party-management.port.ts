import type { GameId } from '../../../entities/game';
import type { Party } from '../../shared/entities/party';

export interface CreatePartyCommand {
  readonly gameId: GameId;
}

export interface PartyManagementPort {
  createParty(command: CreatePartyCommand): Promise<Party>;
  listParties(): Promise<readonly Party[]>;
}

export const PartyManagementPortToken = Symbol('PartyManagementPort');
