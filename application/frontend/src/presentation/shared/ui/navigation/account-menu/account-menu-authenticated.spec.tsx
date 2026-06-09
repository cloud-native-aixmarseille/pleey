import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthFixtureFactory } from '../../../../../test-utils/fixtures/auth-fixture-factory';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { AccountMenuAuthenticated } from './account-menu-authenticated';

const authFixtureFactory = new AuthFixtureFactory();

const authenticatedUser = authFixtureFactory.createUser({
  id: 4,
  username: 'Morgan',
  email: 'morgan@example.com',
  avatarUri: null,
});

vi.mock('../../../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('AccountMenuAuthenticated', () => {
  it('shows the user name on the trigger and toggles the menu state', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    renderWithProviders(
      <AccountMenuAuthenticated
        onNavigateToProfile={vi.fn()}
        onSignOut={vi.fn()}
        onToggle={onToggle}
        opened={false}
        user={authenticatedUser}
        wrapperRef={createRef()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'shared.shell.accountMenu' }));

    expect(screen.getByText('Morgan')).toBeInTheDocument();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders profile and sign-out actions when opened', async () => {
    const user = userEvent.setup();
    const onNavigateToProfile = vi.fn();
    const onSignOut = vi.fn();

    renderWithProviders(
      <AccountMenuAuthenticated
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={onSignOut}
        onToggle={vi.fn()}
        opened
        user={authenticatedUser}
        wrapperRef={createRef()}
      />,
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'shared.shell.profileLink' }));
    await user.click(screen.getByRole('menuitem', { name: 'shared.shell.signOutAction' }));

    expect(onNavigateToProfile).toHaveBeenCalledTimes(1);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
