import { GameIdentifier } from '../../application/game/shared/services/identifiers/game-identifier';

export class GameIdentifierMockFactory {
  create() {
    return new GameIdentifier();
  }
}
