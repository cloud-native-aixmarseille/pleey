import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  createOrganizationMemberRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { CreateQuizDto } from '../dto/create-quiz.dto';
import { CreateQuizUseCase } from './create-quiz.use-case';

describe('CreateQuizUseCase', () => {
  it('throws NOT_A_MEMBER when user is not in organization', async () => {
    const quizRepository = createQuizRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new CreateQuizUseCase(quizRepository as never, memberRepository as never);

    await expect(
      useCase.execute({ organizationId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      useCase.execute({ organizationId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('throws INSUFFICIENT_PERMISSIONS when member cannot create quizzes', async () => {
    const quizRepository = createQuizRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        canCreateQuizzes: () => false,
      } as never,
    });

    const useCase = new CreateQuizUseCase(quizRepository as never, memberRepository as never);

    await expect(
      useCase.execute({ organizationId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      useCase.execute({ organizationId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('creates quiz when member has permissions', async () => {
    const quizRepository = createQuizRepositoryMock({ create: { id: 1 } as never });

    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        canCreateQuizzes: () => true,
      } as never,
    });

    const useCase = new CreateQuizUseCase(quizRepository as never, memberRepository as never);

    const dto: CreateQuizDto = { organizationId: 1, title: 'Quiz' };
    await useCase.execute(dto, 10);
    expect(quizRepository.create).toHaveBeenCalledWith('Quiz', null, 10, 1);
  });
});
