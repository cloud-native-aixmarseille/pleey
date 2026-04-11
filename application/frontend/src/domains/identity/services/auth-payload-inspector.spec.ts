import { describe, expect, it } from 'vitest';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { AuthPayloadInspector } from './auth-payload-inspector';

const authFixtureFactory = new AuthFixtureFactory();

describe('AuthPayloadInspector', () => {
  describe('isUser()', () => {
    it('returns true for a valid user payload', () => {
      // Arrange
      const inspector = new AuthPayloadInspector();

      // Act
      const result = inspector.isUser(
        authFixtureFactory.createUserPayload({ avatarUri: undefined }),
      );

      // Assert
      expect(result).toBe(true);
    });

    it('returns false for an invalid user payload', () => {
      // Arrange
      const inspector = new AuthPayloadInspector();

      // Act
      const result = inspector.isUser({ id: '1', username: 'captain' });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('toAuthSession()', () => {
    it('returns a normalized auth session when the payload is valid', () => {
      // Arrange
      const inspector = new AuthPayloadInspector();

      // Act
      const result = inspector.toAuthSession(
        authFixtureFactory.createAuthSessionPayload({
          user: { avatarUri: undefined },
        }),
      );

      // Assert
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: authFixtureFactory.createUserPayload({ avatarUri: undefined }),
      });
    });

    it('returns null when the payload is incomplete', () => {
      // Arrange
      const inspector = new AuthPayloadInspector();

      // Act
      const result = inspector.toAuthSession({ accessToken: 'access-token' });

      // Assert
      expect(result).toBeNull();
    });
  });
});
