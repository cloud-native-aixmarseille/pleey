import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';
import type { UserId } from '../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GameSessionStateSnapshot } from '../../../domain/game/entities/game-session-state';
import { GameSessionState } from '../../../domain/game/entities/game-session-state';
import type { SessionStateRepository } from '../../../domain/game/ports/repositories/session-state.repository';
import { SESSION_STATE_CONFIG, type SessionStateConfig } from './session-state-config.token';

type ValkeyClient = ReturnType<typeof createClient>;

@Injectable()
export class ValkeySessionStateRepository implements SessionStateRepository, OnModuleDestroy {
  private client: ValkeyClient | undefined;
  private connectPromise: Promise<ValkeyClient> | undefined;

  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(SESSION_STATE_CONFIG) private readonly config: SessionStateConfig,
  ) {}

  async get(pin: GameSessionPin): Promise<GameSessionState | undefined> {
    const client = await this.getClient();
    const raw = await client.get(this.stateKey(pin));
    if (!raw) {
      return undefined;
    }

    try {
      const snapshot = this.deserializeSnapshot(raw);
      return GameSessionState.fromSnapshot(snapshot);
    } catch (_error) {
      this.logger.warn(
        `Failed to parse session state snapshot for pin=${pin}; deleting corrupted key`,
        ValkeySessionStateRepository.name,
      );
      await this.remove(pin);
      return undefined;
    }
  }

  async save(pin: GameSessionPin, state: GameSessionState): Promise<void> {
    const client = await this.getClient();

    const ttlSeconds = this.config.ttlSeconds;
    const snapshot = state.toSnapshot();
    const serialized = JSON.stringify(snapshot);

    const socketsKey = this.socketsKey(pin);
    const stateKey = this.stateKey(pin);

    const currentSocketIds = state.getAllPlayers().map((p) => p.socketId);
    const currentSocketIdSet = new Set(currentSocketIds);

    const previousSocketIds = await client.sMembers(socketsKey);
    const removedSocketIds = previousSocketIds.filter(
      (socketId: string) => !currentSocketIdSet.has(socketId),
    );

    const multi = client.multi();

    multi.set(stateKey, serialized, { EX: ttlSeconds });

    if (removedSocketIds.length > 0) {
      multi.sRem(socketsKey, removedSocketIds);
      for (const socketId of removedSocketIds) {
        multi.del(this.socketToPinKey(socketId));
      }
    }

    if (currentSocketIds.length > 0) {
      multi.sAdd(socketsKey, currentSocketIds);
      for (const socketId of currentSocketIds) {
        multi.set(this.socketToPinKey(socketId), pin, { EX: ttlSeconds });
      }
    }

    multi.expire(socketsKey, ttlSeconds);

    await multi.exec();
  }

  async remove(pin: GameSessionPin): Promise<void> {
    const client = await this.getClient();

    const socketsKey = this.socketsKey(pin);
    const socketIds = await client.sMembers(socketsKey);

    const multi = client.multi();
    multi.del(this.stateKey(pin));
    multi.del(socketsKey);

    for (const socketId of socketIds) {
      multi.del(this.socketToPinKey(socketId));
    }

    await multi.exec();
  }

  async findPinByUserId(userId: UserId): Promise<GameSessionPin | undefined> {
    const client = await this.getClient();
    const pin = await client.get(this.userToPinKey(userId));

    return pin ?? undefined;
  }

  async savePinByUserId(userId: UserId, pin: GameSessionPin): Promise<void> {
    const client = await this.getClient();
    const userToPinKey = this.userToPinKey(userId);
    const nextSessionUsersKey = this.sessionUsersKey(pin);
    const previousPin = await client.get(userToPinKey);
    const multi = client.multi();

    multi.set(userToPinKey, pin);
    multi.sAdd(nextSessionUsersKey, String(userId));

    if (previousPin && previousPin !== pin) {
      multi.sRem(this.sessionUsersKey(previousPin), String(userId));
    }

    await multi.exec();
  }

  async removePinByUserId(userId: UserId): Promise<void> {
    const client = await this.getClient();
    const userToPinKey = this.userToPinKey(userId);
    const pin = await client.get(userToPinKey);

    if (!pin) {
      return;
    }

    const multi = client.multi();
    multi.del(userToPinKey);
    multi.sRem(this.sessionUsersKey(pin), String(userId));
    await multi.exec();
  }

  async removePinsBySession(pin: GameSessionPin): Promise<void> {
    const client = await this.getClient();
    const sessionUsersKey = this.sessionUsersKey(pin);
    const userIds = await client.sMembers(sessionUsersKey);

    if (userIds.length === 0) {
      await client.del(sessionUsersKey);
      return;
    }

    const multi = client.multi();
    multi.del(sessionUsersKey);

    for (const userId of userIds) {
      multi.del(this.userToPinKey(Number(userId) as UserId));
    }

    await multi.exec();
  }

  async has(pin: GameSessionPin): Promise<boolean> {
    const client = await this.getClient();
    const exists = await client.exists(this.stateKey(pin));
    return exists === 1;
  }

  async findPinBySocketId(socketId: string): Promise<GameSessionPin | undefined> {
    const client = await this.getClient();
    const pin = await client.get(this.socketToPinKey(socketId));
    return pin ?? undefined;
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
    } catch {
      // ignore
    }
  }

  private async getClient(): Promise<ValkeyClient> {
    if (this.client) {
      return this.client;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const url = this.config.valkeyUrl?.trim();
    if (!url) {
      throw new Error('VALKEY_URL is required to use ValkeySessionStateRepository');
    }

    const client = createClient({ url });
    client.on('error', (error: unknown) => {
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error('Valkey client error', trace, ValkeySessionStateRepository.name);
    });

    this.connectPromise = client.connect().then(() => {
      this.logger.log('Connected to Valkey', ValkeySessionStateRepository.name);
      this.client = client;
      return client;
    });

    return this.connectPromise;
  }

  private stateKey(pin: GameSessionPin): string {
    return `game:session-state:${pin}`;
  }

  private socketsKey(pin: GameSessionPin): string {
    return `game:session-sockets:${pin}`;
  }

  private socketToPinKey(socketId: string): string {
    return `game:socket-pin:${socketId}`;
  }

  private userToPinKey(userId: UserId): string {
    return `game:user-pin:${userId}`;
  }

  private sessionUsersKey(pin: GameSessionPin): string {
    return `game:session-users:${pin}`;
  }

  private deserializeSnapshot(raw: string): GameSessionStateSnapshot {
    const parsed = JSON.parse(raw) as unknown;

    if (!this.isGameSessionStateSnapshot(parsed)) {
      throw new Error('Invalid game session state snapshot');
    }

    return parsed;
  }

  private isGameSessionStateSnapshot(value: unknown): value is GameSessionStateSnapshot {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.sessionId === 'number' &&
      typeof value.gameId === 'number' &&
      typeof value.hostId === 'number' &&
      (value.currentStageId === null || typeof value.currentStageId === 'number') &&
      (value.stageStartTime === undefined || typeof value.stageStartTime === 'number') &&
      (value.pausedTimeLeft === undefined || typeof value.pausedTimeLeft === 'number') &&
      Array.isArray(value.stages) &&
      value.stages.every((stage) => this.isStageSnapshot(stage)) &&
      Array.isArray(value.players) &&
      value.players.every((player) => this.isPlayerStateSnapshot(player)) &&
      Array.isArray(value.scores) &&
      value.scores.every((score) => this.isPlayerScoreSnapshot(score)) &&
      Array.isArray(value.currentStageActions) &&
      value.currentStageActions.every((action) => this.isPlayerActionSnapshot(action))
    );
  }

  private isStageSnapshot(value: unknown): boolean {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.id === 'number' &&
      typeof value.sourceId === 'number' &&
      typeof value.position === 'number' &&
      typeof value.text === 'string' &&
      typeof value.type === 'string' &&
      typeof value.timeLimit === 'number' &&
      typeof value.points === 'number' &&
      Array.isArray(value.actions) &&
      value.actions.every((action) => this.isStageActionSnapshot(action))
    );
  }

  private isStageActionSnapshot(value: unknown): boolean {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.id === 'number' &&
      typeof value.text === 'string' &&
      typeof value.position === 'number' &&
      typeof value.isCorrect === 'boolean'
    );
  }

  private isPlayerStateSnapshot(value: unknown): boolean {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.socketId === 'string' &&
      typeof value.username === 'string' &&
      typeof value.avatarSeed === 'string' &&
      this.hasExclusiveIdentity(value)
    );
  }

  private isPlayerScoreSnapshot(value: unknown): boolean {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.playerId === 'string' &&
      typeof value.username === 'string' &&
      typeof value.totalPoints === 'number' &&
      this.hasExclusiveIdentity(value)
    );
  }

  private isPlayerActionSnapshot(value: unknown): boolean {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.playerId === 'string' &&
      typeof value.actionId === 'number' &&
      typeof value.isCorrect === 'boolean' &&
      typeof value.points === 'number' &&
      typeof value.timeLeft === 'number'
    );
  }

  private hasExclusiveIdentity(value: Record<string, unknown>): boolean {
    const hasUserId = typeof value.userId === 'number';
    const hasGuestId = typeof value.guestId === 'string';

    return hasUserId !== hasGuestId;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
