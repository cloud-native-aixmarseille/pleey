import type { GameId } from '../../../../../domains/game/entities/game';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class GameIdentifier extends NumericIdentifierParser<GameId> {
  constructor() {
    super('GameId');
  }
}
