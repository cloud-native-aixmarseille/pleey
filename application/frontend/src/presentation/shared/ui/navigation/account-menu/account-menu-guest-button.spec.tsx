import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { AccountMenuGuestButton } from './account-menu-guest-button';

vi.mock('../../../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('AccountMenuGuestButton', () => {
  it('renders the sign-in action and delegates clicks', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();

    renderWithProviders(<AccountMenuGuestButton onSignIn={onSignIn} />);

    await user.click(screen.getByRole('button', { name: 'shared.shell.signInLink' }));

    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
