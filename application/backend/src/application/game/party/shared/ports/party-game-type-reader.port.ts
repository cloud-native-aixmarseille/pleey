import type { GameType } from '@pleey/domain/game';
import type { PartyId } from '@pleey/domain/party';

export abstract class PartyGameTypeReaderPort {
  abstract findGameTypeByPartyId(partyId: PartyId): Promise<GameType | null>;
}
