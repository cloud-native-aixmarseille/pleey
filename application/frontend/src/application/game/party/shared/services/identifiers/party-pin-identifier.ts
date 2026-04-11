import type { PartyPin } from '../../../../../../domains/game/party/shared/entities/party';
import { StringIdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyPinIdentifier extends StringIdentifierParser<PartyPin> {
  constructor() {
    super('PartyPin');
  }

  protected override normalize(value: string): string {
    return value.trim().toUpperCase();
  }
}
