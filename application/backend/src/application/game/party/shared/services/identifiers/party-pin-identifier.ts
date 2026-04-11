import { Injectable } from '@nestjs/common';
import type { PartyPin } from '../../../../../../domain/game/party/shared/entities/party';
import { StringIdentifierParser } from '../../../../../shared/services/identifier-parser';

@Injectable()
export class PartyPinIdentifier extends StringIdentifierParser<PartyPin> {
  constructor() {
    super('PartyPin');
  }

  protected override normalize(value: string): string {
    return value.trim().toUpperCase();
  }
}
