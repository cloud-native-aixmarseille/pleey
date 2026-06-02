import type { OrganizationMemberId } from '../../../../../domains/organization/entities/organization-member';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class OrganizationMemberIdentifier extends NumericIdentifierParser<OrganizationMemberId> {
  constructor() {
    super('OrganizationMemberId');
  }
}
