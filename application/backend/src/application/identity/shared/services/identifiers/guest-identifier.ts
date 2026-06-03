import { Injectable } from '@nestjs/common';
import type { GuestId } from '../../../../../domain/identity/entities/guest';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GuestIdentifier extends UuidV7IdentifierParser<GuestId> {
  constructor() {
    super('GuestId');
  }
}
