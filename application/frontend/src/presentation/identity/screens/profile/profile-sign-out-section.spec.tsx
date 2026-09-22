import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ProfileSignOutSection } from './profile-sign-out-section';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ProfileSignOutSection', () => {
  it('renders the sign-out explanation and delegates the sign-out action', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    // Act
    renderWithUiProvider(<ProfileSignOutSection onSignOut={onSignOut} />);
    await user.click(screen.getByRole('button', { name: 'auth.profile.signOutCta' }));

    // Assert
    expect(screen.getByText('auth.profile.signOutDescription')).toBeInTheDocument();
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('disables repeated sign-out actions until the session request completes', () => {
    // Arrange
    const onSignOut = vi.fn().mockReturnValue(new Promise<void>(() => {}));
    renderWithUiProvider(<ProfileSignOutSection onSignOut={onSignOut} />);
    const button = screen.getByRole('button', { name: 'auth.profile.signOutCta' });

    // Act
    fireEvent.click(button);
    fireEvent.click(button);

    // Assert
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('auth.profile.security.signingOut');
  });

  it('announces a failed sign-out and allows retrying', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSignOut = vi.fn().mockRejectedValue(new Error('offline'));
    renderWithUiProvider(<ProfileSignOutSection onSignOut={onSignOut} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'auth.profile.signOutCta' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('auth.profile.security.signOutError');
    expect(screen.getByRole('button', { name: 'auth.profile.signOutCta' })).toBeEnabled();
  });
});
