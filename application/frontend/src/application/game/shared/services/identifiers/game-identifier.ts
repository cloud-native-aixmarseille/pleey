import type { GameId } from '../../../../../domains/game/entities/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class GameIdentifier extends UuidV7IdentifierParser<GameId> {
  constructor() {
    super('GameId');
  }
}
