import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../domains/organization/entities/organization-member';
import type {
  AddOrganizationMemberCommand,
  ListOrganizationMembersQuery,
  RemoveOrganizationMemberCommand,
  UpdateOrganizationMemberRoleCommand,
} from '../../../../domains/organization/ports/organization-repository';
import type { Project } from '../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../domains/project/ports/project-repository';
import type { PaginatedResult } from '../../../../domains/shared/value-objects/paginated-result';
import { CreateProjectUseCase } from '../../projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../projects/use-cases/delete-project-use-case';
import { UpdateProjectUseCase } from '../../projects/use-cases/update-project-use-case';
import type { CreateOrganizationCommand } from '../contracts/create-organization-command';
import { AddOrganizationMemberUseCase } from '../use-cases/add-organization-member-use-case';
import { CreateOrganizationUseCase } from '../use-cases/create-organization-use-case';
import { ListOrganizationMembersUseCase } from '../use-cases/list-organization-members-use-case';
import { RemoveOrganizationMemberUseCase } from '../use-cases/remove-organization-member-use-case';
import { UpdateOrganizationMemberRoleUseCase } from '../use-cases/update-organization-member-role-use-case';

@injectable()
export class OrganizationManagementFacade {
  constructor(
    @inject(CreateOrganizationUseCase)
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    @inject(ListOrganizationMembersUseCase)
    private readonly listOrganizationMembersUseCase: ListOrganizationMembersUseCase,
    @inject(AddOrganizationMemberUseCase)
    private readonly addOrganizationMemberUseCase: AddOrganizationMemberUseCase,
    @inject(RemoveOrganizationMemberUseCase)
    private readonly removeOrganizationMemberUseCase: RemoveOrganizationMemberUseCase,
    @inject(UpdateOrganizationMemberRoleUseCase)
    private readonly updateOrganizationMemberRoleUseCase: UpdateOrganizationMemberRoleUseCase,
    @inject(CreateProjectUseCase)
    private readonly createProjectUseCase: CreateProjectUseCase,
    @inject(UpdateProjectUseCase)
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    @inject(DeleteProjectUseCase)
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  createOrganization(command: CreateOrganizationCommand): Promise<Organization> {
    return this.createOrganizationUseCase.execute(command);
  }

  listOrganizationMembers(
    query: ListOrganizationMembersQuery,
  ): Promise<PaginatedResult<OrganizationMember>> {
    return this.listOrganizationMembersUseCase.execute(query);
  }

  addOrganizationMember(command: AddOrganizationMemberCommand): Promise<OrganizationMember> {
    return this.addOrganizationMemberUseCase.execute(command);
  }

  removeOrganizationMember(command: RemoveOrganizationMemberCommand): Promise<void> {
    return this.removeOrganizationMemberUseCase.execute(command);
  }

  updateOrganizationMemberRole(
    command: UpdateOrganizationMemberRoleCommand,
  ): Promise<OrganizationMember> {
    return this.updateOrganizationMemberRoleUseCase.execute(command);
  }

  createProject(command: CreateProjectCommand): Promise<Project> {
    return this.createProjectUseCase.execute(command);
  }

  updateProject(command: UpdateProjectCommand): Promise<Project> {
    return this.updateProjectUseCase.execute(command);
  }

  deleteProject(command: DeleteProjectCommand): Promise<void> {
    return this.deleteProjectUseCase.execute(command);
  }
}
