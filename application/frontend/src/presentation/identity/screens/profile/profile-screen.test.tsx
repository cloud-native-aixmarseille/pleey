import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { ProfileScreen } from './profile-screen';

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  regenerateAvatar: vi.fn(),
  signOut: vi.fn(),
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
      user: {
        id: 1,
        username: 'captain',
        email: 'captain@pleey.io',
        avatarUri: 'https://avatar.example/1',
      },
      isAuthenticated: true,
      updateProfile: mocks.updateProfile,
      regenerateAvatar: mocks.regenerateAvatar,
      signOut: mocks.signOut,
    }),
  };
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal);
});

describe('ProfileScreen', () => {
  beforeEach(() => {
    mocks.updateProfile.mockReset();
    mocks.regenerateAvatar.mockReset();
    mocks.signOut.mockReset();
  });

  describe('render()', () => {
    it('renders the profile eyebrow', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(screen.getByText('auth.profile.eyebrow')).toBeInTheDocument();
    });

    it('renders the profile title heading', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(screen.getByRole('heading', { name: 'auth.profile.title' })).toBeInTheDocument();
    });

    it('renders the avatar regeneration button', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(
        screen.getByRole('button', { name: 'auth.profile.avatarSection.regenerateCta' }),
      ).toBeInTheDocument();
    });

    it('renders the sign out button', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(screen.getByRole('button', { name: 'auth.profile.signOutCta' })).toBeInTheDocument();
    });

    it('renders the sign out description', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(screen.getByText('auth.profile.signOutDescription')).toBeInTheDocument();
    });

    it('renders the username in the identity section', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(screen.getByRole('heading', { name: 'captain' })).toBeInTheDocument();
    });

    it('renders pre-filled username and email fields', () => {
      renderWithFormProvider(<ProfileScreen />);

      expect(screen.getByLabelText('auth.form.usernameLabel *')).toHaveValue('captain');
      expect(screen.getByLabelText('auth.form.emailLabel *')).toHaveValue('captain@pleey.io');
    });
  });

  describe('actions', () => {
    it('calls regenerateAvatar when the regenerate button is clicked', async () => {
      mocks.regenerateAvatar.mockResolvedValue(undefined);
      renderWithFormProvider(<ProfileScreen />);

      await userEvent.click(
        screen.getByRole('button', { name: 'auth.profile.avatarSection.regenerateCta' }),
      );

      expect(mocks.regenerateAvatar).toHaveBeenCalledOnce();
    });

    it('calls signOut when the sign out button is clicked', async () => {
      mocks.signOut.mockResolvedValue(undefined);
      renderWithFormProvider(<ProfileScreen />);

      await userEvent.click(screen.getByRole('button', { name: 'auth.profile.signOutCta' }));

      expect(mocks.signOut).toHaveBeenCalledOnce();
    });

    it('submits profile updates and shows a success message', async () => {
      mocks.updateProfile.mockResolvedValue(undefined);
      renderWithFormProvider(<ProfileScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.usernameLabel *'), {
        target: { value: 'newcaptain' },
      });

      fireEvent.submit(screen.getByRole('button', { name: 'auth.profile.submitCta' }));

      await waitFor(() => {
        expect(mocks.updateProfile).toHaveBeenCalledWith({
          username: 'newcaptain',
        });
      });
      expect(await screen.findByRole('status')).toHaveTextContent('auth.profile.successMessage');
    });

    it('renders an error when profile update fails', async () => {
      mocks.updateProfile.mockRejectedValue(new Error('Profile update failed.'));
      renderWithFormProvider(<ProfileScreen />);

      fireEvent.change(screen.getByLabelText('auth.form.usernameLabel *'), {
        target: { value: 'newcaptain' },
      });

      fireEvent.submit(screen.getByRole('button', { name: 'auth.profile.submitCta' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Profile update failed.');
    });
  });
});
