import { inject, injectable } from 'inversify';
import type { Project } from '../../../../domains/project/entities/project';
import type {
  ProjectRepository,
  UpdateProjectCommand,
} from '../../../../domains/project/ports/project-repository';
import { ProjectRepositoryToken } from '../../../../domains/project/ports/project-repository';

@injectable()
export class UpdateProjectUseCase {
  constructor(
    @inject(ProjectRepositoryToken)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: UpdateProjectCommand): Promise<Project> {
    return this.projectRepository.updateProject(command);
  }
}
