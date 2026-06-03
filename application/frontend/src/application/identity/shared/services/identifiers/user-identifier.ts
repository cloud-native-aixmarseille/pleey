import type { UserId } from '../../../../../domains/identity/entities/user';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class UserIdentifier extends UuidV7IdentifierParser<UserId> {
  constructor() {
    super('UserId');
  }
}
