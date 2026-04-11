import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  beforeEach(() => {
    window.history.replaceState({}, '', '/identity/sign-in');
    mocks.signIn.mockReset();
    mocks.signOut.mockReset();
    mocks.navigate.mockReset();
  });

  describe('render()', () => {
    it('renders the sign-in eyebrow i18n key', () => {
      // Arrange + Act
      renderWithFormProvider(<SignInScreen />);

      // Assert
      expect(screen.getByText('auth.signIn.eyebrow')).toBeInTheDocument();
    });

    it('renders the sign-in title heading', () => {
      // Arrange + Act
      renderWithFormProvider(<SignInScreen />);

      // Assert
      expect(screen.getByRole('heading', { name: 'auth.signIn.title' })).toBeInTheDocument();
    });

    it('renders the sign-in action button', () => {
      // Arrange + Act
      renderWithFormProvider(<SignInScreen />);

      // Assert
      expect(screen.getByRole('button', { name: 'auth.signIn.submitCta' })).toBeInTheDocument();
    });

    it('renders a field validation message after blurring an empty email field', async () => {
      // Arrange
      renderWithFormProvider(<SignInScreen />);

      // Act
      fireEvent.blur(screen.getByLabelText('auth.form.emailLabel *'));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'auth.form.validation.emailRequired',
      );
    });

    it('submits credentials and navigates to the dashboard on success', async () => {
      // Arrange
      mocks.signIn.mockResolvedValue(undefined);
      renderWithFormProvider(<SignInScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.signIn.submitCta' }));

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
      mocks.signIn.mockResolvedValue(undefined);
      window.history.replaceState({}, '', '/identity/sign-in?redirectTo=%2Fjoin%2FAB12CD');
      renderWithFormProvider(<SignInScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'secret' },
      });

      fireEvent.submit(screen.getByRole('button', { name: 'auth.signIn.submitCta' }));

      await waitFor(() => {
        expect(mocks.navigate).toHaveBeenCalledWith('/join/AB12CD');
      });
    });

    it('ignores unsafe redirect targets after successful sign-in', async () => {
      mocks.signIn.mockResolvedValue(undefined);
      window.history.replaceState(
        {},
        '',
        '/identity/sign-in?redirectTo=https%3A%2F%2Fevil.example%2Fphishing',
      );
      renderWithFormProvider(<SignInScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'secret' },
      });

      fireEvent.submit(screen.getByRole('button', { name: 'auth.signIn.submitCta' }));

      await waitFor(() => {
        expect(mocks.navigate).toHaveBeenCalledWith('/workspace/dashboard');
      });
    });

    it('renders the translated generic fallback when sign-in fails without an Error instance', async () => {
      // Arrange
      mocks.signIn.mockRejectedValue({ reason: 'unexpected' });
      renderWithFormProvider(<SignInScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'wrong' },
      });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.signIn.submitCta' }));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('auth.errors.generic');
    });

    it('renders backend-translated errors without passing them through i18n', async () => {
      // Arrange
      mocks.signIn.mockRejectedValue(new Error('Email ou mot de passe invalide.'));
      renderWithFormProvider(<SignInScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'wrong' },
      });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.signIn.submitCta' }));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('Email ou mot de passe invalide.');
    });
  });
});
