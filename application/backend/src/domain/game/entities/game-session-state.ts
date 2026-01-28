import type { UserId } from '../../auth/entities/user';
import type { GameId } from '../entities/game';
import { GameErrorCode } from '../enums/game-error-code.enum';
import type { GameType } from '../enums/game-type.enum';
import type { GameSessionId } from './game-session';
import {
  GameAction,
  type GameActionId,
  GameStage,
  type GameStageId,
  type GameStageType,
} from './game-stage';
import type { PlayerActionProps } from './player-action';
import { PlayerAction } from './player-action';
import type { GuestId, PlayerIdentity } from './player-identity';
import type { PlayerScoreProps } from './player-score';
import { PlayerScore } from './player-score';
import type { PlayerStateProps } from './player-state';
import { PlayerState } from './player-state';

interface StageSnapshot {
  id: GameStageId;
  sourceId: number;
  position: number;
  text: string;
  type: GameStageType;
  actions: Array<{
    id: GameActionId;
    text: string;
    position: number;
    isCorrect: boolean;
  }>;
  timeLimit: number;
  points: number;
}

export interface GameSessionStateSnapshot {
  sessionId: GameSessionId;
  gameId: GameId;
  gameTitle: string;
  gameType: GameType;
  hostId: UserId;
  stages: StageSnapshot[];
  currentStageId: GameStageId | null;
  players: PlayerStateProps[];
  scores: PlayerScoreProps[];
  currentStageActions: PlayerActionProps[];
  stageStartTime?: number;
  pausedTimeLeft?: number;
}

interface GameSessionStateProps {
  sessionId: GameSessionId;
  gameId: GameId;
  gameTitle: string;
  gameType: GameType;
  hostId: UserId;
  stages: GameStage[];
  currentStageId?: GameStageId | null;
}

/**
 * Aggregate root for game session state.
 * Encapsulates all in-memory game state and enforces business rules.
 */
export class GameSessionState {
  readonly sessionId: GameSessionId;
  readonly gameId: GameId;
  readonly gameTitle: string;
  readonly gameType: GameType;
  readonly hostId: UserId;
  readonly stages: GameStage[];

  private _currentStageId: GameStageId | null;
  private _players: Map<string, PlayerState>;
  private _scores: Map<string, PlayerScore>;
  private _currentStageActions: Map<string, PlayerAction>;
  private _stageStartTime?: number;
  private _pausedTimeLeft?: number;

  private constructor(props: GameSessionStateProps) {
    this.sessionId = props.sessionId;
    this.gameId = props.gameId;
    this.gameTitle = props.gameTitle;
    this.gameType = props.gameType;
    this.hostId = props.hostId;
    this.stages = props.stages;
    this._currentStageId = props.currentStageId ?? null;
    this._players = new Map();
    this._scores = new Map();
    this._currentStageActions = new Map();
  }

  static create(props: GameSessionStateProps): GameSessionState {
    return new GameSessionState(props);
  }

  static fromSnapshot(snapshot: GameSessionStateSnapshot): GameSessionState {
    const state = new GameSessionState({
      sessionId: snapshot.sessionId,
      gameId: snapshot.gameId,
      gameTitle: snapshot.gameTitle,
      gameType: snapshot.gameType,
      hostId: snapshot.hostId,
      stages: snapshot.stages.map(
        (p) =>
          new GameStage(
            p.id,
            p.sourceId,
            p.position,
            p.text,
            p.type,
            p.actions.map(
              (action) =>
                new GameAction(action.id, p.id, action.text, action.position, action.isCorrect),
            ),
            p.timeLimit,
            p.points,
          ),
      ),
      currentStageId: snapshot.currentStageId,
    });

    state._stageStartTime = snapshot.stageStartTime;
    state._pausedTimeLeft = snapshot.pausedTimeLeft;

    state._players = new Map(
      snapshot.players.map((playerProps) => [
        playerProps.socketId,
        PlayerState.create(playerProps),
      ]),
    );

    state._scores = new Map(
      snapshot.scores.map((scoreProps) => [scoreProps.playerId, PlayerScore.create(scoreProps)]),
    );

    state._currentStageActions = new Map(
      snapshot.currentStageActions.map((actionProps) => [
        actionProps.playerId,
        PlayerAction.create(actionProps),
      ]),
    );

    return state;
  }

