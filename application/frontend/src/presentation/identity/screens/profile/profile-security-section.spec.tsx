import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';
import { AccountGatewayMockFactory } from '../../../../test-utils/mocks/account-gateway-mock-factory';
import { AuthContextMockFactory } from '../../../../test-utils/mocks/auth-context-mock-factory';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { AccountProvider } from '../../contexts/account-context';
import { AuthProvider } from '../../contexts/auth-context';
import { ProfileSecuritySection } from './profile-security-section';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal, {
    currentLanguage: 'fr-CA',
  });
});

describe('ProfileSecuritySection', () => {
  it('requests recovery for the authenticated account and announces where to check for the link', async () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    const user = userEvent.setup();
    const auth = new AuthContextMockFactory().createAuthenticatedValue();
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'auth.profile.security.sendReset' }));

    // Assert
    expect(auth.requestPasswordReset).toHaveBeenCalledWith('captain@pleey.io', 'fr');
    expect(screen.getByRole('status')).toHaveTextContent('auth.profile.security.resetSent (email=captain@pleey.io)');
    expect(screen.getByRole('button', { name: 'auth.profile.security.resetRequested' })).toBeDisabled();
  });

  it('prevents repeated requests while delivery is pending', () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    const auth = new AuthContextMockFactory().createAuthenticatedValue({
      requestPasswordReset: vi.fn().mockReturnValue(new Promise<void>(() => {})),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );
    const button = screen.getByRole('button', { name: 'auth.profile.security.sendReset' });

    // Act
    fireEvent.click(button);
    fireEvent.click(button);

    // Assert
    expect(auth.requestPasswordReset).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('auth.profile.security.sendingReset');
  });

  it('announces a localized delivery error and leaves the action available to retry', async () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    const user = userEvent.setup();
    const auth = new AuthContextMockFactory().createAuthenticatedValue({
      requestPasswordReset: vi.fn().mockRejectedValue(new Error('offline')),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'auth.profile.security.sendReset' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('auth.profile.security.resetError');
    expect(screen.getByRole('button', { name: 'auth.profile.security.sendReset' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('clears delivery errors when a retry succeeds', async () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    const user = userEvent.setup();
    const auth = new AuthContextMockFactory().createAuthenticatedValue({
      requestPasswordReset: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined),
    });
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'auth.profile.security.sendReset' }));
    await user.click(screen.getByRole('button', { name: 'auth.profile.security.sendReset' }));

    // Assert
    expect(auth.requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not initiate recovery merely by opening the security panel', () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    const auth = new AuthContextMockFactory().createAuthenticatedValue();

    // Act
    renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} />
        </AccountProvider>
      </AuthProvider>,
    );

    // Assert
    expect(screen.getByText('captain@pleey.io')).toBeInTheDocument();
    expect(auth.requestPasswordReset).not.toHaveBeenCalled();
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('keeps a late reset response for the old email out of a remounted account panel', async () => {
    // Arrange
    const account = new AccountGatewayMockFactory().create();
    let completeRequest: (() => void) | undefined;
    const pendingRequest = new Promise<void>((resolve) => {
      completeRequest = resolve;
    });
    const auth = new AuthContextMockFactory().createAuthenticatedValue({
      requestPasswordReset: vi.fn().mockReturnValue(pendingRequest),
    });
    const updatedAuth = {
      ...auth,
      user: new AuthFixtureFactory().createUser({ email: 'new-address@pleey.io' }),
    };
    const view = renderWithUiProvider(
      <AuthProvider value={auth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} key={auth.user?.email} />
        </AccountProvider>
      </AuthProvider>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'auth.profile.security.sendReset' }));
    view.rerender(
      <AuthProvider value={updatedAuth}>
        <AccountProvider value={account}>
          <ProfileSecuritySection active={false} key={updatedAuth.user.email} />
        </AccountProvider>
      </AuthProvider>,
    );
    await act(async () => completeRequest?.());

    // Assert
    expect(screen.getByText('new-address@pleey.io')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.profile.security.sendReset' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
