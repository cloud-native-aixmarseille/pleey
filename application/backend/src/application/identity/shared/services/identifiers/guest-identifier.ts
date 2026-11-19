import { Injectable } from '@nestjs/common';
import type { GuestId } from '@pleey/domain/identity';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GuestIdentifier extends UuidV7IdentifierParser<GuestId> {
  constructor() {
    super('GuestId');
  }
}
