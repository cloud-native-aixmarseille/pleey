import { Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { describe, expect, it } from 'vitest';
import type { UserId } from '../../../domain/auth/entities/user';
import { Game } from '../../../domain/game/entities/game';
import type { GameSessionId } from '../../../domain/game/entities/game-session';
import { GameSession, type GameSessionPin } from '../../../domain/game/entities/game-session';
import {
  GameAction,
  type GameActionId,
  GameStage,
  type GameStageId,
} from '../../../domain/game/entities/game-stage';
import { PlayerState } from '../../../domain/game/entities/player-state';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import type { GameRepository } from '../../../domain/game/ports/repositories/game.repository';
import type { GameSessionRepository } from '../../../domain/game/ports/repositories/game-session.repository';
import type { GameContentProviderRegistry } from '../../../domain/game/ports/services/game-content-provider';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state-service';
import type { SessionStateConfig } from './session-state-config.token';
import { ValkeySessionStateRepository } from './valkey-session-state-repository';

const createGameSession = (params: {
  id: GameSessionId;
  pin: GameSessionPin;
  status: GameSessionStatus;
  gameId: number;
  hostId: UserId;
  currentStageId: number | null;
}): GameSession =>
  new GameSession(
    params.id,
    params.gameId,
    params.hostId,
    params.pin,
    params.status,
    params.currentStageId !== null ? { currentStageId: params.currentStageId } : null,
    new Date(),
  );

const hasValkey = Boolean((process.env.VALKEY_URL ?? '').trim());

const describeIfValkey = hasValkey ? describe : describe.skip;

const createRepository = (): ValkeySessionStateRepository =>
  new ValkeySessionStateRepository(new Logger(), {
    ttlSeconds: 6 * 60 * 60,
    valkeyUrl: (process.env.VALKEY_URL ?? '').trim(),
  } satisfies SessionStateConfig);

describeIfValkey('ValkeySessionStateRepository', () => {
  it('getOrCreate persists, and get rehydrates state', async () => {
    const pin = `pin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const session = createGameSession({
      id: 1 as GameSessionId,
      pin,
      status: GameSessionStatus.ACTIVE,
      gameId: 10,
      hostId: 42 as UserId,
      currentStageId: 1,
    });
    const stages = [
      new GameStage(
        1 as GameStageId,
        10,
        1,
        'Q1',
        'multiple',
        [
          new GameAction(11 as GameActionId, 1 as GameStageId, 'A', 0, true),
          new GameAction(12 as GameActionId, 1 as GameStageId, 'B', 1, false),
          new GameAction(13 as GameActionId, 1 as GameStageId, 'C', 2, false),
          new GameAction(14 as GameActionId, 1 as GameStageId, 'D', 3, false),
        ],
        10,
        1000,
      ),
      new GameStage(
        2 as GameStageId,
        10,
        2,
        'Q2',
        'multiple',
        [
          new GameAction(21 as GameActionId, 2 as GameStageId, 'A', 0, false),
          new GameAction(22 as GameActionId, 2 as GameStageId, 'B', 1, true),
          new GameAction(23 as GameActionId, 2 as GameStageId, 'C', 2, false),
          new GameAction(24 as GameActionId, 2 as GameStageId, 'D', 3, false),
        ],
        10,
        1000,
      ),
    ];

    const gameSessionRepository = {
      findByPin: async (p: string) => (p === pin ? session : null),
    } as GameSessionRepository;

    const gameRepository = {
      findById: async (gameId: number) =>
        gameId === session.gameId
          ? new Game(gameId, GameType.QUIZ, 'Quiz', null, 1, new Date())
          : null,
    } as GameRepository;

    const contentProviderRegistry = {
      resolve: () => ({
        resolveStages: async () => stages,
      }),
    } as GameContentProviderRegistry;

    const repository = createRepository();
    const sessionStateService = new GameSessionStateService(
      repository,
      gameSessionRepository,
      gameRepository,
      contentProviderRegistry,
    );

    try {
      const created = await sessionStateService.getOrCreate(pin);
      expect(created.sessionId).toBe(1);
      expect(created.gameId).toBe(10);
      expect(created.hostId).toBe(42);
      expect(created.totalStages).toBe(2);

      const loaded = await repository.get(pin);
      expect(loaded).toBeDefined();
      expect(loaded?.sessionId).toBe(1);
      expect(loaded?.gameId).toBe(10);
      expect(loaded?.hostId).toBe(42);
      expect(loaded?.totalStages).toBe(2);
    } finally {
      await repository.remove(pin);
      await repository.onModuleDestroy();
    }
  });

  it('save updates socketId->pin index and remove cleans up keys', async () => {
    const pin = `pin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const session = createGameSession({
      id: 2 as GameSessionId,
      pin,
      status: GameSessionStatus.ACTIVE,
      gameId: 11,
      hostId: 99 as UserId,
      currentStageId: 1,
    });
    const stages = [
      new GameStage(
        1 as GameStageId,
        11,
        1,
        'Q1',
        'multiple',
        [
          new GameAction(31 as GameActionId, 1 as GameStageId, 'A', 0, true),
          new GameAction(32 as GameActionId, 1 as GameStageId, 'B', 1, false),
          new GameAction(33 as GameActionId, 1 as GameStageId, 'C', 2, false),
          new GameAction(34 as GameActionId, 1 as GameStageId, 'D', 3, false),
        ],
        10,
        1000,
      ),
    ];

    const gameSessionRepository = {
      findByPin: async (p: string) => (p === pin ? session : null),
    } as GameSessionRepository;

    const gameRepository = {
      findById: async (gameId: number) =>
        gameId === session.gameId
          ? new Game(gameId, GameType.QUIZ, 'Quiz', null, 1, new Date())
          : null,
    } as GameRepository;

    const contentProviderRegistry = {
      resolve: () => ({
        resolveStages: async () => stages,
      }),
    } as GameContentProviderRegistry;

    const repository = createRepository();
    const sessionStateService = new GameSessionStateService(
      repository,
      gameSessionRepository,
      gameRepository,
      contentProviderRegistry,
    );

    const socketId = `socket-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const state = await sessionStateService.getOrCreate(pin);
      state.addPlayer(PlayerState.createGuest(socketId, 'guest-1', 'alice', 'guest-1'));
      await repository.save(pin, state);

      await expect(repository.has(pin)).resolves.toBe(true);
      await expect(repository.findPinBySocketId(socketId)).resolves.toBe(pin);

      await repository.remove(pin);
      await expect(repository.has(pin)).resolves.toBe(false);
      await expect(repository.get(pin)).resolves.toBeUndefined();
      await expect(repository.findPinBySocketId(socketId)).resolves.toBeUndefined();
    } finally {
      await repository.remove(pin);
      await repository.onModuleDestroy();
    }
  });

  it('returns undefined and deletes corrupted snapshot', async () => {
    const pin = `pin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const repository = createRepository();

    const url = (process.env.VALKEY_URL ?? '').trim();
    const client = createClient({ url });

    try {
      await client.connect();
      await client.set(`game:session-state:${pin}`, '{not-json');

      const loaded = await repository.get(pin);
      expect(loaded).toBeUndefined();

      const stillThere = await client.exists(`game:session-state:${pin}`);
      expect(stillThere).toBe(0);
    } finally {
      try {
        await client.quit();
      } catch {
        // ignore
      }
      await repository.remove(pin);
      await repository.onModuleDestroy();
    }
  });
});
