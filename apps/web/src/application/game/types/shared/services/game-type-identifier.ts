import type { GameTypeId } from '@pleey/contracts/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class GameTypeIdentifier extends UuidV7IdentifierParser<GameTypeId> {
  constructor() {
    super('GameTypeId');
  }
}
