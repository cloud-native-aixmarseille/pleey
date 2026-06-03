import { GameIdentifier } from '../../application/game/shared/services/identifiers/game-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class GameIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new GameIdentifier());
  }
}
