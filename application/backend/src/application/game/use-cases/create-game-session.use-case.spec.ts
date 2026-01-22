import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use.error';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import {
  createGameSessionFixture,
  createOrganizationMemberFixture,
  createQuizFixture,
} from '../../../test-utils/fixtures/unit';
import {
  createGameSessionRepositoryMock,
  createOrganizationMemberRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import { CreateGameSessionUseCase } from './create-game-session.use-case';

describe('CreateGameSessionUseCase', () => {
  let useCase: CreateGameSessionUseCase;
  let mockGameSessionRepository: GameSessionRepository;
  let mockQuizRepository: QuizRepository;
  let mockMemberRepository: OrganizationMemberRepository;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    mockMemberRepository = createOrganizationMemberRepositoryMock();
    mockQuizRepository = createQuizRepositoryMock();

    useCase = new CreateGameSessionUseCase(
      mockGameSessionRepository,
      mockQuizRepository,
      mockMemberRepository,
    );
  });

  describe('execute', () => {
    it('should create a game session successfully when quiz exists and no active sessions', async () => {
      const mockQuiz = createQuizFixture();
      const mockSession = createGameSessionFixture({ hostId: 100 });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await useCase.execute({ quizId: 1, hostId: 100 });

      expect(result.session).toBeDefined();
      expect(result.pin).toBeDefined();
      expect(result.pin).toHaveLength(6);
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGameSessionRepository.findActiveByQuizId).toHaveBeenCalledWith(1);
      expect(mockGameSessionRepository.findActiveByHostId).toHaveBeenCalledWith(100);
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(null);

      await expect(useCase.execute({ quizId: 999, hostId: 100 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when admin has other active sessions', async () => {
      const mockQuiz = createQuizFixture();
      const activeSession = createGameSessionFixture({
        quizId: 2,
        hostId: 100,
        status: GameSessionStatus.ACTIVE,
      });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue([activeSession]);

      await expect(useCase.execute({ quizId: 1, hostId: 100 })).rejects.toThrow(
        BadRequestException,
      );

      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when quiz already has an active session', async () => {
      const mockQuiz = createQuizFixture();
      const quizSession = createGameSessionFixture({
        quizId: 1,
        hostId: 999,
        status: GameSessionStatus.ACTIVE,
      });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(quizSession);

      await expect(useCase.execute({ quizId: 1, hostId: 100 })).rejects.toThrow(
        BadRequestException,
      );

      expect(mockGameSessionRepository.findActiveByHostId).not.toHaveBeenCalled();
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when admin has paused sessions', async () => {
      const mockQuiz = createQuizFixture();
      const pausedSession = createGameSessionFixture({
        quizId: 2,
        hostId: 100,
        status: GameSessionStatus.PAUSED,
      });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue([pausedSession]);

      await expect(useCase.execute({ quizId: 1, hostId: 100 })).rejects.toThrow(
        BadRequestException,
      );

      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should return existing session when admin already has active session for quiz', async () => {
      const mockQuiz = createQuizFixture();
      const existingSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.ACTIVE,
      });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(existingSession);

      const result = await useCase.execute({ quizId: 1, hostId: 100 });

      expect(result.session).toBe(existingSession);
      expect(result.pin).toBe(existingSession.pin);
      expect(mockGameSessionRepository.findActiveByHostId).not.toHaveBeenCalled();
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating new session when previous session is ended', async () => {
      const mockQuiz = createQuizFixture();
      const mockSession = createGameSessionFixture({ hostId: 100 });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await useCase.execute({ quizId: 1, hostId: 100 });

      expect(result.session).toBeDefined();
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });

    it('should retry when generated PIN is already in use', async () => {
      const mockQuiz = createQuizFixture();
      const mockSession = createGameSessionFixture({ hostId: 100 });

      vi.spyOn(mockQuizRepository, 'findById').mockResolvedValue(mockQuiz);
      vi.spyOn(mockMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(
        createOrganizationMemberFixture({
          userId: 100,
        }),
      );
      vi.spyOn(mockGameSessionRepository, 'findActiveByQuizId').mockResolvedValue(null);
      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue([]);
      vi.spyOn(mockGameSessionRepository, 'create')
        .mockRejectedValueOnce(new PinAlreadyInUseError())
        .mockResolvedValueOnce(mockSession);

      const result = await useCase.execute({ quizId: 1, hostId: 100 });

      expect(result.session).toBeDefined();
      expect(result.pin).toHaveLength(6);
      expect(mockGameSessionRepository.create).toHaveBeenCalledTimes(2);
    });
  });
});
