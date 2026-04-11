import { Injectable } from '@nestjs/common';
import type { OrganizationMemberId } from '../../../../../domain/organization/entities/organization-member';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class OrganizationMemberIdentifier extends NumericIdentifierParser<OrganizationMemberId> {
  constructor() {
    super('OrganizationMemberId');
  }
}
