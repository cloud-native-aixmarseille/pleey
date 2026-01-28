import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { ForgotPasswordScreen } from './forgot-password-screen';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('ForgotPasswordScreen', () => {
  describe('render()', () => {
    it('renders the forgot password eyebrow', () => {
      renderWithFormProvider(<ForgotPasswordScreen />);

      expect(screen.getByText('auth.forgotPassword.eyebrow')).toBeInTheDocument();
    });

    it('renders the forgot password title', () => {
      renderWithFormProvider(<ForgotPasswordScreen />);

      expect(
        screen.getByRole('heading', { name: 'auth.forgotPassword.title' }),
      ).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      renderWithFormProvider(<ForgotPasswordScreen />);

      expect(
        screen.getByRole('button', { name: 'auth.forgotPassword.submitCta' }),
      ).toBeInTheDocument();
    });

    it('renders the back to sign in link', () => {
      renderWithFormProvider(<ForgotPasswordScreen />);

      expect(screen.getByText('auth.forgotPassword.backToSignIn')).toBeInTheDocument();
    });

    it('shows the success state after submitting the form', async () => {
      renderWithFormProvider(<ForgotPasswordScreen />);

      fireEvent.change(screen.getByLabelText('auth.forgotPassword.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });

      fireEvent.submit(screen.getByRole('button', { name: 'auth.forgotPassword.submitCta' }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'auth.forgotPassword.success.title' }),
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('status')).toHaveTextContent('auth.forgotPassword.success.message');
    });

    it('renders a validation message after blurring an empty email field', async () => {
      renderWithFormProvider(<ForgotPasswordScreen />);

      fireEvent.blur(screen.getByLabelText('auth.forgotPassword.emailLabel *'));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'auth.form.validation.emailRequired',
      );
    });
  });
});
