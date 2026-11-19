import type { GameId } from '@pleey/domain/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class GameIdentifier extends UuidV7IdentifierParser<GameId> {
  constructor() {
    super('GameId');
  }
}