  toSnapshot(): GameSessionStateSnapshot {
    return {
      sessionId: this.sessionId,
      gameId: this.gameId,
      gameTitle: this.gameTitle,
      gameType: this.gameType,
      hostId: this.hostId,
      stages: this.stages.map((p) => ({
        id: p.id,
        sourceId: p.sourceId,
        position: p.position,
        text: p.text,
        type: p.type,
        actions: p.actions.map((action) => ({
          id: action.id,
          text: action.text,
          position: action.position,
          isCorrect: action.isCorrect,
        })),
        timeLimit: p.timeLimit,
        points: p.points,
      })),
      currentStageId: this._currentStageId,
      players: this.getAllPlayers().map((p) => {
        if (p.userId !== undefined) {
          return {
            socketId: p.socketId,
            username: p.username,
            avatarSeed: p.avatarSeed,
            userId: p.userId,
          };
        }
        if (p.guestId !== undefined) {
          return {
            socketId: p.socketId,
            username: p.username,
            avatarSeed: p.avatarSeed,
            guestId: p.guestId,
          };
        }
        throw new Error(GameErrorCode.PLAYER_IDENTITY_REQUIRED);
      }),
      scores: Array.from(this._scores.values()).map((s) => {
        if (s.userId !== undefined) {
          return {
            playerId: s.playerId,
            username: s.username,
            totalPoints: s.totalPoints,
            userId: s.userId,
          };
        }
        if (s.guestId !== undefined) {
          return {
            playerId: s.playerId,
            username: s.username,
            totalPoints: s.totalPoints,
            guestId: s.guestId,
          };
        }
        throw new Error(GameErrorCode.PLAYER_SCORE_IDENTITY_INVALID);
      }),
      currentStageActions: this.getAllActions().map((action) => ({
        playerId: action.playerId,
        actionId: action.actionId,
        isCorrect: action.isCorrect,
        points: action.points,
        timeLeft: action.timeLeft,
      })),
      stageStartTime: this._stageStartTime,
      pausedTimeLeft: this._pausedTimeLeft,
    };
  }

  // Getters
  get currentStageId(): GameStageId | null {
    return this._currentStageId;
  }

  get currentStage(): GameStage | undefined {
    if (!this._currentStageId) {
      return undefined;
    }
    return this.stages.find((stage) => stage.id === this._currentStageId);
  }

  getCorrectActionIds(): GameActionId[] {
    const currentStage = this.currentStage;
    if (!currentStage) {
      return [];
    }
    return currentStage.getCorrectActions().map((action) => action.id);
  }

  get stageStartTime(): number | undefined {
    return this._stageStartTime;
  }

  get pausedTimeLeft(): number | undefined {
    return this._pausedTimeLeft;
  }

  get hasMoreStages(): boolean {
    if (this.stages.length === 0) {
      return false;
    }
    const currentStage = this.currentStage;
    if (!currentStage) {
      return true;
    }
    return this.stages.some((stage) => stage.position > currentStage.position);
  }

  get canRewindStage(): boolean {
    return this.stages.length > 0 && this.currentStage !== undefined;
  }

  get totalStages(): number {
    return this.stages.length;
  }

  get hasStages(): boolean {
    return this.stages.length > 0;
  }

  // Player management
  addPlayer(player: PlayerState): void {
    // Remove existing player with same identity (reconnection)
    const existingSocketId = this.findExistingPlayerSocketId(player);
    if (existingSocketId) {
      this._players.delete(existingSocketId);
    }
    this._players.set(player.socketId, player);
  }

  removePlayerBySocketId(socketId: string): boolean {
    return this._players.delete(socketId);
  }

  removePlayerByUserId(userId: UserId): boolean {
    const player = this.findPlayerByUserId(userId);

    if (!player) {
      return false;
    }

    return this._players.delete(player.socketId);
  }

  getPlayerBySocketId(socketId: string): PlayerState | undefined {
    return this._players.get(socketId);
  }

