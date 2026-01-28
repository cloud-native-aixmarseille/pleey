import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionRouteGuardService } from '../../../../../domains/game-session/services/game-session-route-guard.service';
import { GameRouteKind, useGameSessionRouteGuard } from './use-game-session-route-guard';

const testState = vi.hoisted(() => ({
  auth: {
    hasRestoredSession: true,
    isAuthenticated: true,
  },
  game: {
    guestNickname: '',
    joinGameFlow: {
      hasPlayerIdentity: vi.fn(() => true),
    },
  },
  lobby: {
    errorCode: null,
    hasGameStarted: true,
  },
  playing: {
    actionResult: null as null | { isCorrect: boolean; points: number; correctActionIds: number[] },
    currentStage: {
      id: 42,
    },
    errorCode: null,
    hasGameEnded: true,
    isResultTransitionActive: false,
  },
}));

vi.mock('../../../../identity/contexts/auth-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../../identity/contexts/auth-context')>();

  return {
    ...actual,
    useAuth: () => testState.auth,
  };
});

vi.mock('../contexts/game-join-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/game-join-context')>();

  return {
    ...actual,
    useGameJoin: () => testState.game,
  };
});

vi.mock('../contexts/game-lobby-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/game-lobby-context')>();

  return {
    ...actual,
    useGameLobby: () => testState.lobby,
  };
});

vi.mock('../contexts/game-playing-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/game-playing-context')>();

  return {
    ...actual,
    useGamePlaying: () => testState.playing,
  };
});

describe('useGameSessionRouteGuard', () => {
  const routeGuardService = new GameSessionRouteGuardService();
  const routeResolvers = {
    resolveJoinRoute: () => '/game/join',
    resolveLobbyRoute: (pin: string) => `/game/${pin}/lobby`,
    resolveStageRouteForStage: (pin: string, stage: { id: number }) =>
      `/game/${pin}/stage/${stage.id}`,
    resolveStageResultRouteForStage: (pin: string, stage: { id: number }) =>
      `/game/${pin}/stage/${stage.id}/result`,
    resolveLeaderboardRoute: (pin: string) => `/game/${pin}/leaderboard`,
  };

  beforeEach(() => {
    testState.auth.hasRestoredSession = true;
    testState.auth.isAuthenticated = true;
    testState.game.guestNickname = '';
    testState.game.joinGameFlow.hasPlayerIdentity.mockReturnValue(true);
    testState.lobby.errorCode = null;
    testState.lobby.hasGameStarted = true;
    testState.playing.currentStage = { id: 42 };
    testState.playing.actionResult = null;
    testState.playing.errorCode = null;
    testState.playing.hasGameEnded = true;
    testState.playing.isResultTransitionActive = false;
  });

  it('redirects the live stage route to the stage result route when a result is available', () => {
    testState.playing.hasGameEnded = false;
    testState.playing.actionResult = { isCorrect: true, points: 100, correctActionIds: [1] };
    testState.auth.isAuthenticated = false;

    const { result } = renderHook(() =>
      useGameSessionRouteGuard(GameRouteKind.STAGE, 'ab12cd', routeResolvers, routeGuardService),
    );

    expect(result.current.redirectTo).toBe('/game/AB12CD/stage/42/result');
  });

  it('redirects authenticated hosts to the result route when a result is available', () => {
    testState.playing.hasGameEnded = false;
    testState.playing.actionResult = { isCorrect: true, points: 100, correctActionIds: [1] };
    testState.auth.isAuthenticated = true;

    const { result } = renderHook(() =>
      useGameSessionRouteGuard(GameRouteKind.STAGE, 'ab12cd', routeResolvers, routeGuardService),
    );

    expect(result.current.redirectTo).toBe('/game/AB12CD/stage/42/result');
  });

  it('redirects the stage result route back to the live stage route when no result is available', () => {
    testState.playing.hasGameEnded = false;
    testState.playing.actionResult = null;

    const { result } = renderHook(() =>
      useGameSessionRouteGuard(GameRouteKind.RESULT, 'ab12cd', routeResolvers, routeGuardService),
    );

    expect(result.current.redirectTo).toBe('/game/AB12CD/stage/42');
  });

  it('keeps the result route stable while the timer-finished transition is active', () => {
    testState.playing.hasGameEnded = false;
    testState.playing.actionResult = null;
    testState.playing.isResultTransitionActive = true;

    const { result } = renderHook(() =>
      useGameSessionRouteGuard(GameRouteKind.RESULT, 'ab12cd', routeResolvers, routeGuardService),
    );

    expect(result.current.redirectTo).toBeNull();
  });

  it('redirects authenticated hosts to the leaderboard when the session ends', () => {
    const { result } = renderHook(() =>
      useGameSessionRouteGuard(GameRouteKind.STAGE, 'ab12cd', routeResolvers, routeGuardService),
    );

    expect(result.current.redirectTo).toBe('/game/AB12CD/leaderboard');
  });

  it('keeps guest players on the leaderboard when the session ends', () => {
    testState.auth.isAuthenticated = false;

    const { result } = renderHook(() =>
      useGameSessionRouteGuard(GameRouteKind.STAGE, 'ab12cd', routeResolvers, routeGuardService),
    );

    expect(result.current.redirectTo).toBe('/game/AB12CD/leaderboard');
  });
});
