import { StringIdentifierParser as SharedStringIdentifierParser } from '@pleey/contracts/identifier';
import { invalidIdentifier } from './invalid-identifier';

export abstract class StringIdentifierParser<TIdentifier> extends SharedStringIdentifierParser<TIdentifier> {
  protected constructor(label: string) {
    super(label, invalidIdentifier);
  }
}
