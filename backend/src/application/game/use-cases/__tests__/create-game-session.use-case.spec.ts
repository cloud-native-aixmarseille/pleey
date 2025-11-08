import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGameSessionUseCase } from '../create-game-session.use-case';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import type { QuizRepository } from '../../../../domain/quiz/repositories/quiz.repository.interface';
import type { OrganizationMemberRepository } from '../../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMember } from '../../../../domain/organization/entities/organization-member.entity';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';
import { Quiz } from '../../../../domain/quiz/entities/quiz.entity';

describe('CreateGameSessionUseCase', () => {
  let useCase: CreateGameSessionUseCase;
  let mockGameSessionRepository: GameSessionRepository;
  let mockQuizRepository: QuizRepository;
  let mockMemberRepository: OrganizationMemberRepository;

  beforeEach(() => {
    mockGameSessionRepository = {
      create: vi.fn(),
      findByPin: vi.fn(),
      findById: vi.fn(),
      findActiveByAdminId: vi.fn(),
      findActiveByQuizId: vi.fn(),
      findByQuizId: vi.fn(),
      findByOrganization: vi.fn(),
      updateStatus: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      countActiveByQuizId: vi.fn(),
      deleteOldSessions: vi.fn(),
    };

    mockMemberRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOrganizationAndUser: vi.fn(),
      findByOrganization: vi.fn(),
      findByUser: vi.fn(),
      updateRole: vi.fn(),
      delete: vi.fn(),
    };

    mockQuizRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByOrganization: vi.fn(),
      findByCreator: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new CreateGameSessionUseCase(
      mockGameSessionRepository,
      mockQuizRepository,
      mockMemberRepository
    );
  });

  describe('execute', () => {
    it('should create a game session successfully when quiz exists and no active sessions', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, 1, new Date());
      const mockSession = new GameSession(1, 1, 100, 1, '123456', 'waiting', 0, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        new OrganizationMember(1, 1, 100, OrganizationRole.OWNER, new Date())
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await useCase.execute({ quizId: 1, adminId: 100 });

      expect(result.session).toBeDefined();
      expect(result.pin).toBeDefined();
      expect(result.pin).toHaveLength(6);
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGameSessionRepository.findActiveByQuizId).toHaveBeenCalledWith(1);
      expect(mockGameSessionRepository.findActiveByAdminId).toHaveBeenCalledWith(100);
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(null);

      await expect(
        useCase.execute({ quizId: 999, adminId: 100 })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when admin has other active sessions', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, 1, new Date());
      const activeSession = new GameSession(2, 2, 100, 1, '654321', 'active', 2, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        new OrganizationMember(1, 1, 100, OrganizationRole.OWNER, new Date())
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([activeSession]);

      await expect(
        useCase.execute({ quizId: 1, adminId: 100 })
      ).rejects.toThrow(BadRequestException);

      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when quiz already has an active session', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, 1, new Date());
      const quizSession = new GameSession(5, 1, 999, 1, '999999', 'active', 1, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        new OrganizationMember(1, 1, 100, OrganizationRole.OWNER, new Date())
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(quizSession);

      await expect(
        useCase.execute({ quizId: 1, adminId: 100 })
      ).rejects.toThrow(BadRequestException);

      expect(mockGameSessionRepository.findActiveByAdminId).not.toHaveBeenCalled();
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when admin has paused sessions', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, 1, new Date());
      const pausedSession = new GameSession(3, 2, 100, 1, '123456', 'paused', 2, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        new OrganizationMember(1, 1, 100, OrganizationRole.OWNER, new Date())
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([pausedSession]);

      await expect(
        useCase.execute({ quizId: 1, adminId: 100 })
      ).rejects.toThrow(BadRequestException);

      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should return existing session when admin already has active session for quiz', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, 1, new Date());
      const existingSession = new GameSession(5, 1, 100, 1, '999999', 'active', 1, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        new OrganizationMember(1, 1, 100, OrganizationRole.OWNER, new Date())
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(existingSession);

      const result = await useCase.execute({ quizId: 1, adminId: 100 });

      expect(result.session).toBe(existingSession);
      expect(result.pin).toBe(existingSession.pin);
      expect(mockGameSessionRepository.findActiveByAdminId).not.toHaveBeenCalled();
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating new session when previous session is ended', async () => {
      const mockQuiz = new Quiz(1, 'Test Quiz', 'Description', 100, 1, new Date());
      const mockSession = new GameSession(1, 1, 100, 1, '123456', 'waiting', 0, new Date());

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        new OrganizationMember(1, 1, 100, OrganizationRole.OWNER, new Date())
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await useCase.execute({ quizId: 1, adminId: 100 });

      expect(result.session).toBeDefined();
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });
  });
});
