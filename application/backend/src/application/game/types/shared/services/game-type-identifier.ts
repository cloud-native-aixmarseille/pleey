import { Injectable } from '@nestjs/common';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GameTypeIdentifier extends NumericIdentifierParser<GameTypeId> {
  constructor() {
    super('GameTypeId');
  }
}
