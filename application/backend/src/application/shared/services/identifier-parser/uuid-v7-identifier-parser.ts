import { UuidV7IdentifierParser as SharedUuidV7IdentifierParser } from '@pleey/domain/identifier';
import { invalidIdentifier } from './invalid-identifier';

export abstract class UuidV7IdentifierParser<TIdentifier> extends SharedUuidV7IdentifierParser<TIdentifier> {
  protected constructor(label: string) {
    super(label, invalidIdentifier);
  }
}
