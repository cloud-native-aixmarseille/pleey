import { inject, injectable } from 'inversify';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { Project } from '../../../../domains/project/entities/project';
import {
  type ProjectRepository,
  ProjectRepositoryToken,
} from '../../../../domains/project/ports/project-repository';

interface ListOrganizationProjectsCommand {
  readonly organizationId: OrganizationId;
}

@injectable()
export class ListOrganizationProjectsUseCase {
  constructor(
    @inject(ProjectRepositoryToken)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: ListOrganizationProjectsCommand): Promise<Project[]> {
    return this.projectRepository.getProjectsByOrganization(command.organizationId);
  }
}
