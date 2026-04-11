import type { GuestId } from '../../../../../domains/identity/entities/guest';
import { StringIdentifierParser } from '../../../../shared/services/identifier-parser';

export class GuestIdentifier extends StringIdentifierParser<GuestId> {
  constructor() {
    super('GuestId');
  }
}
