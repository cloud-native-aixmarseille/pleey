import { StringIdentifierParser as SharedStringIdentifierParser } from '@pleey/domain/identifier';
import { invalidIdentifier } from './invalid-identifier';

export abstract class StringIdentifierParser<TIdentifier> extends SharedStringIdentifierParser<TIdentifier> {
  protected constructor(label: string) {
    super(label, invalidIdentifier);
  }
}
