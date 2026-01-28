import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';
import { AuthProvider, useAuth } from './auth-context';

describe('AuthContext', () => {
  describe('useAuth()', () => {
    it('returns the auth value from context', () => {
      // Arrange
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          value={{
            user: { id: 1, username: 'captain', email: 'captain@pleey.io' },
            isAuthenticated: true,
            hasRestoredSession: true,
            signIn: vi.fn(),
            register: vi.fn(),
            signOut: vi.fn(),
            updateProfile: vi.fn(),
            regenerateAvatar: vi.fn(),
          }}
        >
          {children}
        </AuthProvider>
      );

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      expect(result.current.user?.username).toBe('captain');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('throws when called without the provider', () => {
      // Arrange + Act
      const renderWithoutProvider = () => renderHook(() => useAuth());

      // Assert
      expect(renderWithoutProvider).toThrow(PresentationContextErrorCode.AUTH_PROVIDER_REQUIRED);
    });
  });
});
