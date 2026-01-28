import { createContext, type PropsWithChildren, useContext } from 'react';
import type { GameSessionPlayer } from '../../../../../domains/game-session/entities/game-session-player';
import type { GameLobbyErrorCode } from '../../../../../domains/game-session/errors/game-lobby-error-code';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

export interface GameLobbyContextValue {
  readonly gameType: string | null;
  readonly gameTitle: string | null;
  readonly sessionPin: string | null;
  readonly players: readonly GameSessionPlayer[];
  readonly hasReceivedRoster: boolean;
  readonly hasGameStarted: boolean;
  readonly isHost: boolean;
  readonly errorCode: GameLobbyErrorCode | null;
  buildJoinUrl(pin: string): string;
  activateSession(pin: string): void;
  clearError(): void;
  startGame(): void;
  leaveSession(): Promise<void>;
}

const GameLobbyContext = createContext<GameLobbyContextValue | null>(null);

interface GameLobbyProviderProps extends PropsWithChildren {
  readonly value: GameLobbyContextValue;
}

export function GameLobbyProvider({ children, value }: GameLobbyProviderProps) {
  return <GameLobbyContext.Provider value={value}>{children}</GameLobbyContext.Provider>;
}

export function useGameLobby(): GameLobbyContextValue {
  const value = useContext(GameLobbyContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_LOBBY_PROVIDER_REQUIRED);
  }

  return value;
}
