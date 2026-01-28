import { createContext, type PropsWithChildren, useContext } from 'react';
import type { ActionResult } from '../../../../../domains/game-session/entities/action-result';
import type { GameStage } from '../../../../../domains/game-session/entities/game-stage';
import type { LeaderboardEntry } from '../../../../../domains/game-session/entities/leaderboard-entry';
import type { GamePlayingErrorCode } from '../../../../../domains/game-session/errors/game-playing-error-code';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

export interface GamePlayingContextValue {
  readonly activePlayerCount: number;
  readonly actionResult: ActionResult | null;
  readonly actionSubmitted: boolean;
  readonly currentGameType: string | null;
  readonly gameType: string | null;
  readonly gameTitle: string | null;
  readonly currentStage: GameStage | null;
  readonly errorCode: GamePlayingErrorCode | null;
  readonly hasGameEnded: boolean;
  readonly isHost: boolean;
  readonly isPaused: boolean;
  readonly isResultTransitionActive: boolean;
  readonly leaderboard: readonly LeaderboardEntry[];
  readonly selectedActionId: number | null;
  readonly sessionPin: string | null;
  readonly timeLeft: number | null;
  readonly totalStages: number;
  activateSession(pin: string): void;
  clearError(): void;
  leaveSession(): Promise<void>;
  submitAction(actionId: number): void;
}

const GamePlayingContext = createContext<GamePlayingContextValue | null>(null);

interface GamePlayingProviderProps extends PropsWithChildren {
  readonly value: GamePlayingContextValue;
}

export function GamePlayingProvider({ children, value }: GamePlayingProviderProps) {
  return <GamePlayingContext.Provider value={value}>{children}</GamePlayingContext.Provider>;
}

export function useGamePlaying(): GamePlayingContextValue {
  const value = useContext(GamePlayingContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PLAYING_PROVIDER_REQUIRED);
  }

  return value;
}
