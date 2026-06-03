import { Injectable } from '@nestjs/common';
import type { PartyActionId } from '../../../../../../domain/game/party/shared/entities/party-action';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyActionIdentifier extends UuidV7IdentifierParser<PartyActionId> {
  constructor() {
    super('PartyActionId');
  }
}
