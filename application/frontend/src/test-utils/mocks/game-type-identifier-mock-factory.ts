import { GameTypeIdentifier } from '../../application/game/types/shared/services/game-type-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class GameTypeIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new GameTypeIdentifier());
  }
}
