import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../shared/services/identifiers/project-identifier';
import type { UpdateProjectDto } from '../dto/update-project-dto';
import { UpdateProjectUseCase } from './update-project-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

describe('UpdateProjectUseCase', () => {
  it('throws PROJECT_NOT_FOUND when the project does not exist', async () => {
    const projectRepository = createProjectRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    await expect(
      useCase.execute(
        projectIdentifier.parse(5),
        { name: 'Updated project' } satisfies UpdateProjectDto,
        backendTestIdentifiers.user(22),
      ),
    ).rejects.toThrow(ProjectErrorCode.PROJECT_NOT_FOUND);
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(5),
        organizationId: organizationIdentifier.parse(3),
      } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    await expect(
      useCase.execute(
        projectIdentifier.parse(5),
        { name: 'Updated project' } satisfies UpdateProjectDto,
        backendTestIdentifiers.user(22),
      ),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('throws INSUFFICIENT_PERMISSIONS when the user cannot manage projects', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(5),
        organizationId: organizationIdentifier.parse(3),
      } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => false,
      } as never,
    });

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    await expect(
      useCase.execute(
        projectIdentifier.parse(5),
        { name: 'Updated project' } satisfies UpdateProjectDto,
        backendTestIdentifiers.user(22),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('updates the project when the user has management rights', async () => {
    const updatedProject = {
      id: projectIdentifier.parse(5),
      name: 'Updated project',
      description: 'Refined scope',
      organizationId: organizationIdentifier.parse(3),
    };
    const projectRepository = createProjectRepositoryMock({
      findById: {
        id: projectIdentifier.parse(5),
        organizationId: organizationIdentifier.parse(3),
      } as never,
      update: updatedProject as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    const result = await useCase.execute(
      projectIdentifier.parse(5),
      { name: 'Updated project', description: 'Refined scope' } satisfies UpdateProjectDto,
      backendTestIdentifiers.user(22),
    );

    expect(projectRepository.update).toHaveBeenCalledWith(
      projectIdentifier.parse(5),
      'Updated project',
      'Refined scope',
    );
    expect(result).toBe(updatedProject);
  });
});
