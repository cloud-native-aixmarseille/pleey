import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../shared/services/identifiers/project-identifier';
import { DeleteProjectUseCase } from './delete-project-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

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

    await expect(useCase.execute(projectIdentifier.parse(8), 22)).rejects.toThrow(
      ProjectErrorCode.PROJECT_NOT_FOUND,
    );
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
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

    await expect(useCase.execute(projectIdentifier.parse(8), 22)).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('throws INSUFFICIENT_PERMISSIONS when the user cannot manage projects', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
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

    await expect(useCase.execute(8, 22)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when deleting the last project of an organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
      } as never,
      findByOrganization: [
        {
          id: projectIdentifier.parse(8),
          organizationId: organizationIdentifier.parse(3),
        } as never,
      ],
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

    await expect(useCase.execute(projectIdentifier.parse(8), 22)).rejects.toThrow(
      ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT,
    );

    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('requires a migration target when the project still contains games', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
      } as never,
      findByOrganization: [
        {
          id: projectIdentifier.parse(8),
          organizationId: organizationIdentifier.parse(3),
        } as never,
        {
          id: projectIdentifier.parse(9),
          organizationId: organizationIdentifier.parse(3),
        } as never,
      ],
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

    await expect(useCase.execute(projectIdentifier.parse(8), 22)).rejects.toThrow(
      ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED,
    );

    expect(workspaceGameManagement.reassignProjectGames).not.toHaveBeenCalled();
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('rejects an invalid migration target', async () => {
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [
        {
          id: projectIdentifier.parse(8),
          organizationId: organizationIdentifier.parse(3),
        } as never,
        {
          id: projectIdentifier.parse(9),
          organizationId: organizationIdentifier.parse(3),
        } as never,
      ],
    });
    projectRepository.findById
      .mockResolvedValueOnce({
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
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

    await expect(
      useCase.execute(projectIdentifier.parse(8), 22, projectIdentifier.parse(99)),
    ).rejects.toThrow(ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND);
  });

  it('migrates games before deleting the project when a target is provided', async () => {
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [
        {
          id: projectIdentifier.parse(8),
          organizationId: organizationIdentifier.parse(3),
        } as never,
        {
          id: projectIdentifier.parse(9),
          organizationId: organizationIdentifier.parse(3),
        } as never,
      ],
    });
    projectRepository.findById
      .mockResolvedValueOnce({
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
      } as never)
      .mockResolvedValueOnce({
        id: projectIdentifier.parse(9),
        organizationId: organizationIdentifier.parse(3),
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

    await useCase.execute(projectIdentifier.parse(8), 22, projectIdentifier.parse(9));

    expect(workspaceGameManagement.reassignProjectGames).toHaveBeenCalledWith(
      projectIdentifier.parse(8),
      projectIdentifier.parse(9),
    );
    expect(projectRepository.delete).toHaveBeenCalledWith(projectIdentifier.parse(8));
  });

  it('deletes the project directly when there are no games to migrate', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(8),
        organizationId: organizationIdentifier.parse(3),
      } as never,
      findByOrganization: [
        {
          id: projectIdentifier.parse(8),
          organizationId: organizationIdentifier.parse(3),
        } as never,
        {
          id: projectIdentifier.parse(9),
          organizationId: organizationIdentifier.parse(3),
        } as never,
      ],
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

    await useCase.execute(projectIdentifier.parse(8), 22);

    expect(projectRepository.delete).toHaveBeenCalledWith(projectIdentifier.parse(8));
    expect(workspaceGameManagement.reassignProjectGames).not.toHaveBeenCalled();
  });
});
