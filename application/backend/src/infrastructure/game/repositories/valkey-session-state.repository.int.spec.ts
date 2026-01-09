import { createClient } from 'redis';
import { describe, expect, it } from 'vitest';

import { PlayerState } from '../../../domain/game/entities/player-state';
import { Question } from '../../../domain/quiz/entities/question';
import { ValkeySessionStateRepository } from './valkey-session-state.repository';

type GameSessionRecord = {
  id: number;
  pin: string;
  status: 'active' | 'paused' | 'ended';
  quizId: number;
  hostId: number;
  currentQuestion: number;
};

const hasValkey = Boolean((process.env.VALKEY_URL ?? '').trim());

const describeIfValkey = hasValkey ? describe : describe.skip;

describeIfValkey('ValkeySessionStateRepository (integration)', () => {
  it('getOrCreate persists, and get rehydrates state', async () => {
    const pin = `pin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const session: GameSessionRecord = {
      id: 1,
      pin,
      status: 'active',
      quizId: 10,
      hostId: 42,
      currentQuestion: 0,
    };

    const questions = [
      new Question(1, session.quizId, 'Q1', 'multiple', 'A', 'A', 'B', 'C', 'D', 10, 1000),
      new Question(2, session.quizId, 'Q2', 'multiple', 'B', 'A', 'B', 'C', 'D', 10, 1000),
    ];

    const gameSessionRepository = {
      findByPin: async (p: string) => (p === pin ? session : null),
    };

    const questionRepository = {
      findByQuizId: async (quizId: number) => (quizId === session.quizId ? questions : []),
    };

    const repository = new ValkeySessionStateRepository(
      gameSessionRepository as never,
      questionRepository as never,
    );

    try {
      const created = await repository.getOrCreate(pin);
      expect(created.sessionId).toBe(1);
      expect(created.quizId).toBe(10);
      expect(created.hostId).toBe(42);
      expect(created.totalQuestions).toBe(2);

      const loaded = await repository.get(pin);
      expect(loaded).toBeDefined();
      expect(loaded?.sessionId).toBe(1);
      expect(loaded?.quizId).toBe(10);
      expect(loaded?.hostId).toBe(42);
      expect(loaded?.totalQuestions).toBe(2);
    } finally {
      await repository.remove(pin);
      await repository.onModuleDestroy();
    }
  });

  it('save updates socketId->pin index and remove cleans up keys', async () => {
    const pin = `pin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const session: GameSessionRecord = {
      id: 2,
      pin,
      status: 'active',
      quizId: 11,
      hostId: 99,
      currentQuestion: 0,
    };

    const questions = [
      new Question(1, session.quizId, 'Q1', 'multiple', 'A', 'A', 'B', 'C', 'D', 10, 1000),
    ];

    const gameSessionRepository = {
      findByPin: async (p: string) => (p === pin ? session : null),
    };

    const questionRepository = {
      findByQuizId: async (quizId: number) => (quizId === session.quizId ? questions : []),
    };

    const repository = new ValkeySessionStateRepository(
      gameSessionRepository as never,
      questionRepository as never,
    );

    const socketId = `socket-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const state = await repository.getOrCreate(pin);
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

    const session: GameSessionRecord = {
      id: 3,
      pin,
      status: 'active',
      quizId: 12,
      hostId: 101,
      currentQuestion: 0,
    };

    const gameSessionRepository = {
      findByPin: async () => session,
    };

    const questionRepository = {
      findByQuizId: async () => [],
    };

    const repository = new ValkeySessionStateRepository(
      gameSessionRepository as never,
      questionRepository as never,
    );

    const url = (process.env.VALKEY_URL ?? '').trim();
    const client = createClient({ url });

    try {
      await client.connect();
      await client.set(`quiz:session-state:${pin}`, '{not-json');

      const loaded = await repository.get(pin);
      expect(loaded).toBeUndefined();

      const stillThere = await client.exists(`quiz:session-state:${pin}`);
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
