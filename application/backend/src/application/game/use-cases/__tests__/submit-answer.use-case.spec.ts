import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubmitAnswerUseCase } from '../submit-answer.use-case';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import type { QuestionRepository } from '../../../../domain/quiz/repositories/question.repository.interface';
import type { ScoreRepository } from '../../../../domain/game/repositories/score.repository.interface';
import { ScoreCalculatorService } from '../../../../domain/game/services/score-calculator.service';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';
import { Question } from '../../../../domain/quiz/entities/question.entity';

describe('SubmitAnswerUseCase - Guest Player Support', () => {
  let useCase: SubmitAnswerUseCase;
  let mockGameSessionRepository: GameSessionRepository;
  let mockQuestionRepository: QuestionRepository;
  let mockScoreRepository: ScoreRepository;
  let scoreCalculatorService: ScoreCalculatorService;

  beforeEach(() => {
    // Mock repositories
    mockGameSessionRepository = {
      findByPin: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      findById: vi.fn(),
      findActiveByAdminId: vi.fn(),
      findActiveByQuizId: vi.fn(),
      findByQuizId: vi.fn(),
      countActiveByQuizId: vi.fn(),
      deleteOldSessions: vi.fn(),
      findByOrganization: vi.fn(),
    };

    mockQuestionRepository = {
      findByQuizId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };

    mockScoreRepository = {
      create: vi.fn(),
      findBySessionId: vi.fn(),
      findBySessionAndUser: vi.fn(),
      calculateTotalScore: vi.fn(),
      getLeaderboard: vi.fn(),
    };

    scoreCalculatorService = new ScoreCalculatorService();

    useCase = new SubmitAnswerUseCase(
      mockGameSessionRepository,
      mockQuestionRepository,
      mockScoreRepository,
      scoreCalculatorService
    );
  });

  describe('Guest player answer submission', () => {
    it('should not persist scores to database for guest players', async () => {
      // Setup
      const mockSession = new GameSession(1, 100, 200, 1, 'ABC123', 'active', 0, new Date());
      const mockQuestion = new Question(
        1,
        100,
        'Test question',
        'multiple',
        'A',
        'Option A',
        'Option B',
        'Option C',
        'Option D',
        20,
        1000
      );

      vi.spyOn(mockGameSessionRepository, 'findByPin').mockResolvedValue(mockSession);
      vi.spyOn(mockQuestionRepository, 'findByQuizId').mockResolvedValue([mockQuestion]);

      // Execute - guest player (no userId)
      const result = await useCase.execute({
        pin: 'ABC123',
        userId: undefined,
        guestId: 'guest-xyz',
        answer: 'A',
        timeLeft: 15,
      });

      // Verify
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
      expect(mockScoreRepository.create).not.toHaveBeenCalled(); // Should NOT persist
    });

    it('should persist scores to database for authenticated players', async () => {
      // Setup
      const mockSession = new GameSession(1, 100, 200, 1, 'ABC123', 'active', 0, new Date());
      const mockQuestion = new Question(
        1,
        100,
        'Test question',
        'multiple',
        'A',
        'Option A',
        'Option B',
        'Option C',
        'Option D',
        20,
        1000
      );

      vi.spyOn(mockGameSessionRepository, 'findByPin').mockResolvedValue(mockSession);
      vi.spyOn(mockQuestionRepository, 'findByQuizId').mockResolvedValue([mockQuestion]);

      // Execute - authenticated player (with userId)
      const result = await useCase.execute({
        pin: 'ABC123',
        userId: 42,
        guestId: undefined,
        answer: 'A',
        timeLeft: 15,
      });

      // Verify
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
      expect(mockScoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 1,
          userId: 42,
          questionId: 1,
          isCorrect: true,
        })
      );
    });

    it('should calculate correct scores for both guest and authenticated players', async () => {
      // Setup
      const mockSession = new GameSession(1, 100, 200, 1, 'ABC123', 'active', 0, new Date());
      const mockQuestion = new Question(
        1,
        100,
        'Test question',
        'multiple',
        'B',
        'Option A',
        'Option B',
        'Option C',
        'Option D',
        20,
        1000
      );

      vi.spyOn(mockGameSessionRepository, 'findByPin').mockResolvedValue(mockSession);
      vi.spyOn(mockQuestionRepository, 'findByQuizId').mockResolvedValue([mockQuestion]);

      // Execute - both should get same score for wrong answer
      const guestResult = await useCase.execute({
        pin: 'ABC123',
        userId: undefined,
        guestId: 'guest-xyz',
        answer: 'A',
        timeLeft: 15,
      });

      const authResult = await useCase.execute({
        pin: 'ABC123',
        userId: 42,
        answer: 'A',
        timeLeft: 15,
      });

      // Verify - both get 0 points for wrong answer
      expect(guestResult.isCorrect).toBe(false);
      expect(authResult.isCorrect).toBe(false);
      expect(guestResult.points).toBe(0);
      expect(authResult.points).toBe(0);
    });
  });
});
