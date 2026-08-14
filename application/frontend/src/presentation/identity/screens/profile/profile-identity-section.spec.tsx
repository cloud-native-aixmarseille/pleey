import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ProfileIdentitySection } from './profile-identity-section';

const authFixtureFactory = new AuthFixtureFactory();

const currentUser = authFixtureFactory.createUser({
  username: 'Morgan',
  email: 'morgan@example.com',
  avatarUri: null,
});

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ProfileIdentitySection', () => {
  it('renders the current user and delegates avatar regeneration', async () => {
    // Arrange
    const user = userEvent.setup();
    const onRegenerateAvatar = vi.fn().mockResolvedValue(undefined);

    // Act
    renderWithUiProvider(
      <ProfileIdentitySection isRegenerating={false} onRegenerateAvatar={onRegenerateAvatar} user={currentUser} />,
    );

    // Assert
    expect(screen.getByRole('heading', { name: 'Morgan' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'auth.profile.avatarSection.regenerateCta' }));

    expect(onRegenerateAvatar).toHaveBeenCalledTimes(1);
  });

  it('shows the regenerating label while avatar generation is pending', () => {
    // Arrange + Act
    renderWithUiProvider(<ProfileIdentitySection isRegenerating onRegenerateAvatar={vi.fn()} user={currentUser} />);

    // Assert
    expect(screen.getByRole('button', { name: 'auth.profile.avatarSection.regeneratingCta' })).toBeDisabled();
  });
});
