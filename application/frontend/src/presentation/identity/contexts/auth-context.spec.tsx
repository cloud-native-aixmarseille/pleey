import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';
import { AuthContextMockFactory } from '../../../test-utils/mocks/auth-context-mock-factory';
import { AuthProvider, useAuth } from './auth-context';

const authContextMockFactory = new AuthContextMockFactory();

describe('AuthContext', () => {
  describe('useAuth()', () => {
    it('returns the auth value from context', () => {
      // Arrange
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          value={authContextMockFactory.createAuthenticatedValue({
            signIn: vi.fn(),
            register: vi.fn(),
            signOut: vi.fn(),
            updateProfile: vi.fn(),
            regenerateAvatar: vi.fn(),
          })}
        >
          {children}
        </AuthProvider>
      );

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      expect(result.current.user?.username).toBe('captain');
      expect(result.current.user).not.toBeNull();
    });

    it('throws when called without the provider', () => {
      // Arrange + Act
      const renderWithoutProvider = () => renderHook(() => useAuth());

      // Assert
      expect(renderWithoutProvider).toThrow(PresentationContextErrorCode.AUTH_PROVIDER_REQUIRED);
    });
  });
});
