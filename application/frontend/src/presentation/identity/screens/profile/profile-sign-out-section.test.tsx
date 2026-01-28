import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ProfileSignOutSection } from './profile-sign-out-section';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ProfileSignOutSection', () => {
  it('renders the sign-out explanation and delegates the sign-out action', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    renderWithUiProvider(<ProfileSignOutSection onSignOut={onSignOut} />);

    expect(screen.getByText('auth.profile.signOutDescription')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'auth.profile.signOutCta' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
