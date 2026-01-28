import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRouteWithProviders } from '../../../test-utils/render-route-with-providers';
import { type AuthContextValue, AuthProvider } from '../../identity/contexts/auth-context';
import { ProtectedRoute } from './protected-route';

function createAuthContextValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: null,
    isAuthenticated: false,
    hasRestoredSession: true,
    signIn: async () => {},
    register: async () => {},
    signOut: async () => {},
    updateProfile: async () => {},
    regenerateAvatar: async () => {},
    ...overrides,
  };
}

function renderProtectedRoute(authValue: AuthContextValue) {
  return renderRouteWithProviders({
    initialEntries: ['/workspace/dashboard'],
    routes: [
      {
        path: '/workspace/dashboard',
        element: (
          <AuthProvider value={authValue}>
            <ProtectedRoute>
              <div>dashboard-content</div>
            </ProtectedRoute>
          </AuthProvider>
        ),
      },
      {
        path: '/identity/sign-in',
        element: <div>sign-in-screen</div>,
      },
    ],
  });
}

describe('ProtectedRoute', () => {
  it('does not render protected content before session restoration completes', () => {
    renderProtectedRoute(
      createAuthContextValue({
        hasRestoredSession: false,
      }),
    );

    expect(screen.queryByText('dashboard-content')).not.toBeInTheDocument();
    expect(screen.queryByText('sign-in-screen')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    renderProtectedRoute(
      createAuthContextValue({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'alice',
          email: 'alice@example.com',
          avatarUri: null,
        },
      }),
    );

    expect(screen.getByText('dashboard-content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to the sign-in route after restoration', async () => {
    renderProtectedRoute(createAuthContextValue());

    await waitFor(() => {
      expect(screen.getByText('sign-in-screen')).toBeInTheDocument();
    });
  });
});
