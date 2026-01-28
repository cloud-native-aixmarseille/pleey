import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { AuthRoutesFactory } from './auth-routes-factory';

describe('AuthRoutesFactory', () => {
  describe('create()', () => {
    it('returns four routes', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory().create();

      // Assert
      expect(routes).toHaveLength(4);
    });

    it('includes the sign-in route at identity/sign-in', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory().create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/sign-in')).toBe(true);
    });

    it('includes the register route at identity/register', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory().create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/register')).toBe(true);
    });

    it('includes the forgot-password route at identity/forgot-password', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory().create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/forgot-password')).toBe(true);
    });

    it('includes the profile route at identity/profile', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory().create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/profile')).toBe(true);
    });
  });
});
