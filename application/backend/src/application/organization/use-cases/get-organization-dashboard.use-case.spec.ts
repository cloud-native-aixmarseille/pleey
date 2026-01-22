import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import {
  createGameSessionRepositoryMock,
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import { GetOrganizationDashboardUseCase } from './get-organization-dashboard.use-case';

describe('GetOrganizationDashboardUseCase', () => {
  it('throws when organization does not exist', async () => {
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const quizRepository = createQuizRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock();

    const useCase = new GetOrganizationDashboardUseCase(
      organizationRepository as never,
      memberRepository as never,
      quizRepository as never,
      sessionRepository as never,
    );

    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
  });

  it('throws when user is not a member', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1, name: 'Org', description: null } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const quizRepository = createQuizRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock();

    const useCase = new GetOrganizationDashboardUseCase(
      organizationRepository as never,
      memberRepository as never,
      quizRepository as never,
      sessionRepository as never,
    );

    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('returns aggregated stats', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1, name: 'Org', description: null } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
      findByOrganization: [{ id: 1 }, { id: 2 }] as never,
    });

    const quizRepository = createQuizRepositoryMock({
      findByOrganization: [{ id: 1 }] as never,
    });

    const sessionRepository = createGameSessionRepositoryMock({
      findByQuizId: [
        { status: GameSessionStatus.WAITING },
        { status: GameSessionStatus.ENDED },
      ] as never,
    });

    const useCase = new GetOrganizationDashboardUseCase(
      organizationRepository as never,
      memberRepository as never,
      quizRepository as never,
      sessionRepository as never,
    );

    const result = await useCase.execute(1, 10);
    expect(result.stats).toEqual({
      totalQuizzes: 1,
      totalGameSessions: 2,
      activeGameSessions: 1,
      totalMembers: 2,
    });
  });
});
