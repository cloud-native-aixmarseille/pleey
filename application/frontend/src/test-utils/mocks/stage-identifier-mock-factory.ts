import { StageIdentifier } from '../../application/game/party/shared/services/identifiers/stage-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class StageIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new StageIdentifier());
  }
}
