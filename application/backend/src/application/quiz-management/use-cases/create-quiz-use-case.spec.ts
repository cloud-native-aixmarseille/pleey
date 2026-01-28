import { GameType } from '../../../domain/game/enums/game-type.enum';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import { createGameRepositoryMock } from '../../../test-utils/mock-factories/game-repository.mock-factory';
import { createOrganizationMemberRepositoryMock } from '../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../test-utils/mock-factories/project-repository.mock-factory';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories/quiz-repository.mock-factory';
import type { CreateQuizDto } from '../dto/create-quiz-dto';
import { CreateQuizUseCase } from './create-quiz-use-case';

describe('CreateQuizUseCase', () => {
  it('throws PROJECT_NOT_FOUND when project does not exist', async () => {
    const quizRepository = createQuizRepositoryMock();
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock();
    const projectRepository = createProjectRepositoryMock({ findById: null });

    const useCase = new CreateQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    await expect(
      useCase.execute({ projectId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toThrow(ProjectErrorCode.PROJECT_NOT_FOUND);
  });

  it('throws NOT_A_MEMBER when user is not in organization', async () => {
    const quizRepository = createQuizRepositoryMock();
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const projectRepository = createProjectRepositoryMock({
      findById: { organizationId: 1 } as never,
    });

    const useCase = new CreateQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    await expect(
      useCase.execute({ projectId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('throws INSUFFICIENT_PERMISSIONS when member cannot create quizzes', async () => {
    const quizRepository = createQuizRepositoryMock();
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        canCreateGames: () => false,
      } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findById: { organizationId: 1 } as never,
    });

    const useCase = new CreateQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    await expect(
      useCase.execute({ projectId: 1, title: 'Quiz' } satisfies CreateQuizDto, 10),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('creates quiz when member has permissions', async () => {
    const quizRepository = createQuizRepositoryMock({ create: { id: 1 } as never });
    const gameRepository = createGameRepositoryMock({ create: { id: 99 } as never });

    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        canCreateGames: () => true,
      } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findById: { organizationId: 1 } as never,
    });

    const useCase = new CreateQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      projectRepository as never,
      memberRepository as never,
    );

    const dto: CreateQuizDto = { projectId: 1, title: 'Quiz' };
    await useCase.execute(dto, 10);
    expect(gameRepository.create).toHaveBeenCalledWith(GameType.QUIZ, 'Quiz', null, 1);
    expect(quizRepository.create).toHaveBeenCalledWith(99);
  });
});
