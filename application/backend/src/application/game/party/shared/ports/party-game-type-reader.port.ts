import type { GameType } from '@pleey/domain/game';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';

export abstract class PartyGameTypeReaderPort {
  abstract findGameTypeByPartyId(partyId: PartyId): Promise<GameType | null>;
}
