import { Injectable } from '@nestjs/common';
import type { GameId } from '../../../../../domain/game/entities/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GameIdentifier extends UuidV7IdentifierParser<GameId> {
  constructor() {
    super('GameId');
  }
}
