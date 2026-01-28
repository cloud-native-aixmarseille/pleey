import type { ActionResult } from '../../../../../domains/game-session/entities/action-result';
import type { GameSessionPlayer } from '../../../../../domains/game-session/entities/game-session-player';
import type { GameStage } from '../../../../../domains/game-session/entities/game-stage';
import type { LeaderboardEntry } from '../../../../../domains/game-session/entities/leaderboard-entry';

export enum GameSessionPlayingRuntimeEventName {
  ERROR = 'error',
  PLAYER_JOINED = 'player-joined',
  GAME_STARTED = 'game-started',
  NEXT_STAGE = 'next-stage',
  RESULT_REVEALED = 'result-revealed',
  RETURNED_TO_LOBBY = 'returned-to-lobby',
  GAME_PAUSED = 'game-paused',
  GAME_RESUMED = 'game-resumed',
  GAME_ENDED = 'game-ended',
  ACTION_ACKNOWLEDGED = 'action-acknowledged',
  ACTION_RESULT = 'action-result',
}

export interface SubmitGameActionCommand {
  readonly pin: string;
  readonly actionId: number;
  readonly timeLeft: number;
  readonly userId?: number;
  readonly guestId?: string;
}

export interface GameSessionPlayingRuntimeEventMap {
  readonly [GameSessionPlayingRuntimeEventName.ERROR]: {
    readonly message?: string;
  };
  readonly [GameSessionPlayingRuntimeEventName.PLAYER_JOINED]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly players: readonly GameSessionPlayer[];
  };
  readonly [GameSessionPlayingRuntimeEventName.GAME_STARTED]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly activePlayerCount: number;
    readonly stage: GameStage;
    readonly totalStages: number;
  };
  readonly [GameSessionPlayingRuntimeEventName.NEXT_STAGE]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly activePlayerCount: number;
    readonly stage: GameStage;
  };
  readonly [GameSessionPlayingRuntimeEventName.RESULT_REVEALED]: ActionResult;
  readonly [GameSessionPlayingRuntimeEventName.RETURNED_TO_LOBBY]: Record<string, never>;
  readonly [GameSessionPlayingRuntimeEventName.GAME_PAUSED]: {
    readonly timeLeft: number;
  };
  readonly [GameSessionPlayingRuntimeEventName.GAME_RESUMED]: {
    readonly gameTitle: string;
    readonly gameType: string;
    readonly activePlayerCount: number;
    readonly stage: GameStage;
    readonly totalStages: number;
    readonly timeLeft?: number;
  };
  readonly [GameSessionPlayingRuntimeEventName.GAME_ENDED]: {
    readonly leaderboard: readonly LeaderboardEntry[];
  };
  readonly [GameSessionPlayingRuntimeEventName.ACTION_ACKNOWLEDGED]: {
    readonly acknowledged: boolean;
  };
  readonly [GameSessionPlayingRuntimeEventName.ACTION_RESULT]: ActionResult;
}

export type GameSessionPlayingRuntimeEventKey = keyof GameSessionPlayingRuntimeEventMap;

export type GameSessionPlayingRuntimeHandler<TEventName extends GameSessionPlayingRuntimeEventKey> =
  (payload: GameSessionPlayingRuntimeEventMap[TEventName]) => void;

export interface GameSessionPlayingRuntimePort {
  observeSession(pin: string): void;
  submitAction(command: SubmitGameActionCommand): void;
  on<TEventName extends GameSessionPlayingRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionPlayingRuntimeHandler<TEventName>,
  ): void;
  off<TEventName extends GameSessionPlayingRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionPlayingRuntimeHandler<TEventName>,
  ): void;
}
