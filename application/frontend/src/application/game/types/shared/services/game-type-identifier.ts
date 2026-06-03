import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class GameTypeIdentifier extends UuidV7IdentifierParser<GameTypeId> {
  constructor() {
    super('GameTypeId');
  }
}
