import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import type { ScoreRepository } from '../../../domain/game/ports/score.repository';
import { ScoreCalculatorService } from '../../../domain/game/services/score-calculator.service';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { QuestionAnswer } from '../../../domain/quiz/entities/question-answer';
import type { QuestionRepository } from '../../../domain/quiz/ports/question.repository';
import { createGameSessionFixture, createQuestionFixture } from '../../../test-utils/fixtures/unit';
import {
  createGameSessionRepositoryMock,
  createGameSessionStateServiceMock,
  createQuestionRepositoryMock,
  createScoreRepositoryMock,
} from '../../../test-utils/mock-factories';
import { SubmitAnswerUseCase } from './submit-answer.use-case';

describe('SubmitAnswerUseCase - Guest Player Support', () => {
  let useCase: SubmitAnswerUseCase;
  let mockGameSessionRepository: GameSessionRepository;
  let mockQuestionRepository: QuestionRepository;
  let mockScoreRepository: ScoreRepository;
  let mockGameSessionStateService: ReturnType<typeof createGameSessionStateServiceMock>;
  let scoreCalculatorService: ScoreCalculatorService;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    mockQuestionRepository = createQuestionRepositoryMock();
    mockScoreRepository = createScoreRepositoryMock();
    mockGameSessionStateService = createGameSessionStateServiceMock();

    scoreCalculatorService = new ScoreCalculatorService();

    useCase = new SubmitAnswerUseCase(
      mockGameSessionRepository,
      mockQuestionRepository,
      mockScoreRepository,
      mockGameSessionStateService as never,
      scoreCalculatorService,
    );
  });

  describe('Guest player answer submission', () => {
    it('should persist scores to database for guest players', async () => {
      // Setup
      const mockSession = createGameSessionFixture({
        id: 1,
        quizId: 100,
        hostId: 200,
        pin: 'ABC123',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 1,
      });
      const mockQuestion = createQuestionFixture({
        id: 1,
        quizId: 100,
        questionText: 'Test question',
        type: QuestionType.MULTIPLE,
        answers: [
          new QuestionAnswer(1, 1, 'Option A', 0, true),
          new QuestionAnswer(2, 1, 'Option B', 1, false),
          new QuestionAnswer(3, 1, 'Option C', 2, false),
          new QuestionAnswer(4, 1, 'Option D', 3, false),
        ],
        timeLimit: 20,
        points: 1000,
      });

      vi.spyOn(mockGameSessionRepository, 'findByPin').mockResolvedValue(mockSession);
      vi.spyOn(mockQuestionRepository, 'findByQuizId').mockResolvedValue([mockQuestion]);
      vi.spyOn(mockGameSessionStateService, 'get').mockResolvedValue({
        findPlayerByGuestId: () => ({ username: 'Guest Player' }),
      } as never);

      // Execute - guest player (no userId)
      const result = await useCase.execute({
        pin: 'ABC123',
        userId: undefined,
        guestId: 'guest-xyz',
        answerId: 1,
        timeLeft: 15,
      });

      // Verify
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
      expect(mockScoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 1,
          guestId: 'guest-xyz',
          guestUsername: 'Guest Player',
          questionId: 1,
          isCorrect: true,
        }),
      );
    });

    it('should persist scores to database for authenticated players', async () => {
      // Setup
      const mockSession = createGameSessionFixture({
        id: 1,
        quizId: 100,
        hostId: 200,
        pin: 'ABC123',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 1,
      });
      const mockQuestion = createQuestionFixture({
        id: 1,
        quizId: 100,
        questionText: 'Test question',
        type: QuestionType.MULTIPLE,
        answers: [
          new QuestionAnswer(1, 1, 'Option A', 0, true),
          new QuestionAnswer(2, 1, 'Option B', 1, false),
          new QuestionAnswer(3, 1, 'Option C', 2, false),
          new QuestionAnswer(4, 1, 'Option D', 3, false),
        ],
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
        answerId: 1,
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
        pin: 'ABC123',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 1,
      });
      const mockQuestion = createQuestionFixture({
        id: 1,
        quizId: 100,
        questionText: 'Test question',
        type: QuestionType.MULTIPLE,
        answers: [
          new QuestionAnswer(1, 1, 'Option A', 0, false),
          new QuestionAnswer(2, 1, 'Option B', 1, true),
          new QuestionAnswer(3, 1, 'Option C', 2, false),
          new QuestionAnswer(4, 1, 'Option D', 3, false),
        ],
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
        answerId: 1,
        timeLeft: 15,
      });

      const authResult = await useCase.execute({
        pin: 'ABC123',
        userId: 42,
        answerId: 1,
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
