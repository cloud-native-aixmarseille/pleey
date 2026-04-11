import { Injectable } from '@nestjs/common';
import type { PartyId } from '../../../../../../domain/game/party/shared/entities/party';
import { NumericIdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyIdentifier extends NumericIdentifierParser<PartyId> {
  constructor() {
    super('PartyId');
  }
}
