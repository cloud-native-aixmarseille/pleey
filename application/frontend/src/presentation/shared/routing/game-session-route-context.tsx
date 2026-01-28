import { createContext, type PropsWithChildren, useContext } from 'react';
import type { GameStage } from '../../../domains/game-session/entities/game-stage';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

export interface GameSessionRouteContextValue {
  resolveJoinRoute(pin?: string): string;
  resolveLobbyRoute(pin: string): string;
  resolveStageRoute(pin: string, stageId: number): string;
  resolveStageResultRoute(pin: string, stageId: number): string;
  resolveStageRouteForStage(pin: string, stage: Pick<GameStage, 'id'>): string;
  resolveStageResultRouteForStage(pin: string, stage: Pick<GameStage, 'id'>): string;
  resolveLeaderboardRoute(pin: string): string;
}

const GameSessionRouteContext = createContext<GameSessionRouteContextValue | null>(null);

interface GameSessionRouteProviderProps extends PropsWithChildren {
  readonly value: GameSessionRouteContextValue;
}

export function GameSessionRouteProvider({ children, value }: GameSessionRouteProviderProps) {
  return (
    <GameSessionRouteContext.Provider value={value}>{children}</GameSessionRouteContext.Provider>
  );
}

export function useGameSessionRoutes(): GameSessionRouteContextValue {
  const value = useContext(GameSessionRouteContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_SESSION_ROUTE_PROVIDER_REQUIRED);
  }

  return value;
}
