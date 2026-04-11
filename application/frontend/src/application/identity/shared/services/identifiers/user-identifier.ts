import type { UserId } from '../../../../../domains/identity/entities/user';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class UserIdentifier extends NumericIdentifierParser<UserId> {
  constructor() {
    super('UserId');
  }
}
