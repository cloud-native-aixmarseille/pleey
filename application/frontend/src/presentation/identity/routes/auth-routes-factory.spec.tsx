import 'reflect-metadata';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import type { AccountGateway } from '../../../application/identity/ports/account.gateway';
import { AccountGatewayMockFactory } from '../../../test-utils/mocks/account-gateway-mock-factory';
import { GuestOnlyRoute } from '../../shared/routing/guest-only-route';
import { ProtectedRoute } from '../../shared/routing/protected-route';
import { AccountProvider } from '../contexts/account-context';
import { AuthRoutesFactory } from './auth-routes-factory';

function getWrappedRouteElement(path: string): ReactElement {
  const route = new AuthRoutesFactory(new AccountGatewayMockFactory().create())
    .create()
    .find((candidate) => candidate.path === path);

  expect(route?.element).toBeTruthy();

  const patienceProvider = route?.element as ReactElement<{ children: ReactElement }>;

  return patienceProvider.props.children;
}

describe('AuthRoutesFactory', () => {
  describe('create()', () => {
    it('returns the identity routes', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory(new AccountGatewayMockFactory().create()).create();

      // Assert
      expect(routes).toHaveLength(5);
    });

    it('includes the sign-in route at identity/sign-in', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory(new AccountGatewayMockFactory().create()).create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/sign-in')).toBe(true);
    });

    it('wraps the sign-in route in a guest-only guard', () => {
      // Arrange + Act
      const wrappedRoute = getWrappedRouteElement('identity/sign-in');

      // Assert
      expect(wrappedRoute.type).toBe(GuestOnlyRoute);
    });

    it('includes the register route at identity/register', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory(new AccountGatewayMockFactory().create()).create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/register')).toBe(true);
    });

    it('wraps the register route in a guest-only guard', () => {
      // Arrange + Act
      const wrappedRoute = getWrappedRouteElement('identity/register');

      // Assert
      expect(wrappedRoute.type).toBe(GuestOnlyRoute);
    });

    it('includes the forgot-password route at identity/forgot-password', () => {
      // Arrange + Act
      const routes = new AuthRoutesFactory(new AccountGatewayMockFactory().create()).create();

      // Assert
      expect(routes.some((r) => r.path === 'identity/forgot-password')).toBe(true);
    });

    it('provides the account gateway inside the protected profile route', () => {
      // Arrange
      const account = new AccountGatewayMockFactory().create();

      // Act
      const routes = new AuthRoutesFactory(account).create();
      const profile = routes.find((route) => route.path === 'identity/profile/:section?');
      const patienceProvider = profile?.element as ReactElement<{ children: ReactElement }>;
      const protectedRoute = patienceProvider.props.children as ReactElement<{ children: ReactElement }>;
      const accountProvider = protectedRoute.props.children as ReactElement<{ value: AccountGateway }>;

      // Assert
      expect(protectedRoute.type).toBe(ProtectedRoute);
      expect(accountProvider.type).toBe(AccountProvider);
      expect(accountProvider.props.value).toBe(account);
    });
  });
});
