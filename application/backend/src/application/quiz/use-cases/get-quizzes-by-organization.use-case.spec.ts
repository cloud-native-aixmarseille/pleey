import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import {
  createOrganizationMemberRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import { GetQuizzesByOrganizationUseCase } from './get-quizzes-by-organization.use-case';

describe('GetQuizzesByOrganizationUseCase', () => {
  it('throws NOT_A_MEMBER when user is not in organization', async () => {
    const quizRepository = createQuizRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new GetQuizzesByOrganizationUseCase(
      quizRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('returns quizzes for organization when user is a member', async () => {
    const quizRepository = createQuizRepositoryMock({
      findByOrganization: [{ id: 1 }] as never,
    });

    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
    });

    const useCase = new GetQuizzesByOrganizationUseCase(
      quizRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(1, 10);
    expect(quizRepository.findByOrganization).toHaveBeenCalledWith(1);
    expect(result).toEqual([{ id: 1 }]);
  });
});
