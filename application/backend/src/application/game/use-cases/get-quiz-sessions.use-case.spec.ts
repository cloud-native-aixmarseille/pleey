import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
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
import { GetQuizSessionsUseCase } from './get-quiz-sessions.use-case';

describe('GetQuizSessionsUseCase', () => {
  let useCase: GetQuizSessionsUseCase;
  let gameSessionRepository: GameSessionRepository;
  let quizRepository: QuizRepository;
  let memberRepository: OrganizationMemberRepository;

  beforeEach(() => {
    gameSessionRepository = createGameSessionRepositoryMock();
    quizRepository = createQuizRepositoryMock();
    memberRepository = createOrganizationMemberRepositoryMock();

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
        pin: '123456',
        status: GameSessionStatus.ACTIVE,
        currentQuestionId: 101,
      }),
      createGameSessionFixture({
        id: 11,
        quizId: 1,
        hostId: 7,
        pin: '654321',
        status: GameSessionStatus.ENDED,
        currentQuestionId: 202,
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
