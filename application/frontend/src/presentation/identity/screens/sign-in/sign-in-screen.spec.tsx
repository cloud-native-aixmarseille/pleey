import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { SignInScreen } from './sign-in-screen';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../contexts/auth-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/auth-context')>();
  const { AuthContextMockFactory } = await import('src/test-utils/mocks/auth-context-mock-factory');

  return {
    ...actual,
    ...new AuthContextMockFactory().createModule({
      signIn: mocks.signIn,
      signOut: mocks.signOut,
    }),
  };
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: mocks.navigate,
  });
});

describe('SignInScreen', () => {
  function arrangeSignInScreen(route = '/identity/sign-in') {
    window.history.replaceState({}, '', route);
    mocks.signIn.mockReset();
    mocks.signOut.mockReset();
    mocks.navigate.mockReset();

    renderWithFormProvider(<SignInScreen />);

    return {
      emailInput: screen.getByLabelText('auth.form.emailLabel *'),
      passwordInput: screen.getByLabelText('auth.form.passwordLabel *'),
      submitButton: screen.getByRole('button', { name: 'auth.signIn.submitCta' }),
    };
  }

  describe('render()', () => {
    it('renders the sign-in eyebrow i18n key', () => {
      // Arrange + Act
      arrangeSignInScreen();

      // Assert
      expect(screen.getByText('auth.signIn.eyebrow')).toBeInTheDocument();
    });

    it('renders the sign-in title heading', () => {
      // Arrange + Act
      arrangeSignInScreen();

      // Assert
      expect(screen.getByRole('heading', { name: 'auth.signIn.title' })).toBeInTheDocument();
    });

    it('renders the sign-in action button', () => {
      // Arrange + Act
      arrangeSignInScreen();

      // Assert
      expect(screen.getByRole('button', { name: 'auth.signIn.submitCta' })).toBeInTheDocument();
    });

    it('renders a field validation message after blurring an empty email field', async () => {
      // Arrange
      const { emailInput } = arrangeSignInScreen();

      // Act
      fireEvent.blur(emailInput);

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('auth.form.validation.emailRequired');
    });

    it('submits credentials and navigates to the dashboard on success', async () => {
      // Arrange
      const { emailInput, passwordInput, submitButton } = arrangeSignInScreen();
      mocks.signIn.mockResolvedValue(undefined);

      fireEvent.change(emailInput, {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(submitButton);

      // Assert
      await waitFor(() => {
        expect(mocks.signIn).toHaveBeenCalledWith({
          email: 'captain@pleey.io',
          password: 'secret',
        });
        expect(mocks.navigate).toHaveBeenCalledWith('/workspace/dashboard');
      });
    });

    it('returns to the requested join route after successful sign-in', async () => {
      // Arrange
      const { emailInput, passwordInput, submitButton } = arrangeSignInScreen(
        '/identity/sign-in?redirectTo=%2Fjoin%2FAB12CD',
      );
      mocks.signIn.mockResolvedValue(undefined);

      fireEvent.change(emailInput, {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(submitButton);

      // Assert
      await waitFor(() => {
        expect(mocks.navigate).toHaveBeenCalledWith('/join/AB12CD');
      });
    });

    it('ignores unsafe redirect targets after successful sign-in', async () => {
      // Arrange
      const { emailInput, passwordInput, submitButton } = arrangeSignInScreen(
        '/identity/sign-in?redirectTo=https%3A%2F%2Fevil.example%2Fphishing',
      );
      mocks.signIn.mockResolvedValue(undefined);

      fireEvent.change(emailInput, {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(submitButton);

      // Assert
      await waitFor(() => {
        expect(mocks.navigate).toHaveBeenCalledWith('/workspace/dashboard');
      });
    });

    it('renders the translated generic fallback when sign-in fails without an Error instance', async () => {
      // Arrange
      const { emailInput, passwordInput, submitButton } = arrangeSignInScreen();
      mocks.signIn.mockRejectedValue({ reason: 'unexpected' });

      fireEvent.change(emailInput, {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'wrong' },
      });

      // Act
      fireEvent.submit(submitButton);

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('auth.errors.generic');
    });

    it('renders backend-translated errors without passing them through i18n', async () => {
      // Arrange
      const { emailInput, passwordInput, submitButton } = arrangeSignInScreen();
      mocks.signIn.mockRejectedValue(new Error('Invalid email or password.'));

      fireEvent.change(emailInput, {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'wrong' },
      });

      // Act
      fireEvent.submit(submitButton);

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    });
  });
});
