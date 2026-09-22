import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContextMockFactory } from '../../../../test-utils/mocks/auth-context-mock-factory';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { AuthProvider } from '../../contexts/auth-context';
import { ResetPasswordScreen } from './reset-password-screen';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});
vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');
  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('ResetPasswordScreen', () => {
  it('submits the fragment token and matching passwords, removes the token from the URL, and offers sign-in', async () => {
    // Arrange
    const token = 'a'.repeat(64);
    window.history.replaceState(null, '', `/identity/reset-password#token=${token}`);
    const auth = new AuthContextMockFactory().createValue();
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <ResetPasswordScreen />
      </AuthProvider>,
    );
    fireEvent.change(screen.getByLabelText('auth.resetPassword.newPassword *'), { target: { value: 'new-password' } });
    fireEvent.change(screen.getByLabelText('auth.resetPassword.confirmPassword *'), {
      target: { value: 'new-password' },
    });
    // Act
    fireEvent.submit(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));
    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('auth.resetPassword.success');
    expect(auth.resetPassword).toHaveBeenCalledWith(token, 'new-password');
    expect(window.location.hash).toBe('');
    expect(screen.getByText('auth.forgotPassword.backToSignIn')).toBeInTheDocument();
  });

  it('rejects mismatched passwords before submitting', async () => {
    // Arrange
    window.history.replaceState(null, '', `/identity/reset-password#token=${'a'.repeat(64)}`);
    const auth = new AuthContextMockFactory().createValue();
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <ResetPasswordScreen />
      </AuthProvider>,
    );
    fireEvent.change(screen.getByLabelText('auth.resetPassword.newPassword *'), { target: { value: 'new-password' } });
    fireEvent.change(screen.getByLabelText('auth.resetPassword.confirmPassword *'), {
      target: { value: 'different-password' },
    });
    // Act
    fireEvent.submit(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));
    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('auth.resetPassword.passwordMismatch');
    expect(screen.getByLabelText('auth.resetPassword.confirmPassword *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('auth.resetPassword.confirmPassword *')).toHaveAccessibleDescription(
      'auth.resetPassword.passwordMismatch',
    );
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it.each(['short', 'a'.repeat(73), 'é'.repeat(37)])(
    'associates password policy errors with the field for %s',
    async (password) => {
      // Arrange
      window.history.replaceState(null, '', `/identity/reset-password#token=${'a'.repeat(64)}`);
      const auth = new AuthContextMockFactory().createValue();
      renderWithFormProvider(
        <AuthProvider value={auth}>
          <ResetPasswordScreen />
        </AuthProvider>,
      );
      const input = screen.getByLabelText('auth.resetPassword.newPassword *');
      fireEvent.change(input, { target: { value: password } });
      fireEvent.change(screen.getByLabelText('auth.resetPassword.confirmPassword *'), { target: { value: password } });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('auth.resetPassword.passwordPolicy');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(screen.getByRole('alert').id);
      expect(auth.resetPassword).not.toHaveBeenCalled();
    },
  );

  it('revalidates confirmation when the password is corrected', async () => {
    // Arrange
    const token = 'a'.repeat(64);
    window.history.replaceState(null, '', `/identity/reset-password#token=${token}`);
    const auth = new AuthContextMockFactory().createValue();
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <ResetPasswordScreen />
      </AuthProvider>,
    );
    const password = screen.getByLabelText('auth.resetPassword.newPassword *');
    const confirmation = screen.getByLabelText('auth.resetPassword.confirmPassword *');
    fireEvent.change(password, { target: { value: 'old-password' } });
    fireEvent.change(confirmation, { target: { value: 'new-password' } });
    fireEvent.submit(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));
    await screen.findByRole('alert');

    // Act
    fireEvent.change(password, { target: { value: 'new-password' } });
    fireEvent.submit(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('auth.resetPassword.success');
    expect(auth.resetPassword).toHaveBeenCalledExactlyOnceWith(token, 'new-password');
  });

  it('provides a new-link action for a missing token', () => {
    // Arrange
    window.history.replaceState(null, '', '/identity/reset-password');
    const auth = new AuthContextMockFactory().createValue();
    // Act
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <ResetPasswordScreen />
      </AuthProvider>,
    );
    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('auth.resetPassword.invalidLink');
    expect(screen.queryByRole('button', { name: 'auth.resetPassword.submit' })).not.toBeInTheDocument();
    expect(screen.getByText('auth.resetPassword.requestLink')).toBeInTheDocument();
  });

  it('keeps the recovery action available when the server rejects an expired or reused token', async () => {
    // Arrange
    window.history.replaceState(null, '', `/identity/reset-password#token=${'b'.repeat(64)}`);
    const auth = new AuthContextMockFactory().createValue({
      resetPassword: vi.fn().mockRejectedValue(new Error('This reset link has expired.')),
    });
    renderWithFormProvider(
      <AuthProvider value={auth}>
        <ResetPasswordScreen />
      </AuthProvider>,
    );
    fireEvent.change(screen.getByLabelText('auth.resetPassword.newPassword *'), { target: { value: 'new-password' } });
    fireEvent.change(screen.getByLabelText('auth.resetPassword.confirmPassword *'), {
      target: { value: 'new-password' },
    });
    // Act
    fireEvent.submit(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));
    // Assert
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('This reset link has expired.'));
    expect(screen.getByText('auth.resetPassword.requestLink')).toBeInTheDocument();
    expect(screen.queryByText('auth.resetPassword.success')).not.toBeInTheDocument();
  });
});
