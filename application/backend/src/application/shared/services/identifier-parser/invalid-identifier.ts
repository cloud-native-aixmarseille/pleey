import type { InvalidIdentifierHandler } from '@pleey/contracts/identifier';
import { InvalidIdentifierValueError } from '../../../../domain/shared/errors/identifier-parser-error-code';

export const invalidIdentifier: InvalidIdentifierHandler = {
  invalid(context): never {
    throw new InvalidIdentifierValueError({ ...context });
  },
};
