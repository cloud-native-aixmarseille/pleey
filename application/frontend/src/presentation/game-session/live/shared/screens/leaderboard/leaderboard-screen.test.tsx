import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { LeaderboardScreen } from './leaderboard-screen';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const testState = vi.hoisted(() => {
  const navigate = vi.fn();
  const activateSession = vi.fn();

  return {
    navigate,
    activateSession,
    leaderboardState: {
      activateSession,
      currentStage: null,
      hasGameEnded: true,
      leaderboard: [
        {
          avatarUri: 'https://api.example.com/api/avatars/users/7',
          rank: 1,
          username: 'Neo',
          totalPoints: 420,
          userId: 7,
        },
        {
          avatarUri: 'https://api.example.com/api/avatars/users/8',
          rank: 2,
          username: 'Trinity',
          totalPoints: 360,
          userId: 8,
        },
        {
          avatarUri: 'https://api.example.com/api/avatars/users/9',
          rank: 3,
          username: 'Morpheus',
          totalPoints: 300,
          userId: 9,
        },
        {
          avatarUri: 'https://api.example.com/api/avatars/guests/guest-10',
          rank: 4,
          username: 'Switch',
          totalPoints: 240,
          guestId: 'guest-10',
        },
      ],
    },
  };
});

vi.mock('../../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: testState.navigate,
    params: { sessionPin: 'AB12CD' },
  });
});

vi.mock('../../../../../identity/contexts/auth-context', async (importOriginal) => {
  const { AuthContextMockFactory } = await import(
    'src/test-utils/factories/auth-context-mock-factory'
  );

  return new AuthContextMockFactory().createPartialModule(importOriginal, {
    isAuthenticated: true,
    hasRestoredSession: true,
    user: {
      id: 7,
      username: 'Neo',
      email: 'neo@matrix.io',
    },
  });
});

vi.mock('../../contexts/game-join-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-join-context')>();
  const { GameJoinContextMockFactory } = await import(
    'src/test-utils/factories/game-join-context-mock-factory'
  );

  return {
    ...actual,
    ...new GameJoinContextMockFactory().createModule({
      guestNickname: '',
    }),
  };
});

vi.mock('../../contexts/game-leaderboard-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-leaderboard-context')>();
  const { GameLeaderboardContextMockFactory } = await import(
    'src/test-utils/factories/game-leaderboard-context-mock-factory'
  );

  return {
    ...actual,
    ...new GameLeaderboardContextMockFactory().createModule(),
  };
});

vi.mock('../../contexts/game-playing-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-playing-context')>();
  return {
    ...actual,
    useGamePlaying: () => ({
      ...testState.leaderboardState,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
    }),
  };
});

function renderScreen() {
  return renderWithProviders(<LeaderboardScreen />);
}

describe('LeaderboardScreen', () => {
  beforeEach(() => {
    testState.activateSession.mockReset();
    testState.navigate.mockReset();
    Object.assign(testState.leaderboardState, {
      currentStage: null,
      hasGameEnded: true,
      leaderboard: [
        {
          avatarUri: 'https://api.example.com/api/avatars/users/7',
          rank: 1,
          username: 'Neo',
          totalPoints: 420,
          userId: 7,
        },
        {
          avatarUri: 'https://api.example.com/api/avatars/users/8',
          rank: 2,
          username: 'Trinity',
          totalPoints: 360,
          userId: 8,
        },
        {
          avatarUri: 'https://api.example.com/api/avatars/users/9',
          rank: 3,
          username: 'Morpheus',
          totalPoints: 300,
          userId: 9,
        },
        {
          avatarUri: 'https://api.example.com/api/avatars/guests/guest-10',
          rank: 4,
          username: 'Switch',
          totalPoints: 240,
          guestId: 'guest-10',
        },
      ],
    });
  });

  it('renders the synchronized standings', () => {
    renderScreen();

    expect(screen.getAllByText('Neo')).toHaveLength(2);
    expect(screen.getAllByText('Trinity')).toHaveLength(2);
    expect(screen.getByLabelText('game.leaderboard.sessionBarLabel')).toBeInTheDocument();
    expect(screen.getByText('quiz.gameType.title')).toBeInTheDocument();
    expect(screen.getByText('Arcade Trivia')).toBeInTheDocument();
    expect(screen.getByText('AB12CD')).toBeInTheDocument();
  });

  it('renders the full ranking list below the animated podium', () => {
    renderScreen();

    expect(screen.getAllByText('Neo')).toHaveLength(2);
    expect(screen.getAllByText('Trinity')).toHaveLength(2);
    expect(screen.getAllByText('Morpheus')).toHaveLength(2);
    expect(screen.getByText('game.leaderboard.rankLabel (rank=1)')).toBeInTheDocument();
    expect(screen.getByText('game.leaderboard.rankLabel (rank=4)')).toBeInTheDocument();
  });

  it('shows the current player summary when the authenticated user is ranked', () => {
    renderScreen();

    expect(
      screen.getByText('game.leaderboard.currentPlayerRank (rank=1, points=420)'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('game.leaderboard.youBadge')).not.toHaveLength(0);
  });

  it('renders backend avatar URLs for authenticated and guest leaderboard entries', () => {
    renderScreen();

    expect(
      screen
        .getAllByRole('img', { name: 'Neo' })
        .every(
          (avatar) => avatar.getAttribute('src') === 'https://api.example.com/api/avatars/users/7',
        ),
    ).toBe(true);
    expect(screen.getByRole('img', { name: 'Switch' })).toHaveAttribute(
      'src',
      'https://api.example.com/api/avatars/guests/guest-10',
    );
  });

  it('shows a loading state when the final standings are not ready yet', () => {
    Object.assign(testState.leaderboardState, {
      currentStage: {
        id: 4,
        sourceId: 19,
        position: 1,
        text: 'Current stage',
        type: 'quiz',
        actions: [],
        timeLimit: 15,
        points: 100,
      },
      hasGameEnded: false,
      leaderboard: [],
    });

    renderScreen();

    expect(screen.getByText('game.leaderboard.loadingTitle')).toBeInTheDocument();
    expect(screen.getByText('game.leaderboard.loadingSyncing')).toBeInTheDocument();
  });
});
