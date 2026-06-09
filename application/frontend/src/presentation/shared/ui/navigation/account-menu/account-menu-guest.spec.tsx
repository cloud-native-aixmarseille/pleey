import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { KeyboardShortcutsProvider } from '../../../keyboard';
import { AccountMenu } from './account-menu';

const mocks = vi.hoisted(() => ({
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
    ...new AuthContextMockFactory().createModule({
      user: null,
      isAuthenticated: false,
    }),
  };
});

describe('AccountMenu (unauthenticated)', () => {
  function renderAccountMenu() {
    renderWithUiProvider(
      <KeyboardShortcutsProvider>
        <AccountMenu />
      </KeyboardShortcutsProvider>,
    );
  }

  it('renders a sign-in button when user is not authenticated', () => {
    renderAccountMenu();
    expect(screen.getByRole('button', { name: 'shared.shell.signInLink' })).toBeInTheDocument();
  });

  it('navigates to sign-in on click', async () => {
    renderAccountMenu();
    await userEvent.click(screen.getByRole('button', { name: 'shared.shell.signInLink' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/identity/sign-in');
  });
});
