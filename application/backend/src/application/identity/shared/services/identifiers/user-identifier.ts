import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class UserIdentifier extends UuidV7IdentifierParser<UserId> {
  constructor() {
    super('UserId');
  }
}
