import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { LobbySessionBar } from './lobby-session-bar';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('LobbySessionBar', () => {
  it('renders the session pin and player count', () => {
    renderWithUiProvider(<LobbySessionBar sessionPin="AB12CD" playerCount={5} hasReceivedRoster />);

    expect(screen.getByText('game.lobby.sessionTitle (pin=AB12CD)')).toBeInTheDocument();
    expect(screen.getByText(/game\.lobby\.playerCount/)).toBeInTheDocument();
  });

  it('shows the roster-ready status when synchronized', () => {
    renderWithUiProvider(<LobbySessionBar sessionPin="AB12CD" playerCount={3} hasReceivedRoster />);

    expect(screen.getByText('game.lobby.rosterReadyBadge')).toBeInTheDocument();
    expect(screen.getByText(/game\.lobby\.sessionSummaryReady/)).toBeInTheDocument();
  });

  it('shows the syncing status when roster is not yet received', () => {
    renderWithUiProvider(
      <LobbySessionBar sessionPin="AB12CD" playerCount={0} hasReceivedRoster={false} />,
    );

    expect(screen.getByText('game.lobby.syncingRosterBadge')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.sessionSummaryPending')).toBeInTheDocument();
  });

  it('has a banner role with an accessible label', () => {
    renderWithUiProvider(<LobbySessionBar sessionPin="XY99ZZ" playerCount={2} hasReceivedRoster />);

    expect(screen.getByRole('banner', { name: 'game.lobby.sessionBarLabel' })).toBeInTheDocument();
  });
});
