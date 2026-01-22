import { createClient } from 'redis';
import { describe, expect, it } from 'vitest';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionId } from '../../../domain/game/entities/game-session';
import { GameSession, type GameSessionPin } from '../../../domain/game/entities/game-session';
import { PlayerState } from '../../../domain/game/entities/player-state';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import { Question, type QuestionId, QuestionType } from '../../../domain/quiz/entities/question';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';
import { QuestionAnswer } from '../../../domain/quiz/entities/question-answer';
import type { QuizId } from '../../../domain/quiz/entities/quiz';
import type { QuestionRepository } from '../../../domain/quiz/ports/question.repository';
import { ValkeySessionStateRepository } from './valkey-session-state.repository';

const createGameSession = (params: {
  id: GameSessionId;
  pin: GameSessionPin;
  status: GameSessionStatus;
  quizId: QuizId;
  hostId: UserId;
  currentQuestionId: number | null;
}): GameSession =>
  new GameSession(
    params.id,
    params.quizId,
    params.hostId,
    params.pin,
    params.status,
    params.currentQuestionId,
    new Date(),
  );

const hasValkey = Boolean((process.env.VALKEY_URL ?? '').trim());

const describeIfValkey = hasValkey ? describe : describe.skip;

const createRepository = (): ValkeySessionStateRepository => new ValkeySessionStateRepository();

describeIfValkey('ValkeySessionStateRepository (integration)', () => {
  it('getOrCreate persists, and get rehydrates state', async () => {
    const pin = `pin-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const session = createGameSession({
      id: 1 as GameSessionId,
      pin,
      status: GameSessionStatus.ACTIVE,
      quizId: 10 as QuizId,
      hostId: 42 as UserId,
      currentQuestionId: 1,
    });

    const questions = [
      new Question(
        1 as QuestionId,
        session.quizId,
        1,
        'Q1',
        QuestionType.MULTIPLE,
        [
          new QuestionAnswer(11 as QuestionAnswerId, 1 as QuestionId, 'A', 0, true),
          new QuestionAnswer(12 as QuestionAnswerId, 1 as QuestionId, 'B', 1, false),
          new QuestionAnswer(13 as QuestionAnswerId, 1 as QuestionId, 'C', 2, false),
          new QuestionAnswer(14 as QuestionAnswerId, 1 as QuestionId, 'D', 3, false),
        ],
        10,
        1000,
      ),
      new Question(
        2 as QuestionId,
        session.quizId,
        2,
        'Q2',
        QuestionType.MULTIPLE,
        [
          new QuestionAnswer(21 as QuestionAnswerId, 2 as QuestionId, 'A', 0, false),
          new QuestionAnswer(22 as QuestionAnswerId, 2 as QuestionId, 'B', 1, true),
          new QuestionAnswer(23 as QuestionAnswerId, 2 as QuestionId, 'C', 2, false),
          new QuestionAnswer(24 as QuestionAnswerId, 2 as QuestionId, 'D', 3, false),
        ],
        10,
        1000,
      ),
    ];

    const gameSessionRepository = {
      findByPin: async (p: string) => (p === pin ? session : null),
    } as GameSessionRepository;

    const questionRepository = {
      findByQuizId: async (quizId: QuizId) => (quizId === session.quizId ? questions : []),
    } as QuestionRepository;

    const repository = createRepository();
    const sessionStateService = new GameSessionStateService(
      repository,
      gameSessionRepository,
      questionRepository,
    );

    try {
      const created = await sessionStateService.getOrCreate(pin);
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

    const session = createGameSession({
      id: 2 as GameSessionId,
      pin,
      status: GameSessionStatus.ACTIVE,
      quizId: 11 as QuizId,
      hostId: 99 as UserId,
      currentQuestionId: 1,
    });

    const questions = [
      new Question(
        1 as QuestionId,
        session.quizId,
        1,
        'Q1',
        QuestionType.MULTIPLE,
        [
          new QuestionAnswer(31 as QuestionAnswerId, 1 as QuestionId, 'A', 0, true),
          new QuestionAnswer(32 as QuestionAnswerId, 1 as QuestionId, 'B', 1, false),
          new QuestionAnswer(33 as QuestionAnswerId, 1 as QuestionId, 'C', 2, false),
          new QuestionAnswer(34 as QuestionAnswerId, 1 as QuestionId, 'D', 3, false),
        ],
        10,
        1000,
      ),
    ];

    const gameSessionRepository = {
      findByPin: async (p: string) => (p === pin ? session : null),
    } as GameSessionRepository;

    const questionRepository = {
      findByQuizId: async (quizId: QuizId) => (quizId === session.quizId ? questions : []),
    } as QuestionRepository;

    const repository = createRepository();
    const sessionStateService = new GameSessionStateService(
      repository,
      gameSessionRepository,
      questionRepository,
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
