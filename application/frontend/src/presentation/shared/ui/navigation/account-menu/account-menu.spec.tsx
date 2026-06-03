import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { coerceUuidV7TestValue } from '../../../../../test-utils/fixtures/uuid-v7-test-value';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { AccountMenu } from './account-menu';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../../../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: mocks.navigate,
  });
});

vi.mock('../../../../identity/contexts/auth-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../../identity/contexts/auth-context')>();
  const { AuthContextMockFactory } = await import('src/test-utils/mocks/auth-context-mock-factory');

  return {
    ...actual,
    ...new AuthContextMockFactory().createAuthenticatedModule({
      signOut: mocks.signOut,
    }),
  };
});

describe('AccountMenu', () => {
  describe('when authenticated', () => {
    it('renders the account menu trigger with the username', () => {
      renderWithUiProvider(<AccountMenu />);
      expect(screen.getByText('captain')).toBeInTheDocument();
    });

    it('renders the authenticated user avatar in the trigger', () => {
      renderWithUiProvider(<AccountMenu />);

      expect(screen.getByRole('img', { name: 'captain' })).toHaveAttribute(
        'src',
        `https://api.example.com/api/avatars/users/${coerceUuidV7TestValue(1)}?v=fingerprint`,
      );
    });

    it('renders the account menu button with an accessible label', () => {
      renderWithUiProvider(<AccountMenu />);
      expect(screen.getByRole('button', { name: 'shared.shell.accountMenu' })).toBeInTheDocument();
    });

    it('opens a menu with profile and sign out options on click', async () => {
      renderWithUiProvider(<AccountMenu />);
      await userEvent.click(screen.getByRole('button', { name: 'shared.shell.accountMenu' }));
      expect(
        screen.getByRole('menuitem', { name: 'shared.shell.profileLink' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'shared.shell.signOutAction' }),
      ).toBeInTheDocument();
    });

    it('navigates to profile when profile menu item is clicked', async () => {
      renderWithUiProvider(<AccountMenu />);
      await userEvent.click(screen.getByRole('button', { name: 'shared.shell.accountMenu' }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'shared.shell.profileLink' }));
      expect(mocks.navigate).toHaveBeenCalledWith('/identity/profile');
    });

    it('calls signOut when sign out menu item is clicked', async () => {
      renderWithUiProvider(<AccountMenu />);
      await userEvent.click(screen.getByRole('button', { name: 'shared.shell.accountMenu' }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'shared.shell.signOutAction' }));
      expect(mocks.signOut).toHaveBeenCalled();
    });
  });
});
