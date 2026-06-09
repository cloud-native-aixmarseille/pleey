import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import { AppShellHeader } from './app-shell-header';

vi.mock('../ui/navigation/account-menu/account-menu', () => ({
  AccountMenu: () => <div>account-menu</div>,
}));

vi.mock('../ui/navigation/account-menu/guest-preferences-menu', () => ({
  GuestPreferencesMenu: () => <div>guest-preferences-menu</div>,
}));

vi.mock('../ui/branding/pleey-logo', () => ({
  PleeyLogo: () => <div>logo</div>,
}));

vi.mock('../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('AppShellHeader', () => {
  it('renders authenticated navigation and delegates the burger toggle', async () => {
    const user = userEvent.setup();
    const navHandlers = { toggle: vi.fn(), close: vi.fn() };

    renderWithProviders(
      <AppShellHeader isAuthenticated navHandlers={navHandlers} navOpened={false} />,
    );

    expect(screen.getByText('shared.shell.kicker')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shared.nav.dashboard/i })).toHaveAttribute(
      'href',
      '/workspace/dashboard',
    );
    expect(screen.getByText('account-menu')).toBeInTheDocument();
    expect(screen.queryByText('guest-preferences-menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'shared.shell.navToggle' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'shared.shell.navToggle' }));

    expect(navHandlers.toggle).toHaveBeenCalledTimes(1);
  });

  it('hides the dashboard link for guests', () => {
    renderWithProviders(
      <AppShellHeader
        isAuthenticated={false}
        navHandlers={{ toggle: vi.fn(), close: vi.fn() }}
        navOpened={false}
      />,
    );

    expect(screen.queryByRole('link', { name: /shared.nav.dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByText('guest-preferences-menu')).toBeInTheDocument();
  });
});
