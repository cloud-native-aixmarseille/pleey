import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyFixtureFactory } from '../../../../../../test-utils/fixtures/party-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { PartyFinalSummaryPanel } from './party-final-summary-panel';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    usePresentationTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

const partyFixtureFactory = new PartyFixtureFactory();

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('PartyFinalSummaryPanel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the desktop podium ordering on wide screens', () => {
    stubMatchMedia(false);

    renderWithUiProvider(
      <PartyFinalSummaryPanel
        players={[
          partyFixtureFactory.createObservationPlayer({
            avatarUri: null,
            identity: { kind: PartyPlayerIdentityKind.User, userId: 7 },
            totalScore: 800,
            username: 'Player Two',
          }),
          partyFixtureFactory.createObservationPlayer({
            avatarUri: null,
            identity: { kind: PartyPlayerIdentityKind.Guest, guestId: 'guest-1' },
            totalScore: 1200,
            username: 'Winner',
          }),
          partyFixtureFactory.createObservationPlayer({
            avatarUri: null,
            identity: { kind: PartyPlayerIdentityKind.User, userId: 9 },
            isCurrentPlayer: true,
            totalScore: 400,
            username: 'Player Three',
          }),
        ]}
      />,
    );

    expect(screen.getByTestId('party-final-podium-desktop')).toBeInTheDocument();
    expect(screen.queryByTestId('party-final-podium-mobile')).not.toBeInTheDocument();
    expect(screen.getByTestId('party-final-podium-desktop')).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    });

    expect(
      within(screen.getByTestId('party-final-podium-rank-2')).getByText('Player Two'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('party-final-podium-rank-1')).getByText('Winner'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('party-final-podium-rank-3')).getByText('Player Three'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('party-final-podium-rank-2-badge-slot')).toBeEmptyDOMElement();
    expect(
      within(screen.getByTestId('party-final-podium-rank-3-badge-slot')).getByText(
        'game.party.route.youBadge',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('party-final-podium-rank-2')).toHaveStyle({
      minHeight: '13rem',
      padding: 'var(--ui-spacing-xl) var(--ui-spacing-sm) var(--ui-spacing-xl)',
    });
    expect(screen.getByTestId('party-final-podium-rank-3')).toHaveStyle({
      minHeight: '10rem',
      padding: 'var(--ui-spacing-lg) var(--ui-spacing-sm) var(--ui-spacing-md)',
    });
  });

  it('renders a dedicated mobile winner card and compact standings on narrow screens', () => {
    stubMatchMedia(true);

    renderWithUiProvider(
      <PartyFinalSummaryPanel
        players={[
          partyFixtureFactory.createObservationPlayer({
            avatarUri: null,
            identity: { kind: PartyPlayerIdentityKind.User, userId: 7 },
            totalScore: 800,
            username: 'Player Two',
          }),
          partyFixtureFactory.createObservationPlayer({
            avatarUri: null,
            identity: { kind: PartyPlayerIdentityKind.Guest, guestId: 'guest-1' },
            totalScore: 1200,
            username: 'Winner',
          }),
          partyFixtureFactory.createObservationPlayer({
            avatarUri: null,
            identity: { kind: PartyPlayerIdentityKind.User, userId: 9 },
            isCurrentPlayer: true,
            totalScore: 400,
            username: 'Player Three',
          }),
        ]}
      />,
    );

    expect(screen.getByTestId('party-final-podium-mobile')).toBeInTheDocument();
    expect(screen.queryByTestId('party-final-podium-desktop')).not.toBeInTheDocument();

    expect(
      within(screen.getByTestId('party-final-mobile-winner')).getByText('Winner'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('party-final-podium-mobile-rank-2')).getByText('Player Two'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('party-final-podium-mobile-rank-3')).getByText('Player Three'),
    ).toBeInTheDocument();

    expect(
      within(screen.getByTestId('party-final-standings-rank-1')).getByText('Winner'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('party-final-standings-rank-3')).getByText(
        'game.party.route.youBadge',
      ),
    ).toBeInTheDocument();
  });
});
