import { Injectable } from '@nestjs/common';
import type { PartyStageId } from '@pleey/domain/party';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyStageIdentifier extends UuidV7IdentifierParser<PartyStageId> {
  constructor() {
    super('PartyStageId');
  }
}
