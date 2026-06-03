import { Injectable } from '@nestjs/common';
import type { PartyId } from '../../../../../../domain/game/party/shared/entities/party';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyIdentifier extends UuidV7IdentifierParser<PartyId> {
  constructor() {
    super('PartyId');
  }
}
