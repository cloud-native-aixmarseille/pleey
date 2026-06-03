import type { OrganizationMemberId } from '../../../../../domains/organization/entities/organization-member';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class OrganizationMemberIdentifier extends UuidV7IdentifierParser<OrganizationMemberId> {
  constructor() {
    super('OrganizationMemberId');
  }
}
