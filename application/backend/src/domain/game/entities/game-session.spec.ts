import { describe, expect, it } from 'vitest';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameSessionStatus } from '../enums/game-session-status.enum';

describe('GameSession', () => {
  describe('constructor', () => {
    it('should create a game session with all properties', () => {
      const now = new Date();
      const session = createGameSessionFixture({
        id: 1,
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: now,
      });

      expect(session.id).toBe(1);
      expect(session.quizId).toBe(10);
      expect(session.hostId).toBe(100);
      expect(session.pin).toBe('123456');
      expect(session.status).toBe(GameSessionStatus.WAITING);
      expect(session.currentQuestionId).toBe(101);
      expect(session.createdAt).toBe(now);
    });
  });

  describe('start', () => {
    it('should start game from waiting status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: null,
        createdAt: new Date(),
      });

      session.start();
      expect(session.status).toBe(GameSessionStatus.ACTIVE);
    });

    it('should throw error when starting from non-waiting status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(() => session.start()).toThrow(GameErrorCode.CAN_ONLY_START_WAITING_GAME);
    });

    it('should throw error when starting ended game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(() => session.start()).toThrow(GameErrorCode.CAN_ONLY_START_WAITING_GAME);
    });
  });

  describe('pause', () => {
    it('should pause game from active status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 2,
        createdAt: new Date(),
      });

      session.pause();
      expect(session.status).toBe(GameSessionStatus.PAUSED);
    });

    it('should throw error when pausing from non-active status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: null,
        createdAt: new Date(),
      });

      expect(() => session.pause()).toThrow('CAN_ONLY_PAUSE_ACTIVE_GAME');
    });

    it('should throw error when pausing ended game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 5,
        createdAt: new Date(),
      });

      expect(() => session.pause()).toThrow('CAN_ONLY_PAUSE_ACTIVE_GAME');
    });
  });

  describe('resume', () => {
    it('should resume game from paused status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.PAUSED,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      session.resume();
      expect(session.status).toBe(GameSessionStatus.ACTIVE);
    });

    it('should throw error when resuming from non-paused status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(() => session.resume()).toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
    });

    it('should throw error when resuming ended game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 5,
        createdAt: new Date(),
      });

      expect(() => session.resume()).toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
    });
  });

  describe('end', () => {
    it('should end game from any status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      session.end();
      expect(session.status).toBe(GameSessionStatus.ENDED);
    });

    it('should end game from waiting status', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      session.end();
      expect(session.status).toBe(GameSessionStatus.ENDED);
    });

    it('should end already ended game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      session.end();
      expect(session.status).toBe(GameSessionStatus.ENDED);
    });
  });

  describe('nextQuestion', () => {
    it('should increment current question in active game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      session.nextQuestion(102);
      expect(session.currentQuestionId).toBe(102);

      session.nextQuestion(103);
      expect(session.currentQuestionId).toBe(103);
    });

    it('should throw error when not in active game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(() => session.nextQuestion(102)).toThrow(
        GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_QUESTION_ACTIVE_GAME,
      );
    });

    it('should throw error when game is ended', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 5,
        createdAt: new Date(),
      });

      expect(() => session.nextQuestion(102)).toThrow(
        GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_QUESTION_ACTIVE_GAME,
      );
    });
  });

  describe('isActive', () => {
    it('should return true for active game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 1,
        createdAt: new Date(),
      });

      expect(session.isActive()).toBe(true);
    });

    it('should return false for waiting game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(session.isActive()).toBe(false);
    });

    it('should return false for ended game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 10,
        createdAt: new Date(),
      });

      expect(session.isActive()).toBe(false);
    });
  });

  describe('isWaiting', () => {
    it('should return true for waiting game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(session.isWaiting()).toBe(true);
    });

    it('should return false for active game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 1,
        createdAt: new Date(),
      });

      expect(session.isWaiting()).toBe(false);
    });

    it('should return false for ended game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 10,
        createdAt: new Date(),
      });

      expect(session.isWaiting()).toBe(false);
    });
  });

  describe('isPaused', () => {
    it('should return true for paused game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.PAUSED,
        currentQuestionId: 2,
        createdAt: new Date(),
      });

      expect(session.isPaused()).toBe(true);
    });

    it('should return false for active game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 1,
        createdAt: new Date(),
      });

      expect(session.isPaused()).toBe(false);
    });

    it('should return false for waiting game', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(session.isPaused()).toBe(false);
    });
  });

  describe('game lifecycle', () => {
    it('should follow proper lifecycle: waiting -> active -> ended', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: 101,
        createdAt: new Date(),
      });

      expect(session.isWaiting()).toBe(true);
      expect(session.isActive()).toBe(false);

      session.start();
      expect(session.isWaiting()).toBe(false);
      expect(session.isActive()).toBe(true);

      session.nextQuestion(101);
      expect(session.currentQuestionId).toBe(101);

      session.end();
      expect(session.isActive()).toBe(false);
      expect(session.isWaiting()).toBe(false);
      expect(session.status).toBe(GameSessionStatus.ENDED);
    });

    it('should allow pause and resume lifecycle: waiting -> active -> paused -> active -> ended', () => {
      const session = createGameSessionFixture({
        quizId: 10,
        hostId: 100,
        pin: '123456',
        status: GameSessionStatus.WAITING,
        currentQuestionId: null,
        createdAt: new Date(),
      });

      expect(session.isWaiting()).toBe(true);

      session.start();
      expect(session.isActive()).toBe(true);

      session.nextQuestion(101);
      expect(session.currentQuestionId).toBe(101);

      session.pause();
      expect(session.isPaused()).toBe(true);
      expect(session.isActive()).toBe(false);

      session.resume();
      expect(session.isActive()).toBe(true);
      expect(session.isPaused()).toBe(false);

      session.end();
      expect(session.status).toBe(GameSessionStatus.ENDED);
    });
  });
});
