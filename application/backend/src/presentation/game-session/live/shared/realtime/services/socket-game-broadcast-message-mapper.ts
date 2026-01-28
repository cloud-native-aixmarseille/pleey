import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../../domain/auth/entities/user';
import type { GameActionId, GameStage } from '../../../../../../domain/game/entities/game-stage';
import type { GuestId, PlayerState } from '../../../../../../domain/game/entities/player-state';
import {
  type GameBroadcastEvent,
  GameBroadcastEventType,
  type LeaderboardEntry,
} from '../../../../../../domain/game/ports/services/game-broadcast.service';
import { AvatarUriService } from './avatar-uri-service';

interface SocketPlayerPayload {
  id?: UserId;
  guestId?: GuestId;
  username: string;
  avatarUri: string;
}

interface SocketLeaderboardEntryPayload {
  userId?: UserId;
  guestId?: GuestId;
  username: string;
  totalPoints: number;
  rank: number;
  avatarUri: string | null;
}

type GameActionResponse = {
  id: GameActionId;
  text: string;
  position: number;
  isCorrect: boolean;
};

type GameStageResponse = {
  id: GameStage['id'];
  sourceId: number;
  position: number;
  text: string;
  type: GameStage['type'];
  actions: GameActionResponse[];
  timeLimit: number;
  points: number;
};

interface SocketGameBroadcastMessage {
  readonly target: string;
  readonly payload: unknown;
}

@Injectable()
export class SocketGameBroadcastMessageMapper {
  constructor(private readonly avatarUriService: AvatarUriService) {}

  map(event: GameBroadcastEvent): SocketGameBroadcastMessage {
    switch (event.type) {
      case GameBroadcastEventType.PLAYER_JOINED:
        return {
          target: event.pin,
          payload: {
            gameTitle: event.gameTitle,
            gameType: event.gameType,
            players: event.players.map((player: PlayerState) => this.mapPlayer(player)),
          },
        };
      case GameBroadcastEventType.GAME_STARTED:
        return {
          target: event.pin,
          payload: {
            gameTitle: event.gameTitle,
            gameType: event.gameType,
            activePlayerCount: event.activePlayerCount,
            stage: this.mapGameStageToResponse(event.stage),
            totalStages: event.totalStages,
          },
        };
      case GameBroadcastEventType.NEXT_STAGE:
        return {
          target: event.pin,
          payload: {
            gameTitle: event.gameTitle,
            gameType: event.gameType,
            activePlayerCount: event.activePlayerCount,
            stage: this.mapGameStageToResponse(event.stage),
          },
        };
      case GameBroadcastEventType.RESULT_REVEALED:
        return {
          target: event.pin,
          payload: event.result,
        };
      case GameBroadcastEventType.RETURNED_TO_LOBBY:
        return {
          target: event.pin,
          payload: {
            gameTitle: event.gameTitle,
            gameType: event.gameType,
            players: event.players.map((player: PlayerState) => this.mapPlayer(player)),
          },
        };
      case GameBroadcastEventType.GAME_PAUSED:
        return {
          target: event.pin,
          payload: { timeLeft: event.timeLeft },
        };
      case GameBroadcastEventType.GAME_RESUMED:
        return {
          target: event.pin,
          payload: {
            gameTitle: event.gameTitle,
            gameType: event.gameType,
            activePlayerCount: event.activePlayerCount,
            stage: this.mapGameStageToResponse(event.stage),
            totalStages: event.totalStages,
            timeLeft: event.timeLeft,
          },
        };
      case GameBroadcastEventType.GAME_ENDED:
        return {
          target: event.pin,
          payload: {
            leaderboard: event.leaderboard.map((entry) => this.mapLeaderboardEntry(entry)),
          },
        };
      case GameBroadcastEventType.ACTION_ACKNOWLEDGED:
        return {
          target: event.connectionId,
          payload: { acknowledged: true },
        };
      case GameBroadcastEventType.ACTION_RESULT:
        return {
          target: event.connectionId,
          payload: event.result,
        };
      case GameBroadcastEventType.LEADERBOARD_UPDATED:
        return {
          target: event.pin,
          payload: {
            leaderboard: event.leaderboard.map((entry) => this.mapLeaderboardEntry(entry)),
          },
        };
      case GameBroadcastEventType.GAME_STATE:
        return {
          target: event.connectionId,
          payload: {
            gameTitle: event.gameTitle,
            gameType: event.gameType,
            activePlayerCount: event.activePlayerCount,
            stage: this.mapGameStageToResponse(event.stage),
            totalStages: event.totalStages,
            timeLeft: event.timeLeft,
          },
        };
    }
  }

  private mapPlayer(player: PlayerState): SocketPlayerPayload {
    const avatarUri = player.userId
      ? this.avatarUriService.buildUserAvatarUri(player.userId)
      : this.avatarUriService.buildGuestPlayerAvatarUri(player.guestId as GuestId);

    return {
      id: player.userId,
      guestId: player.guestId,
      username: player.username,
      avatarUri,
    };
  }

  private mapLeaderboardEntry(entry: LeaderboardEntry): SocketLeaderboardEntryPayload {
    const avatarUri = entry.userId
      ? this.avatarUriService.buildUserAvatarUri(entry.userId)
      : entry.guestId
        ? this.avatarUriService.buildGuestPlayerAvatarUri(entry.guestId)
        : null;

    return {
      userId: entry.userId,
      guestId: entry.guestId,
      username: entry.username,
      totalPoints: entry.totalPoints,
      rank: entry.rank,
      avatarUri,
    };
  }

  private mapGameActionToResponse(action: GameStage['actions'][number]): GameActionResponse {
    return {
      id: action.id,
      text: action.text,
      position: action.position,
      isCorrect: action.isCorrect,
    };
  }

  private mapGameStageToResponse(stage: GameStage): GameStageResponse {
    return {
      id: stage.id,
      sourceId: stage.sourceId,
      position: stage.position,
      text: stage.text,
      type: stage.type,
      actions: stage.actions.map((action) => this.mapGameActionToResponse(action)),
      timeLimit: stage.timeLimit,
      points: stage.points,
    };
  }
}
