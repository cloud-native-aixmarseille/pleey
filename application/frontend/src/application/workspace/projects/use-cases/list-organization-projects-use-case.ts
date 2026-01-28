import { inject, injectable } from 'inversify';
import type { Project } from '../../../../domains/project/entities/project';
import type { ProjectRepository } from '../../../../domains/project/ports/project-repository';
import { PROJECT_SERVICE_ID } from '../contracts/project-service-id';

interface ListOrganizationProjectsCommand {
  readonly organizationId: number;
}

@injectable()
export class ListOrganizationProjectsUseCase {
  constructor(
    @inject(PROJECT_SERVICE_ID.projectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: ListOrganizationProjectsCommand): Promise<Project[]> {
    return this.projectRepository.getProjectsByOrganization(command.organizationId);
  }
}
