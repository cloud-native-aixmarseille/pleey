import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGameSessionUseCase } from '../create-game-session.use-case';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import type { QuizRepository } from '../../../../domain/quiz/repositories/quiz.repository.interface';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';
import { Quiz } from '../../../../domain/quiz/entities/quiz.entity';

describe('CreateGameSessionUseCase', () => {
  let useCase: CreateGameSessionUseCase;
  let mockGameSessionRepository: GameSessionRepository;
  let mockQuizRepository: QuizRepository;

  beforeEach(() => {
    mockGameSessionRepository = {
      create: vi.fn(),
      findByPin: vi.fn(),
      findById: vi.fn(),
      findActiveByAdminId: vi.fn(),
      updateStatus: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      deleteOldSessions: vi.fn(),
    };

    mockQuizRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByCreatedBy: vi.fn(),
    };

    useCase = new CreateGameSessionUseCase(
      mockGameSessionRepository,
      mockQuizRepository
    );
  });

  describe('execute', () => {
    it('should create a game session successfully when quiz exists and no active sessions', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, new Date(), []);
      const mockSession = new GameSession(1, 1, 100, '123456', 'waiting', 0, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await useCase.execute({ quizId: 1, adminId: 100 });

      expect(result.session).toBeDefined();
      expect(result.pin).toBeDefined();
      expect(result.pin).toHaveLength(6);
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGameSessionRepository.findActiveByAdminId).toHaveBeenCalledWith(100);
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(null);

      await expect(
        useCase.execute({ quizId: 999, adminId: 100 })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when admin has active sessions', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, new Date(), []);
      const activeSession = new GameSession(1, 1, 100, '123456', 'active', 2, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([activeSession]);

      await expect(
        useCase.execute({ quizId: 1, adminId: 100 })
      ).rejects.toThrow(BadRequestException);
      
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when admin has paused sessions', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, new Date(), []);
      const pausedSession = new GameSession(1, 1, 100, '123456', 'paused', 2, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([pausedSession]);

      await expect(
        useCase.execute({ quizId: 1, adminId: 100 })
      ).rejects.toThrow(BadRequestException);
      
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating new session when previous session is ended', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, new Date(), []);
      const mockSession = new GameSession(1, 1, 100, '123456', 'waiting', 0, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await useCase.execute({ quizId: 1, adminId: 100 });

      expect(result.session).toBeDefined();
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });
  });
});
