import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';
import { AccountGatewayMockFactory } from '../../../test-utils/mocks/account-gateway-mock-factory';
import { AccountProvider, useAccount } from './account-context';

describe('AccountContext', () => {
  it('provides the account gateway without changing its identity', () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AccountProvider value={account}>{children}</AccountProvider>
    );

    // Act
    const { result } = renderHook(() => useAccount(), { wrapper });

    // Assert
    expect(result.current).toBe(account);
  });

  it('rejects access outside the account provider', () => {
    // Arrange + Act
    const renderWithoutProvider = () => renderHook(() => useAccount());

    // Assert
    expect(renderWithoutProvider).toThrow(
      PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED,
    );
  });
});
