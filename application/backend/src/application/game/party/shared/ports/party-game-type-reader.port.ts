import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';

export abstract class PartyGameTypeReaderPort {
  abstract findGameTypeByPartyId(partyId: PartyId): Promise<GameType | null>;
}
