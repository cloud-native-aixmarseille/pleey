import { act, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyFixtureFactory } from '../../../../../../test-utils/fixtures/party-fixture-factory';
import { TranslationFixtureFactory } from '../../../../../../test-utils/fixtures/translation-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { PresentationTranslationProvider } from '../../../../../shared/i18n/use-presentation-translation';
import { usePrefersReducedMotion } from '../../../../../shared/ui/motion/use-prefers-reduced-motion';
import { PartyStandingsList } from './party-standings-list';

vi.mock('../../../../../shared/ui/motion/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: vi.fn(() => true),
}));

const players = new PartyFixtureFactory();
const translations = new TranslationFixtureFactory();

describe('PartyStandingsList', () => {
  it.each([
    { language: 'en', isMobile: false, earned: '+900 pts this stage' },
    { language: 'fr', isMobile: true, earned: '+900 pts cette manche' },
  ])('shows points separately from places lost in $language', async ({ language, isMobile, earned }) => {
    // Arrange
    const translation = await translations.create(language);
    const previous = [
      players.createObservationPlayer({
        identity: { kind: PartyPlayerIdentityKind.User, userId: 1 },
        username: 'A',
        totalScore: 1200,
      }),
      players.createObservationPlayer({
        identity: { kind: PartyPlayerIdentityKind.User, userId: 2 },
        username: 'B',
        totalScore: 1150,
      }),
      players.createObservationPlayer({
        identity: { kind: PartyPlayerIdentityKind.User, userId: 3 },
        username: 'C',
        totalScore: 1125,
      }),
    ];
    const current = previous.map((player, index) => ({
      ...player,
      totalScore: player.totalScore + (index === 0 ? 900 : 1000),
    }));
    // Act
    renderWithUiProvider(
      <PresentationTranslationProvider value={translation}>
        <PartyStandingsList
          isMobile={isMobile}
          players={current}
          previousPlayers={previous}
          testIdPrefix="standings"
          totalStages={3}
        />
      </PresentationTranslationProvider>,
    );
    // Assert
    const row = within(screen.getByTestId('standings-rank-3'));
    expect(row.getByText('A')).toBeInTheDocument();
    expect(row.getByText('2100 pts')).toBeInTheDocument();
    expect(row.getByText(earned)).toBeInTheDocument();
    expect(row.getByText('-2 places')).toBeInTheDocument();
    expect(within(screen.getByTestId('standings-rank-1')).getByText('+1 place')).toBeInTheDocument();
  });

  it('preserves historical ranks when a player departs and labels newcomers without inventing stage points', async () => {
    // Arrange
    const translation = await translations.create();
    const departed = players.createObservationPlayer({
      identity: { kind: PartyPlayerIdentityKind.User, userId: 1 },
      totalScore: 1000,
      username: 'Departed',
    });
    const remaining = players.createObservationPlayer({
      identity: { kind: PartyPlayerIdentityKind.User, userId: 2 },
      totalScore: 500,
      username: 'Remaining',
    });
    const newcomer = players.createObservationPlayer({
      identity: { kind: PartyPlayerIdentityKind.Guest, guestId: 'new' },
      totalScore: 800,
      username: 'Newcomer',
    });
    // Act
    renderWithUiProvider(
      <PresentationTranslationProvider value={translation}>
        <PartyStandingsList
          players={[newcomer, { ...remaining, totalScore: 1400 }]}
          previousPlayers={[departed, remaining]}
          testIdPrefix="standings"
          totalStages={3}
        />
      </PresentationTranslationProvider>,
    );
    // Assert
    expect(within(screen.getByTestId('standings-rank-1')).getByText('+1 place')).toBeInTheDocument();
    const newRow = within(screen.getByTestId('standings-rank-2'));
    expect(newRow.getByText('New')).toBeInTheDocument();
    expect(newRow.queryByText(/this stage/)).not.toBeInTheDocument();
  });

  it('uses stable identities to order tied duplicate usernames, preserving unchanged ranks and zero stage points', async () => {
    // Arrange
    const translation = await translations.create();
    const first = players.createObservationPlayer({
      identity: { kind: PartyPlayerIdentityKind.User, userId: 1 },
      username: 'Same',
      totalScore: 900,
      isCurrentPlayer: true,
    });
    const second = players.createObservationPlayer({
      identity: { kind: PartyPlayerIdentityKind.User, userId: 2 },
      username: 'Same',
      totalScore: 900,
    });
    // Act
    renderWithUiProvider(
      <PresentationTranslationProvider value={translation}>
        <PartyStandingsList
          players={[second, first]}
          previousPlayers={[first, second]}
          testIdPrefix="standings"
          totalStages={3}
        />
      </PresentationTranslationProvider>,
    );
    // Assert
    expect(within(screen.getByTestId('standings-rank-1')).getByText('You')).toBeInTheDocument();
    expect(screen.getAllByText('Unchanged')).toHaveLength(2);
    expect(screen.getAllByText('0 pts this stage')).toHaveLength(2);
  });

  it('omits deltas when no previous snapshot exists', async () => {
    // Arrange
    const translation = await translations.create();
    // Act
    renderWithUiProvider(
      <PresentationTranslationProvider value={translation}>
        <PartyStandingsList
          players={[players.createObservationPlayer({ totalScore: 2100 })]}
          testIdPrefix="standings"
          totalStages={3}
        />
      </PresentationTranslationProvider>,
    );
    // Assert
    expect(screen.getByText('2100 pts')).toBeInTheDocument();
    expect(screen.queryByText(/this stage|New|Unchanged|places?/)).not.toBeInTheDocument();
  });

  it('distinguishes an observed empty roster from an unavailable baseline', async () => {
    // Arrange
    const translation = await translations.create();
    // Act
    renderWithUiProvider(
      <PresentationTranslationProvider value={translation}>
        <PartyStandingsList
          players={[players.createObservationPlayer()]}
          previousPlayers={[]}
          testIdPrefix="standings"
          totalStages={3}
        />
      </PresentationTranslationProvider>,
    );
    // Assert
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.queryByText(/this stage/)).not.toBeInTheDocument();
  });

  it('keeps stage points and rank deltas stable across reveal animation and rerenders', async () => {
    // Arrange
    const translation = await translations.create();
    const previous = players.createObservationPlayer({ totalScore: 1200 });
    const current = { ...previous, totalScore: 2100 };
    vi.useFakeTimers();
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    // Act + Assert
    try {
      const content = (
        <PresentationTranslationProvider value={translation}>
          <PartyStandingsList
            players={[current]}
            previousPlayers={[previous]}
            testIdPrefix="standings"
            totalStages={3}
          />
        </PresentationTranslationProvider>
      );
      // Act
      const rendered = renderWithUiProvider(content);
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      rendered.rerender(content);
      // Assert
      expect(screen.getByText('+900 pts this stage')).toBeInTheDocument();
      expect(screen.getByText('Unchanged')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
      vi.mocked(usePrefersReducedMotion).mockReturnValue(true);
    }
  });
});
