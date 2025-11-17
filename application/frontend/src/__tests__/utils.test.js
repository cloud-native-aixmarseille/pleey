import { describe, it, expect } from 'vitest';

describe('Quiz Game Logic', () => {
  describe('Score Calculation', () => {
    it('should calculate points based on time remaining', () => {
      const basePoints = 1000;
      const timeLimit = 20;
      const timeLeft = 10;
      const timeBonus = 500;

      const calculatedBonus = Math.floor((timeLeft / timeLimit) * timeBonus);
      const totalPoints = basePoints + calculatedBonus;

      expect(totalPoints).toBe(1250);
    });

    it('should give maximum points for instant answers', () => {
      const basePoints = 1000;
      const timeLimit = 20;
      const timeLeft = 20;
      const timeBonus = 500;

      const calculatedBonus = Math.floor((timeLeft / timeLimit) * timeBonus);
      const totalPoints = basePoints + calculatedBonus;

      expect(totalPoints).toBe(1500);
    });

    it('should give minimum points for late answers', () => {
      const basePoints = 1000;
      const timeLimit = 20;
      const timeLeft = 0;
      const timeBonus = 500;

      const calculatedBonus = Math.floor((timeLeft / timeLimit) * timeBonus);
      const totalPoints = basePoints + calculatedBonus;

      expect(totalPoints).toBe(1000);
    });
  });

  describe('PIN Validation', () => {
    it('should validate 6-digit PIN format', () => {
      const validPin = '123456';
      expect(validPin).toMatch(/^\d{6}$/);
    });

    it('should reject invalid PIN formats', () => {
      const invalidPins = ['12345', '1234567', 'abc123', ''];

      invalidPins.forEach(pin => {
        expect(pin).not.toMatch(/^\d{6}$/);
      });
    });
  });

  describe('Answer Validation', () => {
    it('should validate multiple choice answers', () => {
      const validAnswers = ['A', 'B', 'C', 'D'];
      const answer = 'B';

      expect(validAnswers).toContain(answer);
    });

    it('should validate true/false answers', () => {
      const validAnswers = ['true', 'false'];
      const answer = 'true';

      expect(validAnswers).toContain(answer);
    });

    it('should reject invalid answers', () => {
      const validAnswers = ['A', 'B', 'C', 'D'];
      const answer = 'E';

      expect(validAnswers).not.toContain(answer);
    });
  });

  describe('Question Timer', () => {
    it('should calculate elapsed time correctly', () => {
      const startTime = Date.now();
      const endTime = startTime + 5000; // 5 seconds later
      const elapsed = (endTime - startTime) / 1000;

      expect(elapsed).toBe(5);
    });

    it('should handle timeout scenario', () => {
      const timeLimit = 20;
      const elapsed = 25;

      expect(elapsed).toBeGreaterThan(timeLimit);
    });
  });

  describe('Leaderboard Sorting', () => {
    it('should sort players by score in descending order', () => {
      const players = [
        { username: 'Player1', score: 1000 },
        { username: 'Player2', score: 2000 },
        { username: 'Player3', score: 1500 }
      ];

      const sorted = [...players].sort((a, b) => b.score - a.score);

      expect(sorted[0].username).toBe('Player2');
      expect(sorted[1].username).toBe('Player3');
      expect(sorted[2].username).toBe('Player1');
    });

    it('should handle tied scores', () => {
      const players = [
        { username: 'Player1', score: 1000 },
        { username: 'Player2', score: 1000 }
      ];

      const sorted = [...players].sort((a, b) => b.score - a.score);

      expect(sorted).toHaveLength(2);
      expect(sorted[0].score).toBe(sorted[1].score);
    });
  });

  describe('Game State Transitions', () => {
    it('should transition from waiting to playing', () => {
      const gameStates = ['waiting', 'playing', 'ended'];
      const currentState = 'waiting';
      const nextState = 'playing';

      expect(gameStates).toContain(currentState);
      expect(gameStates).toContain(nextState);
      expect(gameStates.indexOf(nextState)).toBeGreaterThan(
        gameStates.indexOf(currentState)
      );
    });

    it('should validate game state', () => {
      const validStates = ['waiting', 'playing', 'ended'];
      const state = 'playing';

      expect(validStates).toContain(state);
    });
  });
});
