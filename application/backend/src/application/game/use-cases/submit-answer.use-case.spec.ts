import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import type { ScoreRepository } from '../../../domain/game/repositories/score.repository.interface';
import { ScoreCalculatorService } from '../../../domain/game/services/score-calculator.service';
import type { QuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';
import { createGameSessionFixture, createQuestionFixture } from '../../../test-utils/fixtures';
import {
  createGameSessionRepositoryMock,
  createQuestionRepositoryMock,
  createScoreRepositoryMock,
} from '../../../test-utils/mock-factories';
import { SubmitAnswerUseCase } from './submit-answer.use-case';

describe('SubmitAnswerUseCase - Guest Player Support', () => {
  let useCase: SubmitAnswerUseCase;
  let mockGameSessionRepository: GameSessionRepository;
  let mockQuestionRepository: QuestionRepository;
  let mockScoreRepository: ScoreRepository;
  let scoreCalculatorService: ScoreCalculatorService;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    mockQuestionRepository = createQuestionRepositoryMock();
    mockScoreRepository = createScoreRepositoryMock();

    scoreCalculatorService = new ScoreCalculatorService();

    useCase = new SubmitAnswerUseCase(
      mockGameSessionRepository,
      mockQuestionRepository,
      mockScoreRepository,
      scoreCalculatorService,
    );
  });

  describe('Guest player answer submission', () => {
    it('should not persist scores to database for guest players', async () => {
      // Setup
      const mockSession = createGameSessionFixture({
        id: 1,
        quizId: 100,
        hostId: 200,
        organizationId: 1,
        pin: 'ABC123',
        status: 'active',
        currentQuestion: 0,
      });
      const mockQuestion = createQuestionFixture({
        id: 1,
        quizId: 100,
        questionText: 'Test question',
        type: 'multiple',
        correctAnswer: 'A',
        optionA: 'Option A',
        optionB: 'Option B',
        optionC: 'Option C',
        optionD: 'Option D',
        timeLimit: 20,
        points: 1000,
      });

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
      const mockSession = createGameSessionFixture({
        id: 1,
        quizId: 100,
        hostId: 200,
        organizationId: 1,
        pin: 'ABC123',
        status: 'active',
        currentQuestion: 0,
      });
      const mockQuestion = createQuestionFixture({
        id: 1,
        quizId: 100,
        questionText: 'Test question',
        type: 'multiple',
        correctAnswer: 'A',
        optionA: 'Option A',
        optionB: 'Option B',
        optionC: 'Option C',
        optionD: 'Option D',
        timeLimit: 20,
        points: 1000,
      });

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
        }),
      );
    });

    it('should calculate correct scores for both guest and authenticated players', async () => {
      // Setup
      const mockSession = createGameSessionFixture({
        id: 1,
        quizId: 100,
        hostId: 200,
        organizationId: 1,
        pin: 'ABC123',
        status: 'active',
        currentQuestion: 0,
      });
      const mockQuestion = createQuestionFixture({
        id: 1,
        quizId: 100,
        questionText: 'Test question',
        type: 'multiple',
        correctAnswer: 'B',
        optionA: 'Option A',
        optionB: 'Option B',
        optionC: 'Option C',
        optionD: 'Option D',
        timeLimit: 20,
        points: 1000,
      });

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
