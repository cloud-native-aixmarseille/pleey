import { Injectable } from '@nestjs/common';
import type { OrganizationId } from '../../../../../domain/organization/entities/organization';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class OrganizationIdentifier extends UuidV7IdentifierParser<OrganizationId> {
  constructor() {
    super('OrganizationId');
  }
}
