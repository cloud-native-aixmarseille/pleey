import { inject, injectable } from 'inversify';
import type { Project } from '../../../../domains/project/entities/project';
import {
  type ListOrganizationProjectsQuery,
  type ProjectRepository,
  ProjectRepositoryToken,
} from '../../../../domains/project/ports/project-repository';
import type { PaginatedResult } from '../../../../domains/shared/value-objects/paginated-result';

@injectable()
export class ListOrganizationProjectsUseCase {
  constructor(
    @inject(ProjectRepositoryToken)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(query: ListOrganizationProjectsQuery): Promise<PaginatedResult<Project>> {
    return this.projectRepository.getProjectsByOrganization(query);
  }
}
