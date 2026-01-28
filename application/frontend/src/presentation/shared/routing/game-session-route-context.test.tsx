import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';
import { GameSessionRouteProvider, useGameSessionRoutes } from './game-session-route-context';

describe('game-session-route-context', () => {
  it('returns the provided routing helpers from context', () => {
    const value = {
      resolveJoinRoute: (pin?: string) => (pin ? `/game/join?pin=${pin}` : '/game/join'),
      resolveLobbyRoute: (pin: string) => `/game/${pin}/lobby`,
      resolveStageRoute: (pin: string, stageId: number) => `/game/${pin}/stage/${String(stageId)}`,
      resolveStageResultRoute: (pin: string, stageId: number) =>
        `/game/${pin}/stage/${String(stageId)}/result`,
      resolveStageRouteForStage: (pin: string, stage: { id: number }) =>
        `/game/${pin}/stage/${String(stage.id)}`,
      resolveStageResultRouteForStage: (pin: string, stage: { id: number }) =>
        `/game/${pin}/stage/${String(stage.id)}/result`,
      resolveLeaderboardRoute: (pin: string) => `/game/${pin}/leaderboard`,
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <GameSessionRouteProvider value={value}>{children}</GameSessionRouteProvider>
    );

    const { result } = renderHook(() => useGameSessionRoutes(), { wrapper });

    expect(result.current.resolveLobbyRoute('ABCD12')).toBe('/game/ABCD12/lobby');
    expect(result.current.resolveStageResultRouteForStage('ABCD12', { id: 3 })).toBe(
      '/game/ABCD12/stage/3/result',
    );
  });

  it('throws when the hook is used without its provider', () => {
    expect(() => renderHook(() => useGameSessionRoutes())).toThrow(
      PresentationContextErrorCode.GAME_SESSION_ROUTE_PROVIDER_REQUIRED,
    );
  });
});
