import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { RegisterScreen } from './register-screen';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
}));

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../contexts/auth-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/auth-context')>();
  const { AuthContextMockFactory } = await import(
    'src/test-utils/factories/auth-context-mock-factory'
  );

  return {
    ...actual,
    ...new AuthContextMockFactory().createModule({
      register: mocks.register,
    }),
  };
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('RegisterScreen', () => {
  beforeEach(() => {
    mocks.register.mockReset();
  });

  describe('render()', () => {
    it('renders the register eyebrow i18n key', () => {
      // Arrange + Act
      renderWithFormProvider(<RegisterScreen />);

      // Assert
      expect(screen.getByText('auth.register.eyebrow')).toBeInTheDocument();
    });

    it('renders the register title heading', () => {
      // Arrange + Act
      renderWithFormProvider(<RegisterScreen />);

      // Assert
      expect(screen.getByRole('heading', { name: 'auth.register.title' })).toBeInTheDocument();
    });

    it('submits registration data and renders the success state', async () => {
      // Arrange
      mocks.register.mockResolvedValue(undefined);
      renderWithFormProvider(<RegisterScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.usernameLabel *'), {
        target: { value: 'ArcadeCaptain' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.register.submitCta' }));

      // Assert
      await waitFor(() => {
        expect(mocks.register).toHaveBeenCalledWith({
          username: 'ArcadeCaptain',
          email: 'captain@pleey.io',
          password: 'secret',
        });
      });
      expect(
        await screen.findByRole('heading', { name: 'auth.register.success.title' }),
      ).toBeInTheDocument();
      expect(screen.getByText('auth.register.success.message')).toBeInTheDocument();
    });

    it('renders the translated generic fallback when registration fails without an Error instance', async () => {
      // Arrange
      mocks.register.mockRejectedValue({ reason: 'unexpected' });
      renderWithFormProvider(<RegisterScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.usernameLabel *'), {
        target: { value: 'ArcadeCaptain' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.register.submitCta' }));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('auth.errors.generic');
    });

    it('renders backend-translated registration errors without passing them through i18n', async () => {
      // Arrange
      mocks.register.mockRejectedValue(new Error('Un compte existe deja pour cet email.'));
      renderWithFormProvider(<RegisterScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.usernameLabel *'), {
        target: { value: 'ArcadeCaptain' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.emailLabel *'), {
        target: { value: 'captain@pleey.io' },
      });
      fireEvent.change(screen.getByLabelText('auth.form.passwordLabel *'), {
        target: { value: 'secret' },
      });

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'auth.register.submitCta' }));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Un compte existe deja pour cet email.',
      );
    });

    it('renders a username validation message after blur when the field is empty', async () => {
      // Arrange
      renderWithFormProvider(<RegisterScreen />);

      // Act
      fireEvent.blur(screen.getByLabelText('auth.form.usernameLabel *'));

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'auth.form.validation.usernameRequired',
      );
    });
  });
});
