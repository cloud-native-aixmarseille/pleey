import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { createGameRepositoryMock } from '../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { DeleteProjectUseCase } from './delete-project-use-case';

describe('DeleteProjectUseCase', () => {
  it('throws PROJECT_NOT_FOUND when the project does not exist', async () => {
    const projectRepository = createProjectRepositoryMock({ findById: null });
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock();

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(8, 22)).rejects.toThrow(ProjectErrorCode.PROJECT_NOT_FOUND);
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
    });
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(8, 22)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('throws INSUFFICIENT_PERMISSIONS when the user cannot manage projects', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
    });
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => false,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(8, 22)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when deleting the last project of an organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
      findByOrganization: [{ id: 8, organizationId: 3 } as never],
    });
    const gameRepository = createGameRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(8, 22)).rejects.toThrow(
      ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT,
    );

    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('requires a migration target when the project still contains games', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
      findByOrganization: [
        { id: 8, organizationId: 3 } as never,
        { id: 9, organizationId: 3 } as never,
      ],
    });
    const gameRepository = createGameRepositoryMock({
      findByProject: [{ id: 101, projectId: 8 } as never],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(8, 22)).rejects.toThrow(
      ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED,
    );

    expect(gameRepository.reassignProject).not.toHaveBeenCalled();
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('rejects an invalid migration target', async () => {
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [
        { id: 8, organizationId: 3 } as never,
        { id: 9, organizationId: 3 } as never,
      ],
    });
    projectRepository.findById
      .mockResolvedValueOnce({ id: 8, organizationId: 3 } as never)
      .mockResolvedValueOnce(null);
    const gameRepository = createGameRepositoryMock({
      findByProject: [{ id: 101, projectId: 8 } as never],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await expect(useCase.execute(8, 22, 99)).rejects.toThrow(
      ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND,
    );
  });

  it('migrates games before deleting the project when a target is provided', async () => {
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [
        { id: 8, organizationId: 3 } as never,
        { id: 9, organizationId: 3 } as never,
      ],
    });
    projectRepository.findById
      .mockResolvedValueOnce({ id: 8, organizationId: 3 } as never)
      .mockResolvedValueOnce({ id: 9, organizationId: 3 } as never);
    const gameRepository = createGameRepositoryMock({
      findByProject: [{ id: 101, projectId: 8 } as never],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await useCase.execute(8, 22, 9);

    expect(gameRepository.reassignProject).toHaveBeenCalledWith(8, 9);
    expect(projectRepository.delete).toHaveBeenCalledWith(8);
  });

  it('deletes the project directly when there are no games to migrate', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 8, organizationId: 3 } as never,
      findByOrganization: [
        { id: 8, organizationId: 3 } as never,
        { id: 9, organizationId: 3 } as never,
      ],
    });
    const gameRepository = createGameRepositoryMock({
      findByProject: [],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      gameRepository as never,
      memberRepository as never,
    );

    await useCase.execute(8, 22);

    expect(projectRepository.delete).toHaveBeenCalledWith(8);
    expect(gameRepository.reassignProject).not.toHaveBeenCalled();
  });
});
