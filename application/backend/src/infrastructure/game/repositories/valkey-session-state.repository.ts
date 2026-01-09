import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { createClient } from 'redis';
import { GameErrorCode } from '../../../application/game/enums/game-error-code.enum';
import type { GameSessionStateSnapshot } from '../../../domain/game/entities/game-session-state';
import { GameSessionState } from '../../../domain/game/entities/game-session-state';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import type { SessionStateRepository } from '../../../domain/game/repositories/session-state.repository.interface';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/repositories/question.repository.interface';

const DEFAULT_SESSION_STATE_TTL_SECONDS = 6 * 60 * 60;

type ValkeyClient = ReturnType<typeof createClient>;

@Injectable()
export class ValkeySessionStateRepository implements SessionStateRepository, OnModuleDestroy {
  private readonly logger = new Logger(ValkeySessionStateRepository.name);

  private client: ValkeyClient | undefined;
  private connectPromise: Promise<ValkeyClient> | undefined;

  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) {}

  async getOrCreate(pin: string): Promise<GameSessionState> {
    const cached = await this.get(pin);
    if (cached) {
      return cached;
    }

    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.status === 'ended') {
      throw new WsException(GameErrorCode.GAME_SESSION_ENDED);
    }

    const questions = await this.questionRepository.findByQuizId(session.quizId);

    const state = GameSessionState.create({
      sessionId: session.id,
      quizId: session.quizId,
      hostId: session.hostId,
      questions,
      currentQuestionIndex: session.currentQuestion ?? 0,
    });

    await this.save(pin, state);
    return state;
  }

  async get(pin: string): Promise<GameSessionState | undefined> {
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
      );
      await this.remove(pin);
      return undefined;
    }
  }

  async save(pin: string, state: GameSessionState): Promise<void> {
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

  async remove(pin: string): Promise<void> {
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

  async has(pin: string): Promise<boolean> {
    const client = await this.getClient();
    const exists = await client.exists(this.stateKey(pin));
    return exists === 1;
  }

  async findPinBySocketId(socketId: string): Promise<string | undefined> {
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
      this.logger.error('Valkey client error', error as Error);
    });

    this.connectPromise = client.connect().then(() => {
      this.logger.log('Connected to Valkey');
      this.client = client;
      return client;
    });

    return this.connectPromise;
  }

  private stateKey(pin: string): string {
    return `quiz:session-state:${pin}`;
  }

  private socketsKey(pin: string): string {
    return `quiz:session-sockets:${pin}`;
  }

  private socketToPinKey(socketId: string): string {
    return `quiz:socket-pin:${socketId}`;
  }
}
