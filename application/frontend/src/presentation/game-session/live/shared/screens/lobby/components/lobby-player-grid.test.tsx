import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { HighlightedPlayersResult } from '../../../../../../../domains/game-session/entities/lobby-result';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { LobbyPlayerGrid } from './lobby-player-grid';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

const twoPlayersResult: HighlightedPlayersResult = {
  currentPlayer: { guestId: 'guest-1', username: 'Trinity', avatarUri: 'avatar-1' },
  otherPlayers: [{ id: 42, username: 'Neo', avatarUri: 'avatar-2' }],
};

const emptyResult: HighlightedPlayersResult = {
  currentPlayer: null,
  otherPlayers: [],
};

describe('LobbyPlayerGrid', () => {
  it('renders the current player and other players', () => {
    renderWithUiProvider(<LobbyPlayerGrid highlightedPlayers={twoPlayersResult} playerCount={2} />);

    expect(screen.getByText('Trinity')).toBeInTheDocument();
    expect(screen.getByText('Neo')).toBeInTheDocument();
  });

  it('shows a you badge on the current player tile', () => {
    renderWithUiProvider(<LobbyPlayerGrid highlightedPlayers={twoPlayersResult} playerCount={2} />);

    expect(screen.getByText('game.lobby.youBadge')).toBeInTheDocument();
  });

  it('does not show a you badge when no current player is resolved', () => {
    renderWithUiProvider(<LobbyPlayerGrid highlightedPlayers={emptyResult} playerCount={0} />);

    expect(screen.queryByText('game.lobby.youBadge')).not.toBeInTheDocument();
  });

  it('renders the player count as a metric', () => {
    renderWithUiProvider(<LobbyPlayerGrid highlightedPlayers={twoPlayersResult} playerCount={2} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows the empty roster message when there are no players', () => {
    renderWithUiProvider(<LobbyPlayerGrid highlightedPlayers={emptyResult} playerCount={0} />);

    expect(screen.getByText('game.lobby.emptyRoster')).toBeInTheDocument();
  });

  it('has a labelled section role for accessibility', () => {
    renderWithUiProvider(<LobbyPlayerGrid highlightedPlayers={twoPlayersResult} playerCount={2} />);

    expect(screen.getByRole('region', { name: 'game.lobby.playerGridLabel' })).toBeInTheDocument();
  });
});
