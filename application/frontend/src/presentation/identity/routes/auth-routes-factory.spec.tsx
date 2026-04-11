import 'reflect-metadata';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { GuestOnlyRoute } from '../../shared/routing/guest-only-route';
import { AuthRoutesFactory } from './auth-routes-factory';

function getWrappedRouteElement(path: string): ReactElement {
  const route = new AuthRoutesFactory().create().find((candidate) => candidate.path === path);

  expect(route?.element).toBeTruthy();

  const patienceProvider = route?.element as ReactElement<{ children: ReactElement }>;

  return patienceProvider.props.children;
}

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

    it('wraps the sign-in route in a guest-only guard', () => {
      const wrappedRoute = getWrappedRouteElement('identity/sign-in');

      expect(wrappedRoute.type).toBe(GuestOnlyRoute);
    });

    it('includes the register route at identity/register', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory().create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/register')).toBe(true);
    });

    it('wraps the register route in a guest-only guard', () => {
      const wrappedRoute = getWrappedRouteElement('identity/register');

      expect(wrappedRoute.type).toBe(GuestOnlyRoute);
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
