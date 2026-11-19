import type { GuestId } from '@pleey/domain/identity';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class GuestIdentifier extends UuidV7IdentifierParser<GuestId> {
  constructor() {
    super('GuestId');
  }
}
