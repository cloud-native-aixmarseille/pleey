import { createContext, type PropsWithChildren, useContext } from 'react';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

export interface GameHostControlContextValue {
  readonly isHost: boolean;
  readonly isPaused: boolean;
  readonly canRewindStage: boolean;
  readonly canReturnToLobby: boolean;
  readonly shouldReturnToLobbyFromCurrentStage: boolean;
  readonly isEndConfirmPending: boolean;
  pauseGame(): void;
  resumeGame(): void;
  restartStage(): void;
  rewindStage(): void;
  returnToLobby(): void;
  nextStage(): void;
  requestEndGame(): void;
  confirmEndGame(): void;
  cancelEndGame(): void;
}

const GameHostControlContext = createContext<GameHostControlContextValue | null>(null);

interface GameHostControlProviderProps extends PropsWithChildren {
  readonly value: GameHostControlContextValue;
}

export function GameHostControlProvider({ children, value }: GameHostControlProviderProps) {
  return (
    <GameHostControlContext.Provider value={value}>{children}</GameHostControlContext.Provider>
  );
}

export function useGameHostControl(): GameHostControlContextValue {
  const value = useContext(GameHostControlContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PLAYING_PROVIDER_REQUIRED);
  }

  return value;
}
