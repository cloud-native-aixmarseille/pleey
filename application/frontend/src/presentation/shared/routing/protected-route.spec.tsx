import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthFixtureFactory } from '../../../test-utils/fixtures/auth-fixture-factory';
import { AuthContextMockFactory } from '../../../test-utils/mocks/auth-context-mock-factory';
import { RoutingMockFactory } from '../../../test-utils/mocks/routing-mock-factory';
import { renderWithRoutingProvider } from '../../../test-utils/render-with-routing-provider';
import { type AuthContextValue, AuthProvider } from '../../identity/contexts/auth-context';
import { ProtectedRoute } from './protected-route';

const authContextMockFactory = new AuthContextMockFactory();
const authFixtureFactory = new AuthFixtureFactory();
const routingMockFactory = new RoutingMockFactory();

function renderProtectedRoute(authValue: AuthContextValue) {
  return renderWithRoutingProvider(
    <AuthProvider value={authValue}>
      <ProtectedRoute>
        <div>dashboard-content</div>
      </ProtectedRoute>
    </AuthProvider>,
    routingMockFactory.createRoutingPort(),
  );
}

describe('ProtectedRoute', () => {
  it('does not render protected content before session restoration completes', () => {
    renderProtectedRoute(
      authContextMockFactory.createValue({
        hasRestoredSession: false,
      }),
    );

    expect(screen.queryByText('dashboard-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate-/identity/sign-in')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    renderProtectedRoute(
      authContextMockFactory.createAuthenticatedValue({
        user: authFixtureFactory.createUser({
          username: 'alice',
          email: 'alice@example.com',
          avatarUri: null,
        }),
      }),
    );

    expect(screen.getByText('dashboard-content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to the sign-in route after restoration', () => {
    renderProtectedRoute(authContextMockFactory.createValue());

    expect(screen.getByTestId('navigate-/identity/sign-in')).toBeInTheDocument();
  });
});
