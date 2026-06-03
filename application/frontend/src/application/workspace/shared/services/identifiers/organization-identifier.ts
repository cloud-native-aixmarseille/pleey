import type { OrganizationId } from '../../../../../domains/organization/entities/organization';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class OrganizationIdentifier extends UuidV7IdentifierParser<OrganizationId> {
  constructor() {
    super('OrganizationId');
  }
}
