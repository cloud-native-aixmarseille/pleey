import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GameSessionStateSnapshot } from '../../../domain/game/entities/game-session-state';
import { GameSessionState } from '../../../domain/game/entities/game-session-state';
import type { SessionStateRepository } from '../../../domain/game/ports/session-state.repository';

const DEFAULT_SESSION_STATE_TTL_SECONDS = 6 * 60 * 60;

type ValkeyClient = ReturnType<typeof createClient>;

@Injectable()
export class ValkeySessionStateRepository implements SessionStateRepository, OnModuleDestroy {
  private client: ValkeyClient | undefined;
  private connectPromise: Promise<ValkeyClient> | undefined;

  constructor(@Inject(Logger) private readonly logger: Logger) {}

  async get(pin: GameSessionPin): Promise<GameSessionState | undefined> {
    const client = await this.getClient();
    const raw = await client.get(this.stateKey(pin));
    if (!raw) {
      return undefined;
    }

    try {
      const snapshot = JSON.parse(raw) as GameSessionStateSnapshot;
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

    const ttlSeconds = this.getTtlSeconds();
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

  private getTtlSeconds(): number {
    const raw = process.env.SESSION_STATE_TTL_SECONDS;
    if (!raw) {
      return DEFAULT_SESSION_STATE_TTL_SECONDS;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_SESSION_STATE_TTL_SECONDS;
    }

    return Math.floor(parsed);
  }

  private async getClient(): Promise<ValkeyClient> {
    if (this.client) {
      return this.client;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const url = (process.env.VALKEY_URL ?? process.env.REDIS_URL ?? '').trim();
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
    return `quiz:session-state:${pin}`;
  }

  private socketsKey(pin: GameSessionPin): string {
    return `quiz:session-sockets:${pin}`;
  }

  private socketToPinKey(socketId: string): string {
    return `quiz:socket-pin:${socketId}`;
  }
}
