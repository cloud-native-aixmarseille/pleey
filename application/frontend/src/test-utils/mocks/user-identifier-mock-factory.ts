import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class UserIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new UserIdentifier());
  }
}
