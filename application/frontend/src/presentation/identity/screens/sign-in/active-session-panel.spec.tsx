import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthFixtureFactory } from '../../../../test-utils/fixtures/auth-fixture-factory';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { ActiveSessionPanel } from './active-session-panel';

const authFixtureFactory = new AuthFixtureFactory();

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ActiveSessionPanel', () => {
  const user = authFixtureFactory.createUser({ avatarUri: undefined });

  describe('render()', () => {
    it('renders the active session eyebrow', () => {
      renderWithProviders(
        <ActiveSessionPanel user={user} onNavigateDashboard={vi.fn()} onSignOut={vi.fn()} />,
      );

      expect(screen.getByText('auth.signIn.activeSession.eyebrow')).toBeInTheDocument();
    });

    it('renders the welcome heading with the username', () => {
      renderWithProviders(
        <ActiveSessionPanel user={user} onNavigateDashboard={vi.fn()} onSignOut={vi.fn()} />,
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'auth.signIn.activeSession.title',
      );
    });

    it('renders the dashboard button', () => {
      renderWithProviders(
        <ActiveSessionPanel user={user} onNavigateDashboard={vi.fn()} onSignOut={vi.fn()} />,
      );

      expect(
        screen.getByRole('button', { name: 'auth.signIn.activeSession.dashboardCta' }),
      ).toBeInTheDocument();
    });

    it('calls onNavigateDashboard when the dashboard button is clicked', async () => {
      const onNavigateDashboard = vi.fn();
      renderWithProviders(
        <ActiveSessionPanel
          user={user}
          onNavigateDashboard={onNavigateDashboard}
          onSignOut={vi.fn()}
        />,
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'auth.signIn.activeSession.dashboardCta' }),
      );

      expect(onNavigateDashboard).toHaveBeenCalledOnce();
    });

    it('calls onSignOut when the sign-out button is clicked', async () => {
      const onSignOut = vi.fn();
      renderWithProviders(
        <ActiveSessionPanel user={user} onNavigateDashboard={vi.fn()} onSignOut={onSignOut} />,
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'auth.signIn.activeSession.signOutCta' }),
      );

      expect(onSignOut).toHaveBeenCalledOnce();
    });
  });
});
