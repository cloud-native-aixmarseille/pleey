import { Injectable } from '@nestjs/common';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GameTypeIdentifier extends UuidV7IdentifierParser<GameTypeId> {
  constructor() {
    super('GameTypeId');
  }
}
