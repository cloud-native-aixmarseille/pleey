import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { AuthContextMockFactory } from '../../../test-utils/mocks/auth-context-mock-factory';
import { RoutingMockFactory } from '../../../test-utils/mocks/routing-mock-factory';
import { renderWithRoutingProvider } from '../../../test-utils/render-with-routing-provider';
import { type AuthContextValue, AuthProvider } from '../../identity/contexts/auth-context';
import { GuestOnlyRoute } from './guest-only-route';

const authContextMockFactory = new AuthContextMockFactory();
const authFixtureFactory = new AuthFixtureFactory();
const routingMockFactory = new RoutingMockFactory();

function renderGuestOnlyRoute(authValue: AuthContextValue) {
  return renderWithRoutingProvider(
    <AuthProvider value={authValue}>
      <GuestOnlyRoute>
        <div>sign-in-content</div>
      </GuestOnlyRoute>
    </AuthProvider>,
    routingMockFactory.createRoutingPort(),
  );
}

describe('GuestOnlyRoute', () => {
  it('does not render guest content before session restoration completes', () => {
    // Arrange + Act
    renderGuestOnlyRoute(
      authContextMockFactory.createValue({
        hasRestoredSession: false,
      }),
    );

    // Assert
    expect(screen.queryByText('sign-in-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate-/workspace/dashboard')).not.toBeInTheDocument();
  });

  it('renders guest content for unauthenticated users', () => {
    // Arrange + Act
    renderGuestOnlyRoute(authContextMockFactory.createValue());

    // Assert
    expect(screen.getByText('sign-in-content')).toBeInTheDocument();
  });

  it('redirects authenticated users to the dashboard after restoration', () => {
    // Arrange + Act
    renderGuestOnlyRoute(
      authContextMockFactory.createAuthenticatedValue({
        user: authFixtureFactory.createUser({
          username: 'alice',
          email: 'alice@example.com',
          avatarUri: null,
        }),
      }),
    );

    // Assert
    expect(screen.getByTestId('navigate-/workspace/dashboard')).toBeInTheDocument();
  });
});
