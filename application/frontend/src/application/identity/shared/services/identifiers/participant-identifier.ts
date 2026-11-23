import type { ParticipantId } from '@pleey/contracts/identity';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class ParticipantIdentifier extends UuidV7IdentifierParser<ParticipantId> {
  constructor() {
    super('ParticipantId');
  }
}
