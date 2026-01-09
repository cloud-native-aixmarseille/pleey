import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import {
  createGameSessionFixture,
  createOrganizationMemberFixture,
  createQuizFixture,
} from '../../../test-utils/fixtures';
import { GetQuizSessionsUseCase } from './get-quiz-sessions.use-case';

describe('GetQuizSessionsUseCase', () => {
  let useCase: GetQuizSessionsUseCase;
  let gameSessionRepository: GameSessionRepository;
  let quizRepository: QuizRepository;
  let memberRepository: OrganizationMemberRepository;

  beforeEach(() => {
    gameSessionRepository = {
      create: vi.fn(),
      findByPin: vi.fn(),
      findById: vi.fn(),
      findActiveByHostId: vi.fn(),
      findActiveByQuizId: vi.fn(),
      findByQuizId: vi.fn(),
      findByOrganization: vi.fn(),
      updateStatus: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      countActiveByQuizId: vi.fn(),
      deleteOldSessions: vi.fn(),
    };

    quizRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByOrganization: vi.fn(),
      findByCreator: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    memberRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOrganizationAndUser: vi.fn(),
      findByOrganization: vi.fn(),
      findByUser: vi.fn(),
      updateRole: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new GetQuizSessionsUseCase(gameSessionRepository, quizRepository, memberRepository);
  });

  it('returns sessions when quiz exists and requester is a member', async () => {
    const quiz = createQuizFixture({
      id: 1,
      title: 'Arcade Trivia',
      description: null,
      createdById: 42,
      organizationId: 99,
    });
    const member = createOrganizationMemberFixture({
      id: 1,
      organizationId: 99,
      userId: 7,
      role: OrganizationRole.OWNER,
    });
    const sessions = [
      createGameSessionFixture({
        id: 10,
        quizId: 1,
        hostId: 7,
        organizationId: 99,
        pin: '123456',
        status: 'active',
        currentQuestion: 2,
      }),
      createGameSessionFixture({
        id: 11,
        quizId: 1,
        hostId: 7,
        organizationId: 99,
        pin: '654321',
        status: 'completed',
        currentQuestion: 8,
      }),
    ];

    vi.spyOn(quizRepository, 'findById').mockResolvedValue(quiz);
    vi.spyOn(memberRepository, 'findByOrganizationAndUser').mockResolvedValue(member);
    vi.spyOn(gameSessionRepository, 'findByQuizId').mockResolvedValue(sessions);

    const result = await useCase.execute(quiz.id, member.userId);

    expect(result).toEqual(sessions);
    expect(gameSessionRepository.findByQuizId).toHaveBeenCalledWith(quiz.id);
  });

  it('throws NotFoundException when quiz does not exist', async () => {
    vi.spyOn(quizRepository, 'findById').mockResolvedValue(null);

    await expect(useCase.execute(999, 1)).rejects.toThrow(NotFoundException);
    expect(gameSessionRepository.findByQuizId).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when requester is not a member', async () => {
    const quiz = createQuizFixture({
      id: 1,
      title: 'Arcade Trivia',
      description: null,
      createdById: 42,
      organizationId: 99,
    });
    vi.spyOn(quizRepository, 'findById').mockResolvedValue(quiz);
    vi.spyOn(memberRepository, 'findByOrganizationAndUser').mockResolvedValue(null);

    await expect(useCase.execute(quiz.id, 7)).rejects.toThrow(ForbiddenException);
    expect(gameSessionRepository.findByQuizId).not.toHaveBeenCalled();
  });
});
