import type { OrganizationId } from '../../../../../domains/organization/entities/organization';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class OrganizationIdentifier extends NumericIdentifierParser<OrganizationId> {
  constructor() {
    super('OrganizationId');
  }
}