  findPlayerByUserId(userId: UserId): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (player.matchesUserId(userId)) {
        return player;
      }
    }
    return undefined;
  }

  findPlayerByGuestId(guestId: GuestId): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (player.matchesGuestId(guestId)) {
        return player;
      }
    }
    return undefined;
  }

  findPlayerByIdentity(userId?: UserId, guestId?: GuestId): PlayerState | undefined {
    for (const player of this._players.values()) {
      if (userId !== undefined && player.matchesUserId(userId)) {
        return player;
      }
      if (guestId && player.matchesGuestId(guestId)) {
        return player;
      }
    }
    return undefined;
  }

  getNonHostPlayers(): PlayerState[] {
    return Array.from(this._players.values()).filter((player) => player.userId !== this.hostId);
  }

  getAllPlayers(): PlayerState[] {
    return Array.from(this._players.values());
  }

  getPlayerEntries(): [string, PlayerState][] {
    return Array.from(this._players.entries());
  }

  get playerCount(): number {
    return this._players.size;
  }

  isHost(userId?: UserId): boolean {
    return userId !== undefined && userId === this.hostId;
  }

  // Score management
  getOrCreateScore(playerId: string, username: string, identity: PlayerIdentity): PlayerScore {
    let score = this._scores.get(playerId);
    if (!score) {
      score = PlayerScore.createNew(playerId, username, identity);
      this._scores.set(playerId, score);
    }
    return score;
  }

  getScoresExcludingHost(): PlayerScore[] {
    return Array.from(this._scores.values()).filter(
      (score) => score.userId === undefined || score.userId !== this.hostId,
    );
  }

  // Action management
  hasPlayerActed(playerId: string): boolean {
    return this._currentStageActions.has(playerId);
  }

  recordAction(action: PlayerAction): void {
    this._currentStageActions.set(action.playerId, action);
  }

  getAction(playerId: string): PlayerAction | undefined {
    return this._currentStageActions.get(playerId);
  }

  getAllActions(): PlayerAction[] {
    return Array.from(this._currentStageActions.values());
  }

  get actionCount(): number {
    return this._currentStageActions.size;
  }

  haveAllNonHostPlayersActed(): boolean {
    const nonHostPlayers = this.getNonHostPlayers();
    return nonHostPlayers.length > 0 && this.actionCount === nonHostPlayers.length;
  }

  // Stage flow management
  startFirstStage(): void {
    this._currentStageId = this.stages[0]?.id ?? null;
    this._currentStageActions.clear();
    this._stageStartTime = Date.now();
    this._pausedTimeLeft = undefined;
  }

  advanceToNextStage(): void {
    if (this.stages.length === 0) {
      this._currentStageId = null;
    } else {
      const nextStage = this.resolveNextStage();
      if (nextStage) {
        this._currentStageId = nextStage.id;
      }
    }
    this._currentStageActions.clear();
    this._stageStartTime = Date.now();
    this._pausedTimeLeft = undefined;
  }

  rewindToPreviousStage(): void {
    if (this.stages.length === 0) {
      this._currentStageId = null;
    } else {
      const previousStage = this.resolvePreviousStage();
      if (!previousStage) {
        this._currentStageId = null;
      } else {
        this._currentStageId = previousStage.id;
      }
    }

    this._currentStageActions.clear();
    this._stageStartTime = this._currentStageId === null ? undefined : Date.now();
    this._pausedTimeLeft = undefined;
  }

  returnToLobby(): void {
    this._currentStageId = null;
    this._currentStageActions.clear();
    this._stageStartTime = undefined;
    this._pausedTimeLeft = undefined;
  }

  restartCurrentStage(): void {
    if (!this.currentStage) {
      throw new Error(GameErrorCode.NO_CURRENT_STAGE_TO_RESUME);
    }

    this._currentStageActions.clear();
    this._stageStartTime = Date.now();
    this._pausedTimeLeft = undefined;
  }

  clearActionsForNewStage(): void {
    this._currentStageActions.clear();
    this._stageStartTime = Date.now();
  }

  // Pause management
  pause(): number {
    const timeLimit = this.currentStage?.timeLimit ?? 20;
    let remainingTime = timeLimit;

    if (this._stageStartTime) {
      const elapsedSeconds = Math.floor((Date.now() - this._stageStartTime) / 1000);
      remainingTime = Math.max(0, timeLimit - elapsedSeconds);
    }

    this._pausedTimeLeft = remainingTime;
    return remainingTime;
  }

  resume(): number {
    const currentStage = this.currentStage;
    if (!currentStage) {
      throw new Error(GameErrorCode.NO_CURRENT_STAGE_TO_RESUME);
    }

    const remainingTime = this._pausedTimeLeft ?? currentStage.timeLimit;

    // Recalculate stage start time for accurate tracking
    this._stageStartTime = Date.now() - (currentStage.timeLimit - remainingTime) * 1000;
    this._pausedTimeLeft = undefined;

    return remainingTime;
  }

  private resolveNextStage(): GameStage | undefined {
    const orderedStages = this.getStagesOrderedByPosition();
    const currentStage = this.currentStage;

    if (!currentStage) {
      return orderedStages[0];
    }

    return orderedStages.find((stage) => stage.position > currentStage.position);
  }

  private resolvePreviousStage(): GameStage | undefined {
    const orderedStages = this.getStagesOrderedByPosition();
    const currentStage = this.currentStage;

    if (!currentStage) {
      return undefined;
    }

    return orderedStages.findLast((stage) => stage.position < currentStage.position);
  }

  private getStagesOrderedByPosition(): GameStage[] {
    return [...this.stages].sort((left, right) => left.position - right.position);
  }

  // Utility
  private findExistingPlayerSocketId(newPlayer: PlayerState): string | undefined {
    for (const [socketId, player] of this._players.entries()) {
      if (newPlayer.userId !== undefined && player.matchesUserId(newPlayer.userId)) {
        return socketId;
      }
      if (newPlayer.guestId && player.matchesGuestId(newPlayer.guestId)) {
        return socketId;
      }
    }
    return undefined;
  }
}
