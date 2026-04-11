import { Injectable } from '@nestjs/common';
import type { PartyStageId } from '../../../../../../domain/game/party/shared/entities/party-stage';
import { NumericIdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyStageIdentifier extends NumericIdentifierParser<PartyStageId> {
  constructor() {
    super('PartyStageId');
  }
}
