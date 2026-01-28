import type { GameSessionId, GameSessionPin } from '../../entities/game-session';
import type { GameActionId, GameStage } from '../../entities/game-stage';
import type { PlayerIdentity } from '../../entities/player-identity';
import type { PlayerState } from '../../entities/player-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameBroadcastServiceProvider = Symbol('GameBroadcastService');

export enum GameBroadcastEventType {
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
  LEADERBOARD_UPDATED = 'leaderboard-updated',
  GAME_STATE = 'game-state',
}

export type LeaderboardEntry = PlayerIdentity & {
  avatarUri?: string | null;
  username: string;
  totalPoints: number;
  rank: number;
};

interface ActionStatistics {
  totalActions: number;
  actionDistribution: Record<GameActionId, number>;
}

export interface ActionResultPayload {
  isCorrect: boolean;
  points: number;
  correctActionIds: GameActionId[];
  statistics: ActionStatistics;
}

export type GameBroadcastEvent =
  | {
      type: GameBroadcastEventType.PLAYER_JOINED;
      pin: GameSessionPin;
      sessionId: GameSessionId;
      gameTitle: string;
      gameType: GameType;
      players: PlayerState[];
    }
  | {
      type: GameBroadcastEventType.GAME_STARTED;
      pin: GameSessionPin;
      gameTitle: string;
      gameType: GameType;
      activePlayerCount: number;
      stage: GameStage;
      totalStages: number;
    }
  | {
      type: GameBroadcastEventType.NEXT_STAGE;
      pin: GameSessionPin;
      gameTitle: string;
      gameType: GameType;
      activePlayerCount: number;
      stage: GameStage;
    }
  | {
      type: GameBroadcastEventType.RESULT_REVEALED;
      pin: GameSessionPin;
      result: ActionResultPayload;
    }
  | {
      type: GameBroadcastEventType.RETURNED_TO_LOBBY;
      pin: GameSessionPin;
      sessionId: GameSessionId;
      gameTitle: string;
      gameType: GameType;
      players: PlayerState[];
    }
  | {
      type: GameBroadcastEventType.GAME_PAUSED;
      pin: GameSessionPin;
      timeLeft: number;
    }
  | {
      type: GameBroadcastEventType.GAME_RESUMED;
      pin: GameSessionPin;
      gameTitle: string;
      gameType: GameType;
      activePlayerCount: number;
      stage: GameStage;
      totalStages: number;
      timeLeft: number;
    }
  | {
      type: GameBroadcastEventType.GAME_ENDED;
      pin: GameSessionPin;
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: GameBroadcastEventType.ACTION_ACKNOWLEDGED;
      connectionId: string;
    }
  | {
      type: GameBroadcastEventType.ACTION_RESULT;
      connectionId: string;
      result: ActionResultPayload;
    }
  | {
      type: GameBroadcastEventType.LEADERBOARD_UPDATED;
      pin: GameSessionPin;
      leaderboard: LeaderboardEntry[];
    }
  | {
      type: GameBroadcastEventType.GAME_STATE;
      connectionId: string;
      gameTitle: string;
      gameType: GameType;
      activePlayerCount: number;
      stage: GameStage;
      totalStages: number;
      timeLeft: number;
    };

/**
 * Outbound port used by game-related use-cases to notify clients.
 * Implemented by infrastructure (e.g., Socket.IO gateway adapter).
 */
export interface GameBroadcastService {
  publish(event: GameBroadcastEvent): void;
}
