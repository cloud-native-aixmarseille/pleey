import { Injectable } from '@nestjs/common';
import type { OrganizationId } from '../../../../../domain/organization/entities/organization';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class OrganizationIdentifier extends NumericIdentifierParser<OrganizationId> {
  constructor() {
    super('OrganizationId');
  }
}
