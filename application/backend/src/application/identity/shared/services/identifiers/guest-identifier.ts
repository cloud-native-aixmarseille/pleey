import { Injectable } from '@nestjs/common';
import type { GuestId } from '../../../../../domain/identity/entities/guest';
import { StringIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class GuestIdentifier extends StringIdentifierParser<GuestId> {
  constructor() {
    super('GuestId');
  }
}
