import type { GameSessionPlayer } from '../../../../../domains/game-session/entities/game-session-player';

export enum GameSessionLobbyRuntimeEventName {
  ERROR = 'error',
  PLAYER_JOINED = 'player-joined',
  GAME_STARTED = 'game-started',
  GAME_RESUMED = 'game-resumed',
  RETURNED_TO_LOBBY = 'returned-to-lobby',
}

interface GameSessionLobbyRuntimeEventMap {
  readonly [GameSessionLobbyRuntimeEventName.ERROR]: {
    readonly message?: string;
  };
  readonly [GameSessionLobbyRuntimeEventName.PLAYER_JOINED]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly players: readonly GameSessionPlayer[];
  };
  readonly [GameSessionLobbyRuntimeEventName.GAME_STARTED]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly totalStages: number;
  };
  readonly [GameSessionLobbyRuntimeEventName.GAME_RESUMED]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly totalStages: number;
    readonly timeLeft?: number;
  };
  readonly [GameSessionLobbyRuntimeEventName.RETURNED_TO_LOBBY]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly players: readonly GameSessionPlayer[];
  };
}

export type GameSessionLobbyRuntimeEventKey = keyof GameSessionLobbyRuntimeEventMap;

export type GameSessionLobbyRuntimeHandler<TEventName extends GameSessionLobbyRuntimeEventKey> = (
  payload: GameSessionLobbyRuntimeEventMap[TEventName],
) => void;

export interface GameSessionLobbyRuntimePort {
  on<TEventName extends GameSessionLobbyRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionLobbyRuntimeHandler<TEventName>,
  ): void;
  off<TEventName extends GameSessionLobbyRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionLobbyRuntimeHandler<TEventName>,
  ): void;
  observeSession(pin: string): void;
  startGame(pin: string): void;
  disconnect(): void;
}
