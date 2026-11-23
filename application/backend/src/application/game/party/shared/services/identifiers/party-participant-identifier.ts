import { Injectable } from '@nestjs/common';
import type { ParticipantId } from '@pleey/contracts/identity';
import { StringIdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyParticipantIdentifier extends StringIdentifierParser<ParticipantId> {
  constructor() {
    super('ParticipantId');
  }
}
