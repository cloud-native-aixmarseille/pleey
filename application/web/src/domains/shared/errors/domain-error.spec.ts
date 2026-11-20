import { describe, expect, it } from 'vitest';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../identity/errors/auth-error-code';
import { GenericAuthError } from '../../identity/errors/generic-auth-error';
import { createDomainError } from './domain-error';

describe('DomainError', () => {
  it('stores the provided context for generic domain errors', () => {
    // Arrange
    const context = { source: 'auth-refresh' };

    // Act
    const error = createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], context);

    // Assert
    expect(error.context).toEqual(context);
    expect(error.code).toBe(AuthErrorCode.GENERIC);
    expect(error.messageKey).toBe('auth.errors.generic');
  });

  it('allows dedicated domain error subclasses to expose context', () => {
    // Arrange
    const context = { source: 'auth-refresh' };

    // Act
    const error = new GenericAuthError(context);

    // Assert
    expect(error.context).toEqual(context);
    expect(error.message).toBe('auth.errors.generic');
  });
});
