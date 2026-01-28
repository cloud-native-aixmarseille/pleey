import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import type { UpdateProjectDto } from '../dto/update-project-dto';
import { UpdateProjectUseCase } from './update-project-use-case';

describe('UpdateProjectUseCase', () => {
  it('throws PROJECT_NOT_FOUND when the project does not exist', async () => {
    const projectRepository = createProjectRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    await expect(
      useCase.execute(5, { name: 'Updated project' } satisfies UpdateProjectDto, 22),
    ).rejects.toThrow(ProjectErrorCode.PROJECT_NOT_FOUND);
  });

  it('throws NOT_A_MEMBER when the user is outside the organization', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 5, organizationId: 3 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    await expect(
      useCase.execute(5, { name: 'Updated project' } satisfies UpdateProjectDto, 22),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('throws INSUFFICIENT_PERMISSIONS when the user cannot manage projects', async () => {
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 5, organizationId: 3 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => false,
      } as never,
    });

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    await expect(
      useCase.execute(5, { name: 'Updated project' } satisfies UpdateProjectDto, 22),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('updates the project when the user has management rights', async () => {
    const updatedProject = {
      id: 5,
      name: 'Updated project',
      description: 'Refined scope',
      organizationId: 3,
    };
    const projectRepository = createProjectRepositoryMock({
      findById: { id: 5, organizationId: 3 } as never,
      update: updatedProject as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
      } as never,
    });

    const useCase = new UpdateProjectUseCase(projectRepository as never, memberRepository as never);

    const result = await useCase.execute(
      5,
      { name: 'Updated project', description: 'Refined scope' } satisfies UpdateProjectDto,
      22,
    );

    expect(projectRepository.update).toHaveBeenCalledWith(5, 'Updated project', 'Refined scope');
    expect(result).toBe(updatedProject);
  });
});
