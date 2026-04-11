import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class GameTypeIdentifier extends NumericIdentifierParser<GameTypeId> {
  constructor() {
    super('GameTypeId');
  }
}
