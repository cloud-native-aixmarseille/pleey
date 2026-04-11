import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class UserIdentifier extends NumericIdentifierParser<UserId> {
  constructor() {
    super('UserId');
  }
}
