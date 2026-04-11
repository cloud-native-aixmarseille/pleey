import { Injectable } from '@nestjs/common';
import type { PartyActionId } from '../../../../../../domain/game/party/shared/entities/party-action';
import { NumericIdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyActionIdentifier extends NumericIdentifierParser<PartyActionId> {
  constructor() {
    super('PartyActionId');
  }
}
