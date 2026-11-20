import { Injectable } from '@nestjs/common';
import type { GameTypeId } from '@pleey/contracts/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GameTypeIdentifier extends UuidV7IdentifierParser<GameTypeId> {
  constructor() {
    super('GameTypeId');
  }
}
