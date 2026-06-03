import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { DeleteProjectUseCase } from './delete-project-use-case';

const organizationId = backendTestIdentifiers.organization(3);
const projectId = backendTestIdentifiers.project(8);
const migrationProjectId = backendTestIdentifiers.project(9);
const missingProjectId = backendTestIdentifiers.project(99);
const actorUserId = backendTestIdentifiers.user(22);

describe('DeleteProjectUseCase', () => {
  it('throws PROJECT_NOT_FOUND when the project does not exist', async () => {
    const projectRepository = createProjectRepositoryMock({ findById: null });
    const workspaceGameManagement = {
      countProjectGames: vi.fn(),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock();

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await expect(useCase.execute(projectId, actorUserId)).rejects.toThrow(
      ProjectErrorCode.PROJECT_NOT_FOUND,
    );
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectId,
        organizationId,
      } as never,
    });
    const workspaceGameManagement = {
      countProjectGames: vi.fn(),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await expect(useCase.execute(projectId, actorUserId)).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('throws INSUFFICIENT_PERMISSIONS when the user cannot manage projects', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectId,
        organizationId,
      } as never,
    });
    const workspaceGameManagement = {
      countProjectGames: vi.fn(),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => false,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await expect(useCase.execute(projectId, actorUserId)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when deleting the last project of an organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectId,
        organizationId,
      } as never,
      countByOrganization: 1,
    });
    const workspaceGameManagement = {
      countProjectGames: vi.fn(),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await expect(useCase.execute(projectId, actorUserId)).rejects.toThrow(
      ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT,
    );

    expect(projectRepository.countByOrganization).toHaveBeenCalledWith(
      backendTestIdentifiers.organization(3),
    );
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('requires a migration target when the project still contains games', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectId,
        organizationId,
      } as never,
      countByOrganization: 2,
    });
    const workspaceGameManagement = {
      countProjectGames: vi.fn().mockResolvedValue(1),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await expect(useCase.execute(projectId, actorUserId)).rejects.toThrow(
      ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED,
    );

    expect(workspaceGameManagement.reassignProjectGames).not.toHaveBeenCalled();
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('rejects an invalid migration target', async () => {
    const projectRepository = createProjectRepositoryMock({
      countByOrganization: 2,
    });
    projectRepository.findById
      .mockResolvedValueOnce({
        id: projectId,
        organizationId,
      } as never)
      .mockResolvedValueOnce(null);
    const workspaceGameManagement = {
      countProjectGames: vi.fn().mockResolvedValue(1),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await expect(useCase.execute(projectId, actorUserId, missingProjectId)).rejects.toThrow(
      ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND,
    );
  });

  it('migrates games before deleting the project when a target is provided', async () => {
    const projectRepository = createProjectRepositoryMock({
      countByOrganization: 2,
    });
    projectRepository.findById
      .mockResolvedValueOnce({
        id: projectId,
        organizationId,
      } as never)
      .mockResolvedValueOnce({
        id: migrationProjectId,
        organizationId,
      } as never);
    const workspaceGameManagement = {
      countProjectGames: vi.fn().mockResolvedValue(1),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await useCase.execute(projectId, actorUserId, migrationProjectId);

    expect(workspaceGameManagement.reassignProjectGames).toHaveBeenCalledWith(
      projectId,
      migrationProjectId,
    );
    expect(projectRepository.delete).toHaveBeenCalledWith(projectId);
  });

  it('deletes the project directly when there are no games to migrate', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectId,
        organizationId,
      } as never,
      countByOrganization: 2,
    });
    const workspaceGameManagement = {
      countProjectGames: vi.fn().mockResolvedValue(0),
      reassignProjectGames: vi.fn(),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new DeleteProjectUseCase(
      projectRepository as never,
      workspaceGameManagement as never,
      memberRepository as never,
    );

    await useCase.execute(projectId, actorUserId);

    expect(projectRepository.countByOrganization).toHaveBeenCalledWith(
      backendTestIdentifiers.organization(3),
    );
    expect(projectRepository.delete).toHaveBeenCalledWith(backendTestIdentifiers.project(8));
    expect(workspaceGameManagement.reassignProjectGames).not.toHaveBeenCalled();
  });
});
