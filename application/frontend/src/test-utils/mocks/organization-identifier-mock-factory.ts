import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class OrganizationIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new OrganizationIdentifier());
  }
}
