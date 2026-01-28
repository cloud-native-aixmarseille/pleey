import { createContext, type PropsWithChildren, useContext } from 'react';
import type {
  GameLobbyState,
  GetGameLobbyStateCommand,
} from '../../../../../application/game-session/live/shared/contracts/lobby-state';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

export interface GameLobbyStatePort {
  execute(command: GetGameLobbyStateCommand): GameLobbyState;
}

const GameLobbyStateContext = createContext<GameLobbyStatePort | null>(null);

interface GameLobbyStateProviderProps extends PropsWithChildren {
  readonly value: GameLobbyStatePort;
}

export function GameLobbyStateProvider({ children, value }: GameLobbyStateProviderProps) {
  return <GameLobbyStateContext.Provider value={value}>{children}</GameLobbyStateContext.Provider>;
}

export function useGameLobbyState(): GameLobbyStatePort {
  const value = useContext(GameLobbyStateContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PROVIDER_REQUIRED);
  }

  return value;
}
