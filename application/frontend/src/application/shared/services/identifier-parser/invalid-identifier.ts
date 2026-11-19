import type { InvalidIdentifierHandler } from '@pleey/domain/identifier';
import { InvalidIdentifierValueError } from '../../../../domains/shared/errors/identifier-parser-error-code';

export const invalidIdentifier: InvalidIdentifierHandler = {
  invalid(context): never {
    throw new InvalidIdentifierValueError({ ...context });
  },
};
