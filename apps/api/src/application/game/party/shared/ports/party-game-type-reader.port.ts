import type { GameType } from '@pleey/contracts/game';
import type { PartyId } from '@pleey/contracts/party';

export abstract class PartyGameTypeReaderPort {
  abstract findGameTypeByPartyId(partyId: PartyId): Promise<GameType | null>;
}
