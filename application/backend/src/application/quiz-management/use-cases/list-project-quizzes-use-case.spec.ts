import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { createOrganizationMemberRepositoryMock } from '../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../test-utils/mock-factories/project-repository.mock-factory';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories/quiz-repository.mock-factory';
import { ListProjectQuizzesUseCase } from './list-project-quizzes-use-case';

describe('ListProjectQuizzesUseCase', () => {
  it('throws NOT_A_MEMBER when user is not in organization', async () => {
    const quizRepository = createQuizRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const projectRepository = createProjectRepositoryMock({
      findById: { organizationId: 1 } as never,
    });

    const useCase = new ListProjectQuizzesUseCase(
      quizRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('returns quizzes for project when user is a member', async () => {
    const quizRepository = createQuizRepositoryMock({
      findByProject: [{ id: 1 }] as never,
    });

    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findById: { organizationId: 1 } as never,
    });

    const useCase = new ListProjectQuizzesUseCase(
      quizRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(1, 10);
    expect(quizRepository.findByProject).toHaveBeenCalledWith(1);
    expect(result).toEqual([{ id: 1 }]);
  });
});
