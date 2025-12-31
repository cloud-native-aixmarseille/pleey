import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import { OrganizationMember } from '../../../../domain/organization/entities/organization-member.entity';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/repositories/organization-member.repository.interface';
import { Quiz } from '../../../../domain/quiz/entities/quiz.entity';
import type { QuizRepository } from '../../../../domain/quiz/repositories/quiz.repository.interface';
import { GetQuizSessionsUseCase } from '../get-quiz-sessions.use-case';

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
      findActiveByAdminId: vi.fn(),
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
    const quiz = new Quiz(1, 'Arcade Trivia', null, 42, 99, new Date());
    const member = new OrganizationMember(1, 99, 7, OrganizationRole.OWNER, new Date());
    const sessions = [
      new GameSession(10, 1, 7, 99, '123456', 'active', 2, new Date()),
      new GameSession(11, 1, 7, 99, '654321', 'completed', 8, new Date()),
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
    const quiz = new Quiz(1, 'Arcade Trivia', null, 42, 99, new Date());
    vi.spyOn(quizRepository, 'findById').mockResolvedValue(quiz);
    vi.spyOn(memberRepository, 'findByOrganizationAndUser').mockResolvedValue(null);

    await expect(useCase.execute(quiz.id, 7)).rejects.toThrow(ForbiddenException);
    expect(gameSessionRepository.findByQuizId).not.toHaveBeenCalled();
  });
});
