import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type { Project } from '../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
} from '../../../../domains/project/ports/project-repository';
import { CreateProjectUseCase } from '../../projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../projects/use-cases/delete-project-use-case';
import { UpdateProjectUseCase } from '../../projects/use-cases/update-project-use-case';
import type { CreateOrganizationCommand } from '../contracts/create-organization-command';
import { CreateOrganizationUseCase } from '../use-cases/create-organization-use-case';

@injectable()
export class OrganizationManagementFacade {
  constructor(
    @inject(CreateOrganizationUseCase)
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
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
