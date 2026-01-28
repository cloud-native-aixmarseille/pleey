import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { LobbyReadinessPanel } from './lobby-readiness-panel';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('LobbyReadinessPanel', () => {
  it('renders the current identity and player count', () => {
    renderWithUiProvider(
      <LobbyReadinessPanel
        currentIdentityLabel="Trinity"
        errorMessage={null}
        hasReceivedRoster
        playerCount={3}
      />,
    );

    expect(
      screen.getByRole('complementary', { name: 'game.lobby.readinessPanelLabel' }),
    ).toBeInTheDocument();
    expect(screen.getByText('game.lobby.currentIdentity (username=Trinity)')).toBeInTheDocument();
    expect(screen.getByText(/game\.lobby\.playerCount/)).toBeInTheDocument();
  });

  it('shows the ready status when the roster is synchronized', () => {
    renderWithUiProvider(
      <LobbyReadinessPanel
        currentIdentityLabel="Neo"
        errorMessage={null}
        hasReceivedRoster
        playerCount={2}
      />,
    );

    expect(screen.getByText('game.lobby.rosterReadyBadge')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.rosterReady')).toBeInTheDocument();
  });

  it('shows syncing and error states together when needed', () => {
    renderWithUiProvider(
      <LobbyReadinessPanel
        currentIdentityLabel="Neo"
        errorMessage="game.join.errors.UNKNOWN"
        hasReceivedRoster={false}
        playerCount={1}
      />,
    );

    expect(screen.getByText('game.lobby.syncingRosterBadge')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.syncingRoster')).toBeInTheDocument();
    expect(screen.getByText('game.join.errors.UNKNOWN')).toBeInTheDocument();
  });
});
