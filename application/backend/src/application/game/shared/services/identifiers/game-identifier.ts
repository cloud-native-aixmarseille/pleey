import { Injectable } from '@nestjs/common';
import type { GameId } from '../../../../../domain/game/entities/game';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GameIdentifier extends NumericIdentifierParser<GameId> {
  constructor() {
    super('GameId');
  }
}
