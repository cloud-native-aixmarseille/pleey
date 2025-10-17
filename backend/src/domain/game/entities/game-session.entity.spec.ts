import { describe, it, expect } from 'vitest';
import { GameSession } from './game-session.entity';

describe('GameSession Entity', () => {
  describe('constructor', () => {
    it('should create a game session with all properties', () => {
      const now = new Date();
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        now,
      );

      expect(session.id).toBe(1);
      expect(session.quizId).toBe(10);
      expect(session.pin).toBe('123456');
      expect(session.status).toBe('waiting');
      expect(session.currentQuestion).toBe(0);
      expect(session.createdAt).toBe(now);
    });
  });

  describe('start', () => {
    it('should start game from waiting status', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        new Date(),
      );

      session.start();
      expect(session.status).toBe('active');
    });

    it('should throw error when starting from non-waiting status', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'active',
        0,
        new Date(),
      );

      expect(() => session.start()).toThrow('Game can only be started from waiting status');
    });

    it('should throw error when starting ended game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'ended',
        0,
        new Date(),
      );

      expect(() => session.start()).toThrow('Game can only be started from waiting status');
    });
  });

  describe('end', () => {
    it('should end game from any status', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'active',
        5,
        new Date(),
      );

      session.end();
      expect(session.status).toBe('ended');
    });

    it('should end game from waiting status', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        new Date(),
      );

      session.end();
      expect(session.status).toBe('ended');
    });

    it('should end already ended game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'ended',
        10,
        new Date(),
      );

      session.end();
      expect(session.status).toBe('ended');
    });
  });

  describe('nextQuestion', () => {
    it('should increment current question in active game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'active',
        0,
        new Date(),
      );

      session.nextQuestion();
      expect(session.currentQuestion).toBe(1);

      session.nextQuestion();
      expect(session.currentQuestion).toBe(2);
    });

    it('should throw error when not in active game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        new Date(),
      );

      expect(() => session.nextQuestion()).toThrow('Can only move to next question in active game');
    });

    it('should throw error when game is ended', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'ended',
        5,
        new Date(),
      );

      expect(() => session.nextQuestion()).toThrow('Can only move to next question in active game');
    });
  });

  describe('isActive', () => {
    it('should return true for active game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'active',
        1,
        new Date(),
      );

      expect(session.isActive()).toBe(true);
    });

    it('should return false for waiting game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        new Date(),
      );

      expect(session.isActive()).toBe(false);
    });

    it('should return false for ended game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'ended',
        10,
        new Date(),
      );

      expect(session.isActive()).toBe(false);
    });
  });

  describe('isWaiting', () => {
    it('should return true for waiting game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        new Date(),
      );

      expect(session.isWaiting()).toBe(true);
    });

    it('should return false for active game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'active',
        1,
        new Date(),
      );

      expect(session.isWaiting()).toBe(false);
    });

    it('should return false for ended game', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'ended',
        10,
        new Date(),
      );

      expect(session.isWaiting()).toBe(false);
    });
  });

  describe('game lifecycle', () => {
    it('should follow proper lifecycle: waiting -> active -> ended', () => {
      const session = new GameSession(
        1,
        10,
        '123456',
        'waiting',
        0,
        new Date(),
      );

      expect(session.isWaiting()).toBe(true);
      expect(session.isActive()).toBe(false);

      session.start();
      expect(session.isWaiting()).toBe(false);
      expect(session.isActive()).toBe(true);

      session.nextQuestion();
      expect(session.currentQuestion).toBe(1);

      session.end();
      expect(session.isActive()).toBe(false);
      expect(session.isWaiting()).toBe(false);
      expect(session.status).toBe('ended');
    });
  });
});
